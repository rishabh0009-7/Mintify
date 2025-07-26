import { useWallet } from '@solana/wallet-adapter-react';
import { 
    Connection, 
    Keypair, 
    Transaction,
    SystemProgram,
    PublicKey,
    Connection
  } from '@solana/web3.js';

  import {
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAccount,
   
  } from '@solana/spl-token';


  import {
    createCreateMetadataAccountV3Instruction,
    PROGRAM_ID as METADATA_PROGRAM_ID,
  } from '@metaplex-foundation/mpl-token-metadata';
import { connect } from 'http2';
import { transcode } from 'buffer';


//   create token

const createToken  = async (wallet:any ){
const connection = new Connection("https://api.devnet.solana.com', 'confirmed")

try {

    console.log("started creating token ....")

    // 1- generate mintkeypair 
    const mintKeypair = Keypair.generate ()
    
    // 2-get rent amount 
    const lamport = await getMinimumBalanceForRentExemptMint(connection)

    // 3- get  associatedToken address

    const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey

    )
    
    
    // 4- crete metadata address 
    const [metadataAddress]  = PublicKey.findProgramAddressSync(
        [
            Buffer.from ("metadata "),
            METADATA_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer()
        ], 
        METADATA_PROGRAM_ID
    )

    // 5- build transaction 

    const transaction = new Transaction()

// i)create mint account 
    transaction.add (
        SystemProgram.createAccount({
            fromPubkey :wallet.publicKey,
            newAccountPubkey : mintKeypair.publicKey,
            space :MINT_SIZE,
            lamports,
            programId :TOKEN_PROGRAM_ID

        })



    )


    // ii)initialise mint 

    transaction.add(
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            parseInt(tokenData.decimals ),
            wallet.publicKey

        )
    )
    
} catch (error) {
    
}

}