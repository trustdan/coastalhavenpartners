"use client"

import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"
import { ShieldCheck, Users, Lock, TrendingUp, type LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="relative group">
      <ShineBorder
        borderWidth={2}
        shineColor={["#14b8a6", "#10b981", "#047857"]}
        className="p-6 bg-background/50 backdrop-blur-sm rounded-2xl h-full transition-all duration-300"
        duration={14}
      >
        <div className="flex flex-col items-center text-center h-full">
          {/* Icon Circle */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-green-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-8 w-8 text-emerald-500" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3">{title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </ShineBorder>
    </div>
  )
}

export function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: "GPA-Verified Talent",
      description:
        "Every student profile is verified with transcripts, ensuring you're connecting with top performers from target schools.",
    },
    {
      icon: Users,
      title: "Students, Recruiters, Career Services",
      description:
        "A balanced ecosystem where candidates showcase skills, recruiters discover talent, and schools track placements.",
    },
    {
      icon: Lock,
      title: "Control Your Visibility",
      description:
        "Granular privacy controls let you decide who sees what - from contact info to GPA to preferred locations.",
    },
    {
      icon: TrendingUp,
      title: "Track Your Impact",
      description:
        "Students see who viewed their profile. Recruiters track outreach. Schools monitor placement rates.",
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
            Built for Elite Finance Careers
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A verified network designed to connect top talent with exceptional opportunities
            in investment banking, private equity, and hedge funds
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Every feature is designed to create meaningful connections between verified talent
            and top-tier firms while respecting privacy and professionalism.
          </p>
        </div>
      </div>
    </section>
  )
}
