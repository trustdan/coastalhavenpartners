"use client"

import { IconCloud } from "@/components/magicui/icon-cloud"
import { TextAnimate } from "@/components/magicui/text-animate"

const aiPartners = [
  {
    key: "anthropic",
    label: "Anthropic",
    src: "/icons/anthropic.svg",
  },
  {
    key: "google",
    label: "Google",
    src: "/icons/google.svg",
  },
  {
    key: "mailmeteor",
    label: "Mailmeteor",
    src: "/icons/mailmeteor.svg",
  },
  {
    key: "gemini",
    label: "Google Gemini",
    src: "/icons/gemini.svg",
  },
  {
    key: "gmail",
    label: "Gmail",
    src: "https://cdn.simpleicons.org/gmail",
  },
  {
    key: "claude",
    label: "Anthropic Claude",
    src: "/icons/claude.svg",
  },
  {
    key: "outlook",
    label: "Microsoft Outlook",
    src: "/icons/outlook.svg",
  },
  {
    key: "word",
    label: "Microsoft Word",
    src: "/icons/word.svg",
  },
  {
    key: "excel",
    label: "Microsoft Excel",
    src: "/icons/excel.svg",
  },
  {
    key: "cursor",
    label: "Cursor",
    src: "/icons/cursor.svg",
  },
  {
    key: "typora",
    label: "Typora",
    src: "/icons/typora.svg",
  },
  {
    key: "openai",
    label: "OpenAI",
    src: "https://cdn.simpleicons.org/openai/0FA37F",
  },
]

export function TechStackSection() {
  const iconCloudImages = aiPartners.map((brand) => brand.src)

  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Optional subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Powered by Cutting-Edge AI
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We leverage the best tools and technologies to deliver exceptional
            results
          </p>
        </div>

        {/* Icon Cloud Container */}
        <div className="flex items-center justify-center px-4">
          <div className="relative w-full max-w-xl aspect-square rounded-[32px] border border-white/10 bg-gradient-to-br from-background via-background/80 to-background/60 shadow-[0_25px_120px_rgba(0,0,0,0.35)]">
            <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 blur-2xl" />
            <div className="relative flex h-full items-center justify-center p-6 md:p-10">
              <IconCloud images={iconCloudImages} />
            </div>
          </div>
        </div>

        {/* Tech Labels */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Anthropic + Claude
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Google & Gemini
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Gmail + Outlook workflow automation
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Microsoft Word + Excel co-pilots
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            Cursor & Typora creative tooling
          </span>
          <span className="rounded-full border bg-background/50 px-3 py-1">
            OpenAI orchestration
          </span>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            Our technology stack combines AI research tools, deliverability
            platforms, and automation systems to ensure your outreach is both
            personalized and reliable.
          </p>
        </div>
      </div>
    </section>
  )
}
