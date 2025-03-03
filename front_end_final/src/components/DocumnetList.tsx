import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { 
  Trash2, Share, Eye, Download, XCircle, RefreshCw, 
  FileText, FileImage, FileVideo, FileAudio, File, 
  Lock, Calendar, MoreHorizontal 
} from "lucide-react";
import { useRecoilValue } from "recoil";
import { documentState } from "../state/documentState";
import { decryptCID } from "../utilities/cryptoUtils";
import { useCallback, useState, useMemo, memo } from "react";
import { authState } from "../state/authAtom";
import { useRetrieveAllDocuments } from "../utilities/retrievalallDocument";

// Get appropriate icon based on file type
const getFileIcon = (fileType) => {
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) {
    return <FileText size={24} className="text-red-500" />;
  } else if (type.includes('jpeg') || type.includes('jpg') || type.includes('png') || type.includes('gif') || type.includes('svg') || type.includes('webp')) {
    return <FileImage size={24} className="text-blue-500" />;
  } else if (type.includes('mp4') || type.includes('mov') || type.includes('avi') || type.includes('webm')) {
    return <FileVideo size={24} className="text-purple-500" />;
  } else if (type.includes('mp3') || type.includes('wav') || type.includes('ogg')) {
    return <FileAudio size={24} className="text-green-500" />;
  } else if (type.includes('doc') || type.includes('docx')) {
    return <FileText size={24} className="text-blue-700" />;
  } else if (type.includes('xls') || type.includes('xlsx')) {
    return <FileText size={24} className="text-green-700" />;
  } else if (type.includes('ppt') || type.includes('pptx')) {
    return <FileText size={24} className="text-orange-500" />;
  } else {
    return <File size={24} className="text-gray-500" />;
  }
};

// Enhanced document card with dropdown menu
const DocumentCard = memo(({ doc, onView, onDownload, processingDoc }) => {
  const isProcessing = processingDoc === doc.publicKey;
  const [showMenu, setShowMenu] = useState(false);
  
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Get formatted date
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Card header with file type */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {getFileIcon(doc.fileType)}
          <span className="text-xs font-medium text-gray-500 uppercase">{doc.fileType}</span>
        </div>
      </div>
      
      {/* Card body */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-1">{doc.fileName}</h3>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formattedDate}
          </div>
          <div className="flex items-center">
            <Lock size={14} className="mr-1" />
            Encrypted
          </div>
        </div>
        
        {/* Action buttons with three dots menu */}
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => onView(doc)} 
            disabled={isProcessing}
            className={`flex-1 flex justify-center items-center py-2 px-3 rounded-md text-sm font-medium ${
              isProcessing 
                ? 'bg-blue-100 text-blue-400' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors'
            }`}
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Eye size={16} className="mr-2" />
            )}
            View
          </button>
          
          <button 
            onClick={() => onDownload(doc)} 
            disabled={isProcessing}
            className={`flex-1 flex justify-center items-center py-2 px-3 rounded-md text-sm font-medium ${
              isProcessing 
                ? 'bg-green-100 text-green-400' 
                : 'bg-green-50 text-green-600 hover:bg-green-100 transition-colors'
            }`}
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Download
          </button>
          
          {/* Three dots menu button */}
          <div className="relative">
            <button 
              onClick={toggleMenu}
              disabled={isProcessing}
              className={`flex justify-center items-center py-2 px-3 rounded-md text-sm font-medium ${
                isProcessing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors'
              }`}
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement share functionality
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Share size={16} className="mr-2" /> Share
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement revoke functionality
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <XCircle size={16} className="mr-2" /> Revoke Access
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement delete functionality
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 size={16} className="mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Card footer with document ID */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 truncate flex items-center">
          <span className="font-mono bg-gray-200 px-1 py-0.5 rounded mr-1">ID:</span> 
          {doc.publicKey.substring(0, 16)}...
        </p>
      </div>
    </div>
  );
});

// Loading state component
const LoadingState = memo(() => (
  <div className="container mx-auto p-4">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between">
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
            <div className="flex space-x-2 mt-6">
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

// Error state component
const ErrorState = memo(({ error, onRetry }) => (
  <div className="container mx-auto p-4">
    <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
          <XCircle size={24} className="text-red-500" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-red-800">Error loading documents</h3>
          <p className="text-red-700 mt-2">{error.message || "Please try again later"}</p>
          <button 
            onClick={onRetry} 
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    </div>
  </div>
));

// Empty state component
const EmptyState = memo(({ onRefresh }) => (
  <div className="container mx-auto p-4">
    <div className="text-center p-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <File size={32} className="text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No documents found</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">Upload your first document to get started with secure, encrypted storage</p>
      <button 
        onClick={onRefresh} 
        className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition mx-auto"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </div>
  </div>
));

const DocumentList = () => {
  const { isLoading, error, refetch } = useRetrieveAllDocuments();
  const docs = useRecoilValue(documentState);
  const wallet = useAnchorWallet();
  const auth = useRecoilValue(authState);
  const [processingDoc, setProcessingDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewDocument = useCallback(
    async (doc) => {
      if (!wallet || !auth.signature || auth.signature.trim() === "") {
        console.error("❌ Error: No wallet or valid encryption key");
        return;
      }

      if (processingDoc) return;

      try {
        setProcessingDoc(doc.publicKey);
        
        if (!doc.encryptedCid || !doc.iv) {
          throw new Error("Invalid encrypted CID or IV");
        }

        const decryptedCID = decryptCID(doc.encryptedCid, doc.iv, auth.signature);
        
        if (!decryptedCID) {
          throw new Error("Decryption failed: CID is empty");
        }

        const fileBlob = await fetchFromIPFS(decryptedCID);
        if (fileBlob) {
          const fileURL = URL.createObjectURL(fileBlob);
          window.open(fileURL, "_blank");
        }
      } catch (err) {
        console.error("❌ Error viewing document:", err);
      } finally {
        setProcessingDoc(null);
      }
    },
    [wallet, auth.signature, processingDoc]
  );

  const handleDownloadDocument = useCallback(
    async (doc) => {
      if (!wallet || !auth.signature || auth.signature.trim() === "") {
        console.error("❌ Error: No wallet or valid encryption key");
        return;
      }

      if (processingDoc) return;

      try {
        setProcessingDoc(doc.publicKey);
        
        const decryptedCID = decryptCID(doc.encryptedCid, doc.iv, auth.signature);
        
        if (!decryptedCID) {
          throw new Error("Decryption failed: CID is empty");
        }

        const fileBlob = await fetchFromIPFS(decryptedCID);
        if (fileBlob) {
          const fileURL = URL.createObjectURL(fileBlob);
          const a = document.createElement("a");
          a.href = fileURL;
          a.download = doc.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err) {
        console.error("❌ Error downloading document:", err);
      } finally {
        setProcessingDoc(null);
      }
    },
    [wallet, auth.signature, processingDoc]
  );

  // Fetch from IPFS function
  const fetchFromIPFS = async (cid) => {
    try {
      if (!cid || typeof cid !== "string" || cid.trim() === "") {
        throw new Error("Invalid CID");
      }

      const response = await fetch(`http://127.0.0.1:8080/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("IPFS fetch error:", error);
      return null;
    }
  };

  // Filter documents based on search term
  const filteredDocs = useMemo(() => {
    if (!searchTerm.trim() || !docs) return docs;
    
    return docs.filter(doc => 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [docs, searchTerm]);

  // Handle different states
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!docs || docs.length === 0) {
    return <EmptyState onRefresh={refetch} />;
  }

  // Main render
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Your Documents <span className="text-gray-500 text-lg font-normal">({docs.length})</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
            
            {/* Refresh button */}
            <button
              onClick={refetch}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
        
        {/* Filter info when searching */}
        {searchTerm && (
          <div className="mb-4 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Showing results for "{searchTerm}" ({filteredDocs.length} of {docs.length})
            {filteredDocs.length === 0 && (
              <button 
                onClick={() => setSearchTerm("")}
                className="ml-auto text-blue-700 hover:text-blue-900 text-sm font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Empty search results */}
      {searchTerm && filteredDocs.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No matching documents</h2>
          <p className="text-gray-600 mb-6">We couldn't find any documents matching "{searchTerm}"</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition mx-auto"
          >
            <RefreshCw size={16} /> Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <DocumentCard 
              key={doc.publicKey}
              doc={doc}
              onView={handleViewDocument}
              onDownload={handleDownloadDocument}
              processingDoc={processingDoc}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;