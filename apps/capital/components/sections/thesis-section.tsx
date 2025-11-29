"use client"

import { Building, Target, TrendingUp, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"

interface ThesisSectionProps {
  className?: string
}

const thesisPoints = [
  {
    icon: Building,
    title: "Lower Middle Market",
    description:
      "We target companies with $5-50M in revenue where we can drive meaningful operational improvements.",
  },
  {
    icon: Target,
    title: "Proprietary Sourcing",
    description:
      "We prioritize direct outreach over banker-led processes. That's where our interns make an impact.",
  },
  {
    icon: TrendingUp,
    title: "Value Creation",
    description:
      "We're operators, not just capital allocators. We roll up our sleeves and build alongside management teams.",
  },
  {
    icon: Users,
    title: "Relationship-Driven",
    description:
      "We build long-term partnerships with founders, management teams, and industry experts.",
  },
]

export function ThesisSection({ className }: ThesisSectionProps) {
  return (
    <section
      id="thesis"
      className={cn("relative overflow-hidden py-24", className)}
    >
      {/* Dot Pattern Background */}
      <DotPattern className="opacity-30 dark:opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />

      <div className="container mx-auto relative px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1}>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Investment Thesis
            </p>
          </BlurFade>

          <TextAnimate
            animation="blurInUp"
            by="word"
            as="h2"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            once
          >
            How We Invest
          </TextAnimate>

          <BlurFade delay={0.2}>
            <p className="mb-12 text-lg text-muted-foreground">
              We focus on founder-led businesses in fragmented industries with
              strong fundamentals and clear paths to value creation.
            </p>
          </BlurFade>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {thesisPoints.map((point, index) => (
            <BlurFade key={point.title} delay={0.2 + index * 0.1}>
              <ShineBorder
                shineColor={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                className="h-full rounded-xl"
              >
                <div className="flex h-full flex-col gap-4 rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <point.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{point.title}</h3>
                    <p className="text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              </ShineBorder>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
