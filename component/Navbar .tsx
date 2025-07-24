import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full px-6 lg:px-8 py-4 bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-700/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/*  Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <Link href="/" className="text-white text-2xl font-black tracking-tight hover:text-purple-300 transition-colors">
            Mintify
          </Link>
        </div>

        {/*  Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "/airdrop", label: "Airdrop", icon: "🎁" },
            { href: "/CreateToken", label: "Create Token", icon: "⚡" },
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

        {/* Right: Enhanced Connect Button */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="relative px-8 py-2.5 font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ease-out transform hover:scale-105 rounded-xl border border-purple-500/20"
          >
            <span className="relative z-10">Connect Wallet</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity rounded-xl blur-sm"></div>
          </Button>
        </div>
      </div>
    </nav>
  );
}