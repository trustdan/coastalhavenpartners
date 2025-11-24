"use client"

import { IconCloud } from "@/components/magicui/icon-cloud"
import { TextAnimate } from "@/components/magicui/text-animate"

const eliteFirms = [
  // Investment Banks - using local paths (will need to download)
  "/icons/firms/goldmansachs.svg",
  "/icons/firms/morganstanley.svg",
  "/icons/firms/jpmorgan.svg",
  "/icons/firms/citi.svg",
  "/icons/firms/bankofamerica.svg",
  "/icons/firms/barclays.svg",
  "/icons/firms/ubs.svg",
  "/icons/firms/creditsuisse.svg",
  "/icons/firms/deutschebank.svg",
  "/icons/firms/wellsfargo.svg",
  // Private Equity
  "/icons/firms/blackstone.svg",
  "/icons/firms/kkr.svg",
  "/icons/firms/apollo.svg",
  "/icons/firms/carlyle.svg",
  "/icons/firms/tpg.svg",
  // Venture Capital & Hedge Funds
  "/icons/firms/sequoia.svg",
  "/icons/firms/a16z.svg",
  "/icons/firms/benchmark.svg",
  "/icons/firms/citadel.svg",
  "/icons/firms/bridgewater.svg",
  "/icons/firms/twosigma.svg",
  // Consulting
  "/icons/firms/mckinsey.svg",
  "/icons/firms/bcg.svg",
  "/icons/firms/bain.svg",
]

export function TechStackSection() {
  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Optional subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Types of Firms in Our Network
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building connections to help you reach the most prestigious firms in finance
          </p>
        </div>

        {/* Icon Cloud Container */}
        <div className="flex items-center justify-center px-4">
          <div className="relative w-full max-w-xl aspect-square rounded-[32px] border border-white/10 bg-gradient-to-br from-background via-background/80 to-background/60 shadow-[0_25px_120px_rgba(0,0,0,0.35)]">
            <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 blur-2xl" />
            <div className="relative flex h-full items-center justify-center p-6 md:p-10">
              <IconCloud images={eliteFirms} />
            </div>
          </div>
        </div>

        {/* Category Labels */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Investment Banking
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Private Equity
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Venture Capital
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Hedge Funds
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Management Consulting
          </span>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            These represent the types of firms our platform is designed to help you connect with.
            Company names are used for illustrative purposes and do not constitute endorsements or partnerships.
          </p>
        </div>
      </div>
    </section>
  )
}
