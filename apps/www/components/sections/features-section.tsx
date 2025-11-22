"use client"

import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="relative group">
      <ShineBorder
        borderWidth={2}
        shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
        className="p-6 bg-background/50 backdrop-blur-sm rounded-2xl h-full transition-all duration-300"
        duration={14}
      >
        <div className="flex flex-col items-center text-center h-full">
          {/* Icon Circle */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <span className="text-4xl">{icon}</span>
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
      icon: "🤖",
      title: "AI-Powered Research",
      description:
        "Cutting-edge AI tools analyze online presence, recent activity, and industry insights to find genuine conversation starters.",
    },
    {
      icon: "🔍",
      title: "Every Contact Vetted",
      description:
        "Quality over quantity approach ensures every recipient is relevant, qualified, and likely to engage with your message.",
    },
    {
      icon: "📊",
      title: "Full Analytics",
      description:
        "Track opens, clicks, and responses in real-time with comprehensive dashboards and detailed engagement metrics.",
    },
    {
      icon: "📬",
      title: "Technical Deliverability",
      description:
        "Properly configured SPF, DKIM, and DMARC records ensure your emails land in the inbox, not the spam folder.",
    },
    {
      icon: "🎯",
      title: "Quality Over Quantity",
      description:
        "No spray-and-pray tactics. Each email is crafted with care, research, and genuine relevance to the recipient.",
    },
    {
      icon: "💬",
      title: "Complete Transparency",
      description:
        "See exactly what we send on your behalf. Full visibility into every email, every metric, every result.",
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
            Why Choose Us
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We combine cutting-edge AI technology with human expertise to
            deliver outreach that actually works
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
            Every aspect of our service is designed to maximize engagement while
            maintaining authenticity and respect for your recipients.
          </p>
        </div>
      </div>
    </section>
  )
}
