# Ajosave Frontend

Modern Next.js application for the Ajosave decentralized savings platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (for database)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file:
   ```env
   # Celo Sepolia Contract Addresses
   NEXT_PUBLIC_FACTORY_ADDRESS=0xa71C861930C0973AE57c577aC19EB7f11e7d74a6
   NEXT_PUBLIC_TOKEN_ADDRESS=0x24642ffABF43D4bd33e1E883A23E10DdFde186c6

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Set up Supabase**

   Follow the guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Run the SQL schema from `supabase_schema.sql`
   - Get your API credentials

4. **Run development server**
```bash
npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages
│   │   ├── create/        # Create group pages
│   │   └── group/[id]/    # Individual group pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
│
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── landing/           # Landing page components
│   ├── dashboard/         # Dashboard components
│   ├── group/             # Group management components
│   └── create-group/      # Group creation forms
│
├── hooks/                  # Custom React hooks
│   ├── useBaseSafeContracts.ts  # Web3 contract interactions
│   └── use-toast.ts       # Toast notifications
│
├── lib/                    # Utilities
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Helper functions
│
└── public/                # Static assets
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Network Configuration

The app is configured to work with:
- **Celo Sepolia** (Testnet) - Primary network
- **Celo Mainnet** (Production) - Future deployment
- **Base Sepolia** (Testnet) - Secondary network
- **Base Mainnet** (Production) - Future deployment

Network configuration is in [`components/web3-provider.tsx`](./components/web3-provider.tsx)

## 📦 Key Dependencies

- **Next.js 15** - React framework
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Reown AppKit** - Wallet connection & network switching UI
- **Supabase** - Database and backend
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library (12 custom components)
- **Framer Motion** - Animations

## 🔧 Configuration

### Contract Addresses

Update contract addresses in `.env.local` or in:
- `hooks/useBaseSafeContracts.ts`
- `components/create-group/*.tsx`

### Supabase Setup

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for detailed instructions.

Quick checklist:
- ✅ Create Supabase project
- ✅ Run `supabase_schema.sql` in SQL Editor
- ✅ Enable Row Level Security policies
- ✅ Add credentials to `.env.local`

## 🎨 UI Components & Landing Page

- Hero section now includes announcement badge, feature chips, CTA checklist, and deployment stats
- `HowItWorks`, `Features`, `Security`, and `CTA` sections refreshed with new content and motion
- All UI components use shadcn/ui and are located in `components/ui/`:
  - `button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`
  - `card.tsx`, `badge.tsx`, `avatar.tsx`, `progress.tsx`
  - `select.tsx`, `dropdown-menu.tsx`, `tabs.tsx`, `toast.tsx`

## 🔐 Environment Variables

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FACTORY_ADDRESS` | Smart contract factory address | `0x...` |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | ERC20 token address | `0x...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |

## 🐛 Troubleshooting

### "Invalid supabaseUrl" error
- Check that `.env.local` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Ensure credentials are not placeholders

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Check that UI components exist in `components/ui/`

### Wallet connection issues
- Ensure you're on a supported network (Celo Sepolia or Base Sepolia)
- Check that RPC URLs are accessible
- Verify wallet extension is installed

### Database errors
- Verify Supabase credentials in `.env.local`
- Check that tables exist in Supabase dashboard
- Ensure RLS policies allow necessary operations

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📄 License

MIT
