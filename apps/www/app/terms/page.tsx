import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Coastal Haven Partners",
  description: "Terms of Service for Coastal Haven Partners finance talent network",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 27, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Coastal Haven Partners services, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Platform Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Coastal Haven Partners is a curated finance talent network connecting verified candidates with recruiters
              at investment banks, private equity firms, venture capital funds, and consulting firms. Our platform provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Candidate profile creation with GPA verification</li>
              <li>Recruiter access to pre-vetted, verified candidate pools</li>
              <li>School verification and student enrollment confirmation</li>
              <li>Direct connection facilitation between candidates and firms</li>
              <li>Candidate search and filtering tools for recruiters</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Roles and Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our platform serves four user types, each with specific eligibility requirements:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Candidates:</strong> Current undergraduate or MBA students, or recent graduates (within 2 years), with a valid .edu email address</li>
              <li><strong>Recruiters:</strong> Authorized representatives of financial services firms, consulting firms, or corporate employers</li>
              <li><strong>Schools:</strong> Authorized career services representatives from accredited universities</li>
              <li><strong>Administrators:</strong> Coastal Haven Partners staff members</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Recruiter accounts require approval by Coastal Haven Partners before gaining access to candidate information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Candidate Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a candidate, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate and truthful information in your profile</li>
              <li>Submit authentic academic records and transcripts for GPA verification</li>
              <li>Use only your own .edu email address for account verification</li>
              <li>Keep your profile information current and up-to-date</li>
              <li>Not misrepresent your qualifications, experience, or credentials</li>
              <li>Respond professionally to recruiter inquiries</li>
              <li>Notify us of any changes to your enrollment or graduation status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Recruiter Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a recruiter, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Represent a legitimate employer with actual hiring needs</li>
              <li>Use candidate information solely for recruitment purposes</li>
              <li>Not share, sell, or redistribute candidate data outside your organization</li>
              <li>Treat all candidates with respect and professionalism</li>
              <li>Comply with all applicable employment and anti-discrimination laws</li>
              <li>Not use the platform for spam, harassment, or solicitation</li>
              <li>Provide accurate information about your firm and open positions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. School Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a school representative, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Only verify students who are legitimately enrolled at your institution</li>
              <li>Maintain the confidentiality of student academic records</li>
              <li>Use platform analytics solely for career services purposes</li>
              <li>Comply with FERPA and other applicable student privacy regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Verification Process</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our verification system includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Email verification:</strong> Confirmation of valid .edu email addresses for candidates</li>
              <li><strong>GPA verification:</strong> Validation of academic credentials through transcript review or school confirmation</li>
              <li><strong>Recruiter verification:</strong> Manual review and approval of recruiter accounts</li>
              <li><strong>School verification:</strong> Confirmation of career services authorization</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Providing false information during verification is grounds for immediate account termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Create fake or duplicate accounts</li>
              <li>Scrape, harvest, or bulk download candidate or recruiter data</li>
              <li>Use automated tools to access the platform without authorization</li>
              <li>Circumvent verification or security measures</li>
              <li>Share account credentials with unauthorized parties</li>
              <li>Use the platform for any illegal purpose</li>
              <li>Harass, discriminate against, or abuse other users</li>
              <li>Post false, misleading, or defamatory content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Discord Community</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We operate a Discord community server for verified members. By linking your Discord account and joining
              our server, you agree to the following additional terms:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.1 Community Guidelines</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All members must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Treat all members with respect and professionalism</li>
              <li>Keep discussions relevant to finance careers, recruiting, and professional development</li>
              <li>Respect the confidentiality of information shared by other members</li>
              <li>Not share proprietary firm information, interview questions under NDA, or confidential materials</li>
              <li>Not engage in discrimination, harassment, or hate speech of any kind</li>
              <li>Not spam, self-promote excessively, or advertise without permission</li>
              <li>Not share illegal content or discuss illegal activities</li>
              <li>Report violations to moderators rather than engaging in public disputes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Role-Based Access</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your Discord role is based on your verified account type:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Candidates</strong> have access to candidate-specific channels and general networking areas</li>
              <li><strong>Recruiters</strong> have access to recruiter-specific channels and can engage with candidates professionally</li>
              <li><strong>Career Services</strong> have access to school-specific channels and coordination areas</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Misrepresenting your role or attempting to access channels outside your permission level is prohibited.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.3 Recruiter Conduct in Discord</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Recruiters participating in our Discord must:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Identify themselves and their firm when reaching out to candidates</li>
              <li>Not send unsolicited mass messages to candidates</li>
              <li>Respect candidates who indicate they are not interested</li>
              <li>Post job opportunities only in designated channels</li>
              <li>Comply with all applicable employment laws and anti-discrimination regulations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.4 Moderation and Enforcement</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Remove or edit content that violates these guidelines</li>
              <li>Temporarily mute or restrict users who violate rules</li>
              <li>Permanently ban users for serious or repeated violations</li>
              <li>Revoke Discord access while maintaining website account access (or vice versa)</li>
              <li>Report illegal activity to appropriate authorities</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">9.5 Third-Party Platform Disclaimer</h3>
            <p className="text-muted-foreground leading-relaxed">
              Discord is a third-party platform not operated by Coastal Haven Partners. Your use of Discord is also
              subject to Discord&apos;s{" "}
              <a href="https://discord.com/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="https://discord.com/guidelines" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Community Guidelines
              </a>
              . We are not responsible for Discord&apos;s availability, features, or any actions taken by Discord.
              We cannot recover deleted Discord messages or accounts banned by Discord itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Coastal Haven Partners platform, including its design, features, and content, is protected by intellectual
              property laws. You retain ownership of the content you submit (profiles, resumes, etc.), but grant us a
              license to use, display, and distribute your content as necessary to operate the platform and provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain platform availability but do not guarantee uninterrupted access. We may modify,
              suspend, or discontinue features with or without notice. We are not liable for any impact on your
              recruiting or job search activities due to service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. No Employment Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coastal Haven Partners is a networking and discovery platform. We do not guarantee that candidates will
              receive job offers or that recruiters will find suitable candidates. Employment decisions are made solely
              by the parties involved, and we are not a party to any employment relationship formed through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coastal Haven Partners shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of our platform. This includes but is not limited to lost job
              opportunities, failed hires, or decisions made based on information obtained through our platform.
              Our total liability shall not exceed the amount you paid for our services, if any.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Coastal Haven Partners, its officers, directors, employees, and
              agents from any claims, damages, losses, or expenses arising from your use of the platform, violation of
              these terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may suspend or terminate your account for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Violation of these Terms of Service</li>
              <li>Providing false or misleading information</li>
              <li>Fraudulent or abusive behavior</li>
              <li>Extended inactivity</li>
              <li>Request by you to close your account</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Upon termination, your right to access the platform ceases immediately. You may request deletion of your
              data in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of
              Delaware, without regard to its conflict of law provisions. Any disputes arising from these terms or
              your use of the platform shall be resolved in the courts of Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">17. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective upon posting to our
              website. We will notify registered users of material changes via email. Continued use of the platform
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">18. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a
                href="mailto:contact@coastalhavenpartners.com"
                className="text-primary hover:underline"
              >
                contact@coastalhavenpartners.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
