"use client"

import { TextAnimate } from "@/components/magicui/text-animate"

const eliteFirms = [
  "Goldman Sachs",
  "Morgan Stanley",
  "JPMorgan",
  "Citi",
  "Bank of America",
  "Barclays",
  "UBS",
  "Credit Suisse",
  "Deutsche Bank",
  "Wells Fargo",
  "Blackstone",
  "KKR",
  "Apollo",
  "Carlyle",
  "TPG",
  "Sequoia",
  "a16z",
  "Benchmark",
  "Citadel",
  "Bridgewater",
  "Two Sigma",
  "McKinsey",
  "BCG",
  "Bain",
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
            Where Our Students Are Placed
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a network that connects you with the most prestigious firms in finance
          </p>
        </div>

        {/* Firms Grid */}
        <div className="flex items-center justify-center px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 w-full max-w-6xl">
            {eliteFirms.map((firm, index) => (
              <div
                key={index}
                className="group relative flex items-center justify-center p-4 md:p-6 rounded-xl border border-white/10 bg-background/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative text-sm md:text-base font-semibold text-center text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  {firm}
                </span>
              </div>
            ))}
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
            Logos represent firms where our verified students have successfully secured internships and full-time positions.
            Company logos are used for illustrative purposes and do not constitute endorsements.
          </p>
        </div>
      </div>
    </section>
  )
}
