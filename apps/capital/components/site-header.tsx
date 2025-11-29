"use client"

import Link from "next/link"
import { Building2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { ThemeToggle } from "@/components/theme-toggle"

const PARTNERS_URL = "https://coastalhavenpartners.com"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <span className="font-semibold tracking-tight">
            Coastal Haven Capital
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#thesis"
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            Investment Thesis
          </Link>
          <Link
            href="#internship"
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            Internship
          </Link>
          <Link
            href={PARTNERS_URL}
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Talent Network
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href={`${PARTNERS_URL}/apply/capital`}>
            <ShimmerButton className="h-9 px-4 text-sm font-medium">
              Apply Now
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </header>
  )
}
