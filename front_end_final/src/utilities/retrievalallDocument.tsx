import { useEffect, useState, useCallback, useRef } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useDocumentStorageProgram } from "./solanaService";
import { useSetRecoilState } from "recoil";
import { documentState } from "../state/documentState";
import { PublicKey } from "@solana/web3.js";

export const useRetrieveAllDocuments = () => {
  const wallet = useAnchorWallet();
  const program = useDocumentStorageProgram();
  const setDocuments = useSetRecoilState(documentState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to track dependencies without triggering re-renders
  const walletRef = useRef();
  const programRef = useRef();
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  
  // Update refs when dependencies change
  useEffect(() => {
    walletRef.current = wallet;
    programRef.current = program;
  }, [wallet, program]);

  const fetchDocuments = useCallback(async (force = false) => {
    // Skip if already fetching or dependencies missing
    if (fetchingRef.current || !programRef.current || !walletRef.current) {
      return;
    }
    
    // Throttle fetches (prevent fetching more often than once every 3 seconds)
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 3000) {
      console.log("🔄 Skipping fetch (throttled)");
      return;
    }
    
    // Set fetching flags
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      lastFetchTimeRef.current = now;
      
      console.log("🔍 Fetching documents from blockchain...");
      
      // Create memcmp filter using walletRef for stability
      const memcmpFilter = {
        memcmp: {
          offset: 8,
          bytes: walletRef.current.publicKey.toBase58(),
        },
      };

      // Fetch documents
      const allDocuments = await programRef.current.account.document.all([memcmpFilter]);
      console.log(`✅ Found ${allDocuments.length} documents`);

      // Map without creating unnecessary intermediate objects
      const formattedDocuments = allDocuments.map((doc) => ({
        publicKey: doc.publicKey.toString(),
        fileName: doc.account.fileName,
        fileType: doc.account.fileType,
        encryptedCid: doc.account.encryptedCid,
        iv: doc.account.iv,
        owner: doc.account.owner.toString(),
        sharedWith: doc.account.sharedWith,
      }));

      // Update state once at the end
      setDocuments(formattedDocuments);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      setError(err);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []); // Empty dependency array since we use refs

  // Initial fetch when wallet/program are available
  useEffect(() => {
    // Only fetch if wallet or program has changed
    if (wallet && program) {
      fetchDocuments();
    }
  }, [wallet, program, fetchDocuments]);

  // Setup subscription to account changes
  useEffect(() => {
    if (!program || !wallet) return;
    
    // Create a function to handle account changes
    const handleAccountChange = () => {
      console.log("🔔 Account change detected");
      fetchDocuments();
    };
    
    // Get the program ID
    const programId = program.programId;
    
    // Create an event emitter for the account
    const eventEmitter = program.provider.connection.onProgramAccountChange(
      programId,
      handleAccountChange,
      "confirmed"
    );
    
    // Clean up subscription
    return () => {
      program.provider.connection.removeProgramAccountChangeListener(eventEmitter);
    };
  }, [program, wallet, fetchDocuments]);

  return { 
    isLoading, 
    error, 
    // Expose a memoized refetch function that forces refresh
    refetch: useCallback(() => fetchDocuments(true), [fetchDocuments]) 
  };
};