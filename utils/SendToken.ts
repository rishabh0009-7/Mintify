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
  TokenAccountNotFoundError
} from '@solana/spl-token';

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
      const info = account.account.data.parsed.info;
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
    const decimals = mintInfo.value?.data.parsed?.info?.decimals || 9;
    
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
    const solBalance = await connection.getBalance(senderPublicKey);
    if (solBalance < 5000) {
      return { 
        success: false, 
        error: 'Insufficient SOL for transaction fees. Need at least 0.000005 SOL' 
      };
    }

    // Check if recipient account exists
    let needCreateAccount = false;
    try {
      await getAccount(connection, recipientTokenAccount);
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        needCreateAccount = true;
        console.log('Need to create recipient token account');
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
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient token balance for this transfer';
      } else if (error.message.includes('TokenAccountNotFoundError')) {
        errorMessage = 'Token account not found';
      } else if (error.message.includes('InvalidAccountOwner')) {
        errorMessage = 'Invalid account owner';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}
