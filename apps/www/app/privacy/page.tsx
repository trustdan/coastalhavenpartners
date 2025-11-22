import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Full Send Emails",
  description: "Privacy Policy for Full Send Emails AI-powered email outreach services",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 18, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Full Send Emails ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our AI-powered
              email outreach services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you engage our services, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Business information (company name, industry, products/services)</li>
              <li>Contact information (name, email address, phone number)</li>
              <li>Target audience specifications and campaign objectives</li>
              <li>Payment information (processed through secure third-party payment processors)</li>
              <li>Communication history and project-related correspondence</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Information We Generate</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Through our AI-powered research process, we generate:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Email contact lists based on your target criteria</li>
              <li>Personalized email content and messaging</li>
              <li>Campaign analytics and performance data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Our Research Methodology</h2>

            <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 my-6">
              <h3 className="text-xl font-semibold mb-3">Ethical AI-Powered Research</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use advanced AI models including Claude, Gemini, and ChatGPT to conduct deep research for
                finding email contacts and gathering publicly available information. Our methodology:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Uses AI deep research</strong> - Not web scraping or unauthorized data collection</li>
                <li><strong>Relies on open sources</strong> - Publicly available information only</li>
                <li><strong>Respects privacy laws</strong> - GDPR, CCPA, and other data protection regulations</li>
                <li><strong>No database purchases</strong> - We don't buy email lists from third parties</li>
                <li><strong>Transparent sources</strong> - Information gathered from legitimate public sources</li>
              </ul>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              We do NOT engage in web scraping, unauthorized access to private databases, or any data collection
              methods that violate website terms of service or privacy regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use collected information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Deliver personalized email outreach services</li>
              <li>Research and identify relevant contacts for your campaigns</li>
              <li>Create customized email content tailored to your audience</li>
              <li>Provide campaign analytics and performance reporting</li>
              <li>Communicate with you about your service engagement</li>
              <li>Improve our services and develop new features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Information Sharing and Disclosure</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 We Do NOT Sell Your Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or trade your personal information or the contact lists we create for you.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Third-Party Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may share information with trusted third parties who assist us in providing services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>AI model providers (Anthropic Claude, Google Gemini, OpenAI ChatGPT)</li>
              <li>Payment processors (Upwork, Stripe, etc.)</li>
              <li>Cloud hosting and infrastructure providers</li>
              <li>Email delivery platforms (if used on your behalf)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These providers are bound by confidentiality obligations and may only use your information to
              perform services on our behalf.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose information if required by law, court order, or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure access controls and authentication</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information on a need-to-know basis</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect
              your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as necessary to provide services and comply with legal
              obligations. When data is no longer needed, we securely delete or anonymize it. Typical retention
              periods:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Active client data: Duration of engagement plus 1 year</li>
              <li>Campaign data and analytics: 2 years for performance analysis</li>
              <li>Financial records: As required by applicable tax and accounting laws (typically 7 years)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Access</strong> - Request access to your personal information</li>
              <li><strong>Correction</strong> - Request correction of inaccurate information</li>
              <li><strong>Deletion</strong> - Request deletion of your information (subject to legal obligations)</li>
              <li><strong>Portability</strong> - Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection</strong> - Object to certain processing of your information</li>
              <li><strong>Restriction</strong> - Request restriction of processing under certain circumstances</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us through our Upwork service page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website uses minimal tracking technologies for essential functionality and analytics. We do not
              use invasive tracking or sell data to advertisers. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Email Recipients' Privacy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For individuals who receive emails as part of our clients' campaigns:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>All information used is from publicly available sources</li>
              <li>Every email includes a clear unsubscribe mechanism</li>
              <li>We respect all unsubscribe requests immediately</li>
              <li>We comply with CAN-SPAM, GDPR, and other email marketing regulations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you received an email and wish to be removed from future communications, use the unsubscribe
              link in the email or contact the sender directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services may involve transferring data internationally. When we transfer data across borders,
              we ensure appropriate safeguards are in place to protect your information in accordance with
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect
              personal information from children. If we become aware that we have collected information from a
              child, we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal
              requirements. We will post the updated policy on our website with a new "Last Updated" date.
              Material changes will be communicated to active clients via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us through our{" "}
              <a
                href="https://www.upwork.com/services/product/marketing-personalized-emails-delivered-to-the-types-of-people-you-want-1990863338668663734"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Upwork service page
              </a>
              .
            </p>
          </section>

          <section className="border-t border-border pt-8 mt-8">
            <p className="text-sm text-muted-foreground italic">
              This Privacy Policy demonstrates our commitment to transparency and protecting your privacy while
              delivering effective AI-powered email outreach services. We use ethical research methods,
              respect data protection laws, and prioritize the security of your information.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
