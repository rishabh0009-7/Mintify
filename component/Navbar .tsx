'use client';
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function Navbar() {
  const { publicKey, connected, disconnect } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/airdrop", label: "Airdrop", icon: "🎁" },
    { href: "/createToken", label: "Create Token", icon: "⚡" },
    { href: "/sendToken", label: "Send Token", icon: "🚀" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-700/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
          </div>
          <Link href="/" className="text-white text-xl sm:text-2xl font-black tracking-tight hover:text-purple-300 transition-colors">
            Mintify
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 px-3 xl:px-4 py-2 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800/50 hover:text-white transition-all duration-200 ease-out"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm xl:text-base">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Content - Desktop */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          {connected ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-zinc-400">Connected</span>
                <span className="text-xs lg:text-sm text-white font-mono">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </span>
              </div>
              <Button
                onClick={disconnect}
                size="sm"
                variant="outline"
                className="px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-semibold bg-zinc-800/50 border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-300 rounded-xl backdrop-blur-sm"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !via-indigo-600 !to-blue-600 hover:!from-purple-500 hover:!via-indigo-500 hover:!to-blue-500 !text-white !shadow-lg hover:!shadow-purple-500/25 !transition-all !duration-300 !ease-out !transform hover:!scale-105 !rounded-xl !border !border-purple-500/20 !px-4 lg:!px-8 !py-2 lg:!py-2.5 !font-bold !text-sm lg:!text-base" />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:hidden">
          {connected && (
            <div className="text-xs text-zinc-400 text-right">
              <div>Connected</div>
              <div className="text-white font-mono">
                {publicKey?.toString().slice(0, 3)}...{publicKey?.toString().slice(-3)}
              </div>
            </div>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`sm:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 py-4 bg-zinc-800/90 backdrop-blur-xl rounded-2xl mt-4 border border-zinc-700/50">
          
          {/* Mobile Navigation Links */}
          <div className="space-y-2 mb-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-300 font-medium rounded-xl hover:bg-zinc-700/50 hover:text-white transition-all duration-200 ease-out"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Wallet Section */}
          <div className="pt-4 border-t border-zinc-700/50">
            {connected ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-zinc-700/30 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Connected Wallet</div>
                  <div className="text-sm text-white font-mono">
                    {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    disconnect();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full py-3 font-semibold bg-zinc-800/50 border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-300 rounded-xl"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !via-indigo-600 !to-blue-600 hover:!from-purple-500 hover:!via-indigo-500 hover:!to-blue-500 !text-white !shadow-lg !transition-all !duration-300 !rounded-xl !border !border-purple-500/20 !px-6 !py-3 !font-bold !text-sm !w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}