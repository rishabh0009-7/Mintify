import {
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    PublicKey,
    TransactionSignature,
    ConfirmOptions,
  } from '@solana/web3.js';
  
  import {
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID, // Ensure this is correctly imported
    getAssociatedTokenAddress,
    ASSOCIATED_TOKEN_PROGRAM_ID, // Ensure this is correctly imported
  } from '@solana/spl-token';
  
  import {
    createCreateMetadataAccountV3Instruction,
    PROGRAM_ID as METADATA_PROGRAM_ID, // This is the crucial import
    DataV2,
  } from '@metaplex-foundation/mpl-token-metadata';
  
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
    metadataUri?: string;
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
    metadataAddress: string;
  }
  
  export interface TokenMetadata {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: null;
    collection: null;
    uses: null;
  }
  
  export const createSPLToken = async (
    wallet: WalletAdapter,
    tokenData: TokenData
  ): Promise<TokenCreationResult> => {
    // Use devnet for testing, change to mainnet-beta for production
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
    try {
      // Validate that we have everything we need
      if (!wallet || !wallet.publicKey) {
        throw new Error('Wallet not connected properly');
      }
  
      if (!tokenData.name || !tokenData.symbol || !tokenData.supply) {
        throw new Error('Missing required fields: name, symbol, or supply');
      }
  
      console.log('Starting token creation process...');
  
      // 1. Generate token mint keypair
      const mintKeypair = Keypair.generate();
      console.log('Mint address:', mintKeypair.publicKey.toString());
  
      // 2. Calculate rent for mint account
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
      // 3. Find associated token address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );
  
      // 4. Find metadata account address
      // THIS IS THE LINE THAT WAS CAUSING THE ERROR BECAUSE METADATA_PROGRAM_ID WAS UNDEFINED
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(), // METADATA_PROGRAM_ID must be defined here
          mintKeypair.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );
  
      // 5. Calculate token amount with decimals
      const decimals = parseInt(tokenData.decimals);
      const supply = parseFloat(tokenData.supply);
      const tokenAmount = BigInt(supply * Math.pow(10, decimals));
  
      // 6. Build the transaction
      const transaction = new Transaction();
  
      // i) Create the mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID
        })
      );
  
      // ii) Initialize the mint
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey, // mint account
          decimals, // decimal places
          wallet.publicKey, // mint authority
          wallet.publicKey // freeze authority
        )
      );
  
      // iii) Create associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          associatedTokenAddress, // associated token account
          wallet.publicKey, // owner
          mintKeypair.publicKey // mint
        )
      );
  
      // iv) Mint tokens to your account
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey, // mint
          associatedTokenAddress, // destination
          wallet.publicKey, // authority
          tokenAmount // amount
        )
      );
  
      // v) Create metadata account
      const metadataData: DataV2 = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        uri: tokenData.metadataUri || "", // You can upload metadata to IPFS/Arweave
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      };
  
      transaction.add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataAddress,
            mint: mintKeypair.publicKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
            updateAuthority: wallet.publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: metadataData,
              isMutable: true,
              collectionDetails: null,
            },
          }
        )
      );
  
      // 7. Prepare the transaction for sending
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
  
      // 8. Sign the transaction with our mint keypair first
      transaction.partialSign(mintKeypair);
  
      // 9. Get wallet signature
      const signedTransaction = await wallet.signTransaction(transaction);
  
      // 10. Send transaction to Solana
      const confirmOptions: ConfirmOptions = {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      };
  
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        confirmOptions
      );
  
      console.log('Transaction sent:', signature);
  
      // 11. Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
  
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
  
      console.log('Token created successfully!');
  
      return {
        success: true,
        signature,
        mintAddress: mintKeypair.publicKey.toString(),
        tokenAccount: associatedTokenAddress.toString(),
        metadataAddress: metadataAddress.toString(),
      };
  
    } catch (error) {
      console.error('Token creation failed:', error);
      throw error;
    }
  };