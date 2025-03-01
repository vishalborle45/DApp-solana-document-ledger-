import { useWallet } from '@solana/wallet-adapter-react';
import { useRecoilState } from 'recoil';
import { authState } from '../state/authAtom';
import CryptoJS from 'crypto-js';
import { useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function TopBar() {
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const [auth, setAuth] = useRecoilState(authState);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAuth = async () => {
    if (!auth.isAuthenticated && publicKey && signMessage) {
      try {
        const message = new TextEncoder().encode('Authenticate');
        const signature = await signMessage(message);
        const hashedSignature = CryptoJS.SHA256(signature.toString()).toString();
        setAuth({ isAuthenticated: true, signature: hashedSignature });
      } catch (error) {
        console.error('Authentication failed', error);
      }
    } else {
      handleLogout(); // Call logout function
    }
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, signature: '' });
    disconnect(); // Disconnect wallet
    setShowDropdown(false); // Close dropdown
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-md">
      {/* Logo */}
      <div className="text-lg font-bold">MyLogo</div>

      <div className="flex items-center gap-4">
        {!connected ? (
          <WalletMultiButton className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" />
        ) : (
          <>
            {/* Profile Icon */}
            <div
              className="relative cursor-pointer bg-gray-700 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {publicKey?.toBase58().charAt(0).toUpperCase()}
              {showDropdown && (
                <div className="absolute top-12 right-0 bg-gray-800 text-white text-sm p-3 rounded shadow-md w-56">
                  <p className="truncate">{publicKey?.toBase58()}</p>
                  <button
                    onClick={handleCopy}
                    className="mt-2 flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-md w-full"
                  >
                    <AiOutlineCopy size={16} /> Copy Public Key
                  </button>
                </div>
              )}
            </div>

            {/* Authenticate / Logout Button */}
            <button
              onClick={handleAuth}
              className={`px-4 py-2 rounded-md ${
                auth.isAuthenticated
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {auth.isAuthenticated ? 'Logout' : 'Authenticate'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
