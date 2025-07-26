import { PublicKey , Keypair , Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
   createInitializeMintInstruction,
   createAssociatedTokenAccountInstruction,
   createMintToInstruction,
   getMinimumBalanceForRentExemptMint,
   MINT_SIZE,
   TOKEN_PROGRAM_ID,
   getAssociatedTokenAddress
   
    
}

from 
"@solana/spl-token"

import {
    createCreateMetadataAccountV3Instruction,
    PROGRAM_ID as METADATA_PROGRAM_ID,
  }
   from '@metaplex-foundation/mpl-token-metadata';


// initialise connection to solana network 
   const connection = new Connection('https://api.devnet.solana.com' , "confirmed ")



//    function to create  spl token 
 export const createSpl = async (Wallet:any , connection:any)=>{

    try {
        console.log('creating spl token ......')


        // 1- generate a mint key pair
        const mintKeypair = Keypair.generate()

        // 2- calculate required rent 
        const lamports = await getMinimumBalanceForRentExemptMint(connection)
        

        // 3 - get assosciated token address
        const associatedTokenAddress = await getAssociatedTokenAddress(
            mintKeypair.publicKey,
            Wallet.publicKey

        )


    } catch (error) {
        
    }

 }