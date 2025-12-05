import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"
import { Suspense } from "react"

// Suppress non-critical analytics and network errors
if (typeof window !== "undefined") {
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || ""
    // Suppress analytics-related errors
    if (
      message.includes("Analytics SDK") ||
      message.includes("coinbase.com/metrics") ||
      message.includes("ERR_BLOCKED_BY_CLIENT") ||
      message.includes("ERR_NAME_NOT_RESOLVED") ||
      message.includes("cca-lite.coinbase.com") ||
      message.includes("MetaMask Tx Signature: User denied") ||
      message.includes("uBOL:") ||
      message.includes("StorageUtil.js") ||
      message.includes("lit-html.mjs") ||
      message.includes("Vercel Web Analytics")
    ) {
      return // Suppress these errors
    }
    originalError.apply(console, args)
  }

  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || ""
    // Suppress analytics warnings
    if (
      message.includes("Analytics") ||
      message.includes("coinbase.com") ||
      message.includes("Vercel")
    ) {
      return
    }
    originalWarn.apply(console, args)
  }
}

export const metadata: Metadata = {
  title: "AjoSave - Community Savings on Base",
  description: "Save together, grow together. Decentralized community savings build on Base blockchain.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Web3Provider>{children}</Web3Provider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
