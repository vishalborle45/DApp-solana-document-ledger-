import { useState, useEffect } from "react";
import { encryptCID } from "../utilities/cryptoUtils";
import { useRecoilValue } from "recoil";
import { authState } from "../state/authAtom";
import { useUploadDocument } from "../utilities/add_document";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [cid, setCid] = useState<string | null>(null);
  const [encryptedCID, setEncryptedCID] = useState<{ encryptedData: string; iv: string } | null>(null);

  const auth = useRecoilValue(authState);
  const { uploadDocument, loading } = useUploadDocument();

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "text/plain"];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("❌ Invalid file type. Only PDF, PNG, JPEG, and TXT are allowed.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("❌ File size exceeds 10MB limit.");
      return;
    }

    setError(null);
    setFile(selectedFile);
    setFileType(selectedFile.type);
    setFileName(selectedFile.name.split(".")[0]);
    setCid(null);
    setEncryptedCID(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("❌ Please select a file.");
      return;
    }
    if (!auth.isAuthenticated || !auth.signature) {
      setError("❌ Please authenticate before uploading.");
      return;
    }
    if (!fileName.trim()) {
      setError("❌ File name cannot be empty.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file, `${fileName}.${file.type.split("/")[1]}`);

      const ipfsResponse = await fetch("http://127.0.0.1:5001/api/v0/add", {
        method: "POST",
        body: formData,
      });

      if (!ipfsResponse.ok) {
        throw new Error("Failed to upload to IPFS.");
      }

      const ipfsResult = await ipfsResponse.json();
      if (!ipfsResult.Hash) {
        throw new Error("Invalid response from IPFS.");
      }

      const newCid = ipfsResult.Hash;
      setCid(newCid);

      const encryptedData = encryptCID(newCid, auth.signature);
      setEncryptedCID(encryptedData);

      const result = await uploadDocument(fileName, fileType, encryptedData.encryptedData, encryptedData.iv);

      if (result.success) {
        alert(`Document uploaded successfully! Tx: ${result.txId}`);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      setError("❌ Upload failed. Check console for details.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => setUploading(false);
  }, []);

  return (
    <div className="w-full">
      <div className=" rounded-t-lg px-6 py-4 bg-blue-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">📤 Document Upload</h2>
      </div>
      
      <div className="bg-white rounded-b-lg shadow-lg p-6">
        <div className="space-y-4">
          {/* File input section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-800 mb-2">Select document to upload</p>
            <input
              type="file"
              accept=".pdf, .png, .jpeg, .txt"
              onChange={handleFileChange}
              className="w-full p-2 border border-blue-200 rounded bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* File details section */}
          {file && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex flex-col space-y-3">
                <div>
                  <label className="text-sm text-blue-800 block mb-1">File name</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter custom file name"
                    className="w-full p-2 border border-blue-200 rounded bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700">Type: <span className="text-blue-900 font-medium">{fileType}</span></span>
                  <span className="text-blue-700">Size: <span className="text-blue-900 font-medium">{(file.size / 1024).toFixed(2)} KB</span></span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {/* Upload success message */}
          {cid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm font-medium">✅ File uploaded successfully!</p>
              <p className="text-xs text-green-700 mt-1 truncate">CID: {cid}</p>
            </div>
          )}
          
          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || loading || !file}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-blue-100 disabled:text-blue-400 flex justify-center items-center"
          >
            {uploading || loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}