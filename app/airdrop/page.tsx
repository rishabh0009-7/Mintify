"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Button } from "@/components/ui/button";
import { Navbar } from '@/component/Navbar '; 

export default function Airdrop() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const handleAirdrop = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > 5) {
      setError('Maximum airdrop amount is 5 SOL');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('Requesting airdrop...');

    try {
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const signature = await connection.requestAirdrop(publicKey, lamports);
      
      setStatus('Confirming transaction...');
      await connection.confirmTransaction(signature);
      
      setStatus(`Successfully airdropped ${amount} SOL!`);
      setAmount('');
      
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      console.error('Airdrop failed:', err);
      setError('Airdrop failed. Make sure you\'re on devnet and try a smaller amount.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [0.5, 1, 2, 5];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 pt-16 sm:pt-20">
        <div className="w-full max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-3 sm:mb-4 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs sm:text-sm text-zinc-300 backdrop-blur-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Devnet Only</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              Request Airdrop
            </h1>
            
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed px-2">
              Get free SOL for testing on Solana devnet
            </p>
          </div>

          {/* Airdrop Card */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Wallet Status */}
            {connected ? (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl sm:rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-green-400 font-semibold text-sm">Wallet Connected</p>
                    <p className="text-zinc-300 font-mono text-xs">
                      {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl sm:rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <p className="text-orange-400 font-semibold text-sm">Please connect your wallet</p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-white font-semibold mb-2 sm:mb-3 text-sm">
                Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (max 5 SOL)"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-3 sm:py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl sm:rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-base sm:text-lg font-semibold"
                  disabled={!connected || isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-zinc-400 font-semibold">SOL</span>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-4 sm:mb-6">
              <p className="text-zinc-400 text-sm mb-3">Quick amounts:</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    disabled={!connected || isLoading}
                    className="px-2 sm:px-3 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-zinc-600/50 rounded-lg sm:rounded-xl text-zinc-300 hover:text-white transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            {status && (
              <div className="mb-4 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl">
                <p className="text-blue-400 font-semibold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  {status}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl">
                <p className="text-red-400 font-semibold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </p>
              </div>
            )}

            {/* Airdrop Button */}
            <Button
              onClick={handleAirdrop}
              disabled={!connected || isLoading || !amount}
              className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ease-out transform hover:scale-[1.02] rounded-xl sm:rounded-2xl border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🎁</span>
                  Request Airdrop
                </div>
              )}
            </Button>

            {/* Info Box */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-zinc-800/30 border border-zinc-700/30 rounded-xl sm:rounded-2xl">
              <h3 className="text-white font-semibold mb-2 text-sm">Important Notes:</h3>
              <ul className="text-zinc-400 text-xs space-y-1">
                <li>• Only works on Solana Devnet</li>
                <li>• Maximum 5 SOL per request</li>
                <li>• Free testnet tokens only</li>
                <li>• Rate limits may apply</li>
              </ul>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl sm:rounded-2xl backdrop-blur-sm">
              <div className="text-xl sm:text-2xl mb-2 sm:mb-3">⚡</div>
              <h3 className="text-white font-bold mb-1 sm:mb-2 text-sm sm:text-base">Instant Delivery</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Receive your devnet SOL within seconds
              </p>
            </div>
            
            <div className="p-4 sm:p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl sm:rounded-2xl backdrop-blur-sm">
              <div className="text-xl sm:text-2xl mb-2 sm:mb-3">🔄</div>
              <h3 className="text-white font-bold mb-1 sm:mb-2 text-sm sm:text-base">Unlimited Testing</h3>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Request multiple times for development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}