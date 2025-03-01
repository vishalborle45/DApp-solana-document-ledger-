import './App.css'
import {Navigate, Route, Routes } from 'react-router-dom'
import TopBar from './components/Topbar'
import Home from './pages/Home';
import Dashboard from './pages/Dahsboard';
import { useRecoilState } from 'recoil';
import { authState } from './state/authAtom';
import { useWallet } from '@solana/wallet-adapter-react';
import { BrowserRouter} from 'react-router-dom';


function App() {
  const [auth] = useRecoilState(authState);
  const { connected } = useWallet();

  return (

    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={!auth.isAuthenticated ? <Home /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={auth.isAuthenticated ? <Dashboard/> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
