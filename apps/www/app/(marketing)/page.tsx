import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { BeforeAfterSection } from "@/components/sections/before-after-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { StatsSection } from "@/components/sections/stats-section"
import { TechStackSection } from "@/components/sections/tech-stack-section"
import { CTASection } from "@/components/sections/cta-section"

export default function Page() {
  return (
    <main className="relative scroll-smooth">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorksSection className="bg-muted/30" />

      {/* Before/After Comparison Section */}
      <BeforeAfterSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Tech Stack Section */}
      <TechStackSection />

      {/* Call to Action Section */}
      <CTASection />
    </main>
  )
}
