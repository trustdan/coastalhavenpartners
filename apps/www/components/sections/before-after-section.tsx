"use client"

import { ShineBorder } from "@/components/magicui/shine-border"
import { TypingAnimation } from "@/components/magicui/typing-animation"
import { TextAnimate } from "@/components/magicui/text-animate"

export function BeforeAfterSection() {
  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            The Difference is in the Details
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See how AI-powered research transforms generic templates into
            genuine conversations
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
          {/* BEFORE Card */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-500/10 dark:bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50 z-10">
              <span className="text-2xl">❌</span>
            </div>
            <div className="border-2 border-red-500/30 rounded-2xl p-8 bg-background/50 backdrop-blur-sm h-full">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-full border border-red-500/20">
                  BEFORE
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-red-900 dark:text-red-100">
                Generic Template
              </h3>
              <div className="text-base md:text-lg leading-relaxed text-foreground/80">
                <p className="mb-3">Hi,</p>
                <p className="mb-3">
                  I'd like to discuss our product with you. We offer great
                  solutions for businesses like yours.
                </p>
                <p className="mb-3">
                  Our platform can help you increase efficiency and reduce
                  costs. Many companies have seen amazing results.
                </p>
                <p className="mb-3">
                  Would you be interested in a quick call to learn more?
                </p>
                <p>Best regards</p>
              </div>
              <div className="mt-6 pt-6 border-t border-red-500/20">
                <p className="text-sm text-muted-foreground">
                  ⚠️ <span className="font-semibold">Issues:</span> No
                  personalization, vague claims, obvious template
                </p>
              </div>
            </div>
          </div>

          {/* AFTER Card */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50 z-10">
              <span className="text-2xl">✅</span>
            </div>
            <ShineBorder
              borderWidth={2}
              shineColor={["#22c55e", "#16a34a", "#15803d"]}
              className="p-8 bg-background/50 backdrop-blur-sm h-full rounded-2xl"
              duration={14}
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 rounded-full border border-green-500/20">
                  AFTER
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-900 dark:text-green-100">
                AI-Researched Personalization
              </h3>
              <div className="text-base md:text-lg leading-relaxed">
                <TypingAnimation
                  duration={30}
                  delay={500}
                  startOnView={true}
                  showCursor={true}
                  loop={false}
                  className="block leading-relaxed whitespace-pre-line"
                >
                  {`Hi Sarah — saw your recent LinkedIn post on warehouse automation ROI. Your point about lean manufacturing really resonated.

I work with mid-market logistics companies implementing AI for order routing. One of our clients cut their fulfillment time by 40% last quarter.

Given your focus on operational efficiency, I thought this might be relevant. Would you be open to a brief conversation about what we're seeing work in the industry?

Best,
Alex`}
                </TypingAnimation>
              </div>
              <div className="mt-6 pt-6 border-t border-green-500/20">
                <p className="text-sm text-muted-foreground">
                  ✨ <span className="font-semibold">Personalization:</span>{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Name
                  </span>
                  ,{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Recent Activity
                  </span>
                  ,{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Relevant Case Study
                  </span>
                </p>
              </div>
            </ShineBorder>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Every email is crafted with genuine research and context. No
            templates, no spray-and-pray — just personalized outreach that
            respects the recipients' time.
          </p>
        </div>
      </div>
    </section>
  )
}
