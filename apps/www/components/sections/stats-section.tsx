"use client"

import { NumberTicker } from "@/components/magicui/number-ticker"
import { TextAnimate } from "@/components/magicui/text-animate"

interface StatCardProps {
  value: number
  suffix?: string
  label: string
  description: string
}

function StatCard({ value, suffix = "", label, description }: StatCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="mb-2">
        <span className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          <NumberTicker value={value} />
          {suffix}
        </span>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{label}</h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-xs">
        {description}
      </p>
    </div>
  )
}

export function StatsSection() {
  const stats = [
    {
      value: 2500,
      suffix: "+",
      label: "Verified Students",
      description: "Top performers from target schools with GPA verification",
    },
    {
      value: 150,
      suffix: "+",
      label: "Elite Firms",
      description: "Investment banks, PE firms, hedge funds, and VC partners",
    },
    {
      value: 30,
      suffix: "+",
      label: "Target Schools",
      description: "Ivy League and top business schools represented",
    },
    {
      value: 92,
      suffix: "%",
      label: "Placement Rate",
      description: "Students successfully placed at their target firms",
    },
  ]

  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background/95 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            The Numbers Speak for Themselves
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a thriving community of finance professionals and aspiring talent
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-sm md:text-base text-muted-foreground">
            Ready to join the network?{" "}
            <a
              href="/signup/candidate"
              className="text-purple-500 hover:text-purple-400 font-semibold underline underline-offset-4 transition-colors"
            >
              Create your profile
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
