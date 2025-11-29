import Link from "next/link"
import { Building2 } from "lucide-react"

const PARTNERS_URL = "https://coastalhavenpartners.com"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-12 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold tracking-tight">
                Coastal Haven Capital
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              A private equity firm where interns source real deals and build
              real careers.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold">Company</h4>
              <Link
                href="#thesis"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Investment Thesis
              </Link>
              <Link
                href="#internship"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Internship Program
              </Link>
              <Link
                href="#stats"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                The Opportunity
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold">Network</h4>
              <Link
                href={PARTNERS_URL}
                className="text-sm text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Coastal Haven Partners
              </Link>
              <Link
                href={`${PARTNERS_URL}/apply/capital`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Apply Now
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold">Legal</h4>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-border/40 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Coastal Haven Capital. All rights
            reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Talent powered by{" "}
            <Link
              href={PARTNERS_URL}
              className="font-medium text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coastal Haven Partners
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
