import CryptoJS from 'crypto-js';

/**
 * Encrypt an IPFS CID using AES encryption.
 * @param cid - The IPFS CID to encrypt.
 * @param key - The hashed signature to be used as an encryption key.
 * @returns An object containing encrypted data and IV.
 */
export function encryptCID(cid: string, key: string): { encryptedData: string; iv: string } {
  const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV
  const encrypted = CryptoJS.AES.encrypt(cid, CryptoJS.enc.Hex.parse(key), { iv });

  return {
    encryptedData: encrypted.toString(),
    iv: iv.toString(CryptoJS.enc.Hex), // Convert IV to hex string
  };
}

/**
 * Decrypt an encrypted IPFS CID.
 * @param encryptedData - The encrypted CID data.
 * @param iv - The IV used during encryption.
 * @param key - The hashed signature to be used as a decryption key.
 * @returns The decrypted IPFS CID.
 */
export function decryptCID(encryptedData: string, iv: string, key: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv),
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
