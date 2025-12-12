# Ajosave 🏦

> **Decentralized Community Savings Platform** - Bringing traditional Ajo/Esusu savings circles on-chain with blockchain transparency and automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black)](https://nextjs.org/)
[![Deployed on Celo & Base](https://img.shields.io/badge/Deployed-Celo%20%7C%20Base-green)](https://ajosave.app)

## 📖 Overview

Ajosave is a decentralized finance (DeFi) platform that digitizes traditional community savings practices (known as Ajo, Esusu, Tontine, or Rotating Savings and Credit Associations - ROSCAs) using blockchain technology. Built for African communities and accessible globally, Ajosave enables trustless, transparent, and automated savings group management.

### Key Features

✨ **Three Pool Templates with Guided Setup:**
- **Rotational Savings** – Traditional turn-based payouts with automated reminders and penalties
- **Target Pool** – Lock contributions until your collective goal or deadline is reached
- **Flexible Pool** – Let members deposit/withdraw anytime while routing idle funds into yield strategies

🔒 **Security & Transparency:**
- Open-source Solidity contracts verified on Sourcify
- Automatic enforcement of rules, penalties & grace periods
- Activity feeds mirrored in Supabase for off-chain context
- Non-custodial architecture—no treasurers or middlemen

🌐 **Multi-Chain Support:**
- Deploy to **Celo** (mobile-first, low-fee) or **Base** (Ethereum L2) with a single codebase
- WalletConnect / MetaMask integration with one-click network switching
- Treasury address shared across chains for unified accounting

📱 **Modern Web Interface:**
- Redesigned hero, feature, and CTA sections with deployment stats
- Dashboard tabs for groups, transactions, and profile management
- Real-time activity feed powered by Supabase
- shadcn/ui component system for cohesive theming

## 🏗️ Architecture

```
ajo/
├── frontend/          # Next.js 15 web application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities and Supabase client
│
└── smartcontract/    # Foundry smart contracts
    ├── src/          # Solidity contracts
    ├── script/       # Deployment scripts
    └── test/         # Contract tests
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Git**
- **Wallet** (MetaMask, WalletConnect, etc.)
- **Supabase Account** (for database)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ajo/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   # Contract addresses (already configured for Celo Sepolia)
   NEXT_PUBLIC_FACTORY_ADDRESS=0xa71C861930C0973AE57c577aC19EB7f11e7d74a6
   NEXT_PUBLIC_TOKEN_ADDRESS=0x24642ffABF43D4bd33e1E883A23E10DdFde186c6
   
   # Supabase (get from https://app.supabase.com)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up Supabase database**
   
   See detailed instructions in [`frontend/SUPABASE_SETUP.md`](./frontend/SUPABASE_SETUP.md)
   
   Quick steps:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `frontend/supabase_schema.sql` in the SQL Editor
   - Copy your project URL and anon key to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Smart Contract Setup

1. **Install Foundry**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Navigate to smartcontract directory**
   ```bash
   cd smartcontract
   ```

3. **Install dependencies**
   ```bash
   forge install
   ```

4. **Build contracts**
   ```bash
   forge build
   ```

5. **Run tests**
   ```bash
   forge test
   ```

For deployment instructions, see [`smartcontract/DEPLOY.md`](./smartcontract/DEPLOY.md)

## 📋 Deployed Contracts

### Celo Sepolia Testnet (Chain ID: 11142220)

| Contract | Address | Explorer |
|----------|---------|----------|
| **BaseToken (BST)** | `0x24642ffABF43D4bd33e1E883A23E10DdFde186c6` | [View on CeloScan](https://sepolia.celoscan.io/address/0x24642ffABF43D4bd33e1E883A23E10DdFde186c6) |
| **BaseSafeFactory** | `0xa71C861930C0973AE57c577aC19EB7f11e7d74a6` | [View on CeloScan](https://sepolia.celoscan.io/address/0xa71C861930C0973AE57c577aC19EB7f11e7d74a6) |

### Base Sepolia Testnet (Chain ID: 84532)

| Contract | Address | Explorer |
|----------|---------|----------|
| **BaseToken (BST)** | `0xa71C861930C0973AE57c577aC19EB7f11e7d74a6` | [View on BaseScan](https://sepolia.basescan.org/address/0xa71C861930C0973AE57c577aC19EB7f11e7d74a6) |
| **BaseSafeFactory** | `0xCF4078f1c5C5e051Ae2442e5758b6Eaf548AD780` | [View on BaseScan](https://sepolia.basescan.org/address/0xCF4078f1c5C5e051Ae2442e5758b6Eaf548AD780) |

**Treasury Address:** `0xa91D5A0a64ED5eeF11c4359C4631279695A338ef`

All contracts are verified on Sourcify and block explorers.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Web3**: Wagmi + Viem + Reown AppKit
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion

### Smart Contracts
- **Language**: Solidity 0.8.30
- **Framework**: Foundry (Forge)
- **Libraries**: OpenZeppelin Contracts
- **Networks**: Celo, Base
- **EVM**: Prague

## 📚 Documentation

- **Frontend Setup**: [`frontend/README.md`](./frontend/README.md)
- **Supabase Setup**: [`frontend/SUPABASE_SETUP.md`](./frontend/SUPABASE_SETUP.md)
- **Smart Contract Deployment**: [`smartcontract/DEPLOY.md`](./smartcontract/DEPLOY.md)
- **Deployment Addresses**: [`smartcontract/DEPLOYMENTS.md`](./smartcontract/DEPLOYMENTS.md)
- **Grant Activity**: [`smartcontract/GRANT_ACTIVITY_CELO_DEPLOYMENT.md`](./smartcontract/GRANT_ACTIVITY_CELO_DEPLOYMENT.md)

## 🎯 How It Works

### 1. **Create a Savings Group**
   - Choose your pool type (Rotational, Target, or Flexible)
   - Set contribution amounts, frequency, and member list
   - Deploy a new smart contract pool via the factory

### 2. **Members Join**
   - Members connect their wallets
   - Approve token spending for the pool
   - Make initial deposits

### 3. **Automated Management**
   - Smart contracts enforce rules automatically
   - Late payments are flagged
   - Rotational payouts execute on schedule
   - Activity is logged on-chain and in the database

### 4. **Transparent Tracking**
   - All transactions visible on block explorers
   - Real-time dashboard updates
   - Activity feed for all pool events

## 🔒 Security

- **Audited Smart Contracts**: Built with OpenZeppelin battle-tested libraries
- **Multi-sig Treasury**: Controlled treasury address for fee collection
- **Immutable Rules**: Pool parameters cannot be changed after creation
- **Non-custodial**: Users always control their funds
- **Open Source**: All code is publicly auditable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Celo Foundation for blockchain infrastructure
- Base Network for L2 scaling solution
- The African communities who inspired this project

## 📞 Support & Contact

- **Website**: [ajosave.app](https://ajosave.app)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: See docs in respective directories

---

**Built with ❤️ for African communities and the global DeFi ecosystem**

---

**Note**: Contract names like `BaseSafeFactory` remain unchanged as they are technical identifiers and would require contract redeployment to change.

## 🔄 CI/CD

Automated testing and contract verification workflows are configured via GitHub Actions. See `.github/workflows/test.yml` for details.

