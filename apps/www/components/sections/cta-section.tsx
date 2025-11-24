"use client"

import Link from "next/link"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { TextAnimate } from "@/components/magicui/text-animate"

export function CTASection() {
  return (
    <section className="w-full py-32 md:py-40 px-4 bg-gradient-to-b from-background via-background/98 to-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-green-600/5" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Main CTA Content */}
        <div className="text-center">
          {/* Headline */}
          <TextAnimate
            animation="slideUp"
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            Ready to Launch Your Finance Career?
          </TextAnimate>

          {/* Subheadline */}
          <TextAnimate
            animation="fadeIn"
            delay={0.2}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Join the network where elite finance students connect with top investment banks, PE firms, and hedge funds
          </TextAnimate>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/signup/candidate">
              <ShimmerButton
                className="px-8 py-4 text-lg font-semibold"
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                shimmerDuration="2s"
                borderRadius="12px"
                background="linear-gradient(135deg, #14b8a6 0%, #059669 50%, #047857 100%)"
              >
                Join as Student
              </ShimmerButton>
            </Link>
            <Link href="/signup/recruiter">
              <ShimmerButton
                className="px-8 py-4 text-lg font-semibold"
                shimmerColor="#14b8a6"
                shimmerSize="0.1em"
                shimmerDuration="2s"
                borderRadius="12px"
                background="rgba(0, 0, 0, 0.8)"
              >
                I&apos;m Recruiting
              </ShimmerButton>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Free for students</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Profile in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Connect with top firms</span>
            </div>
          </div>
        </div>

        {/* Value Props Summary */}
        <div className="mt-16 pt-12 border-t border-foreground/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-lg font-semibold mb-1">
                For Students
              </div>
              <div className="text-sm text-muted-foreground">
                Showcase your credentials to elite firms
              </div>
            </div>
            <div>
              <div className="text-4xl mb-3">🏢</div>
              <div className="text-lg font-semibold mb-1">
                For Recruiters
              </div>
              <div className="text-sm text-muted-foreground">
                Discover top talent from target schools
              </div>
            </div>
            <div>
              <div className="text-4xl mb-3">🎓</div>
              <div className="text-lg font-semibold mb-1">
                For Schools
              </div>
              <div className="text-sm text-muted-foreground">
                Track placements and employer relationships
              </div>
            </div>
          </div>
        </div>

        {/* Final Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Join the growing community of students, recruiters, and career services professionals 
            building meaningful connections in elite finance.
          </p>
        </div>
      </div>
    </section>
  )
}
