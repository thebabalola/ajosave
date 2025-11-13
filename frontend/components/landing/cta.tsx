"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpenCheck, LineChart } from "lucide-react"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import Link from "next/link"

const checklist = [
  "Verified contracts live at 0xa71C…74a6",
  "Supabase dashboards ready to log activity",
  "Templates for rotational, target, and flexible pools",
  "Celo & Base RPC endpoints pre-configured",
]

export function CTA() {
  const { open } = useAppKit()
  const { isConnected } = useAccount()

  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/10 p-12 sm:p-16 lg:p-20 shadow-2xl">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-16 left-1/3 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <BookOpenCheck className="h-4 w-4" />
                Launch in under 5 minutes
              </div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                Ready to start saving with your community?
              </h2>
              <p className="text-lg text-muted-foreground">
                Ajosave equips cooperative groups with automated payouts, transparent tracking, and DeFi yields from day one.
              </p>

              <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2 rounded-full bg-background/60 px-4 py-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <LineChart className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                {isConnected ? (
                  <Button size="lg" className="h-14 rounded-full px-8 text-base shadow-lg shadow-primary/25" asChild>
                    <Link href="/dashboard">
                      Go to dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-8 text-base shadow-lg shadow-primary/25"
                    onClick={() => open()}
                  >
                    Connect wallet
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-primary/30 bg-background/80 px-8 text-base backdrop-blur"
                  asChild
                >
                  <Link href="https://docs.ajosave.app" target="_blank" rel="noreferrer">
                    View docs
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm rounded-3xl border border-primary/15 bg-background/90 p-6 text-left shadow-lg backdrop-blur">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Latest deployment</p>
                  <p className="font-semibold text-foreground">Celo Sepolia · Nov 6, 2025</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm font-medium text-muted-foreground">
                  BaseSafeFactory — <span className="font-semibold text-foreground">0xa71C…74a6</span>
                  <br />
                  BaseToken (BST) — <span className="font-semibold text-foreground">0x2464…186c6</span>
                  <br />
                  Treasury — <span className="font-semibold text-foreground">0xa91D…338ef</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verified on Sourcify with exact_match status. Full transaction history and ABI available in the repo’s
                  deployments directory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
