import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionSignature,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

// Type definitions
export interface TokenData {
  name: string;
  symbol: string;
  description?: string;
  image?: File | null;
  decimals: string;
  supply: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
}

export interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

export interface TokenCreationResult {
  success: boolean;
  signature: TransactionSignature;
  mintAddress: string;
  tokenAccount: string;
  metadataAddress?: string;
}

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Create metadata instruction
const createMetadataInstruction = (
  metadataAccount: PublicKey,
  mint: PublicKey,
  mintAuthority: PublicKey,
  payer: PublicKey,
  updateAuthority: PublicKey,
  name: string,
  symbol: string,
  uri: string
): TransactionInstruction => {
  const nameBuffer = Buffer.from(name, 'utf8');
  const symbolBuffer = Buffer.from(symbol, 'utf8');
  const uriBuffer = Buffer.from(uri, 'utf8');
  
  const discriminator = Buffer.from([33, 168, 68, 200, 204, 228, 24, 129]);
  
  const data = Buffer.alloc(
    8 + 
    4 + nameBuffer.length + 
    4 + symbolBuffer.length + 
    4 + uriBuffer.length + 
    2 + 
    1 + 
    1 + 
    1 + 
    1 + 
    1   
  );
  
  let offset = 0;
  
  discriminator.copy(data, offset);
  offset += 8;
  
  data.writeUInt32LE(nameBuffer.length, offset);
  offset += 4;
  nameBuffer.copy(data, offset);
  offset += nameBuffer.length;
  
  data.writeUInt32LE(symbolBuffer.length, offset);
  offset += 4;
  symbolBuffer.copy(data, offset);
  offset += symbolBuffer.length;
  
  data.writeUInt32LE(uriBuffer.length, offset);
  offset += 4;
  uriBuffer.copy(data, offset);
  offset += uriBuffer.length;
  
  data.writeUInt16LE(0, offset);
  offset += 2;
  
  data.writeUInt8(0, offset);
  offset += 1;
  
  data.writeUInt8(0, offset);
  offset += 1;
  
  data.writeUInt8(0, offset);
  offset += 1;
  
  data.writeUInt8(1, offset);
  offset += 1;
  
  data.writeUInt8(0, offset);
  
  return new TransactionInstruction({
    keys: [
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: mintAuthority, isSigner: true, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: updateAuthority, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: METADATA_PROGRAM_ID,
    data: data,
  });
};

// Create metadata JSON
const createMetadataJson = (tokenData: TokenData): string => {
  const metadata = {
    name: tokenData.name,
    symbol: tokenData.symbol,
    description: tokenData.description || '',
    image: '',
    external_url: tokenData.website || '',
    attributes: [],
    properties: {
      files: [],
      category: 'token',
    },
    social: {
      twitter: tokenData.twitter || '',
      discord: tokenData.discord || '',
      telegram: tokenData.telegram || '',
    }
  };
  
  return JSON.stringify(metadata);
};

// Main token creation function
export const createSPLToken = async (
  wallet: WalletAdapter,
  tokenData: TokenData
): Promise<TokenCreationResult> => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  try {
    console.log('🚀 Starting token creation process...');
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected properly');
    }

    if (!tokenData.name || !tokenData.symbol || !tokenData.supply) {
      throw new Error('Missing required fields: name, symbol, or supply');
    }

    const mintKeypair = Keypair.generate();
    console.log('🔑 Generated mint address:', mintKeypair.publicKey.toString());

    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    );

    const decimals = parseInt(tokenData.decimals);
    const supply = parseFloat(tokenData.supply);
    const tokenAmount = BigInt(supply * Math.pow(10, decimals));

    const transaction = new Transaction();

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID
      })
    );

    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        wallet.publicKey,
        wallet.publicKey
      )
    );

    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAddress,
        wallet.publicKey,
        mintKeypair.publicKey
      )
    );

    transaction.add(
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAddress,
        wallet.publicKey,
        tokenAmount
      )
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    transaction.partialSign(mintKeypair);
    console.log('🔐 Signed transaction with mint keypair');

    const signedTransaction = await wallet.signTransaction(transaction);
    console.log('✍️ Got wallet signature');

    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    console.log('📡 Transaction sent:', signature);

    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('Token created successfully!');

    // Try to add metadata
    let metadataAddress = '';
    try {
      console.log('📄 Adding metadata...');
      
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );
      
      metadataAddress = metadataPDA.toString();
      
      const metadataJson = createMetadataJson(tokenData);
      const metadataUri = `data:application/json;charset=utf-8,${encodeURIComponent(metadataJson)}`;
      
      const metadataTransaction = new Transaction();
      
      const metadataInstruction = createMetadataInstruction(
        metadataPDA,
        mintKeypair.publicKey,
        wallet.publicKey,
        wallet.publicKey,
        wallet.publicKey,
        tokenData.name,
        tokenData.symbol,
        metadataUri
      );
      
      metadataTransaction.add(metadataInstruction);
      
      const { blockhash: metadataBlockhash, lastValidBlockHeight: metadataLastValidBlockHeight } = 
        await connection.getLatestBlockhash('confirmed');
      metadataTransaction.recentBlockhash = metadataBlockhash;
      metadataTransaction.feePayer = wallet.publicKey;
      
      const signedMetadataTransaction = await wallet.signTransaction(metadataTransaction);
      
      const metadataSignature = await connection.sendRawTransaction(
        signedMetadataTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );
      
      await connection.confirmTransaction({
        signature: metadataSignature,
        blockhash: metadataBlockhash,
        lastValidBlockHeight: metadataLastValidBlockHeight,
      }, 'confirmed');
      
      console.log('📄 Metadata added successfully!', metadataSignature);
      
    } catch (metadataError) {
      console.warn('⚠️ Failed to add metadata (token still created):', metadataError);
    }

    return {
      success: true,
      signature,
      mintAddress: mintKeypair.publicKey.toString(),
      tokenAccount: associatedTokenAddress.toString(),
      metadataAddress,
    };

  } catch (error) {
    console.error('❌ Token creation failed:', error);
    throw error;
  }
};