import { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useDocumentStorageProgram } from "./solanaService";

export const useRetrieveAllDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wallet = useAnchorWallet();
  const program = useDocumentStorageProgram();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!program || !wallet) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all document accounts
        const allDocuments = await program.account.document.all([
          {
            memcmp: {
              offset: 8, // Skip the discriminator (8 bytes)
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);

        // Process documents
        const formattedDocuments = allDocuments.map((doc) => ({
          publicKey: doc.publicKey.toString(),
          fileName: doc.account.fileName,
          fileType: doc.account.fileType,
          encryptedCid: doc.account.encryptedCid,
          iv: doc.account.iv,
          owner: doc.account.owner.toString(),
          sharedWith: doc.account.sharedWith,
        }));

        setDocuments(formattedDocuments);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [program, wallet]);

  return { documents, loading, error };
};
