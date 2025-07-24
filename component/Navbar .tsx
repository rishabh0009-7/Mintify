'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function Navbar() {
  const { publicKey, connected, disconnect } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full px-6 lg:px-8 py-4 bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-700/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <Link href="/" className="text-white text-2xl font-black tracking-tight hover:text-purple-300 transition-colors">
            Mintify
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "/airdrop", label: "Airdrop", icon: "🎁" },
            { href: "/createToken", label: "Create Token", icon: "⚡" },
            { href: "/sendToken", label: "Send Token", icon: "🚀" }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 px-4 py-2 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800/50 hover:text-white transition-all duration-200 ease-out"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex items-center gap-4">
          {connected ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-zinc-400">Connected</span>
                <span className="text-sm text-white font-mono">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </span>
              </div>
              <Button
                onClick={disconnect}
                size="lg"
                variant="outline"
                className="px-6 py-2.5 font-semibold bg-zinc-800/50 border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-300 rounded-xl backdrop-blur-sm"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !via-indigo-600 !to-blue-600 hover:!from-purple-500 hover:!via-indigo-500 hover:!to-blue-500 !text-white !shadow-lg hover:!shadow-purple-500/25 !transition-all !duration-300 !ease-out !transform hover:!scale-105 !rounded-xl !border !border-purple-500/20 !px-8 !py-2.5 !font-bold !text-base" />
          )}
        </div>

      </div>
    </nav>
  );
}
