"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from "@/components/ui/button";
import { Navbar } from '@/component/Navbar ';
import { createSPLToken, TokenData, TokenCreationResult } from '@/utils/Tokencreation';
import { PublicKey } from '@solana/web3.js';

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  decimals: string;
  supply: string;
  website: string;
  twitter: string;
  discord: string;
  telegram: string;
}

export default function CreateToken() {
  const [tokenData, setTokenData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    image: null,
    decimals: '9',
    supply: '',
    website: '',
    twitter: '',
    discord: '',
    telegram: ''
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [result, setResult] = useState<TokenCreationResult | null>(null);
  const [error, setError] = useState<string>('');
  
  const { connected, publicKey, signTransaction } = useWallet();

  const handleInputChange = (field: keyof TokenFormData, value: string | File | null) => {
    setTokenData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB');
        return;
      }
      
      setTokenData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    } else {
      setError('Please select a valid image file (PNG, JPG, GIF)');
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    if (!tokenData.name.trim()) {
      throw new Error('Token name is required');
    }
    if (!tokenData.symbol.trim()) {
      throw new Error('Token symbol is required');
    }
    if (!tokenData.supply || parseFloat(tokenData.supply) <= 0) {
      throw new Error('Supply must be greater than 0');
    }
    if (tokenData.symbol.length > 10) {
      throw new Error('Symbol must be 10 characters or less');
    }
    if (parseFloat(tokenData.supply) > 1000000000000) {
      throw new Error('Supply cannot exceed 1 trillion tokens');
    }
    
    // Validate URLs if provided - only validate non-empty URLs
    const urlFields = ['website', 'twitter', 'discord', 'telegram'] as const;
    for (const field of urlFields) {
      const url = tokenData[field];
      if (url && url.trim()) {
        // Check if URL starts with http:// or https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          throw new Error(`${field} URL must start with http:// or https://`);
        }
        
        try {
          new URL(url);
        } catch {
          throw new Error(`Invalid ${field} URL format. Please enter a valid URL starting with http:// or https://`);
        }
      }
    }
  };

  const handleCreateToken = async () => {
    if (!connected || !signTransaction || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Validate form
      validateForm();

      // Check wallet balance
      const connection = new (await import('@solana/web3.js')).Connection('https://api.devnet.solana.com');
      const balance = await connection.getBalance(publicKey);
      const minBalance = 0.02 * 1000000000; // 0.02 SOL in lamports
      
      if (balance < minBalance) {
        throw new Error('Insufficient SOL balance. You need at least 0.02 SOL for token creation.');
      }

      // Create wallet object with required methods
      const walletAdapter = {
        publicKey: publicKey as PublicKey,
        signTransaction,
      };

      // Convert FormData to TokenData
      const tokenDataForCreation: TokenData = {
        name: tokenData.name.trim(),
        symbol: tokenData.symbol.trim().toUpperCase(),
        description: tokenData.description.trim(),
        image: tokenData.image,
        decimals: tokenData.decimals,
        supply: tokenData.supply,
        website: tokenData.website.trim(),
        twitter: tokenData.twitter.trim(),
        discord: tokenData.discord.trim(),
        telegram: tokenData.telegram.trim(),
      };

      console.log('Creating token with data:', tokenDataForCreation);
      
      // Call the token creation service
      const tokenResult = await createSPLToken(walletAdapter, tokenDataForCreation);
      
      setResult(tokenResult);
      
      // Reset form on success
      setTokenData({
        name: '',
        symbol: '',
        description: '',
        image: null,
        decimals: '9',
        supply: '',
        website: '',
        twitter: '',
        discord: '',
        telegram: ''
      });
      setImagePreview('');
      
    } catch (err) {
      console.error('Token creation error:', err);
      let errorMessage = 'Failed to create token';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Handle specific Solana errors
      if (errorMessage.includes('0x1')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (errorMessage.includes('0x0')) {
        errorMessage = 'Transaction failed - please try again';
      } else if (errorMessage.includes('blockhash')) {
        errorMessage = 'Network congestion - please try again';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 px-4 sm:px-6 pt-16 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-4 sm:mb-6 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs sm:text-sm text-zinc-300 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Token Launchpad</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              Create Your Token
            </h1>
            
            <p className="text-zinc-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto px-4">
              Launch your custom token on Solana with just a few clicks. 
              <span className="text-zinc-300 font-medium"> Professional, secure, and instant.</span>
            </p>
          </div>

          {/* Success Result */}
          {result && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-900/20 border border-green-500/30 rounded-xl sm:rounded-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-3 sm:mb-4">✅ Token Created Successfully!</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-zinc-400">Transaction: </span>
                  <a 
                    href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline break-all"
                  >
                    {result.signature}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-400">Mint Address: </span>
                  <span className="text-white font-mono break-all text-xs sm:text-sm">{result.mintAddress}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Token Account: </span>
                  <span className="text-white font-mono break-all text-xs sm:text-sm">{result.tokenAccount}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Metadata Account: </span>
                  <span className="text-white font-mono break-all text-xs sm:text-sm">{result.metadataAddress}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-red-900/20 border border-red-500/30 rounded-xl sm:rounded-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-2">❌ Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Main Form Container */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            
            {/* Progress Steps - Hidden on mobile */}
            <div className="hidden sm:flex items-center justify-between mb-6 lg:mb-8 px-4">
              {['Token Info', 'Media & Links', 'Launch'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 lg:w-10 h-8 lg:h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    index === 0 ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-600 text-zinc-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 lg:ml-3 font-semibold text-sm lg:text-base ${index === 0 ? 'text-white' : 'text-zinc-500'}`}>
                    {step}
                  </span>
                  {index < 2 && <div className="w-8 lg:w-16 h-0.5 bg-zinc-700 ml-4 lg:ml-6"></div>}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Left Column - Token Details */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-zinc-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-700/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    Token Details
                  </h3>
                  
                  {/* Token Name */}
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-white font-semibold mb-2 text-sm">
                      Token Name *
                    </label>
                    <input
                      type="text"
                      value={tokenData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., My Awesome Token"
                      maxLength={32}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg sm:rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm sm:text-base"
                    />
                    <p className="text-zinc-500 text-xs mt-1">Max 32 characters</p>
                  </div>

                  {/* Token Symbol */}
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-white font-semibold mb-2 text-sm">
                      Token Symbol *
                    </label>
                    <input
                      type="text"
                      value={tokenData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                      placeholder="e.g., MAT"
                      maxLength={10}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg sm:rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-mono text-sm sm:text-base"
                    />
                    <p className="text-zinc-500 text-xs mt-1">Max 10 characters</p>
                  </div>

                  {/* Description */}
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-white font-semibold mb-2 text-sm">
                      Description
                    </label>
                    <textarea
                      value={tokenData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your token's purpose and vision..."
                      rows={3}
                      maxLength={200}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg sm:rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 resize-none text-sm sm:text-base"
                    />
                    <p className="text-zinc-500 text-xs mt-1">{tokenData.description.length}/200 characters</p>
                  </div>

                  {/* Decimals and Supply */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">
                        Decimals
                      </label>
                      <select
                        value={tokenData.decimals}
                        onChange={(e) => handleInputChange('decimals', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg sm:rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm sm:text-base"
                      >
                        {[0, 2, 6, 8, 9].map(decimal => (
                          <option key={decimal} value={decimal}>{decimal}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">
                        Total Supply *
                      </label>
                      <input
                        type="number"
                        value={tokenData.supply}
                        onChange={(e) => handleInputChange('supply', e.target.value)}
                        placeholder="1000000"
                        min="1"
                        max="1000000000000"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg sm:rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-zinc-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-700/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span>🔗</span>
                    Social Links
                  </h3>
                  
                  {[
                    { field: 'website' as keyof TokenFormData, label: 'Website', placeholder: 'https://yourtoken.com', icon: '🌐' },
                    { field: 'twitter' as keyof TokenFormData, label: 'Twitter', placeholder: 'https://twitter.com/yourtoken', icon: '🐦' },
                    { field: 'discord' as keyof TokenFormData, label: 'Discord', placeholder: 'https://discord.gg/yourtoken', icon: '💬' },
                    { field: 'telegram' as keyof TokenFormData, label: 'Telegram', placeholder: 'https://t.me/yourtoken', icon: '📱' }
                  ].map(({ field, label, placeholder, icon }) => (
                    <div key={field} className="mb-3 sm:mb-4">
                      <label className="block text-white font-semibold mb-2 text-sm flex items-center gap-2">
                        <span>{icon}</span>
                        {label}
                      </label>
                      <input
                        type="url"
                        value={tokenData[field] as string}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg sm:rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm sm:text-base"
                      />
                      <p className="text-zinc-500 text-xs mt-1">Optional - must include http:// or https://</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Image Upload & Preview */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-zinc-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-700/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span>🎨</span>
                    Token Image
                  </h3>
                  
                  {/* Image Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-purple-500/50 bg-purple-500/10' 
                        : 'border-zinc-600/50 hover:border-zinc-500/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="space-y-3 sm:space-y-4">
                        <img
                          src={imagePreview}
                          alt="Token preview"
                          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-xl sm:rounded-2xl object-cover border-2 border-zinc-600"
                        />
                        <button
                          onClick={() => {
                            setImagePreview('');
                            setTokenData(prev => ({ ...prev, image: null }));
                          }}
                          className="text-red-400 hover:text-red-300 font-semibold text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-zinc-700/50 rounded-full flex items-center justify-center text-xl sm:text-2xl">
                          📸
                        </div>
                        <div>
                          <p className="text-white font-semibold mb-2 text-sm sm:text-base">Upload Token Image</p>
                          <p className="text-zinc-400 text-xs sm:text-sm mb-3 sm:mb-4">
                            Drag and drop an image, or click to browse
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-block px-4 sm:px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg cursor-pointer transition-colors text-sm"
                          >
                            Choose File
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-zinc-500 text-xs mt-2">
                    Recommended: 512x512px, PNG or JPG, max 2MB
                  </p>
                </div>

                {/* Preview Card */}
                <div className="bg-zinc-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-zinc-700/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span>👀</span>
                    Token Preview
                  </h3>
                  
                  <div className="bg-zinc-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-700/30">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Token" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-400 text-lg sm:text-xl">🪙</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm sm:text-base">
                          {tokenData.name || 'Token Name'}
                        </h4>
                        <p className="text-zinc-400 font-mono text-xs sm:text-sm">
                          ${tokenData.symbol || 'SYMBOL'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 text-xs sm:text-sm mb-2 sm:mb-3">
                      {tokenData.description || 'Token description will appear here...'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-zinc-500">Supply:</span>
                        <p className="text-white font-semibold">
                          {tokenData.supply ? Number(tokenData.supply).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Decimals:</span>
                        <p className="text-white font-semibold">{tokenData.decimals}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Creation Cost */}
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/20">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span>💎</span>
                    Creation Cost
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300">Token Creation:</span>
                      <span className="text-white font-bold">~0.01 SOL</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300">Metadata Upload:</span>
                      <span className="text-white font-bold">~0.005 SOL</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300">Network Fees:</span>
                      <span className="text-white font-bold">~0.005 SOL</span>
                    </div>
                    <hr className="border-zinc-700" />
                    <div className="flex justify-between items-center text-base sm:text-lg">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-purple-400 font-bold">~0.02 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-700/50">
              <Button
                onClick={handleCreateToken}
                disabled={!connected || !tokenData.name || !tokenData.symbol || !tokenData.supply || isLoading}
                className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ease-out transform hover:scale-[1.02] rounded-xl sm:rounded-2xl border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Token...
                  </div>
                ) : !connected ? (
                  'Connect Wallet to Create Token'
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Create Token
                  </div>
                )}
              </Button>
              
              {connected && (
                <p className="text-center text-zinc-400 text-xs sm:text-sm mt-2 sm:mt-3">
                  Make sure you have at least 0.02 SOL for transaction fees
                </p>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: "⚡",
                title: "Instant Creation",
                description: "Deploy your token in seconds with our optimized process"
              },
              {
                icon: "🔒",
                title: "Secure & Audited",
                description: "Battle-tested smart contracts with comprehensive security"
              },
              {
                icon: "💫",
                title: "Full Ownership",
                description: "You maintain complete control over your token"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl sm:rounded-2xl backdrop-blur-sm hover:bg-zinc-800/60 hover:border-zinc-700/50 transition-all duration-300"
              >
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}