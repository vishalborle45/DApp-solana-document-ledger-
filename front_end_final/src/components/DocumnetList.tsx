import { useRetrieveAllDocuments } from "../utilities/seRetrieveAllDocuments";
import { Trash2, Share, Eye, Download, XCircle } from "lucide-react";

const DocumentList = () => {
  const { documents, loading, error } = useRetrieveAllDocuments();

  if (loading) return <p className="text-center text-lg font-semibold">Loading documents...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Documents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map((doc) => (
          <div key={doc.publicKey} className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900">{doc.fileName}</h3>
            <p className="text-sm text-gray-600">{doc.fileType}</p>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition">
                <Eye size={16} /> View
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition">
                <Download size={16} /> Download
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition">
                <Share size={16} /> Share
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition">
                <Trash2 size={16} /> Delete
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition">
                <XCircle size={16} /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
