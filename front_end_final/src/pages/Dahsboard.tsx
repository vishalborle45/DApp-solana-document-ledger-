import { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaFileUpload, FaFolderOpen, FaShareAlt } from 'react-icons/fa';
import Upload from '../components/Upload';
import { useInitializeUserAccount } from '../utilities/Initialized';
import DocumentList from '../components/DocumnetList'; // Fixed typo in import name
import { useSetRecoilState } from 'recoil';
import { Initializedstate } from '../state/initialized';

function Dashboard() {
  const { initialized, loading } = useInitializeUserAccount();
  const setInitializedState = useSetRecoilState(Initializedstate);
  
  // Run this effect when initialized or loading changes
  useEffect(() => {
    setInitializedState({
      isInitialized: initialized,
      isloading: loading
    });
  }, [initialized, loading, setInitializedState]);

  const [activeTab, setActiveTab] = useState('retrieve');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white p-4 transition-all ${isSidebarOpen ? 'w-1/4' : 'w-16'}`}>
        <button
          className="text-white mb-4"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        
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
        {activeTab === 'retrieve' && <div className='flex flex-col'><div>Retrieve All Documents</div> <DocumentList /></div>}
        {activeTab === 'upload' && <div className='flex flex-col'><div>Upload Document</div> <Upload /></div>}
        {activeTab === 'shared' && <div>Shared Documents</div>}
      </div>
    </div>
  );
}

export default Dashboard;