

import {program} from './solanaService';

async function test(){

  const simulateTx = async () => {
    try {
      const tx = await program.methods.initialize()
        .accounts({
          userDocuments: userDocumentsPDA,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction(); // Instead of .rpc()
  
      const simulation = await provider.connection.simulateTransaction(tx);
      console.log("Simulation result:", simulation);
    } catch (error) {
      console.error("Simulation failed:", error);
    }
  };
  
  simulateTx()


    const tx = await program.methods
    .initialize()
    .accounts({
      userDocuments: userDocumentsPDA,
      user: ownerKeypair.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([ownerKeypair])
    .rpc();
  
  console.log("Initialize transaction signature", tx);

  // Verify the user documents account
  const userDocumentsAccount = await program.account.userDocuments.fetch(userDocumentsPDA);
}