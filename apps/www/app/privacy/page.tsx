import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Coastal Haven Partners",
  description: "Privacy Policy for Coastal Haven Partners finance talent network",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 26, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coastal Haven Partners (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our finance talent
              network platform connecting candidates, recruiters, and educational institutions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Candidate Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When candidates create profiles, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Personal identifiers (name, email address, phone number)</li>
              <li>Educational information (school, major, graduation year, GPA)</li>
              <li>Professional information (work experience, internships, skills)</li>
              <li>Documents (resumes, transcripts, cover letters)</li>
              <li>Career preferences (target industries, firm types, locations)</li>
              <li>Profile status (seeking, signed, alumni)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Recruiter Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When recruiters register, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Professional contact information (name, work email, phone)</li>
              <li>Employer information (firm name, type, size, location)</li>
              <li>Role and title within the organization</li>
              <li>Recruiting preferences and search history</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 School Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When schools participate, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Institution details (name, location, type)</li>
              <li>Career services representative contact information</li>
              <li>Student verification authorizations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Device and browser information</li>
              <li>IP address and approximate location</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Login timestamps and session information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>

            <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-3">Core Platform Functions</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Profile Display:</strong> Showing candidate profiles to verified recruiters</li>
                <li><strong>Search & Discovery:</strong> Enabling recruiters to find relevant candidates</li>
                <li><strong>Verification:</strong> Confirming GPAs, enrollment status, and credentials</li>
                <li><strong>Communication:</strong> Facilitating connections between candidates and recruiters</li>
                <li><strong>Analytics:</strong> Providing schools with placement insights (aggregated/anonymized)</li>
              </ul>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">
              We also use your information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Create and manage your account</li>
              <li>Process recruiter approval applications</li>
              <li>Send service-related communications and updates</li>
              <li>Improve platform functionality and user experience</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Visibility</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Candidate Profile Visibility</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your candidate profile is visible according to these rules:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Public (all users):</strong> School name, graduation year, major, career interests</li>
              <li><strong>Verified recruiters only:</strong> GPA, full name, contact information</li>
              <li><strong>You only:</strong> Resume files, transcript documents, account settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 We Do NOT Sell Your Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Third-Party Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We share information with service providers who assist in platform operations:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Cloud hosting providers (Vercel, Supabase)</li>
              <li>Email delivery services</li>
              <li>Analytics providers</li>
              <li>Payment processors (if applicable)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These providers are contractually bound to use your information only for providing services to us.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose information if required by law, court order, or to protect our legal rights, safety,
              or the safety of others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication with email verification</li>
              <li>Row-level security policies in our database</li>
              <li>Regular security assessments</li>
              <li>Access controls limiting who can view sensitive data</li>
              <li>Recruiter verification before granting candidate access</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your information for as long as your account is active or as needed to provide services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li><strong>Active accounts:</strong> Data retained while account is active</li>
              <li><strong>Inactive candidate accounts:</strong> 2 years after last login, then archived</li>
              <li><strong>Deleted accounts:</strong> Personal data removed within 30 days; anonymized analytics may be retained</li>
              <li><strong>Recruiter search history:</strong> 1 year for platform improvement</li>
              <li><strong>Legal/compliance records:</strong> As required by applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
              <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@coastalhavenpartners.com" className="text-primary hover:underline">
                privacy@coastalhavenpartners.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Candidate Control Over Profile</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Candidates have control over their visibility:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Set profile status (Seeking, Not Seeking, Hidden)</li>
              <li>Choose which information is visible to recruiters</li>
              <li>View which recruiters have accessed your profile</li>
              <li>Delete your account and all associated data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Essential cookies:</strong> Authentication, security, and core functionality</li>
              <li><strong>Analytics cookies:</strong> Understanding how users interact with our platform</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not use advertising cookies or sell cookie data. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. FERPA Compliance (For Schools)</h2>
            <p className="text-muted-foreground leading-relaxed">
              For educational institutions participating in our platform, we understand the importance of FERPA
              (Family Educational Rights and Privacy Act) compliance. Student information shared through school
              verification is treated as educational records. Schools maintain control over their students&apos; verification
              status and can revoke access at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is primarily operated in the United States. If you access our services from outside the U.S.,
              your information may be transferred to, stored, and processed in the U.S. where our servers are located.
              We ensure appropriate safeguards are in place for international transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is designed for college students and professionals. We do not knowingly collect information
              from individuals under 18 years of age. If we become aware that we have collected information from a minor,
              we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. California Privacy Rights (CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              California residents have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt out of the sale of personal information (we do not sell data)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. We will post the updated policy on our website with a
              new &quot;Last Updated&quot; date. Material changes will be communicated to registered users via email. Continued
              use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us at{" "}
              <a
                href="mailto:privacy@coastalhavenpartners.com"
                className="text-primary hover:underline"
              >
                privacy@coastalhavenpartners.com
              </a>
              .
            </p>
          </section>

          <section className="border-t border-border pt-8 mt-8">
            <p className="text-sm text-muted-foreground italic">
              This Privacy Policy reflects our commitment to protecting your data while operating a transparent,
              trusted platform that connects elite finance talent with top employers. We only collect information
              necessary to provide our services and give you control over your data.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
