import { useState, useCallback } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useDocumentStorageProgram } from "./solanaService";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

interface UploadResult {
  success: boolean;
  txId?: string;
  error?: string;
}

export const useUploadDocument = () => {
  const program = useDocumentStorageProgram();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);

  const uploadDocument = useCallback(
    async (fileName: string, fileType: string, encryptedCid: string, iv: string): Promise<UploadResult> => {
      if (!program || !wallet) {
        return { success: false, error: "Wallet not connected or program unavailable." };
      }

      setLoading(true);

      try {
        const [userDocumentsPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_documents"), wallet.publicKey.toBuffer()],
          program.programId
        );

        const [documentPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("document"), wallet.publicKey.toBuffer(), Buffer.from(fileName)],
          program.programId
        );

        const tx = await program.methods
          .addDocument(fileName, fileType, encryptedCid, iv)
          .accounts({
            userDocuments: userDocumentsPDA,
            document: documentPDA,
            user: wallet.publicKey,
            owner: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log("Document uploaded successfully:", tx);
        return { success: true, txId: tx };
      } catch (error: any) {
        console.error("Error uploading document:", error);
        return { success: false, error: error.message || "Unknown error" };
      } finally {
        setLoading(false);
      }
    },
    [program, wallet]
  );

  return { uploadDocument, loading };
};
