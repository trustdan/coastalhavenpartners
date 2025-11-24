"use client"

import React from "react"
import Link from "next/link"
import { Meteors } from "@/components/magicui/meteors"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { AuroraText } from "@/components/magicui/aurora-text"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden",
        "bg-background",
        className
      )}
    >
      {/* Meteors Background Effect - covers full viewport */}
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="relative h-full w-full">
          <Meteors number={12} />
        </div>
      </div>

      {/* Hero Content */}
      <div className="container relative z-[10] mx-auto px-4 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-8 text-center">
          {/* Main Headline - Animated Shiny Text */}
          <AnimatedShinyText className="text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl">
            Where Elite Talent Meets Boutique Opportunity
          </AnimatedShinyText>

          {/* Subtitle - Aurora Text */}
          <AuroraText className="max-w-3xl text-lg text-muted-foreground md:text-xl lg:text-2xl">
            The verified network connecting top finance students with investment banks, PE firms, and hedge funds
          </AuroraText>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:gap-6">
            <Link href="/signup/candidate">
              <ShimmerButton
                className="px-8 py-4 text-base font-semibold md:px-10 md:py-5 md:text-lg"
                shimmerColor="#8b5cf6"
                shimmerDuration="2.5s"
              >
                Join as Student
              </ShimmerButton>
            </Link>
            <Link href="/signup/recruiter">
              <ShimmerButton
                className="px-8 py-4 text-base font-semibold md:px-10 md:py-5 md:text-lg border-2"
                shimmerColor="#8b5cf6"
                shimmerDuration="2.5s"
                background="rgba(0, 0, 0, 0.95)"
              >
                I&apos;m Recruiting
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator (Optional) */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg
          className="h-6 w-6 text-muted-foreground"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
