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
  stepNumber,
  forwardedRef,
}: {
  icon: string
  title: string
  description: string
  stepNumber: number
  forwardedRef?: React.RefObject<HTMLDivElement>
}) => {
  return (
    <div className="flex flex-col items-center h-full">
      {/* Step Number Badge */}
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-sm font-bold text-white shadow-lg flex-shrink-0">
        {stepNumber}
      </div>
      
      <ShineBorder
        borderWidth={2}
        shineColor={["#14b8a6", "#10b981", "#047857"]}
        duration={14}
        className="relative w-full h-full flex-1 flex"
      >
        <div
          ref={forwardedRef}
          className="flex flex-col items-center space-y-4 p-8 text-center w-full"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 text-4xl shadow-lg flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </ShineBorder>
    </div>
  )
}

export function HowItWorksSection({ className }: HowItWorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  const steps = [
    {
      icon: "👤",
      title: "Sign Up",
      description: "Create your profile with academic info, resume, and target roles in under 5 minutes",
      ref: step1Ref,
    },
    {
      icon: "🔍",
      title: "Get Discovered",
      description: "Recruiters from top firms browse and filter candidates by school, GPA, and target roles",
      ref: step2Ref,
    },
    {
      icon: "🏆",
      title: "Get Placed",
      description: "Connect via email or LinkedIn and land your dream role at Goldman Sachs, Blackstone, or other elite firms",
      ref: step3Ref,
    },
  ]

  return (
    <section
      id="how-it-works"
      className={cn("relative py-20 md:py-32 overflow-hidden", className)}
    >
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="mb-12 md:mb-20 text-center">
          <TextAnimate
            animation="slideUp"
            className="text-4xl font-bold md:text-5xl"
          >
            How It Works
          </TextAnimate>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            From signup to placement — your journey to elite finance starts here
          </p>
        </div>

        {/* Process Cards with Animated Beams */}
        <div
          ref={containerRef}
          className="relative mx-auto max-w-5xl"
        >
          {/* Desktop/Tablet Layout: 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-8 lg:gap-12 items-stretch">
            {steps.map((step, index) => (
              <ProcessCard
                key={index}
                forwardedRef={step.ref}
                icon={step.icon}
                title={step.title}
                description={step.description}
                stepNumber={index + 1}
              />
            ))}
          </div>

          {/* Mobile Layout: Single column */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {steps.map((step, index) => (
              <ProcessCard
                key={index}
                forwardedRef={step.ref}
                icon={step.icon}
                title={step.title}
                description={step.description}
                stepNumber={index + 1}
              />
            ))}
          </div>

          {/* Animated Beams - Desktop only */}
          <div className="hidden md:block">
            {/* Beam from Step 1 to Step 2 */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step1Ref}
              toRef={step2Ref}
              gradientStartColor="#14b8a6"
              gradientStopColor="#10b981"
              duration={3}
              curvature={-50}
            />

            {/* Beam from Step 2 to Step 3 */}
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step2Ref}
              toRef={step3Ref}
              gradientStartColor="#10b981"
              gradientStopColor="#047857"
              duration={3}
              delay={0.5}
              curvature={-50}
            />
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="mt-10 flex justify-center gap-2 md:hidden">
          <div className="h-2 w-2 rounded-full bg-teal-500" />
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <div className="h-2 w-2 rounded-full bg-green-600" />
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-muted-foreground">
            Ready to start your journey?{" "}
            <a
              href="/signup/candidate"
              className="text-emerald-500 hover:text-emerald-400 font-semibold underline underline-offset-4 transition-colors"
            >
              Create your profile now
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
