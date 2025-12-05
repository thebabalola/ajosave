"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { ReactNode } from "react";
import { defineChain } from "viem";

// 1. Get projectId from https://cloud.reown.com
const projectId = "80ad617c75ff0a3e14ee2636f4bbfe56";

// 2. Create metadata object
const metadata = {
  name: "Ajosave",
  description: "Decentralized Community Savings Platform on Celo & Base",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ajosave.app",
  icons: [
    typeof window !== "undefined"
      ? `${window.location.origin}/icon.svg`
      : "https://ajosave.app/icon.svg",
  ],
};

// 3. Define Celo Sepolia Testnet
const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
    public: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "CeloScan",
      url: "https://sepolia.celoscan.io",
    },
  },
  testnet: true,
});

// 4. Define Celo Mainnet (for future use)
const celoMainnet = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo.org"],
    },
    public: {
      http: ["https://forno.celo.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "CeloScan",
      url: "https://celoscan.io",
    },
  },
  testnet: false,
});

// 5. Define Base Sepolia Testnet
const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
    public: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
  testnet: true,
});

// 6. Define Base Mainnet (for future use)
const baseMainnet = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
    },
    public: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://basescan.org",
    },
  },
  testnet: false,
});

// 7. Set the networks
const networks = [celoSepolia, celoMainnet, baseSepolia, baseMainnet];

// 8. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 9. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  // @ts-expect-error - Networks are Chain[] from viem, but AppKit expects AppKitNetwork[]. 
  // The WagmiAdapter already handles network configuration, so this is a type compatibility issue.
  networks,
  projectId,
  metadata,
  features: {
    analytics: false, // Disabled to prevent analytics errors
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "oklch(0.65 0.20 165)",
    "--w3m-border-radius-master": "12px",
  },
});

// 10. Setup queryClient
const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
