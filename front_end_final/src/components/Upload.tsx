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
  const { uploadDocument, loading } = useUploadDocument(); // ✅ Correct way to use the hook

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

      // ✅ Corrected way to call the upload function
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
    <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-3">📤 Upload Document</h2>
      <input
        type="file"
        accept=".pdf, .png, .jpeg, .txt"
        onChange={handleFileChange}
        className="mb-3 w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
      />
      {file && (
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter custom file name"
          className="mb-3 w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
        />
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {file && (
        <div className="bg-gray-800 p-3 rounded-lg mt-3">
          <p className="truncate font-semibold">{fileName}.{fileType.split("/")[1]}</p>
          <p className="text-xs text-gray-400">Type: {fileType}</p>
          <p className="text-xs text-gray-400">Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={uploading || loading}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-500"
      >
        {uploading || loading ? "Uploading..." : "Upload"}
      </button>
      {cid && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-green-400">✅ File uploaded successfully!</p>
          <p className="text-xs truncate">CID: {cid}</p>
        </div>
      )}
    </div>
  );
}
