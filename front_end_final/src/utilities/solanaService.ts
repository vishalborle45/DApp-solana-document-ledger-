import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import type { DocumentStorage } from "../../../target/types/document_storage";
import idl from "../../../target/idl/document_storage.json";



export const useDocumentStorageProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  if (!wallet) return undefined;

  // Create a provider
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Set the provider (optional, but be cautious in React)
  setProvider(provider);

  // Return the program instance
  return new Program<DocumentStorage>(idl as DocumentStorage, provider);
};
