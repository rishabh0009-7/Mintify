"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="w-full bg-black py-6 px-6 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="text-white text-3xl font-bold tracking-wider">
        Mintify
      </Link>

      {/* Wallet Connect Button (Placeholder Button) */}
      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-base shadow-md transition-all duration-200">
        <Link href = "/">Select Wallet</Link>
      </Button>
    </nav>
  );
}
