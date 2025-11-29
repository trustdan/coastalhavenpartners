"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"

const PARTNERS_URL = "https://coastalhavenpartners.com"

interface CtaSectionProps {
  className?: string
}

export function CtaSection({ className }: CtaSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-muted/30 py-24",
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1}>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Ready to Start?
            </p>
          </BlurFade>

          <TextAnimate
            animation="blurInUp"
            by="word"
            as="h2"
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            once
          >
            Source Your First Deal
          </TextAnimate>

          <BlurFade delay={0.2}>
            <p className="mb-8 text-lg text-muted-foreground">
              Join Coastal Haven Capital through our talent network. Complete
              your profile on Coastal Haven Partners and apply with one click.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ShineBorder
                shineColor={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                borderWidth={1}
                duration={10}
                className="rounded-full"
              >
                <Link
                  href={`${PARTNERS_URL}/apply/capital`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-base font-medium transition-colors hover:bg-muted"
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </ShineBorder>
              <ShineBorder
                shineColor={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                borderWidth={1}
                duration={10}
                className="rounded-full"
              >
                <Link
                  href={PARTNERS_URL}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-base font-medium transition-colors hover:bg-muted"
                >
                  Learn About the Network
                </Link>
              </ShineBorder>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="mt-12 flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Applications reviewed on a rolling basis
              </p>
              <p className="text-sm text-muted-foreground">
                Spring 2026 positions available
              </p>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
