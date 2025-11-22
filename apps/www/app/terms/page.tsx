import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Full Send Emails",
  description: "Terms of Service for Full Send Emails AI-powered email outreach services",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last Updated: November 18, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Full Send Emails services, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Full Send Emails provides AI-powered email outreach services, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Email research and contact discovery using AI models (Claude, Gemini, ChatGPT)</li>
              <li>Personalized email content creation</li>
              <li>Email campaign strategy and consultation</li>
              <li>Outreach optimization and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Collection and Research Methods</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our email research methodology uses:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Advanced AI models (Claude, Gemini, ChatGPT) for deep research</li>
              <li>Publicly available information from open sources</li>
              <li>Ethical research practices that respect privacy and data protection laws</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do NOT engage in web scraping, unauthorized data collection, or any practices that violate
              website terms of service or privacy regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Client Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a client, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate information about your business and target audience</li>
              <li>Use our services in compliance with all applicable laws and regulations</li>
              <li>Respect CAN-SPAM Act, GDPR, and other email marketing regulations</li>
              <li>Include proper unsubscribe mechanisms in all email campaigns</li>
              <li>Not use our services for spam, harassment, or illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Service Delivery and Performance</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to achieve optimal results, email outreach performance depends on multiple factors
              including industry, target audience, messaging, and market conditions. We do not guarantee specific
              response rates, conversion rates, or business outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Payment terms are established through our Upwork service agreement or through direct contract.
              All fees are non-refundable once work has commenced, unless otherwise specified in writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All email content, research, and materials created for your campaigns become your property upon
              full payment. However, we retain the right to use anonymized data and insights for service
              improvement and general marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Confidentiality</h2>
            <p className="text-muted-foreground leading-relaxed">
              We maintain strict confidentiality regarding your business information, target lists, and
              campaign strategies. We will not share your proprietary information with third parties without
              your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Full Send Emails shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of our services. Our total liability shall not exceed
              the amount you paid for our services in the preceding three months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate the service agreement with written notice. Upon termination, you will
              receive all completed work, and payment will be due for services rendered up to the termination date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Compliance with Laws</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our services are designed to comply with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>CAN-SPAM Act (United States)</li>
              <li>GDPR (European Union)</li>
              <li>CASL (Canada)</li>
              <li>Other applicable email marketing and privacy regulations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You are responsible for ensuring your use of our services complies with all applicable laws in
              your jurisdiction and the jurisdictions of your recipients.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately
              upon posting to our website. Continued use of our services constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us through our{" "}
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
        </div>
      </div>
    </div>
  )
}
