import { constructMetadata } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Shield,
  Target,
  Zap,
  Sparkles,
  Heart,
  Globe,
  ArrowRight,
  Send,
  BarChart3,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "About | Coastal Haven Partners",
  description:
    "Learn why Coastal Haven Partners is the premier talent network connecting elite finance students with top investment banks, PE firms, and hedge funds.",
});

function ComparisonBox({
  icon: Icon,
  iconColor,
  title,
  before,
  after,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  before: { title: string; items: string[] };
  after: { title: string; items: string[] };
}) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
      <div className="p-6 border-b bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-700">
        <div className="p-6">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
            {before.title}
          </p>
          <ul className="space-y-2">
            {before.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <XCircle className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
            {after.title}
          </p>
          <ul className="space-y-2">
            {after.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-5 rounded-xl border bg-white dark:bg-neutral-900">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </div>
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
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

      {/* How We Fix Recruiting */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How We Fix Finance Recruiting</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Traditional recruiting is broken. Here's what we do differently.
          </p>
        </div>

        <div className="space-y-6">
          <ComparisonBox
            icon={GraduationCap}
            iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            title="For Students"
            before={{
              title: "The old way",
              items: [
                "Top talent at non-target schools gets overlooked",
                "Success depends on who you know, not what you know",
                "Apply to 50 firms, hear back from none",
              ],
            }}
            after={{
              title: "With Coastal Haven",
              items: [
                "Recruiters discover you by GPA, skills, and interests",
                "Verified credentials build instant trust",
                "Direct messaging with recruiters—no gatekeepers",
              ],
            }}
          />

          <ComparisonBox
            icon={Building2}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            title="For Recruiters"
            before={{
              title: "The old way",
              items: [
                "Thousands of applications, no way to filter for quality",
                "Great talent exists everywhere, but no time to find it",
                "LinkedIn profiles are stale, transcripts are unverified",
              ],
            }}
            after={{
              title: "With Coastal Haven",
              items: [
                "Pre-verified candidates with real GPAs and transcripts",
                "Powerful filters to find talent from any school",
                "Bulk outreach campaigns with personalized templates",
              ],
            }}
          />

          <div className="rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">For Career Services</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <BarChart3 className="h-8 w-8 mx-auto text-green-500 mb-3" />
                  <h4 className="font-medium mb-1">Real-Time Analytics</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    See which firms engage with your students and track placement rates
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <Target className="h-8 w-8 mx-auto text-green-500 mb-3" />
                  <h4 className="font-medium mb-1">Student Tracking</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Monitor profiles, verification status, and recruiter engagement
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <Globe className="h-8 w-8 mx-auto text-green-500 mb-3" />
                  <h4 className="font-medium mb-1">Recruiter Directory</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Connect students with verified recruiters who want to hire from your school
                  </p>
                </div>
              </div>
            </div>
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

        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon={Shield}
            title="Verified Everything"
            description="GPAs verified against transcripts. Recruiters verified against firm emails. No fake profiles."
          />
          <FeatureCard
            icon={Target}
            title="Finance-First Design"
            description="Built for IB, PE, HF, and VC recruiting. We understand what matters in finance."
          />
          <FeatureCard
            icon={Send}
            title="Campaign Outreach"
            description="Recruiters can send personalized messages to multiple candidates at once using smart templates."
          />
          <FeatureCard
            icon={Zap}
            title="Two-Way Discovery"
            description="Students express interest in firms. Recruiters discover students. Mutual interest surfaces the best matches."
          />
          <FeatureCard
            icon={Sparkles}
            title="Always Current"
            description="No stale profiles. GPAs refresh each semester. Engagement tracked in real-time."
          />
          <FeatureCard
            icon={Heart}
            title="Free for Students"
            description="No paywall between you and your career. Recruiters pay because you're worth it."
          />
        </div>
      </section>

      {/* Quick Comparison */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How We Compare</h2>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse bg-white dark:bg-neutral-900">
            <thead>
              <tr className="border-b bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="p-4 font-medium text-center text-neutral-500">LinkedIn</th>
                <th className="p-4 font-medium text-center text-neutral-500">Handshake</th>
                <th className="p-4 font-semibold text-center text-blue-600 dark:text-blue-400">
                  Coastal Haven
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">GPA Verification</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Finance-Specific Filters</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center text-neutral-400">Limited</td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Bulk Campaign Outreach</td>
                <td className="p-4 text-center text-neutral-400">Paid</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">School Analytics</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center text-neutral-400">Basic</td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Mutual Interest Matching</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center text-neutral-400">No</td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500" />
                </td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-600 dark:text-neutral-400">Free for Students</td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-neutral-400" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-neutral-400" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500" />
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
