import { atom } from 'recoil';

interface Initializedstate {
  isInitialized: boolean;
  isloading: boolean; // Hashed signature for encryption/decryption
}

export const Initializedstate = atom<Initializedstate>({
  key: 'Initializedstate',
  default: {
    isInitialized: false,
    isloading: false ,
  },
});
