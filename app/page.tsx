"use client";

import Link from "next/link";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";


export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <StarsBackground />
      {/* Heading */}
      <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 text-center">
        Launch Your Token in Seconds 🚀
      </h1>

      {/* Description */}
      <p className="text-lg sm:text-xl text-gray-300 max-w-2xl text-center mb-10">
        Mintify makes it easy to create and deploy your own Solana token with just a few clicks.
        No coding required. Secure, fast, and decentralized.
      </p>

      {/* Create Token Button */}
      <Link
        href="/create"
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
      >
        Create Token
      </Link>
    </main>
  );
}
