import { Navbar } from "@/component/Navbar ";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full"></div>
      </div>

      <Navbar/>

      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-sm text-zinc-300 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live on Solana Mainnet</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent leading-tight">
            Create. Send. 
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Airdrop.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-xl md:text-2xl leading-relaxed mb-12 max-w-3xl mx-auto font-light">
            The most powerful platform for token creation and distribution on Solana. 
            <br />
            <span className="text-zinc-300 font-medium">
              Mint, send, and airdrop with zero complexity.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="group relative px-10 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 ease-out transform hover:scale-105 rounded-2xl border border-purple-500/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-sm"></div>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-4 text-lg font-semibold bg-transparent border-2 border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-300 rounded-2xl backdrop-blur-sm"
            >
              View Documentation
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Deploy tokens in seconds with our optimized Solana integration"
              },
              {
                icon: "🔒",
                title: "Secure & Audited",
                description: "Battle-tested smart contracts with comprehensive security audits"
              },
              {
                icon: "💎",
                title: "Feature Rich",
                description: "Advanced tokenomics, airdrops, and distribution tools included"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/60 hover:border-zinc-700/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 pt-12 border-t border-zinc-800/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { number: "10K+", label: "Tokens Created" },
                { number: "500M+", label: "Tokens Distributed" },
                { number: "50K+", label: "Active Users" },
                { number: "99.9%", label: "Uptime" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-zinc-500 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}