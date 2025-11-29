"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Particles } from "@/components/magicui/particles"
import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"

const PARTNERS_URL = "https://coastalhavenpartners.com"

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const { resolvedTheme } = useTheme()
  const [particleColor, setParticleColor] = useState("#ffffff")
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setParticleColor(resolvedTheme === "dark" ? "#ffffff" : "#000000")
  }, [resolvedTheme])

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-24",
        className
      )}
    >
      {/* Particles Background */}
      <Particles
        key={resolvedTheme}
        className="absolute inset-0 -z-10"
        quantity={100}
        color={particleColor}
        size={0.6}
        interactionRadius={150}
        interactionStrength={0.6}
        mouseContainerRef={sectionRef}
      />

      {/* Gradient Overlay - lighter to let particles show through */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/30 to-background/50" />

      <div className="container mx-auto flex max-w-4xl flex-col items-center text-center">
        <BlurFade delay={0.1}>
          <div className="mb-6 inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span>Now recruiting for Summer 2025</span>
            <ArrowRight className="ml-2 h-3 w-3" />
          </div>
        </BlurFade>

        <TextAnimate
          animation="blurInUp"
          by="word"
          className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          once
        >
          Where Ambitious Talent Meets Exceptional Deals
        </TextAnimate>

        <BlurFade delay={0.3}>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            A private equity firm that gives interns real responsibility on real
            deals. Source companies, build models, and shape investment
            decisions from day one.
          </p>
        </BlurFade>

        <BlurFade delay={0.4}>
          <div className="flex flex-col gap-4 sm:flex-row">
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
                Apply via Partners
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
                Join the Network
              </Link>
            </ShineBorder>
          </div>
        </BlurFade>

        <BlurFade delay={0.5}>
          <p className="mt-6 text-sm text-muted-foreground">
            Applications are reviewed through{" "}
            <Link
              href={PARTNERS_URL}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Coastal Haven Partners
            </Link>
          </p>
        </BlurFade>
      </div>
    </section>
  )
}
