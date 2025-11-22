"use client"

import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { TextAnimate } from "@/components/magicui/text-animate"

export function CTASection() {
  return (
    <section className="w-full py-32 md:py-40 px-4 bg-gradient-to-b from-background via-background/98 to-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main CTA Content */}
        <div className="text-center">
          {/* Headline */}
          <TextAnimate
            animation="slideUp"
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            Ready to Transform Your Outreach?
          </TextAnimate>

          {/* Subheadline */}
          <TextAnimate
            animation="fadeIn"
            delay={0.2}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Book a free consultation to see how AI can personalize your outreach
            at scale
          </TextAnimate>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <ShimmerButton
              className="px-8 py-4 text-lg font-semibold"
              shimmerColor="#ffffff"
              shimmerSize="0.1em"
              shimmerDuration="2s"
              borderRadius="12px"
              background="linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)"
              onClick={() => {
                window.open("https://www.upwork.com/services/product/marketing-personalized-emails-delivered-to-the-types-of-people-you-want-1990863338668663734", "_blank")
              }}
            >
              Book Discovery Call
            </ShimmerButton>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Free consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Setup in 48 hours</span>
            </div>
          </div>
        </div>

        {/* Social Proof / Stats Summary */}
        <div className="mt-16 pt-12 border-t border-foreground/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                85%
              </div>
              <div className="text-sm text-muted-foreground">
                Average Open Rate
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                3.2x
              </div>
              <div className="text-sm text-muted-foreground">
                Higher Response Rate
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                Inbox Delivery
              </div>
            </div>
          </div>
        </div>

        {/* Final Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Join companies that are already transforming their outreach with
            AI-powered personalization. Every email crafted with care, every
            recipient researched, every message genuine.
          </p>
        </div>
      </div>
    </section>
  )
}
