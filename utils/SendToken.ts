import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError,
  // Assuming ParsedAccountData is available or can be imported/defined if needed
  // If ParsedAccountData is not exported, you might need to infer its structure
  // or use a more general 'any' type if absolutely necessary, but try to avoid.
} from '@solana/spl-token';
import { AccountInfo, ParsedAccountData } from '@solana/web3.js'; // Import ParsedAccountData explicitly

// Simple types
export interface SimpleTokenInfo {
  mint: string;
  balance: number;
  decimals: number;
  symbol: string;
  name: string;
  rawBalance: string;
}

// Get user's tokens
export async function getUserTokens(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<SimpleTokenInfo[]> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const tokens: SimpleTokenInfo[] = [];

    for (const account of tokenAccounts.value) {
      // Ensure data is parsed and has info
      if (account.account.data && 'parsed' in account.account.data && account.account.data.parsed.info) {
        const info = (account.account.data as ParsedAccountData).parsed.info;
        const balance = parseFloat(info.tokenAmount.uiAmount || '0');

        if (balance > 0) {
          tokens.push({
            mint: info.mint,
            balance: balance,
            decimals: info.tokenAmount.decimals,
            symbol: `${info.mint.slice(0, 4)}...`,
            name: `Token ${info.mint.slice(0, 8)}`,
            rawBalance: info.tokenAmount.amount
          });
        }
      } else {
        console.warn('Skipping unparsed or incomplete token account:', account.pubkey.toBase58());
      }
    }

    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return [];
  }
}

// Get real-time token balance
export async function getTokenBalance(
  connection: Connection,
  walletPublicKey: PublicKey,
  tokenMint: string
): Promise<{ balance: number; rawBalance: string; decimals: number } | null> {
  try {
    const mintPubkey = new PublicKey(tokenMint);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, walletPublicKey);
    
    const accountInfo = await getAccount(connection, tokenAccount);
    
    // Get mint info for decimals
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
    let decimals = 9; // Default to 9

    // Type check to ensure 'parsed' property exists before accessing
    if (mintInfo.value?.data && 'parsed' in mintInfo.value.data) {
      const parsedData = mintInfo.value.data as ParsedAccountData;
      if (parsedData.parsed?.info?.decimals !== undefined) {
        decimals = parsedData.parsed.info.decimals;
      }
    }
    
    return {
      balance: Number(accountInfo.amount) / Math.pow(10, decimals),
      rawBalance: accountInfo.amount.toString(),
      decimals: decimals
    };
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError) {
      return { balance: 0, rawBalance: '0', decimals: 9 };
    }
    console.error('Error getting token balance:', error);
    return null;
  }
}

// Enhanced send function
export async function sendTokenSimple(
  connection: Connection,
  senderPublicKey: PublicKey,
  recipientAddress: string,
  tokenMint: string,
  amount: number,
  decimals: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{ success: boolean; signature?: string; error?: string }> {
  
  try {
    console.log('Starting send...');

    const recipientPubkey = new PublicKey(recipientAddress);
    const mintPubkey = new PublicKey(tokenMint);

    const senderTokenAccount = await getAssociatedTokenAddress(mintPubkey, senderPublicKey);
    const recipientTokenAccount = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

    // Check current balance
    console.log('Checking current balance...');
    const currentBalance = await getTokenBalance(connection, senderPublicKey, tokenMint);
    
    if (!currentBalance) {
      return { success: false, error: 'Could not fetch current token balance' };
    }

    console.log(`Current balance: ${currentBalance.balance}, Trying to send: ${amount}`);

    // Validate balance
    const transferAmount = Math.floor(amount * Math.pow(10, decimals));
    const availableAmount = Number(currentBalance.rawBalance);
    
    if (transferAmount > availableAmount) {
      return { 
        success: false, 
        error: `Insufficient funds. Available: ${currentBalance.balance}, Requested: ${amount}` 
      };
    }

    // Check SOL balance for fees
    // A minimum fee for a simple transaction is very small, 5000 lamports is 0.000005 SOL
    // But account creation can cost more (around 0.002 SOL or 2,000,000 lamports)
    // Adjust this threshold based on typical transaction costs you expect.
    const SOL_FEE_THRESHOLD = 50000; // Increased to 0.00005 SOL to be safer
    const solBalance = await connection.getBalance(senderPublicKey);
    if (solBalance < SOL_FEE_THRESHOLD) {
      return { 
        success: false, 
        error: `Insufficient SOL for transaction fees. Need at least ${SOL_FEE_THRESHOLD / LAMPORTS_PER_SOL} SOL` 
      };
    }

    // Check if recipient associated token account exists
    let needCreateAccount = false;
    try {
      await getAccount(connection, recipientTokenAccount);
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        needCreateAccount = true;
        console.log('Recipient associated token account not found, will create it.');
      } else {
        // Re-throw other errors
        throw error; 
      }
    }

    // Create transaction
    const transaction = new Transaction();

    if (needCreateAccount) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPublicKey,
          recipientTokenAccount,
          recipientPubkey,
          mintPubkey
        )
      );
    }

    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPublicKey,
        transferAmount
      )
    );

    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('Send successful!', signature);
    return { success: true, signature };

  } catch (error) {
    console.error('Send failed:', error);
    
    let errorMessage = 'Send failed';
    if (error instanceof Error) {
      // More specific error messages for common Solana errors
      if (error.message.includes('insufficient funds') || error.message.includes('0x1771')) { // 0x1771 is a common insufficient funds error code
        errorMessage = 'Insufficient token balance for this transfer';
      } else if (error.message.includes('TokenAccountNotFoundError') || error.message.includes('0x3')) { // 0x3 is a common account not found error
        errorMessage = 'Associated token account not found for recipient, and creation failed or was not attempted correctly.';
      } else if (error.message.includes('InvalidAccountOwner') || error.message.includes('0x4')) { // 0x4 is a common invalid account owner error
        errorMessage = 'Invalid account owner or token account is not associated with the mint.';
      } else if (error.message.includes('Signature verification failed') || error.message.includes('Transaction simulation failed')) {
        errorMessage = 'Transaction failed to simulate or verify. Check network conditions or sender/recipient addresses.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}
