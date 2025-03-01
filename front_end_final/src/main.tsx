import { StrictMode, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';
import { RecoilRoot } from 'recoil';

interface WalletProps {
  children: ReactNode;
}

function Wallet({ children }: WalletProps) {
  const wallets = [new PhantomWalletAdapter()]; // Add more wallets as needed

  return (
    <ConnectionProvider endpoint="http://127.0.0.1:8899">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
    <Wallet>
      <App />
    </Wallet>
    </RecoilRoot>
  </StrictMode>
);
