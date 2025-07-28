"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from "@/components/ui/button";
import { Navbar } from '@/component/Navbar ';
import { getUserTokens, sendTokenSimple, SimpleTokenInfo, getTokenBalance } from "@/utils/SendToken"

export default function SendToken() {
  // Basic state
  const [tokens, setTokens] = useState<SimpleTokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<SimpleTokenInfo | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [solBalance, setSolBalance] = useState<number>(0);
  
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction } = useWallet();

  // Load tokens and SOL balance
  const loadTokens = async () => {
    if (!connected || !publicKey) {
      setError('Connect wallet first');
      return;
    }

    setLoading(true);
    setMessage('Loading tokens and checking balances...');
    
    try {
      // Load SOL balance
      const solBal = await connection.getBalance(publicKey);
      setSolBalance(solBal / LAMPORTS_PER_SOL);

      // Load tokens
      const userTokens = await getUserTokens(connection, publicKey);
      setTokens(userTokens);
      
      if (userTokens.length > 0) {
        setMessage(`Found ${userTokens.length} tokens. SOL balance: ${(solBal / LAMPORTS_PER_SOL).toFixed(4)}`);
      } else {
        setMessage(`No tokens found. SOL balance: ${(solBal / LAMPORTS_PER_SOL).toFixed(4)}`);
      }
      setError('');
    } catch (err) {
      setError('Failed to load tokens and balances');
      setMessage('');
    }
    
    setLoading(false);
  };

  // Refresh specific token balance
  const refreshTokenBalance = async (token: SimpleTokenInfo) => {
    if (!publicKey) return;
    
    try {
      const currentBalance = await getTokenBalance(connection, publicKey, token.mint);
      if (currentBalance) {
        // Update the token in the list
        setTokens(prevTokens => 
          prevTokens.map(t => 
            t.mint === token.mint 
              ? { ...t, balance: currentBalance.balance, rawBalance: currentBalance.rawBalance }
              : t
          )
        );
        
        // Update selected token if it's the same
        if (selectedToken?.mint === token.mint) {
          setSelectedToken({ ...token, balance: currentBalance.balance, rawBalance: currentBalance.rawBalance });
        }
      }
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  // Send function with enhanced validation
  const handleSend = async () => {
    // Basic validation
    if (!selectedToken || !recipientAddress || !amount) {
      setError('Fill all fields');
      return;
    }

    if (!signTransaction || !publicKey) {
      setError('Wallet not connected');
      return;
    }

    // Check address format
    try {
      new PublicKey(recipientAddress);
    } catch {
      setError('Invalid recipient address format');
      return;
    }

    // Check amount
    const sendAmount = parseFloat(amount);
    if (sendAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Check SOL balance for fees
    if (solBalance < 0.000005) {
      setError('Insufficient SOL for transaction fees (need at least 0.000005 SOL)');
      return;
    }

    setLoading(true);
    setMessage('Checking current balance...');
    setError('');

    try {
      // Refresh token balance before sending
      await refreshTokenBalance(selectedToken);
      
      // Get the most current balance
      const currentBalance = await getTokenBalance(connection, publicKey, selectedToken.mint);
      
      if (!currentBalance) {
        setError('Could not verify current token balance');
        setLoading(false);
        return;
      }

      // Final balance check
      if (sendAmount > currentBalance.balance) {
        setError(`Insufficient funds. Available: ${currentBalance.balance}, Requested: ${sendAmount}`);
        setLoading(false);
        return;
      }

      setMessage('Sending transaction...');

      const result = await sendTokenSimple(
        connection,
        publicKey,
        recipientAddress,
        selectedToken.mint,
        sendAmount,
        selectedToken.decimals,
        signTransaction
      );

      if (result.success) {
        setMessage(`✅ Success! Signature: ${result.signature?.slice(0, 8)}...${result.signature?.slice(-8)}`);
        setAmount('');
        setRecipientAddress('');
        // Reload tokens to show new balance
        setTimeout(loadTokens, 3000);
      } else {
        setError(result.error || 'Send failed');
        setMessage('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
      setMessage('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-20">
        <div className="w-full max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              Send Tokens
            </h1>
            <p className="text-zinc-400 text-lg">Transfer tokens to any Solana address</p>
          </div>

          {/* Main card */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
            
            {/* Wallet status */}
            {connected ? (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-green-400 font-semibold text-sm">✅ Wallet Connected</p>
                <p className="text-zinc-300 font-mono text-xs">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                </p>
                {solBalance > 0 && (
                  <p className="text-zinc-400 text-xs mt-1">
                    SOL Balance: {solBalance.toFixed(4)} SOL
                    {solBalance < 0.000005 && (
                      <span className="text-orange-400 ml-2">⚠️ Low balance for fees</span>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                <p className="text-orange-400 font-semibold text-sm">⚠️ Connect your wallet first</p>
              </div>
            )}

            {/* Load tokens button */}
            {connected && tokens.length === 0 && (
              <Button
                onClick={loadTokens}
                disabled={loading}
                className="w-full mb-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl"
              >
                {loading ? 'Loading...' : 'Load My Tokens'}
              </Button>
            )}

            {/* Refresh button */}
            {tokens.length > 0 && (
              <Button
                onClick={loadTokens}
                disabled={loading}
                className="w-full mb-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh Balances'}
              </Button>
            )}

            {/* Token selection */}
            {tokens.length > 0 && (
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">Select Token:</label>
                <div className="space-y-2">
                  {tokens.map((token) => (
                    <div
                      key={token.mint}
                      onClick={() => setSelectedToken(token)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedToken?.mint === token.mint
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">{token.name}</p>
                          <p className="text-zinc-400 text-sm">{token.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{token.balance.toFixed(6)}</p>
                          <p className="text-zinc-500 text-sm">{token.decimals} decimals</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshTokenBalance(token);
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 mt-1"
                          >
                            🔄 Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send form */}
            {selectedToken && (
              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block text-white font-semibold mb-2">Recipient Address:</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter Solana wallet address..."
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-white font-semibold mb-2">Amount:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      max={selectedToken.balance}
                      step="0.000001"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                    />
                    <span className="absolute right-4 top-3 text-zinc-400">
                      {selectedToken.symbol}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm mt-1">
                    Available: {selectedToken.balance.toFixed(6)} {selectedToken.symbol}
                  </p>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                  {['25%', '50%', '75%', 'Max'].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => {
                        const p = percent === 'Max' ? 1 : parseInt(percent) / 100;
                        const newAmount = selectedToken.balance * p;
                        setAmount(newAmount.toFixed(6));
                      }}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm"
                    >
                      {percent}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {message && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-400 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Send button */}
            {selectedToken && (
              <Button
                onClick={handleSend}
                disabled={loading || !recipientAddress || !amount || solBalance < 0.000005}
                className="w-full mt-6 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Tokens'}
              </Button>
            )}

            {/* Warnings */}
            <div className="mt-6 space-y-3">
              {solBalance < 0.000005 && solBalance > 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <p className="text-orange-400 text-sm">
                    ⚠️ <strong>Low SOL Balance:</strong> You need at least 0.000005 SOL for transaction fees.
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-orange-400 text-sm">
                  ⚠️ <strong>Warning:</strong> Double-check the recipient address. Transactions cannot be reversed!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}