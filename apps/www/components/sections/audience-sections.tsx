"use client"

import { TextAnimate } from "@/components/magicui/text-animate"
import { ShineBorder } from "@/components/magicui/shine-border"
import Link from "next/link"
import { ShimmerButton } from "@/components/magicui/shimmer-button"

export function AudienceSections() {
  return (
    <section className="w-full py-20 md:py-32 px-4">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* For Students */}
        <div id="students" className="scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">For Students</span>
              </div>
              <TextAnimate
                animation="slideUp"
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Launch Your Finance Career
              </TextAnimate>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Showcase your academic achievements to elite investment banks, PE firms, and hedge funds.
                Get discovered by top recruiters actively seeking talent from your school.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "GPA-verified profile builds instant credibility",
                  "Control who sees your contact info and academic details",
                  "Track which recruiters viewed your profile",
                  "Connect directly with decision-makers at top firms",
                  "100% free for students"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup/candidate">
                <ShimmerButton
                  className="px-8 py-4 text-base font-semibold"
                  shimmerColor="#10b981"
                  shimmerDuration="2.5s"
                  background="rgba(0, 0, 0, 0.95)"
                >
                  Create Student Profile →
                </ShimmerButton>
              </Link>
            </div>
            <div className="relative">
              <ShineBorder
                borderWidth={2}
                shineColor={["#14b8a6", "#10b981", "#047857"]}
                className="p-8 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 backdrop-blur-sm"
                duration={14}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">🎓</div>
                    <div>
                      <h4 className="font-semibold text-lg">Top School Student</h4>
                      <p className="text-sm text-muted-foreground">Wharton, Finance • 3.9 GPA</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Recent Profile Views</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-2xl">🏦</span>
                        <span>Goldman Sachs — 2 days ago</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-2xl">💼</span>
                        <span>Blackstone — 3 days ago</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-2xl">📊</span>
                        <span>Citadel — 5 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ShineBorder>
            </div>
          </div>
        </div>

        {/* For Recruiters */}
        <div id="recruiters" className="scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <ShineBorder
                borderWidth={2}
                shineColor={["#14b8a6", "#10b981", "#047857"]}
                className="p-8 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 backdrop-blur-sm"
                duration={14}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">🏢</div>
                    <div>
                      <h4 className="font-semibold text-lg">Filter & Discover</h4>
                      <p className="text-sm text-muted-foreground">Find your perfect candidates</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Search Filters</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 rounded-md bg-background/50 border text-xs">GPA: 3.7+</div>
                      <div className="px-3 py-2 rounded-md bg-background/50 border text-xs">Wharton</div>
                      <div className="px-3 py-2 rounded-md bg-background/50 border text-xs">IB Interest</div>
                      <div className="px-3 py-2 rounded-md bg-background/50 border text-xs">NYC</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">47 qualified candidates found</p>
                  </div>
                </div>
              </ShineBorder>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">For Recruiters</span>
              </div>
              <TextAnimate
                animation="slideUp"
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Discover Pre-Vetted Talent
              </TextAnimate>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Access a curated pool of high-achieving finance students from target schools.
                Every GPA is verified, every profile is complete.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Filter by school, GPA, graduation year, and target roles",
                  "Transcript-verified GPAs eliminate resume inflation",
                  "Direct access to student contact information",
                  "Track outreach and engagement metrics",
                  "Join the recruiter network and collaborate with peers"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup/recruiter">
                <ShimmerButton
                  className="px-8 py-4 text-base font-semibold border-2"
                  shimmerColor="#14b8a6"
                  shimmerDuration="2.5s"
                  background="rgba(0, 0, 0, 0.95)"
                >
                  Create Recruiter Profile →
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </div>

        {/* For Schools */}
        <div id="schools" className="scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">For Career Services</span>
              </div>
              <TextAnimate
                animation="slideUp"
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Track Student Success
              </TextAnimate>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Monitor your students' job search progress and placement outcomes.
                Build stronger relationships with recruiting firms.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Dashboard showing all students from your school",
                  "Track verification status and placement progress",
                  "See which firms are recruiting from your school",
                  "Verify student GPAs and academic standing",
                  "Connect with recruiters actively hiring your graduates"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup/school">
                <ShimmerButton
                  className="px-8 py-4 text-base font-semibold border-2"
                  shimmerColor="#a855f7"
                  shimmerDuration="2.5s"
                  background="rgba(0, 0, 0, 0.95)"
                >
                  Create School Account →
                </ShimmerButton>
              </Link>
            </div>
            <div className="relative">
              <ShineBorder
                borderWidth={2}
                shineColor={["#a855f7", "#ec4899", "#f97316"]}
                className="p-8 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm"
                duration={14}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">🎯</div>
                    <div>
                      <h4 className="font-semibold text-lg">Wharton Career Services</h4>
                      <p className="text-sm text-muted-foreground">University of Pennsylvania</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Placement Metrics</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-green-600">127</p>
                        <p className="text-xs text-muted-foreground">Active Students</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">89</p>
                        <p className="text-xs text-muted-foreground">Verified</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">34</p>
                        <p className="text-xs text-muted-foreground">Placed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ShineBorder>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
