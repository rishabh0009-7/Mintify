"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from "@/components/ui/button";
import { Navbar } from '@/component/Navbar '; 

export default function CreateToken() {
  const [tokenData, setTokenData] = useState({
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
  
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const { connected, publicKey } = useWallet();

  const handleInputChange = (field, value) => {
    setTokenData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setTokenData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCreateToken = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    
    // Token creation logic will go here
    setTimeout(() => {
      setIsLoading(false);
      alert('Token creation functionality will be implemented!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-sm text-zinc-300 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Token Launchpad</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              Create Your Token
            </h1>
            
            <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mx-auto">
              Launch your custom token on Solana with just a few clicks. 
              <span className="text-zinc-300 font-medium"> Professional, secure, and instant.</span>
            </p>
          </div>

          {/* Main Form Container */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 px-4">
              {['Token Info', 'Media & Links', 'Launch'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    index === 0 ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-600 text-zinc-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-3 font-semibold ${index === 0 ? 'text-white' : 'text-zinc-500'}`}>
                    {step}
                  </span>
                  {index < 2 && <div className="w-16 h-0.5 bg-zinc-700 ml-6"></div>}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Left Column - Token Details */}
              <div className="space-y-6">
                <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>⚡</span>
                    Token Details
                  </h3>
                  
                  {/* Token Name */}
                  <div className="mb-4">
                    <label className="block text-white font-semibold mb-2 text-sm">
                      Token Name *
                    </label>
                    <input
                      type="text"
                      value={tokenData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., My Awesome Token"
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    />
                  </div>

                  {/* Token Symbol */}
                  <div className="mb-4">
                    <label className="block text-white font-semibold mb-2 text-sm">
                      Token Symbol *
                    </label>
                    <input
                      type="text"
                      value={tokenData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                      placeholder="e.g., MAT"
                      maxLength={10}
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-mono"
                    />
                    <p className="text-zinc-500 text-xs mt-1">Max 10 characters</p>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-white font-semibold mb-2 text-sm">
                      Description
                    </label>
                    <textarea
                      value={tokenData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your token's purpose and vision..."
                      rows={4}
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Decimals and Supply */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">
                        Decimals
                      </label>
                      <select
                        value={tokenData.decimals}
                        onChange={(e) => handleInputChange('decimals', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
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
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔗</span>
                    Social Links
                  </h3>
                  
                  {[
                    { field: 'website', label: 'Website', placeholder: 'https://yourtoken.com', icon: '🌐' },
                    { field: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourtoken', icon: '🐦' },
                    { field: 'discord', label: 'Discord', placeholder: 'https://discord.gg/yourtoken', icon: '💬' },
                    { field: 'telegram', label: 'Telegram', placeholder: 'https://t.me/yourtoken', icon: '📱' }
                  ].map(({ field, label, placeholder, icon }) => (
                    <div key={field} className="mb-4">
                      <label className=" block text-white font-semibold mb-2 text-sm flex items-center gap-2">
                        <span>{icon}</span>
                        {label}
                      </label>
                      <input
                        type="url"
                        value={tokenData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Image Upload & Preview */}
              <div className="space-y-6">
                <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🎨</span>
                    Token Image
                  </h3>
                  
                  {/* Image Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
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
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Token preview"
                          className="w-32 h-32 mx-auto rounded-2xl object-cover border-2 border-zinc-600"
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
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-zinc-700/50 rounded-full flex items-center justify-center text-2xl">
                          📸
                        </div>
                        <div>
                          <p className="text-white font-semibold mb-2">Upload Token Image</p>
                          <p className="text-zinc-400 text-sm mb-4">
                            Drag and drop an image, or click to browse
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-block px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg cursor-pointer transition-colors"
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
                <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>👀</span>
                    Token Preview
                  </h3>
                  
                  <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Token" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-400">🪙</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">
                          {tokenData.name || 'Token Name'}
                        </h4>
                        <p className="text-zinc-400 font-mono text-sm">
                          ${tokenData.symbol || 'SYMBOL'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 text-sm mb-3">
                      {tokenData.description || 'Token description will appear here...'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>💎</span>
                    Creation Cost
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Token Creation:</span>
                      <span className="text-white font-bold">~0.01 SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-300">Metadata Upload:</span>
                      <span className="text-white font-bold">~0.005 SOL</span>
                    </div>
                    <hr className="border-zinc-700" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-purple-400 font-bold">~0.015 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="mt-8 pt-6 border-t border-zinc-700/50">
              <Button
                onClick={handleCreateToken}
                disabled={!connected || !tokenData.name || !tokenData.symbol || !tokenData.supply || isLoading}
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ease-out transform hover:scale-[1.02] rounded-2xl border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                <p className="text-center text-zinc-400 text-sm mt-3">
                  Make sure you have enough SOL for transaction fees
                </p>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
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
                className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/60 hover:border-zinc-700/50 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}