"use client"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { TextAnimate } from "@/components/magicui/text-animate"

interface StatsSectionProps {
  className?: string
}

const stats = [
  {
    value: 10,
    suffix: "",
    prefix: "",
    label: "Interns This Cohort",
  },
  {
    value: 100,
    suffix: "%",
    prefix: "",
    label: "Real Deal Exposure",
  },
  {
    value: 10,
    suffix: "+",
    prefix: "",
    label: "Hours Per Week",
  },
  {
    value: 0,
    suffix: "",
    prefix: "",
    label: "Coffee Runs",
  },
]

export function StatsSection({ className }: StatsSectionProps) {
  return (
    <section
      id="stats"
      className={cn("relative overflow-hidden py-24", className)}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1}>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              The Opportunity
            </p>
          </BlurFade>

          <TextAnimate
            animation="blurInUp"
            by="word"
            as="h2"
            className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl"
            once
          >
            What You're Signing Up For
          </TextAnimate>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <BlurFade key={stat.label} delay={0.2 + index * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
                  {stat.prefix}
                  <NumberTicker value={stat.value} delay={0.3 + index * 0.1} />
                  {stat.suffix}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
