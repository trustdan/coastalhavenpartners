"use client"

import {
  BarChart3,
  FileSearch,
  Lightbulb,
  Phone,
  Presentation,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { TextAnimate } from "@/components/magicui/text-animate"

interface InternshipSectionProps {
  className?: string
}

const responsibilities = [
  {
    icon: Search,
    title: "Deal Sourcing",
    description:
      "Identify acquisition targets through industry research, database mining, and proprietary outreach campaigns.",
  },
  {
    icon: Phone,
    title: "Owner Outreach",
    description:
      "Conduct initial conversations with business owners to assess interest and fit with our investment criteria.",
  },
  {
    icon: FileSearch,
    title: "Due Diligence",
    description:
      "Analyze financials, market dynamics, and competitive positioning to evaluate investment opportunities.",
  },
  {
    icon: BarChart3,
    title: "Financial Modeling",
    description:
      "Build LBO models, valuation analyses, and operating projections to support investment decisions.",
  },
  {
    icon: Lightbulb,
    title: "Industry Research",
    description:
      "Develop sector expertise and identify macro trends that inform our sourcing strategy.",
  },
  {
    icon: Presentation,
    title: "IC Presentations",
    description:
      "Present your findings to the investment committee and participate in real deal discussions.",
  },
]

export function InternshipSection({ className }: InternshipSectionProps) {
  return (
    <section
      id="internship"
      className={cn("relative overflow-hidden bg-muted/30 py-24", className)}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1}>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              The Internship
            </p>
          </BlurFade>

          <TextAnimate
            animation="blurInUp"
            by="word"
            as="h2"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            once
          >
            What You'll Actually Do
          </TextAnimate>

          <BlurFade delay={0.2}>
            <p className="mb-12 text-lg text-muted-foreground">
              No coffee runs. No busy work. You'll work on live deals alongside
              our investment team from day one.
            </p>
          </BlurFade>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {responsibilities.map((item, index) => (
            <BlurFade key={item.title} delay={0.2 + index * 0.1}>
              <div className="group flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-foreground/20 group-hover:bg-muted">
                  <item.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.8}>
          <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-border/50 bg-card p-8 text-center">
            <p className="text-lg font-medium">
              "Source a deal that closes?{" "}
              <span className="text-muted-foreground">
                That's your deal. Forever.
              </span>
              "
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
