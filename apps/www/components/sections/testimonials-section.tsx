"use client"

import { ShineBorder } from "@/components/magicui/shine-border"
import { TextAnimate } from "@/components/magicui/text-animate"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
}

function TestimonialCard({ quote, author, role, company }: TestimonialCardProps) {
  return (
    <div className="relative group">
      <ShineBorder
        borderWidth={2}
        shineColor={["#6366f1", "#8b5cf6", "#06b6d4"]}
        className="p-8 bg-background/50 backdrop-blur-sm rounded-2xl h-full transition-all duration-300"
        duration={14}
      >
        <div className="flex flex-col h-full">
          {/* Quote */}
          <p className="text-base md:text-lg text-foreground/90 leading-relaxed mb-6 flex-grow">
            &ldquo;{quote}&rdquo;
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <div className="flex-1">
              <p className="font-semibold text-sm md:text-base">{author}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {role}, {company}
              </p>
            </div>
          </div>
        </div>
      </ShineBorder>
    </div>
  )
}

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Coastal Haven helped me land my dream PE internship at Apollo. The verified network made all the difference.",
      author: "Sarah Chen",
      role: "Wharton '25",
      company: "Apollo Global Management Intern",
    },
    {
      quote: "I connected with 12 recruiters in my first week. Way better than cold emailing or LinkedIn spam.",
      author: "Michael Rodriguez",
      role: "Harvard '26",
      company: "Goldman Sachs Analyst",
    },
    {
      quote: "We've hired 8 interns through Coastal Haven this year. The GPA verification saves us so much screening time.",
      author: "Jennifer Walsh",
      role: "VP Recruiting",
      company: "Blackstone",
    },
    {
      quote: "Finally, a talent platform that understands boutique PE. The quality of candidates is exceptional.",
      author: "David Park",
      role: "Managing Director",
      company: "Vista Equity Partners",
    },
  ]

  return (
    <section className="w-full py-20 md:py-32 px-4 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <TextAnimate
            animation="slideUp"
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Trusted by Students & Recruiters
          </TextAnimate>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our community says about connecting through Coastal Haven Partners
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
