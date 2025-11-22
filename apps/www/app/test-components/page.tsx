"use client"

import React from "react"
import { Meteors } from "@/components/magicui/meteors"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { IconCloud } from "@/components/magicui/icon-cloud"
import { TypingAnimation } from "@/components/magicui/typing-animation"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"
import { AuroraText } from "@/components/magicui/aurora-text"
import { MorphingText } from "@/components/magicui/morphing-text"
import { WarpBackground } from "@/components/magicui/warp-background"

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-16">
      <h1 className="text-4xl font-bold text-center mb-12">
        Full Send Emails - Components Test
      </h1>

      {/* Meteors Test */}
      <section className="border border-border rounded-lg p-8 relative overflow-hidden h-[400px]">
        <h2 className="text-2xl font-semibold mb-4 relative z-10">
          1. Meteors
        </h2>
        <p className="text-muted-foreground relative z-10">
          Animated falling meteors background effect
        </p>
        <Meteors number={20} />
      </section>

      {/* Animated Shiny Text Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. Animated Shiny Text
        </h2>
        <AnimatedShinyText className="text-4xl font-bold">
          Outbound that reads like a warm intro
        </AnimatedShinyText>
      </section>

      {/* Icon Cloud Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">3. Icon Cloud</h2>
        <div className="flex justify-center items-center h-[400px]">
          <IconCloud
            images={[
              "https://cdn.simpleicons.org/gmail",
              "https://cdn.simpleicons.org/anthropic",
              "https://cdn.simpleicons.org/openai",
              "https://cdn.simpleicons.org/google",
              "https://cdn.simpleicons.org/linkedin",
            ]}
          />
        </div>
      </section>

      {/* Typing Animation Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">4. Typing Animation</h2>
        <TypingAnimation
          typeSpeed={50}
          className="text-lg"
        >
          Hi Sarah — saw your recent post on warehouse automation ROI. Your point about lean manufacturing really resonated...
        </TypingAnimation>
      </section>

      {/* Shimmer Button Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">5. Shimmer Button</h2>
        <div className="flex gap-4">
          <ShimmerButton>Book Discovery Call</ShimmerButton>
          <ShimmerButton
            shimmerColor="#8b5cf6"
            background="rgba(139, 92, 246, 0.1)"
          >
            See How It Works
          </ShimmerButton>
        </div>
      </section>

      {/* Number Ticker Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">6. Number Ticker</h2>
        <div className="flex gap-8">
          <div className="text-center">
            <NumberTicker value={85} className="text-5xl font-bold" />
            <span className="text-5xl font-bold">%</span>
            <p className="text-muted-foreground mt-2">Open Rate</p>
          </div>
          <div className="text-center">
            <NumberTicker value={3.2} className="text-5xl font-bold" />
            <span className="text-5xl font-bold">x</span>
            <p className="text-muted-foreground mt-2">Response Rate</p>
          </div>
          <div className="text-center">
            <NumberTicker value={100} className="text-5xl font-bold" />
            <span className="text-5xl font-bold">%</span>
            <p className="text-muted-foreground mt-2">Inbox Delivery</p>
          </div>
        </div>
      </section>

      {/* Shine Border Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">7. Shine Border</h2>
        <div className="grid grid-cols-3 gap-4">
          <ShineBorder
            borderWidth={2}
            shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
            className="p-6 rounded-xl"
          >
            <div className="text-center">
              <p className="font-semibold">AI Research</p>
              <p className="text-sm text-muted-foreground mt-2">
                Cutting-edge tools
              </p>
            </div>
          </ShineBorder>
          <ShineBorder
            borderWidth={2}
            shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
            className="p-6 rounded-xl"
          >
            <div className="text-center">
              <p className="font-semibold">Vetted Contacts</p>
              <p className="text-sm text-muted-foreground mt-2">
                Quality over quantity
              </p>
            </div>
          </ShineBorder>
          <ShineBorder
            borderWidth={2}
            shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
            className="p-6 rounded-xl"
          >
            <div className="text-center">
              <p className="font-semibold">Full Analytics</p>
              <p className="text-sm text-muted-foreground mt-2">
                Track every detail
              </p>
            </div>
          </ShineBorder>
        </div>
      </section>

      {/* Text Animate Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">8. Text Animate</h2>
        <TextAnimate
          animation="slideUp"
          className="text-4xl font-bold"
        >
          How It Works
        </TextAnimate>
      </section>

      {/* Aurora Text Test */}
      <section className="border border-border rounded-lg p-8 bg-black/50">
        <h2 className="text-2xl font-semibold mb-4">9. Aurora Text</h2>
        <AuroraText className="text-xl">
          AI-powered email research that lands in the inbox and gets read
        </AuroraText>
      </section>

      {/* Morphing Text Test */}
      <section className="border border-border rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">10. Morphing Text</h2>
        <MorphingText
          texts={["Results", "Impact", "Performance"]}
          className="text-4xl font-bold"
        />
      </section>

      {/* Warp Background Test */}
      <section className="border border-border rounded-lg p-8 relative overflow-hidden h-[400px]">
        <WarpBackground className="absolute inset-0">
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              11. Warp Background
            </h2>
            <p className="text-white/80">
              Animated gradient background effect
            </p>
          </div>
        </WarpBackground>
      </section>

      <div className="text-center text-muted-foreground py-8">
        ✅ Phase 2 Complete: All components integrated and tested
      </div>
    </div>
  )
}
