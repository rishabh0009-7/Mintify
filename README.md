# Mintify 🚀

A modern web platform for Solana token operations - create tokens, request airdrops, and send tokens with ease.
<img width="1906" height="868" alt="image" src="https://github.com/user-attachments/assets/1e9c6df9-c32f-4ccd-9b15-c351b5e07312" />
<img width="1910" height="876" alt="image" src="https://github.com/user-attachments/assets/5e3d3044-0f41-46cd-8153-33a9aa677a30" />
<img width="1886" height="846" alt="image" src="https://github.com/user-attachments/assets/e89a6fad-7f97-488f-acfb-30f20daf1846" />
<img width="1908" height="812" alt="image" src="https://github.com/user-attachments/assets/1729817f-84fd-42cd-8ed2-94a5e19f3c31" />






## ✨ Features

- **🎁 SOL Airdrop** - Get free devnet SOL (up to 5 SOL)
- **🪙 Token Creation** - Create SPL tokens with metadata & images
- **💸 Token Transfer** - Send tokens to any Solana address
- **📱 Responsive UI** - Works on desktop, tablet, and mobile
- **🔐 Wallet Integration** - Support for all major Solana wallets

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/mintify.git
cd mintify

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Solana wallet!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **UI**: Custom components with shadcn/ui

## 📋 Usage

1. **Connect Wallet** - Use Phantom, Solflare, or any Solana wallet
2. **Get SOL** - Request free devnet SOL for testing
3. **Create Tokens** - Launch custom SPL tokens with metadata
4. **Send Tokens** - Transfer tokens to any address

## 🎯 Pages

- `/` - Landing page with project overview
- `/airdrop` - Request devnet SOL
- `/create-token` - Create new SPL tokens
- `/send-token` - Transfer tokens

## ⚙️ Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

## 🔧 Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
```

## 📖 Key Features Details

### Token Creation
- Custom name, symbol, and description
- Image upload (PNG/JPG, max 2MB)
- Social media links
- Configurable decimals and supply
- Cost: ~0.02 SOL

### Token Transfer
- Real-time balance checking
- Address validation
- Quick amount selection (25%, 50%, 75%, Max)
- Transaction confirmation

### SOL Airdrop
- Devnet only
- Up to 5 SOL per request
- Instant delivery
- Rate limiting protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request



## ⚠️ Disclaimer

This tool is for educational and development purposes. Test on devnet before using on mainnet. Always verify recipient addresses before sending tokens.

