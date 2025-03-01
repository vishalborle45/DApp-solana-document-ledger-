import { useEffect, useState, useCallback } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useDocumentStorageProgram } from "./solanaService";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export const useInitializeUserAccount = () => {
  const program = useDocumentStorageProgram();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const initializeUser = useCallback(async () => {
    if (!program || !wallet || initialized) return; // Prevent re-initialization
    setLoading(true);

    const [userDocumentsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_documents"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.account.userDocuments.fetch(userDocumentsPDA);
      setInitialized(true);
      console.log("User account already initialized.");
    } catch (error) {
      console.log("Initializing new user account...");

      try {
        const tx = await program.methods
          .initialize()
          .accounts({
            userDocuments: userDocumentsPDA,
            user: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc({
            preflightCommitment: "processed",
            skipPreflight: true, // Prevent unnecessary checks
          });

        console.log("User account initialized:", tx);
        setInitialized(true);
      } catch (txError) {
        console.error("Failed to initialize user account:", txError);
      }
    }

    setLoading(false);
  }, [program, wallet, initialized]); // Dependency array ensures it doesn't run unnecessarily

  useEffect(() => {
    initializeUser();
  }, [initializeUser]); // Runs only when dependencies change

  return { initialized, loading };
};
