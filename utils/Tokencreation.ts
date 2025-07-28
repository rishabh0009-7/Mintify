import {
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
    TransactionSignature,
    ConfirmOptions,
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
  
  // Metaplex Token Metadata Program ID
  const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  
  // Helper function to create metadata instruction using proper format
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
    // CreateMetadataAccountV3 instruction data
    const nameBuffer = Buffer.from(name, 'utf8');
    const symbolBuffer = Buffer.from(symbol, 'utf8');
    const uriBuffer = Buffer.from(uri, 'utf8');
    
    // Instruction discriminator for CreateMetadataAccountV3
    const discriminator = Buffer.from([33, 168, 68, 200, 204, 228, 24, 129]);
    
    // Build the instruction data
    const data = Buffer.alloc(
      8 + // discriminator
      4 + nameBuffer.length + // name length + name
      4 + symbolBuffer.length + // symbol length + symbol
      4 + uriBuffer.length + // uri length + uri
      2 + // seller fee basis points
      1 + // creators (Option<Vec<Creator>>) - None
      1 + // collection (Option<Collection>) - None
      1 + // uses (Option<Uses>) - None
      1 + // is mutable
      1   // collection details (Option<CollectionDetails>) - None
    );
    
    let offset = 0;
    
    // Write discriminator
    discriminator.copy(data, offset);
    offset += 8;
    
    // Write name
    data.writeUInt32LE(nameBuffer.length, offset);
    offset += 4;
    nameBuffer.copy(data, offset);
    offset += nameBuffer.length;
    
    // Write symbol
    data.writeUInt32LE(symbolBuffer.length, offset);
    offset += 4;
    symbolBuffer.copy(data, offset);
    offset += symbolBuffer.length;
    
    // Write URI
    data.writeUInt32LE(uriBuffer.length, offset);
    offset += 4;
    uriBuffer.copy(data, offset);
    offset += uriBuffer.length;
    
    // Write seller fee basis points (0%)
    data.writeUInt16LE(0, offset);
    offset += 2;
    
    // Write creators option (0 = None)
    data.writeUInt8(0, offset);
    offset += 1;
    
    // Write collection option (0 = None)
    data.writeUInt8(0, offset);
    offset += 1;
    
    // Write uses option (0 = None)
    data.writeUInt8(0, offset);
    offset += 1;
    
    // Write is mutable (1 = true)
    data.writeUInt8(1, offset);
    offset += 1;
    
    // Write collection details option (0 = None)
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
  
  // Helper function to create basic metadata JSON
  const createMetadataJson = (tokenData: TokenData): string => {
    const metadata = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: tokenData.description || '',
      image: '', // In production, upload image to IPFS/Arweave first
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
      
      // Validate inputs
      if (!wallet || !wallet.publicKey) {
        throw new Error('Wallet not connected properly');
      }
  
      if (!tokenData.name || !tokenData.symbol || !tokenData.supply) {
        throw new Error('Missing required fields: name, symbol, or supply');
      }
  
      // 1. Generate mint keypair
      const mintKeypair = Keypair.generate();
      console.log('🔑 Generated mint address:', mintKeypair.publicKey.toString());
  
      // 2. Get rent for mint account
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
      // 3. Get associated token address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );
  
      // 4. Calculate token amount
      const decimals = parseInt(tokenData.decimals);
      const supply = parseFloat(tokenData.supply);
      const tokenAmount = BigInt(supply * Math.pow(10, decimals));
  
      // 5. Build transaction WITHOUT metadata first
      const transaction = new Transaction();
  
      // Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID
        })
      );
  
      // Initialize mint
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          wallet.publicKey,
          wallet.publicKey
        )
      );
  
      // Create associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAddress,
          wallet.publicKey,
          mintKeypair.publicKey
        )
      );
  
      // Mint tokens
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAddress,
          wallet.publicKey,
          tokenAmount
        )
      );
  
      // 6. Send transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
  
      // 7. Sign with mint keypair
      transaction.partialSign(mintKeypair);
      console.log('🔐 Signed transaction with mint keypair');
  
      // 8. Get wallet signature
      const signedTransaction = await wallet.signTransaction(transaction);
      console.log('✍️ Got wallet signature');
  
      //9 Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );
  
      console.log('📡 Transaction sent:', signature);
  
      // 10 Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');
  
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
  
      console.log('Token created successfully!');
  
      // Now try to add metadata in a separate transaction
      let metadataAddress = '';
      try {
        console.log('📄 Adding metadata...');
        
        // Find metadata PDA
        const [metadataPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mintKeypair.publicKey.toBuffer(),
          ],
          METADATA_PROGRAM_ID
        );
        
        metadataAddress = metadataPDA.toString();
        
        // Create metadata JSON
        const metadataJson = createMetadataJson(tokenData);
        const metadataUri = `data:application/json;charset=utf-8,${encodeURIComponent(metadataJson)}`;
        
        // Create metadata transaction
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
        
        // Send metadata transaction
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
        
        // Confirm metadata transaction
        await connection.confirmTransaction({
          signature: metadataSignature,
          blockhash: metadataBlockhash,
          lastValidBlockHeight: metadataLastValidBlockHeight,
        }, 'confirmed');
        
        console.log('📄 Metadata added successfully!', metadataSignature);
        
      } catch (metadataError) {
        console.warn('⚠️ Failed to add metadata (token still created):', metadataError);
        // Continue without metadata - token is still valid
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