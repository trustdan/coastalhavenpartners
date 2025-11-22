"use client"

import React, { useRef } from "react"
import { TextAnimate } from "@/components/magicui/text-animate"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { ShineBorder } from "@/components/magicui/shine-border"
import { cn } from "@/lib/utils"

interface HowItWorksSectionProps {
  className?: string
}

const ProcessCard = ({
  icon,
  title,
  description,
  forwardedRef,
}: {
  icon: string
  title: string
  description: string
  forwardedRef?: React.RefObject<HTMLDivElement>
}) => {
  return (
    <ShineBorder
      borderWidth={2}
      shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
      duration={14}
      className="relative"
    >
      <div
        ref={forwardedRef}
        className="flex flex-col items-center space-y-4 p-8 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 text-4xl">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </ShineBorder>
  )
}

export function HowItWorksSection({ className }: HowItWorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  return (
    <section
      id="how-it-works"
      className={cn("relative py-20 md:py-32", className)}
    >
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="mb-16 text-center">
          <TextAnimate
            animation="slideUp"
            className="text-4xl font-bold md:text-5xl"
          >
            How It Works
          </TextAnimate>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Three simple steps to personalized outreach at scale
          </p>
        </div>

        {/* Process Cards with Animated Beams */}
        <div
          ref={containerRef}
          className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12"
        >
          {/* Step 1: Research */}
          <ProcessCard
            forwardedRef={step1Ref}
            icon="🔍"
            title="Research"
            description="AI analyzes recipients' online presence, recent activity, and industry insights to find meaningful conversation starters"
          />

          {/* Step 2: Personalize */}
          <ProcessCard
            forwardedRef={step2Ref}
            icon="✍️"
            title="Personalize"
            description="Generate custom opening lines based on real research, not templates. Every email feels genuinely written for the recipient"
          />

          {/* Step 3: Deliver */}
          <ProcessCard
            forwardedRef={step3Ref}
            icon="📧"
            title="Deliver"
            description="Technical deliverability setup (SPF, DKIM, DMARC) ensures your emails land in the inbox, not spam"
          />

          {/* Animated Beams - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block">
            {/* Beam from Step 1 to Step 2 */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step1Ref}
              toRef={step2Ref}
              gradientStartColor="#6366f1"
              gradientStopColor="#8b5cf6"
              duration={3}
            />

            {/* Beam from Step 2 to Step 3 */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step2Ref}
              toRef={step3Ref}
              gradientStartColor="#8b5cf6"
              gradientStopColor="#06b6d4"
              duration={3}
            />
          </div>
        </div>

        {/* Mobile Connection Indicators */}
        <div className="mt-8 flex justify-center gap-2 md:hidden">
          <div className="h-2 w-2 rounded-full bg-indigo-500" />
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <div className="h-2 w-2 rounded-full bg-cyan-500" />
        </div>
      </div>
    </section>
  )
}
