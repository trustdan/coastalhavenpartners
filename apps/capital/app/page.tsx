import { CtaSection } from "@/components/sections/cta-section"
import { HeroSection } from "@/components/sections/hero-section"
import { InternshipSection } from "@/components/sections/internship-section"
import { StatsSection } from "@/components/sections/stats-section"
import { ThesisSection } from "@/components/sections/thesis-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ThesisSection />
        <InternshipSection />
        <StatsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
