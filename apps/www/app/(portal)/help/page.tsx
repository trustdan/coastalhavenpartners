import { Metadata } from 'next'
import Link from 'next/link'
import {
  GraduationCap,
  Briefcase,
  Building2,
  Shield,
  CheckCircle2,
  MessageSquare,
  Search,
  Bookmark,
  FileText,
  Users,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Help Center | Coastal Haven Partners',
  description: 'Learn how to use Coastal Haven Partners - the finance talent network connecting students, recruiters, and career services.',
}

function Section({
  title,
  icon: Icon,
  children
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function FeatureCard({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
      <h4 className="font-medium">{title}</h4>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <nav className="border-b bg-white dark:bg-neutral-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Coastal Haven Partners
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/support">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Everything you need to know about using Coastal Haven Partners
          </p>
        </div>

        <div className="space-y-6">
          {/* About the Platform */}
          <Section title="About Coastal Haven Partners" icon={Building2}>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Coastal Haven Partners is a comprehensive finance talent network connecting top-tier candidates
              with elite recruiters and educational institutions. We facilitate the entire recruitment lifecycle
              for finance roles including Investment Banking, Private Equity, Venture Capital, Hedge Funds, and more.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <FeatureCard
                title="Two-Sided Marketplace"
                description="Connect candidates with recruiters while career services administrators verify credentials"
              />
              <FeatureCard
                title="Verified Profiles"
                description="GPA, resume, and transcript verification ensures quality and trust"
              />
            </div>
          </Section>

          {/* For Candidates */}
          <Section title="For Candidates" icon={GraduationCap}>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Create a comprehensive profile showcasing your academic achievements and career aspirations.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <FeatureCard
                title="Complete Academic Profile"
                description="Add your school, GPA, major, graduation year, and degree types including graduate education"
              />
              <FeatureCard
                title="Document Uploads"
                description="Upload your resume and transcript for verification by career services"
              />
              <FeatureCard
                title="Target Roles"
                description="Select your preferred finance tracks (IB, PE, VC, HF) and work locations"
              />
              <FeatureCard
                title="Interested Firms"
                description="Express interest in up to 10 firms to create warm signals for recruiter outreach"
              />
              <FeatureCard
                title="Profile Analytics"
                description="See how many recruiters viewed your profile and which firms are interested"
              />
              <FeatureCard
                title="Direct Messaging"
                description="Receive and respond to messages from recruiters directly on the platform"
              />
            </div>

            <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Verification Badges</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Get green checkmarks on your profile when your GPA, resume, and transcript are verified by admins.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* For Recruiters */}
          <Section title="For Recruiters" icon={Briefcase}>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Discover and connect with top finance talent using powerful search and tracking tools.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <FeatureCard
                title="Advanced Filters"
                description="Filter by GPA, major, school, graduation year, target roles, and degree types"
              />
              <FeatureCard
                title="Saved Searches"
                description="Save filter combinations for quick access to your preferred candidate pools"
              />
              <FeatureCard
                title="Candidate Bookmarking"
                description="Save candidates to your shortlist with optional notes"
              />
              <FeatureCard
                title="Pipeline Status Tags"
                description="Track candidates through your hiring funnel with color-coded status badges"
              />
              <FeatureCard
                title="Private Notes"
                description="Add confidential notes on candidates that only you can see"
              />
              <FeatureCard
                title="Mutual Interest Matching"
                description="See which candidates have expressed interest in your firm"
              />
              <FeatureCard
                title="CSV Export"
                description="Export candidate data for offline analysis and reporting"
              />
              <FeatureCard
                title="Direct Messaging"
                description="Reach out to candidates directly through the platform"
              />
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Account Verification Required</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Recruiter accounts require verification before accessing candidate profiles. Our team reviews your
                    work email domain, LinkedIn profile, and firm affiliation. Approval typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* For Schools */}
          <Section title="For Career Services" icon={Building2}>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Support your students&apos; finance career journeys and verify their credentials.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <FeatureCard
                title="Student Verification"
                description="View and verify students from your university"
              />
              <FeatureCard
                title="Document Review"
                description="Review and approve uploaded transcripts and documents"
              />
              <FeatureCard
                title="Track Progress"
                description="Monitor verification status and student engagement"
              />
              <FeatureCard
                title="Recruiter Network"
                description="See which recruiters are active on the platform"
              />
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Account Verification Required</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Career services accounts require verification. Please upload documentation proving your
                    affiliation with your university during signup. Approval typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Account Security */}
          <Section title="Account Security" icon={Shield}>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Keep your account secure with our built-in security features.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <FeatureCard
                title="Two-Factor Authentication"
                description="Enable 2FA in your settings for an extra layer of security"
              />
              <FeatureCard
                title="Secure Sessions"
                description="Your sessions are encrypted and automatically expire for safety"
              />
              <FeatureCard
                title="Discord Integration"
                description="Link your Discord account for community features and additional verification"
              />
              <FeatureCard
                title="Privacy Controls"
                description="Control what information is visible to different user types"
              />
            </div>
          </Section>

          {/* Getting Started */}
          <Section title="Getting Started" icon={Users}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">1. Create Your Account</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Sign up with your email or use Google, LinkedIn, or Discord. Choose your role:
                  Student, Recruiter, or Career Services.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">2. Complete Your Profile</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Fill in your details based on your role. Candidates add academic info,
                  recruiters add firm details, and schools verify their institution.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">3. Get Verified</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Recruiters and career services accounts are reviewed by our team.
                  Candidates can get their documents verified for added credibility.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">4. Start Connecting</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Once approved, browse the platform, save searches, bookmark profiles,
                  and reach out via direct messaging.
                </p>
              </div>
            </div>
          </Section>

          {/* FAQ */}
          <Section title="Frequently Asked Questions" icon={MessageSquare}>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">How long does account approval take?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Recruiter and career services accounts are typically reviewed within 24-48 hours.
                  Candidate accounts are active immediately but document verification may take longer.
                </p>
              </div>
              <div>
                <h4 className="font-medium">How are recruiters verified?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Our team verifies recruiter accounts using multiple methods: (1) work email domain verification -
                  we check that your email domain matches your company&apos;s website, (2) LinkedIn profile review
                  to confirm your professional identity, and (3) firm affiliation verification to ensure you represent
                  a legitimate finance organization. This multi-factor approach protects candidates from fraudulent outreach.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Why do I need to use my work email?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Using your work email (e.g., jane@goldmansachs.com) helps us verify your affiliation with your
                  firm automatically. When your email domain matches the company website, it speeds up the approval
                  process and adds an extra layer of trust to your profile.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Is my information secure?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Yes. We use industry-standard encryption and Row Level Security to protect your data.
                  Only authorized users can see your information based on your privacy settings.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Can I control who sees my profile?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Yes. You can control visibility settings in your profile settings to determine
                  what information different user types can see.
                </p>
              </div>
              <div>
                <h4 className="font-medium">How do I get my GPA verified?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Upload your official transcript in your profile settings. An admin or your
                  school&apos;s career services can verify your academic credentials.
                </p>
              </div>
              <div>
                <h4 className="font-medium">How do I contact support?</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  You can submit support requests or feedback through our support page. You&apos;ll need to be
                  logged in with a verified account to use this feature. Alternatively, you can join our
                  Discord community or email us directly at contact@coastalhavenpartners.com.
                </p>
              </div>
            </div>
          </Section>

          {/* Need More Help */}
          <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Need More Help?</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                Note: You must be logged in with a verified account to submit support requests or feedback.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link href="/support">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://discord.gg/MarkPXNfXd"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Discord Community
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
