"use client"

import { ShineBorder } from "@/components/magicui/shine-border"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { TextAnimate } from "@/components/magicui/text-animate"

interface MetricCardProps {
  value: number
  suffix?: string
  label: string
  description: string
  decimalPlaces?: number
}

function MetricCard({
  value,
  suffix = "",
  label,
  description,
  decimalPlaces = 0,
}: MetricCardProps) {
  return (
    <ShineBorder
      borderWidth={2}
      shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
      className="flex flex-col items-center justify-center p-8 bg-background/50 backdrop-blur-sm rounded-2xl"
      duration={14}
    >
      <div className="flex items-baseline gap-1 mb-2">
        <NumberTicker
          value={value}
          decimalPlaces={decimalPlaces}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent"
        />
        <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          {suffix}
        </span>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{label}</h3>
      <p className="text-sm md:text-base text-muted-foreground text-center">
        {description}
      </p>
    </ShineBorder>
  )
}

export function ResultsSection() {
  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Results That Speak for Themselves
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered approach delivers metrics that transform cold
            outreach into warm conversations
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          <MetricCard
            value={85}
            suffix="%"
            label="Open Rate"
            description="vs. industry average of 20-30%"
          />
          <MetricCard
            value={3.2}
            suffix="x"
            label="Response Rate"
            description="higher than template emails"
            decimalPlaces={1}
          />
          <MetricCard
            value={100}
            suffix="%"
            label="Inbox Delivery"
            description="with proper technical setup"
          />
        </div>

        {/* Additional Context */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Metrics based on campaigns using AI research and personalized
            outreach
          </p>
        </div>
      </div>
    </section>
  )
}
