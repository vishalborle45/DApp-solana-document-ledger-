import { useState } from 'react';
import { FaBars, FaTimes, FaSearch, FaFileUpload, FaFolderOpen, FaShareAlt } from 'react-icons/fa';
import Upload from '../components/Upload';
import { useInitializeUserAccount } from '../utilities/Initialized';

const mockDocuments = [
  'Project Proposal.pdf',
  'Client Agreement.docx',
  'Budget Plan.xlsx',
  'Meeting Notes.txt',
  'Marketing Strategy.pdf',
  'Research Paper.docx'
];

function Dashboard() {

  const { initialized, loading } = useInitializeUserAccount();

  const [activeTab, setActiveTab] = useState('retrieve');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Mock API call with a delay
    setTimeout(() => {
      const filteredResults = mockDocuments.filter(doc =>
        doc.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredResults);
      setActiveTab('search');
    }, 500);
  };

  return (
    <div className="flex h-screen">
      <div>
      {loading ? (
        <p>Initializing your account...</p>
      ) : initialized ? (
        <p>Account is ready! You can start uploading documents.</p>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white p-4 transition-all ${isSidebarOpen ? 'w-1/4' : 'w-16'}`}>
        <button
          className="text-white mb-4"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <div className="mb-4">
          <div className="flex items-center bg-gray-700 p-2 rounded">
            <FaSearch className="mr-2" />
            <input
              type="text"
              className="bg-transparent outline-none w-full"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <ul className="space-y-2">
          <li>
            <button
              className={`flex items-center w-full text-left p-2 rounded ${activeTab === 'retrieve' ? 'bg-gray-600' : ''}`}
              onClick={() => setActiveTab('retrieve')}
            >
              <FaFolderOpen className="mr-2" /> {isSidebarOpen && 'Retrieve All Documents'}
            </button>
          </li>
          <li>
            <button
              className={`flex items-center w-full text-left p-2 rounded ${activeTab === 'upload' ? 'bg-gray-600' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <FaFileUpload className="mr-2" /> {isSidebarOpen && 'Upload Document'}
            </button>
          </li>
          <li>
            <button
              className={`flex items-center w-full text-left p-2 rounded ${activeTab === 'shared' ? 'bg-gray-600' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              <FaShareAlt className="mr-2" /> {isSidebarOpen && 'Shared Documents'}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'retrieve' && <div>Retrieve All Documents</div>}
        {activeTab === 'upload' && <div className='flex flex-col'> <div>Upload Document</div> <Upload /></div>}
        {activeTab === 'shared' && <div>Shared Documents</div>}
        {activeTab === 'search' && (
          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-xl mb-2">Search Results</h2>
            {searchResults.length ? (
              searchResults.map((result, index) => (
                <div key={index} className="p-1 border-b border-gray-600">{result}</div>
              ))
            ) : (
              <div className="text-gray-400">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
