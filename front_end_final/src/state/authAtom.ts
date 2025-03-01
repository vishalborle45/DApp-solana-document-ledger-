import { atom } from 'recoil';

interface AuthState {
  isAuthenticated: boolean;
  signature: string; // Hashed signature for encryption/decryption
}

export const authState = atom<AuthState>({
  key: 'authState',
  default: {
    isAuthenticated: false,
    signature: '',
  },
});
