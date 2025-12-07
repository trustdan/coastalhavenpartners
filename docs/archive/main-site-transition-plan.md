# Main Site Transition Plan
## Full Send Emails → Coastal Haven Partners

**Project Vision:** Transform the marketing site from an AI email outreach tool into a hybrid job board/social network for elite finance internship candidates - "LinkedIn for Finance Interns"

---

## 📋 Progress Tracker

- [x] **Phase 1:** Planning & Content Audit
- [x] **Phase 2:** Navigation & Authentication CTAs
- [x] **Phase 3:** Hero Section Transformation
- [x] **Phase 4:** Features Section Rewrite
- [x] **Phase 5:** Social Proof & Testimonials
- [x] **Phase 6:** Logo Cloud (Email Tools → Elite Firms)
- [ ] **Phase 7:** Process Flow Redesign ⬅️ CURRENT
- [ ] **Phase 8:** Pricing/CTA Section Updates
- [ ] **Phase 9:** Footer & Legal Pages
- [ ] **Phase 10:** SEO & Metadata
- [ ] **Phase 11:** Testing & QA
- [ ] **Phase 12:** Launch

---

## Phase 1: Planning & Content Audit

### Objectives
- Document all current content and components
- Map old messaging to new brand
- Define new value propositions

### Content Mapping

| Current (Full Send Emails) | New (Coastal Haven Partners) |
|---------------------------|------------------------------|
| AI-powered email outreach | Elite finance talent network |
| Personalization at scale | Verified student profiles |
| Sales/marketing focus | Career services focus |
| B2B SaaS tone | Professional/aspirational tone |
| "Close more deals" | "Launch your finance career" |

### Files to Audit
- [x] `app/(marketing)/page.tsx` - Main landing page
- [x] `components/sections/hero-section.tsx`
- [x] `components/sections/features-section.tsx`
- [x] `components/sections/tech-stack-section.tsx`
- [x] `components/site-header.tsx`
- [x] `components/site-footer.tsx`
- [x] `app/privacy/page.tsx`
- [x] `app/terms/page.tsx`

### Acceptance Criteria
- [ ] Complete inventory of all marketing copy
- [ ] New messaging framework documented
- [ ] Target audience personas defined (Students, Recruiters, Schools)

---

## Phase 2: Navigation & Authentication CTAs

### Current State
```typescript
// site-header.tsx - Current
<nav>
  <Logo />
  // No auth buttons
</nav>
```

### Desired State
```typescript
// site-header.tsx - New
<nav>
  <Logo />
  <div className="navigation">
    <Link href="/for-students">For Students</Link>
    <Link href="/for-recruiters">For Recruiters</Link>
    <Link href="/for-schools">For Schools</Link>
  </div>
  <div className="auth-buttons">
    <Button variant="ghost" href="/login">Sign In</Button>
    <Button variant="default" href="/signup">Get Started</Button>
  </div>
</nav>
```

### Gherkin Scenarios

```gherkin
Feature: Main Navigation
  As a visitor
  I want clear navigation options
  So I can understand the platform and sign up

  Scenario: First-time visitor lands on homepage
    Given I am on the homepage
    Then I should see a "Sign In" button in the header
    And I should see a "Get Started" button in the header
    And I should see navigation links for "For Students", "For Recruiters", and "For Schools"
    When I click "Get Started"
    Then I should be redirected to "/signup"
    And I should see options to sign up as Student, Recruiter, or School

  Scenario: Returning user wants to log in
    Given I am on the homepage
    When I click "Sign In"
    Then I should be redirected to "/login"
    And I should see email and password fields
```

### Implementation Tasks
- [ ] Update `components/site-header.tsx` with new navigation
- [ ] Add responsive mobile menu with auth buttons
- [ ] Create hover states for dropdowns (if needed)
- [ ] Add "For Students/Recruiters/Schools" navigation items
- [ ] Style auth buttons to stand out (Sign In: ghost, Get Started: primary)

### Files to Modify
- `components/site-header.tsx`
- `app/(marketing)/layout.tsx` (if needed)

### Acceptance Criteria
- [ ] Sign In and Get Started buttons visible on all screen sizes
- [ ] Navigation dropdowns work smoothly
- [ ] Mobile menu includes all navigation items
- [ ] Buttons link to correct auth pages

---

## Phase 3: Hero Section Transformation

### Current Content (Full Send Emails)
- **Headline:** "Outbound That Reads Like You Wrote It"
- **Subheadline:** AI-powered personalization at scale
- **CTA:** "Start Outreach"
- **Visual:** Meteors background, shiny text effects

### New Content (Coastal Haven Partners)
- **Headline:** "Where Elite Talent Meets Boutique Opportunity"
- **Subheadline:** "The verified network connecting top finance students with investment banks, PE firms, and hedge funds"
- **CTA Primary:** "Join as Student" → `/signup/candidate`
- **CTA Secondary:** "I'm Recruiting" → `/signup/recruiter`
- **Visual:** Keep meteors background, update text animations

### Gherkin Scenarios

```gherkin
Feature: Hero Section
  As a prospective student
  I want to understand the value proposition immediately
  So I can decide if this platform is right for me

  Scenario: Student visits homepage
    Given I am a finance student looking for internships
    When I land on the homepage
    Then I should see a headline about "Elite Talent" and "Boutique Opportunity"
    And I should see a value proposition mentioning "verified network"
    And I should see a primary CTA "Join as Student"
    And I should see a secondary CTA "I'm Recruiting"
    When I click "Join as Student"
    Then I should be redirected to "/signup/candidate"

  Scenario: Recruiter visits homepage
    Given I am a recruiter looking for candidates
    When I land on the homepage
    And I click "I'm Recruiting"
    Then I should be redirected to "/signup/recruiter"
```

### Component Updates

**File:** `components/sections/hero-section.tsx`

**Current:**
```tsx
<AnimatedShinyText>Outbound that reads like...</AnimatedShinyText>
<AuroraText>AI-powered email personalization at scale</AuroraText>
<ShimmerButton>Start Outreach</ShimmerButton>
```

**New:**
```tsx
<AnimatedShinyText>Where Elite Talent Meets...</AnimatedShinyText>
<AuroraText>The verified network connecting top finance students with IB, PE, and HF</AuroraText>
<div className="cta-group">
  <ShimmerButton href="/signup/candidate">Join as Student</ShimmerButton>
  <Button variant="outline" href="/signup/recruiter">I'm Recruiting</Button>
</div>
```

### Implementation Tasks
- [x] Update headline text in hero-section.tsx
- [x] Change subheadline to finance-focused messaging
- [x] Replace single CTA with dual CTAs (Student + Recruiter)
- [x] Update CTA button links
- [x] Keep `<Meteors />` background effect
- [x] Test text animations with new copy

### Files to Modify
- `components/sections/hero-section.tsx` ✅

### Acceptance Criteria
- [x] Headline emphasizes "Elite Talent" and "Opportunity"
- [x] Subheadline mentions verification and finance firms
- [x] Two prominent CTAs visible
- [x] CTAs link to correct signup pages
- [x] Animations work smoothly with new text

---

## Phase 4: Features Section Rewrite

### Current Features (Full Send Emails)
1. AI Research - "Finds talking points automatically"
2. Personalization - "Writes like you, not a bot"
3. Scale - "100s of emails per day"
4. Deliverability - "Lands in inbox, not spam"

### New Features (Coastal Haven Partners)

#### Feature 1: Verified Student Profiles
- **Icon:** Shield with checkmark
- **Headline:** "GPA-Verified Talent"
- **Description:** "Every student profile is verified with transcripts, ensuring you're connecting with top performers from target schools"
- **Visual:** `<ShineBorder>` card with student stats

#### Feature 2: Three-Way Marketplace
- **Icon:** Network/connections icon
- **Headline:** "Students, Recruiters, Career Services"
- **Description:** "A balanced ecosystem where candidates showcase skills, recruiters discover talent, and schools track placements"
- **Visual:** Animated beams connecting three nodes

#### Feature 3: Privacy-First Networking
- **Icon:** Lock/eye icon
- **Headline:** "Control Your Visibility"
- **Description:** "Granular privacy controls let you decide who sees what - from contact info to GPA to preferred locations"
- **Visual:** Toggle switches showing visibility options

#### Feature 4: Real-Time Analytics
- **Icon:** Chart/graph icon
- **Headline:** "Track Your Impact"
- **Description:** "Students see who viewed their profile. Recruiters track outreach. Schools monitor placement rates."
- **Visual:** `<NumberTicker>` showing profile views

### Gherkin Scenarios

```gherkin
Feature: Features Section
  As a visitor
  I want to understand key platform capabilities
  So I can evaluate if it meets my needs

  Scenario: Student reads about verification
    Given I am on the homepage features section
    When I scroll to "GPA-Verified Talent"
    Then I should see an explanation of transcript verification
    And I should understand that profiles are trustworthy

  Scenario: Recruiter reads about privacy controls
    Given I am evaluating the platform as a recruiter
    When I read the "Control Your Visibility" feature
    Then I should understand I can control what candidates see
    And I should feel confident about privacy
```

### Implementation Tasks
- [x] Replace 4 email features with 4 network features
- [x] Update icons (emoji icons: 🛡️ 🔗 🔒 📈)
- [x] Rewrite headlines and descriptions
- [x] Update `<ShineBorder>` card content
- [x] Update section title and subtitle
- [x] Optimize grid layout for 4 features (2x2)

### Files to Modify
- `components/sections/features-section.tsx` ✅

### Acceptance Criteria
- [x] 4 distinct features clearly explained
- [x] Each feature has relevant icon
- [x] Copy emphasizes verification, privacy, and analytics
- [x] Visual hierarchy guides eye through features
- [x] Mobile-responsive layout (1 column mobile, 2 columns desktop)

---

## Phase 5: Social Proof & Testimonials

### Current State
- May not have testimonials section
- No social proof elements

### Desired State

#### Student Testimonials
```
"Coastal Haven helped me land my dream PE internship at Apollo.
The verified network made all the difference."
- Sarah Chen, Wharton '25, Apollo Global Management Intern

"I connected with 12 recruiters in my first week. Way better than
cold emailing or LinkedIn spam."
- Michael Rodriguez, Harvard '26, Goldman Sachs Analyst
```

#### Recruiter Testimonials
```
"We've hired 8 interns through Coastal Haven this year. The GPA
verification saves us so much screening time."
- Jennifer Walsh, VP Recruiting, Blackstone

"Finally, a talent platform that understands boutique PE.
The quality of candidates is exceptional."
- David Park, Managing Director, Vista Equity Partners
```

#### Stats to Display (using `<NumberTicker>`)
- **2,500+** Verified Students
- **150+** Elite Firms
- **30+** Target Schools
- **92%** Placement Rate

### Implementation Tasks
- [ ] Create testimonials section component
- [ ] Design testimonial cards with photos/logos
- [ ] Add stats section with `<NumberTicker>` components
- [ ] Source placeholder testimonials (or mark as coming soon)
- [ ] Add school/firm logos if available

### Files to Create/Modify
- `components/sections/testimonials-section.tsx` (new)
- `components/sections/stats-section.tsx` (new)
- `app/(marketing)/page.tsx` (add sections)

### Acceptance Criteria
- [ ] At least 4 testimonials (2 students, 2 recruiters)
- [ ] Stats animate on scroll
- [ ] Testimonials look credible with names/schools
- [ ] Section builds trust and social proof

---

## Phase 6: Logo Cloud (Email Tools → Elite Firms)

### Current Content
**File:** `components/sections/tech-stack-section.tsx`

Uses `<IconCloud>` to show:
- Gmail, Outlook, Mailchimp (email tools)
- OpenAI, Anthropic (AI providers)
- Zapier, HubSpot (sales tools)

### New Content

Replace with elite finance firm logos:

#### Investment Banks
- Goldman Sachs
- Morgan Stanley
- JP Morgan
- Bank of America
- Citi
- Barclays

#### Private Equity
- Blackstone
- KKR
- Apollo
- Carlyle
- Vista Equity Partners

#### Venture Capital
- Sequoia Capital
- Andreessen Horowitz
- Benchmark
- Accel

#### Hedge Funds
- Citadel
- Bridgewater
- Two Sigma
- D.E. Shaw

#### Consulting
- McKinsey
- BCG
- Bain

### Headline Change
- **Current:** "Works with your favorite tools"
- **New:** "Trusted by Top Firms" or "Students Placed At"

### Implementation Tasks
- [ ] Replace icon slugs in IconCloud component
- [ ] Update section headline
- [ ] Update section description
- [ ] Find appropriate logos/icons (may need custom SVGs)
- [ ] Test 3D cloud animation with new icons
- [ ] Add disclaimer: "Logos shown for placement destinations, not endorsements"

### Files to Modify
- `components/sections/tech-stack-section.tsx`
- May need to add custom SVG logos to `public/logos/`

### Acceptance Criteria
- [ ] IconCloud displays finance firm logos
- [ ] Smooth 3D rotation animation
- [ ] Headline updated to reflect firm placements
- [ ] Disclaimer present if needed
- [ ] Works on mobile

---

## Phase 7: Process Flow Redesign

### Current Flow (Full Send Emails)
Uses `<AnimatedBeam>` to show:
1. Research → 2. Personalize → 3. Deliver

### New Flow (Coastal Haven Partners)

#### Option A: Student Journey
1. **Create Profile** → 2. **Get Verified** → 3. **Connect with Recruiters**

#### Option B: Platform Flow
1. **Student Signs Up** → 2. **GPA Verified** → 3. **Recruiter Views** → 4. **Interview** → 5. **Placement**

### Recommended: Option B (Full Journey)

**Visual Design:**
```
[Student Icon] --beam--> [Shield Icon] --beam--> [Recruiter Icon] --beam--> [Handshake Icon] --beam--> [Trophy Icon]
  Sign Up              Verification          Discovery              Interview             Placed
```

### Gherkin Scenarios

```gherkin
Feature: Process Flow Visualization
  As a prospective user
  I want to see how the platform works
  So I can understand the user journey

  Scenario: Student views process flow
    Given I am on the homepage
    When I scroll to the "How It Works" section
    Then I should see a 5-step process visualization
    And I should see animated beams connecting each step
    And I should understand the path from signup to placement
```

### Implementation Tasks
- [ ] Update AnimatedBeam component flow
- [ ] Change step icons and labels
- [ ] Update section headline to "How It Works"
- [ ] Add description for each step
- [ ] Ensure beams animate smoothly
- [ ] Make responsive for mobile (stack vertically)

### Files to Modify
- `components/sections/process-section.tsx` (or similar)
- May need `components/magicui/animated-beam.tsx` updates

### Acceptance Criteria
- [ ] 5 clear steps in the journey
- [ ] Beams animate connection between steps
- [ ] Icons match each stage
- [ ] Mobile view stacks vertically
- [ ] Copy explains each step clearly

---

## Phase 8: Pricing/CTA Section Updates

### Current State
- Likely has pricing or CTA section for email tool

### New Approach: Free for Students, Subscription for Recruiters

#### For Students Section
```
Headline: "Free for Students, Forever"
Subheadline: "Build your profile, connect with recruiters, and launch your finance career at no cost"

Features:
✓ Verified profile with GPA
✓ Resume & transcript upload
✓ Browse recruiter directory
✓ Unlimited connections
✓ Profile analytics

CTA: "Create Student Account" → /signup/candidate
```

#### For Recruiters Section
```
Headline: "Premium Access for Recruiters"
Subheadline: "Get exclusive access to verified talent from top schools"

Pricing: Contact Sales (or $499/month per seat)

Features:
✓ Search verified candidate pool
✓ Advanced filters (GPA, school, major)
✓ Unlimited profile views
✓ Direct messaging
✓ Analytics dashboard
✓ School partnerships

CTA: "Schedule Demo" → /contact or "Start Free Trial" → /signup/recruiter
```

#### For Schools Section
```
Headline: "Career Services Partnership"
Subheadline: "Track your students' placements and connect them with top employers"

Pricing: Custom pricing for institutions

Features:
✓ Student placement tracking
✓ Recruiter relationship management
✓ Analytics & reporting
✓ Co-branding options
✓ Dedicated support

CTA: "Partner With Us" → /contact
```

### Implementation Tasks
- [ ] Create three-column pricing grid
- [ ] Add checkmark lists for features
- [ ] Style CTAs appropriately for each audience
- [ ] Add pricing disclaimer/fine print
- [ ] Make mobile-responsive (stack on small screens)

### Files to Create/Modify
- `components/sections/pricing-section.tsx` (create new)
- `app/(marketing)/page.tsx` (import section)

### Acceptance Criteria
- [ ] Three distinct audience sections
- [ ] Students see "Free" clearly
- [ ] Recruiter pricing transparent or "Contact Sales"
- [ ] CTAs work for each audience
- [ ] Mobile layout readable

---

## Phase 9: Footer & Legal Pages

### Footer Updates

#### Current Links
- Privacy Policy
- Terms of Service
- (May have other links)

#### New Footer Structure

**Column 1: For Students**
- How It Works
- Create Profile
- Browse Recruiters
- Success Stories

**Column 2: For Recruiters**
- Find Talent
- Pricing
- Request Demo
- Recruiter Login

**Column 3: For Schools**
- Partner With Us
- Track Placements
- Resources
- School Login

**Column 4: Company**
- About Us
- Blog
- Careers
- Contact

**Column 5: Legal**
- Privacy Policy
- Terms of Service
- Cookie Policy
- Data Security

**Bottom:**
- Social media links (LinkedIn, Twitter)
- © 2025 Coastal Haven Partners
- "Built for elite finance talent"

### Privacy Policy Updates

**Key Changes Needed:**

```gherkin
Feature: Privacy Policy
  As a user
  I want to know how my data is used
  So I can trust the platform

  Scenario: Student reviews privacy policy
    Given I am creating a student account
    When I click "Privacy Policy"
    Then I should see information about:
      | Data Category | Usage |
      | GPA & Transcripts | Verification only, not shared without permission |
      | Contact Info | Controlled by visibility settings |
      | Profile Views | Tracked for analytics, shown to profile owner |
      | School Name | Visible to school career services department |
    And I should see my rights to delete data
    And I should see how to control visibility settings
```

**Sections to Add/Update:**
1. **What Data We Collect**
   - Student: transcripts, GPA, resume, school info, target roles
   - Recruiter: firm info, contact details, recruiting specialties
   - School: school name, department info, student oversight data

2. **How We Use Your Data**
   - Profile matching
   - Verification services
   - Analytics
   - Platform improvements

3. **Data Sharing & Visibility Controls**
   - Three-tier visibility system (candidates, recruiters, schools)
   - Granular field-level controls
   - No data sold to third parties

4. **Student Data Protection**
   - FERPA compliance (if applicable)
   - School partnership agreements
   - Parental consent for under 18 (if needed)

5. **Your Rights**
   - Access your data
   - Delete your account
   - Export your data
   - Control visibility settings

### Terms of Service Updates

**Key Changes:**

1. **User Types & Responsibilities**
   - Students must provide accurate academic information
   - Recruiters must represent legitimate firms
   - Schools must be authorized career services departments

2. **Verification Requirements**
   - Student GPA verification process
   - Recruiter firm verification
   - School domain verification

3. **Acceptable Use**
   - No spam or unsolicited outreach
   - Professional communication standards
   - Respect for privacy settings

4. **Account Termination**
   - Conditions for suspension/ban
   - Data retention after termination
   - Appeal process

### Implementation Tasks

**Footer:**
- [ ] Update `components/site-footer.tsx` with new link structure
- [ ] Add five columns for different audiences
- [ ] Update copyright and tagline
- [ ] Add social media links
- [ ] Make responsive (collapse on mobile)

**Privacy Policy:**
- [ ] Update `app/privacy/page.tsx`
- [ ] Add sections for all three user types
- [ ] Detail visibility control system
- [ ] Add FERPA/GDPR compliance language (if needed)
- [ ] Include contact information for privacy questions
- [ ] Add "Last Updated" date

**Terms of Service:**
- [ ] Update `app/terms/page.tsx`
- [ ] Define user types and obligations
- [ ] Add verification requirements
- [ ] Include acceptable use policy
- [ ] Add dispute resolution process
- [ ] Add "Last Updated" date

### Files to Modify
- `components/site-footer.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- May need to create: `app/cookie-policy/page.tsx`, `app/security/page.tsx`

### Acceptance Criteria
- [ ] Footer has clear sections for all user types
- [ ] All footer links work
- [ ] Privacy policy covers all data types
- [ ] Terms clearly define user responsibilities
- [ ] Legal pages are readable and scannable
- [ ] Last updated dates are accurate

---

## Phase 10: SEO & Metadata

### Current Metadata (Full Send Emails)
```typescript
title: "Full Send Emails - AI Email Outreach"
description: "AI-powered email personalization..."
```

### New Metadata (Coastal Haven Partners)

**Homepage:**
```typescript
title: "Coastal Haven Partners | Elite Finance Internship Network"
description: "The verified network connecting top finance students with investment banks, private equity, and hedge funds. Join 2,500+ students from target schools."
keywords: "finance internships, investment banking jobs, PE recruiting, target school network, verified student profiles"
og:image: "/og-coastal-haven.png" // Need to create
```

**For Students Page:**
```typescript
title: "For Students | Launch Your Finance Career"
description: "Create a verified profile, connect with recruiters from Goldman Sachs, Blackstone, and top firms. Free for students."
```

**For Recruiters Page:**
```typescript
title: "For Recruiters | Find Top Finance Talent"
description: "Access GPA-verified candidates from Harvard, Wharton, and target schools. Streamline your recruiting pipeline."
```

### Structured Data (JSON-LD)

Add schema.org markup for:
1. **Organization**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Coastal Haven Partners",
  "description": "Elite finance internship network",
  "url": "https://coastalhavenpartners.com",
  "logo": "https://coastalhavenpartners.com/logo.png",
  "sameAs": [
    "https://linkedin.com/company/coastalhavenpartners",
    "https://twitter.com/coastalhaven"
  ]
}
```

2. **JobPosting** (if relevant)
3. **EducationalOrganization** (for school partnerships)

### Implementation Tasks

**Metadata:**
- [ ] Update `lib/utils.ts` - `constructMetadata` defaults
- [ ] Update `app/layout.tsx` root metadata
- [ ] Create new OG image: `/app/opengraph-image.png`
- [ ] Update `app/robots.ts` - ensure proper indexing
- [ ] Update `app/sitemap.ts` - add new pages

**SEO Content:**
- [ ] Add H1 tags to all major sections
- [ ] Use semantic HTML (article, section, aside)
- [ ] Add alt text to all images
- [ ] Ensure internal linking structure
- [ ] Add breadcrumbs (if multi-page)

**Performance:**
- [ ] Lazy load images
- [ ] Optimize font loading
- [ ] Minimize JavaScript bundle
- [ ] Add preconnect for external resources

### Files to Modify
- `lib/utils.ts`
- `app/layout.tsx`
- `app/(marketing)/page.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- Create: `app/opengraph-image.png` (or .tsx for dynamic)

### Acceptance Criteria
- [ ] Meta titles under 60 characters
- [ ] Meta descriptions between 150-160 characters
- [ ] OG image displays correctly on social shares
- [ ] Structured data validates on schema.org
- [ ] All pages have unique titles/descriptions
- [ ] Site indexed properly by Google

---

## Phase 11: Testing & QA

### User Acceptance Testing

```gherkin
Feature: End-to-End User Flows
  As a QA tester
  I want to verify all critical user journeys
  So we can launch with confidence

  Scenario: Student signup flow
    Given I am a prospective student
    When I visit the homepage
    And I click "Join as Student"
    Then I should be taken to "/signup/candidate"
    When I complete the signup form
    Then I should receive a verification email
    And I should be redirected to my dashboard
    And I should see my profile status as "Pending Verification"

  Scenario: Recruiter explores student pool
    Given I am a logged-in recruiter
    When I navigate to the candidate pool
    Then I should see only verified candidates
    And I should see GPA, school, and major for each
    When I click on a candidate profile
    Then I should see only fields they've made visible to recruiters
    And I should see a "Contact" button if email is visible

  Scenario: School admin views their students
    Given I am a logged-in school admin
    When I visit my dashboard
    Then I should see only students from my school
    And I should see their verification status
    And I should see placement statistics
```

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad, 1024x768)
- [ ] Mobile (iPhone, 375x667)
- [ ] Mobile (Android, 360x640)

### Functionality Checklist
- [ ] All navigation links work
- [ ] All CTAs link to correct pages
- [ ] Forms validate properly
- [ ] Magic UI animations perform smoothly
- [ ] Images load correctly
- [ ] Icons display properly
- [ ] Dark mode works (if enabled)
- [ ] No console errors
- [ ] No broken links (404s)

### Performance Checklist
- [ ] Lighthouse score >90 (Performance)
- [ ] Lighthouse score >90 (Accessibility)
- [ ] Lighthouse score >90 (Best Practices)
- [ ] Lighthouse score >90 (SEO)
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3.5s
- [ ] No layout shift (CLS <0.1)

### Accessibility Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast ratios meet WCAG AA
- [ ] Alt text on all images
- [ ] Form labels properly associated
- [ ] Focus states visible
- [ ] ARIA labels where needed

---

## Phase 12: Launch

### Pre-Launch Checklist

**Technical:**
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Analytics tracking configured (Google Analytics, etc.)
- [ ] Error monitoring enabled (Sentry, etc.)
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] CDN configured (if using)

**Content:**
- [ ] All placeholder text removed
- [ ] All "Lorem ipsum" replaced
- [ ] All images optimized
- [ ] All links tested
- [ ] Legal pages reviewed (preferably by lawyer)
- [ ] Contact information accurate

**SEO:**
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] robots.txt allows indexing
- [ ] Social media meta tags tested
- [ ] Structured data validated

**Communication:**
- [ ] Launch announcement drafted
- [ ] Social media posts prepared
- [ ] Email to beta users (if applicable)
- [ ] Press release (if applicable)

### Launch Sequence

1. **Soft Launch (Internal)**
   - Deploy to production
   - Test all functionality in production environment
   - Check analytics tracking
   - Verify email sends

2. **Soft Launch (Limited Audience)**
   - Share with beta testers
   - Monitor for bugs/issues
   - Collect feedback
   - Fix critical issues

3. **Public Launch**
   - Announce on social media
   - Send email announcements
   - Update LinkedIn/other profiles
   - Monitor traffic and performance
   - Be ready for quick fixes

### Post-Launch Monitoring (First 48 Hours)

- [ ] Check error logs every 2 hours
- [ ] Monitor server performance
- [ ] Track conversion rates
- [ ] Collect user feedback
- [ ] Fix any critical bugs immediately
- [ ] Respond to user questions/issues

### Post-Launch Iteration (First Week)

- [ ] Analyze user behavior with heatmaps
- [ ] Review bounce rates and exit pages
- [ ] A/B test CTAs if needed
- [ ] Gather testimonials from early users
- [ ] Optimize based on data
- [ ] Plan next feature release

---

## Appendix A: Key Messaging Pillars

### For Students
1. **Verification Trust:** "Your GPA speaks louder than your resume"
2. **Elite Access:** "Connect with recruiters from firms you dream about"
3. **Privacy Control:** "You decide who sees what"
4. **Free Forever:** "No paywalls, no gimmicks"

### For Recruiters
1. **Quality Over Quantity:** "Pre-verified candidates save screening time"
2. **Target School Focus:** "Harvard, Wharton, Stanford - all in one place"
3. **Boutique Friendly:** "Not just bulge bracket - we get PE, VC, HF"
4. **ROI:** "Hire faster, hire better"

### For Schools
1. **Placement Tracking:** "Know where your students are landing"
2. **Recruiter Relationships:** "Strengthen employer partnerships"
3. **Student Success:** "Help students navigate the finance recruiting maze"
4. **Data-Driven:** "Analytics to improve career services"

---

## Appendix B: Brand Voice Guidelines

**Tone Attributes:**
- Professional but not stuffy
- Aspirational but not elitist
- Confident but not arrogant
- Helpful but not patronizing

**Do's:**
- Use "elite" to describe opportunities, not people
- Emphasize verification and trust
- Highlight student success stories
- Be transparent about how the platform works

**Don'ts:**
- Don't use salesy/hype language
- Don't promise guaranteed placements
- Don't bash other platforms
- Don't use jargon without explanation

**Example Transformations:**

| ❌ Bad | ✅ Good |
|--------|---------|
| "Get rich quick!" | "Launch your finance career" |
| "Only for Ivy League" | "Trusted by students at top schools" |
| "Beat the competition" | "Stand out to recruiters" |
| "Spam recruiters with ease" | "Connect meaningfully with hiring managers" |

---

## Appendix C: File Change Summary

### Files to Create
- [ ] `components/sections/testimonials-section.tsx`
- [ ] `components/sections/stats-section.tsx`
- [ ] `components/sections/pricing-section.tsx`
- [ ] `app/for-students/page.tsx`
- [ ] `app/for-recruiters/page.tsx`
- [ ] `app/for-schools/page.tsx`
- [ ] `app/contact/page.tsx`
- [ ] `public/logos/` (firm logos)
- [ ] `app/opengraph-image.png`

### Files to Modify
- [ ] `components/site-header.tsx`
- [ ] `components/site-footer.tsx`
- [ ] `components/sections/hero-section.tsx`
- [ ] `components/sections/features-section.tsx`
- [ ] `components/sections/tech-stack-section.tsx`
- [ ] `components/sections/process-section.tsx`
- [ ] `app/(marketing)/page.tsx`
- [ ] `app/privacy/page.tsx`
- [ ] `app/terms/page.tsx`
- [ ] `lib/utils.ts`
- [ ] `app/layout.tsx`
- [ ] `app/robots.ts`
- [ ] `app/sitemap.ts`

### Files to Review (May Not Need Changes)
- [ ] `components/magicui/*` (Magic UI components - likely unchanged)
- [ ] `components/ui/*` (Shadcn components - likely unchanged)
- [ ] `tailwind.config.ts`
- [ ] `next.config.js`

---

## Timeline Estimate

| Phase | Estimated Time | Priority |
|-------|---------------|----------|
| Phase 1: Planning | 4 hours | P0 |
| Phase 2: Navigation | 3 hours | P0 |
| Phase 3: Hero | 2 hours | P0 |
| Phase 4: Features | 4 hours | P0 |
| Phase 5: Social Proof | 3 hours | P1 |
| Phase 6: Logo Cloud | 2 hours | P1 |
| Phase 7: Process Flow | 2 hours | P1 |
| Phase 8: Pricing | 3 hours | P1 |
| Phase 9: Footer/Legal | 4 hours | P0 |
| Phase 10: SEO | 3 hours | P1 |
| Phase 11: Testing | 6 hours | P0 |
| Phase 12: Launch | 2 hours | P0 |
| **TOTAL** | **~38 hours** | |

**Priority Legend:**
- **P0:** Must have for launch
- **P1:** Should have, can iterate post-launch
- **P2:** Nice to have, can add later

---

## Next Steps

1. **Review this plan** and adjust priorities
2. **Start with Phase 1** (content audit)
3. **Work through phases sequentially** or parallelize where possible
4. **Check off items** as you complete them
5. **Launch with confidence** 🚀

---

*Last Updated: 2025-01-23*
*Document Owner: Dan*
*Status: Draft - Ready for Review*
