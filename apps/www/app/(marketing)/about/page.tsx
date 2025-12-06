import { constructMetadata } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Shield,
  Target,
  Zap,
  Heart,
  Globe,
  ArrowRight,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "About | Coastal Haven Partners",
  description:
    "Learn why Coastal Haven Partners is the premier talent network connecting elite finance students with top investment banks, PE firms, and hedge funds.",
});

function ProblemCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30">
      <div className="flex-shrink-0">
        <XCircle className="h-6 w-6 text-red-500" />
      </div>
      <div>
        <h4 className="font-semibold text-red-900 dark:text-red-300">{title}</h4>
        <p className="mt-1 text-sm text-red-700/80 dark:text-red-400/80">{description}</p>
      </div>
    </div>
  );
}

function SolutionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-800/30">
      <div className="flex-shrink-0">
        <CheckCircle2 className="h-6 w-6 text-green-500" />
      </div>
      <div>
        <h4 className="font-semibold text-green-900 dark:text-green-300">{title}</h4>
        <p className="mt-1 text-sm text-green-700/80 dark:text-green-400/80">{description}</p>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Why Coastal Haven Partners?
        </h1>
        <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          We built the talent network that finance recruiting desperately needs—one that works for
          students, recruiters, and schools alike.
        </p>
      </div>

      {/* The Problem Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">The Recruiting Problem</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Traditional finance recruiting is broken for everyone involved
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Students Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">For Students</h3>
            </div>
            <ProblemCard
              icon={XCircle}
              title="Limited Visibility"
              description="Top talent at non-target schools gets overlooked by recruiters who only visit the same 10 campuses"
            />
            <ProblemCard
              icon={XCircle}
              title="Networking Roulette"
              description="Success depends on who you know, not what you know—cold emails go unanswered"
            />
            <ProblemCard
              icon={XCircle}
              title="Application Black Holes"
              description="You apply to 50 firms and hear back from none. No feedback, no visibility"
            />
          </div>

          {/* Recruiters Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">For Recruiters</h3>
            </div>
            <ProblemCard
              icon={XCircle}
              title="Resume Overload"
              description="Thousands of applications, no way to filter for quality without manual review"
            />
            <ProblemCard
              icon={XCircle}
              title="Target School Tunnel Vision"
              description="You know great talent exists everywhere, but you don't have time to find it"
            />
            <ProblemCard
              icon={XCircle}
              title="Outdated Information"
              description="LinkedIn profiles are stale, resumes are PDFs from last year, transcripts are unverified"
            />
          </div>

          {/* Schools Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">For Career Services</h3>
            </div>
            <ProblemCard
              icon={XCircle}
              title="No Visibility"
              description="You can't see which firms are engaging with your students or who's getting interviews"
            />
            <ProblemCard
              icon={XCircle}
              title="Manual Tracking"
              description="Placement data lives in spreadsheets, updated manually (if at all)"
            />
            <ProblemCard
              icon={XCircle}
              title="Recruiter Access"
              description="No efficient way to connect your students with the right recruiters at scale"
            />
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Our Solution</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            A verified talent network that creates value for all sides
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Students Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">For Students</h3>
            </div>
            <SolutionCard
              icon={CheckCircle2}
              title="Get Discovered"
              description="Recruiters search for candidates by GPA, school, target roles, and more—your profile does the networking"
            />
            <SolutionCard
              icon={CheckCircle2}
              title="Verified Credentials"
              description="Your GPA and transcripts are verified, building trust with recruiters instantly"
            />
            <SolutionCard
              icon={CheckCircle2}
              title="Direct Access"
              description="Message recruiters directly, schedule interviews, and track who's viewed your profile"
            />
          </div>

          {/* Recruiters Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">For Recruiters</h3>
            </div>
            <SolutionCard
              icon={CheckCircle2}
              title="Quality Over Quantity"
              description="Pre-verified candidates with real GPAs, transcripts, and active job interests"
            />
            <SolutionCard
              icon={CheckCircle2}
              title="Beyond Target Schools"
              description="Find exceptional talent from any school using powerful filters and saved searches"
            />
            <SolutionCard
              icon={CheckCircle2}
              title="Streamlined Outreach"
              description="Save candidates, take notes, track status, and message directly from one platform"
            />
          </div>

          {/* Schools Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">For Career Services</h3>
            </div>
            <SolutionCard
              icon={CheckCircle2}
              title="Real-Time Analytics"
              description="See which firms engage with your students, placement rates by firm type, and more"
            />
            <SolutionCard
              icon={CheckCircle2}
              title="Student Success Tracking"
              description="Monitor student profiles, verification status, and recruiter engagement in one dashboard"
            />
            <SolutionCard
              icon={CheckCircle2}
              title="Recruiter Directory"
              description="Connect your students with verified recruiters who want to hire from your school"
            />
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">What Makes Us Different</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Built specifically for finance recruiting, not adapted from generic platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ValueCard
            icon={Shield}
            title="Verified Everything"
            description="GPAs verified against transcripts. Recruiters verified against firm emails. No fake profiles, no inflated numbers."
          />
          <ValueCard
            icon={Target}
            title="Finance-First Design"
            description="Built for IB, PE, HF, and VC recruiting. We understand target roles, deal experience, and what matters."
          />
          <ValueCard
            icon={Zap}
            title="Two-Way Discovery"
            description="Students express interest in firms. Recruiters discover students. Mutual interest surfaces the best matches."
          />
          <ValueCard
            icon={Sparkles}
            title="Always Current"
            description="No stale profiles. Candidates update their status, GPAs refresh each semester, and engagement is tracked in real-time."
          />
          <ValueCard
            icon={Globe}
            title="Beyond Target Schools"
            description="Great talent exists everywhere. We make it findable, regardless of school pedigree."
          />
          <ValueCard
            icon={Heart}
            title="Student-Friendly"
            description="Free for students. No paywall between you and your career. Recruiters pay because you're worth it."
          />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How We Compare</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="p-4 font-semibold text-center">LinkedIn</th>
                <th className="p-4 font-semibold text-center">Handshake</th>
                <th className="p-4 font-semibold text-center bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
                  Coastal Haven
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">GPA Verification</td>
                <td className="p-4 text-center text-red-500">
                  <XCircle className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-red-500">
                  <XCircle className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-green-500 bg-blue-50/50 dark:bg-blue-900/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Finance-Specific Filters</td>
                <td className="p-4 text-center text-red-500">
                  <XCircle className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-yellow-500">Limited</td>
                <td className="p-4 text-center text-green-500 bg-blue-50/50 dark:bg-blue-900/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Direct Messaging</td>
                <td className="p-4 text-center text-yellow-500">Paid</td>
                <td className="p-4 text-center text-green-500">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-green-500 bg-blue-50/50 dark:bg-blue-900/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">School Analytics</td>
                <td className="p-4 text-center text-red-500">
                  <XCircle className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-yellow-500">Basic</td>
                <td className="p-4 text-center text-green-500 bg-blue-50/50 dark:bg-blue-900/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Mutual Interest Matching</td>
                <td className="p-4 text-center text-red-500">
                  <XCircle className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-red-500">
                  <XCircle className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-green-500 bg-blue-50/50 dark:bg-blue-900/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Free for Students</td>
                <td className="p-4 text-center text-green-500">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-green-500">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
                <td className="p-4 text-center text-green-500 bg-blue-50/50 dark:bg-blue-900/10">
                  <CheckCircle2 className="h-5 w-5 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 px-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to Join?</h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Whether you're a student looking to break into finance, a recruiter searching for
          exceptional talent, or a career services team wanting better outcomes—we built this for you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup" className="gap-2">
              Create Your Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup/recruiter">I'm a Recruiter</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup/school">I'm Career Services</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
