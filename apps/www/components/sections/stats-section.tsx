"use client"

import { TextAnimate } from "@/components/magicui/text-animate"

interface FeatureCardProps {
  icon: string
  label: string
  description: string
}

function FeatureCard({ icon, label, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{label}</h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-xs">
        {description}
      </p>
    </div>
  )
}

export function StatsSection() {
  const features = [
    {
      icon: "🎓",
      label: "Student Verification",
      description: "Secure transcript verification system to showcase your academic excellence",
    },
    {
      icon: "🔍",
      label: "Firm Discovery",
      description: "Browse and connect with investment banks, PE firms, and hedge funds",
    },
    {
      icon: "🔒",
      label: "Privacy Controls",
      description: "You control what information is visible and who can contact you",
    },
    {
      icon: "📊",
      label: "Profile Analytics",
      description: "Track who views your profile and measure your networking impact",
    },
  ]

  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background/95 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            How It Works
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A streamlined platform designed for elite finance recruiting
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-sm md:text-base text-muted-foreground">
            Ready to get started?{" "}
            <a
              href="/signup/candidate"
              className="text-purple-500 hover:text-purple-400 font-semibold underline underline-offset-4 transition-colors"
            >
              Create your profile today
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
