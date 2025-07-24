"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

export default function Create() {
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimal, setDecimals] = useState("");
  const [supply, setSupply] = useState("");
  const [desc, setDesc] = useState("");
  const [message, setMessage] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [loading, setLoading] = useState(false);

 

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Create Your SPL Token</h1>
        <p className="text-lg mb-10 text-center text-gray-400">
          Easily launch your custom Solana token in just a few steps.
        </p>

        <form className="space-y-6" >
          <div>
            <Label className="text-white py-3">Token Name</Label>
            <Input
              type="text"
              placeholder="e.g. MyToken"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 text-white border border-gray-700"
            />
          </div>

          <div>
            <Label className="text-white py-3">Symbol</Label>
            <Input
              type="text"
              placeholder="e.g. MTK"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-gray-900 text-white border border-gray-700"
              maxLength={8}
            />
          </div>

          <div>
            <Label className="text-white py-3">Decimals</Label>
            <Input
              type="text"
              placeholder="e.g. 9"
              value={decimal}
              onChange={(e) => setDecimals(e.target.value)}
              className="bg-gray-900 text-white border border-gray-700"
              maxLength={1}
            />
          </div>

          <div>
            <Label className="text-white py-3">Initial Supply</Label>
            <Input
              type="text"
              placeholder="e.g. 1000000"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="bg-gray-900 text-white border border-gray-700"
            />
          </div>

          <div>
            <Label className="text-white py-3">Description</Label>
            <Input
              type="text"
              placeholder="Describe your token"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="bg-gray-900 text-white border border-gray-700"
            />
          </div>

         
      
        </form>
      </div>
    </div>
  );
}
