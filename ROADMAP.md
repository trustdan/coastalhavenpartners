# Coastal Haven Partners Implementation Roadmap

_Last updated: 2025-11-22_

**Goal**: Transform Full Send Emails template into Coastal Haven Partners - an elite finance talent network.

**How this differs from `overview.md`:** the overview captures messaging and positioning; this roadmap is the canonical execution tracker. Cross-reference `[overview.md](overview.md)` for copy inspiration and `[BUBBLE-IMPLEMENTATION.md](BUBBLE-IMPLEMENTATION.md)` for the portal build steps.

**Status snapshot** _(keep fields updated when milestones move)_:

| Phase | Owner | Status | Notes |
| --- | --- | --- | --- |
| Infrastructure | TBD | Not started | Waiting on domain purchase |
| Marketing Site | TBD | Not started | Depends on Phase 1 |
| Bubble Core | TBD | Not started | Blocked on Bubble app init |
| Visual Bridge | TBD | Not started | Needs shared asset folder |
| Launch Prep | TBD | Not started | Requires Bubble + site parity |

**Dependency callouts**
- Finish Bubble signup/login (see `[BUBBLE-IMPLEMENTATION.md](BUBBLE-IMPLEMENTATION.md)`) before pointing marketing CTAs to those URLs.
- Gather and store SVG assets in `apps/www/public/brand/` before updating IconCloud, favicons, or OG images.
- Run through Phase 1 infra tasks before sending any external stakeholders to the domain.

**Architecture**: Next.js marketing site (Vercel) + Bubble.io portal backend

---

## Phase 1: Infrastructure Setup (Week 1)

### 1.1 Domain & DNS Configuration

**Tasks**:
- [ ] Purchase domain: `coastalhavenpartners.com`
- [ ] Configure DNS records at your domain provider:
  ```
  Type: A Record (or CNAME)
  Host: www
  Value: [Vercel will provide]

  Type: CNAME
  Host: app
  Value: app.bubble.io
  TTL: Auto
  ```

### 1.2 GitHub & Vercel Setup

**Tasks**:
- [ ] Create new GitHub repository: `coastal-haven-partners`
- [ ] Push current code to new repo:
  ```bash
  git remote remove origin  # Remove old remote
  git remote add origin https://github.com/yourusername/coastal-haven-partners.git
  git branch -M main
  git push -u origin main
  ```
- [ ] Connect to Vercel:
  - Go to vercel.com → New Project
  - Import your GitHub repo
  - Framework Preset: Next.js
  - Build Command: `pnpm build`
  - Install Command: `pnpm install`
- [ ] Configure custom domain in Vercel:
  - Project Settings → Domains
  - Add `www.coastalhavenpartners.com`
  - Add `coastalhavenpartners.com` (redirect to www)
  - Follow Vercel's DNS instructions

### 1.3 Environment Variables

**Tasks**:
- [ ] Create `.env.local` file:
  ```bash
  NEXT_PUBLIC_APP_URL=https://www.coastalhavenpartners.com
  ```
- [ ] Add to Vercel environment variables:
  - Project Settings → Environment Variables
  - Add `NEXT_PUBLIC_APP_URL`
  - Set for Production, Preview, and Development

---

## Phase 2: Content & Branding (Week 2)

### 2.1 Hero Section Update

**File**: `apps/www/components/sections/hero-section.tsx`

**Changes**:
- [ ] Update main headline:
  - Old: "Outbound that reads like..."
  - New: "Where Elite Talent Meets Boutique Opportunity"
- [ ] Update subheadline:
  - Old: Email outreach description
  - New: "A curated network for high-intent banking, PE, and VC recruiting"
- [ ] Update CTA buttons:
  - Primary: "Join as a Candidate" → `https://app.coastalhavenpartners.com/signup-candidate`
  - Secondary: "I'm Hiring Talent" → `https://app.coastalhavenpartners.com/signup-firm`
- Note: until Bubble signup pages ship, point both CTAs to a waitlist or Typeform and label them as “Beta access” to avoid broken experiences.
- [ ] Keep `<Meteors />` background effect (represents fast-moving markets)

### 2.2 Features Section Update

**File**: `apps/www/components/sections/features-section.tsx`

**Changes**:
- [ ] Replace feature cards (keep `<ShineBorder />` component):

  **Card 1: Verified Credentials**
  - Icon: Shield/Checkmark
  - Title: "Verified Credentials"
  - Description: "GPA-verified profiles. School-confirmed enrollment. No resume fluff."

  **Card 2: Direct Access**
  - Icon: Target/Arrow
  - Title: "Direct Access"
  - Description: "Skip the black hole. Connect directly with decision-makers at boutique firms."

  **Card 3: Curated Network**
  - Icon: Users/Network
  - Title: "Curated Network"
  - Description: "Quality over quantity. Pre-vetted candidates and hand-selected firms."

### 2.3 How It Works Section Update

**File**: `apps/www/components/sections/how-it-works-section.tsx`

**Changes**:
- [ ] Update `<AnimatedBeam />` flow steps:
  - Step 1: "Student Profile" (was: Research)
  - Step 2: "GPA Verified" (was: Personalize)
  - Step 3: "Firm Match" (was: Deliver)
- [ ] Update step descriptions to match talent network context

### 2.4 Results/Social Proof Section

**File**: `apps/www/components/sections/results-section.tsx`

**Changes**:
- [ ] Update metrics (use `<NumberTicker />`):
  - "85% open rates" → "95% GPA verified"
  - "2-3 hours saved" → "500+ elite candidates"
  - "3x response rates" → "50+ boutique firms"
- [ ] Update section title and description

### 2.5 Tech Stack Section

**File**: `apps/www/components/sections/tech-stack-section.tsx`

**Critical Change**: Update `<IconCloud />` logos

- [ ] Gather finance firm/school logos (SVG format):
  - **Finance Firms**: Goldman Sachs, Blackstone, Sequoia Capital, KKR, Carlyle, Apollo, Warburg Pincus, Silver Lake
  - **Banks**: JPMorgan, Morgan Stanley, Citi, Bank of America
  - **Schools**: Wharton, HBS, Stanford GSB, MIT Sloan, Booth, Kellogg

- [ ] Replace logo files in appropriate directory
- [ ] Update IconCloud slugs array in the component
- [ ] Store all approved SVGs in `apps/www/public/brand/iconcloud/` (single source of truth before importing anywhere else)
- [ ] Update section title:
  - Old: "Powered by Cutting-Edge AI"
  - New: "Trusted by Top Firms & Schools"

### 2.6 CTA Section

**File**: `apps/www/components/sections/cta-section.tsx`

**Changes**:
- [ ] Update headline: "Ready to Join the Network?"
- [ ] Update description: "Connect with elite talent or discover boutique opportunities."
- [ ] Update `<ShimmerButton />` text: "Get Started" → Links to Bubble signup
- [ ] Add helper copy like “Request beta invite” if the Bubble page is not public yet, so expectations are clear.

### 2.7 Before/After Section

**File**: `apps/www/components/sections/before-after-section.tsx`

**Decision Point**:
- [ ] Option A: Remove this section entirely (not relevant to talent network)
- [ ] Option B: Repurpose as "Traditional vs. Coastal Haven" comparison
  - Traditional: Black hole applications, resume fluff, generic job boards
  - Coastal Haven: Verified profiles, direct access, curated matches

---

## Phase 3: Metadata & SEO (Week 2 continued)

### 3.1 Update Metadata Utilities

**File**: `apps/www/lib/utils.ts`

**Changes**:
- [ ] Update `constructMetadata` defaults:
  ```typescript
  title: "Coastal Haven Partners | Elite Finance Talent Network"
  description: "Where elite finance talent meets boutique opportunity. Banking, PE, and VC recruiting reimagined."
  keywords: [
    "finance recruiting",
    "investment banking jobs",
    "private equity careers",
    "venture capital recruiting",
    "MBA recruiting",
    "boutique finance firms",
    "verified GPA",
    "elite talent network"
  ]
  ```
- [ ] Update `metadataBase` URL to production domain

### 3.2 Update Root Layout

**File**: `apps/www/app/layout.tsx`

**Changes**:
- [ ] Update metadata export:
  ```typescript
  export const metadata = constructMetadata({
    title: "Coastal Haven Partners | Elite Finance Talent Network",
    description: "Where elite finance talent meets boutique opportunity. Curated network for banking, PE, and VC recruiting.",
  });
  ```
- [ ] Update Google Analytics ID (or remove temporarily):
  - [ ] Create new GA4 property for Coastal Haven
  - [ ] Replace tracking ID `G-SC0JD2CK9H` with new ID

### 3.3 Update SEO Files

**File**: `apps/www/app/robots.ts`

**Changes**:
- [ ] Update sitemap URL if domain changed
- [ ] Keep crawling enabled for production

**File**: `apps/www/app/sitemap.ts`

**Changes**:
- [ ] Update base URL to `https://www.coastalhavenpartners.com`
- [ ] Add relevant pages: home, about, privacy, terms
- [ ] Consider adding: `/for-candidates`, `/for-firms` pages

---

## Phase 4: Visual Assets (Week 2-3)

### 4.1 Logo & Branding

**Tasks**:
- [ ] Design Coastal Haven Partners logo (or hire designer)
- [ ] Export logo in multiple formats:
  - SVG (for web)
  - PNG (high-res for OG images)
  - Favicon sizes: 16x16, 32x32, 96x96, 192x192, 512x512
- [ ] Replace logo in header component
- [ ] Store all master files in `apps/www/public/brand/` before syncing to Bubble or marketing assets directories

### 4.2 Favicon & Icons

**Directory**: `apps/www/app/`

**Files to replace**:
- [ ] `favicon.ico`
- [ ] `favicon.svg`
- [ ] `favicon-96x96.png`
- [ ] `icon.svg`
- [ ] `apple-touch-icon.png`
- [ ] `web-app-manifest-192x192.png`
- [ ] `web-app-manifest-512x512.png`

**Tools**: Use https://realfavicongenerator.net/ for automated generation

### 4.3 Open Graph Images

**Files to create**:
- [ ] `/public/og-image.png` (1200x630px)
  - Includes logo, tagline: "Where Elite Talent Meets Boutique Opportunity"
  - Professional gradient background
  - Shows brand colors
- [ ] `/public/hero-light.png` (optional, for light theme)
- [ ] `/public/hero-dark.png` (optional, for dark theme)

### 4.4 Web Manifest

**File**: `apps/www/app/site.webmanifest`

**Changes**:
- [ ] Update `name`: "Coastal Haven Partners"
- [ ] Update `short_name`: "Coastal Haven"
- [ ] Update `description`: "Elite Finance Talent Network"
- [ ] Verify icon paths match new favicon files

---

## Phase 5: Header & Footer (Week 3)

### 5.1 Site Header

**File**: `apps/www/components/site-header.tsx`

**Changes**:
- [ ] Update logo/brand name
- [ ] Update navigation links:
  - Remove email-specific links
  - Add: "For Candidates", "For Firms", "About", "Login"
- [ ] Update CTA button → "Join the Network"
- [ ] If Bubble login/signup is not yet live, temporarily point “Login” + CTA to a waitlist modal or Notion page to avoid dead ends.
- [ ] Keep `<AnimatedThemeToggler />`

### 5.2 Site Footer

**File**: `apps/www/components/site-footer.tsx`

**Changes**:
- [ ] Update company name: "Coastal Haven Partners"
- [ ] Update footer links:
  - Product: For Candidates, For Firms, How It Works
  - Company: About, Contact, Careers
  - Legal: Privacy, Terms, Compliance
- [ ] Add social media links (if applicable):
  - LinkedIn
  - Twitter/X (optional)
- [ ] Update copyright year and company name

---

## Phase 6: Additional Pages (Week 3)

### 6.1 Legal Pages

**Files**:
- `apps/www/app/privacy/page.tsx`
- `apps/www/app/terms/page.tsx`

**Changes**:
- [ ] Update company name throughout
- [ ] Update contact email
- [ ] Update service description (talent network, not email outreach)
- [ ] Consider hiring lawyer or using template for compliance

### 6.2 New Landing Pages (Optional but Recommended)

**Create**:
- [ ] `apps/www/app/(marketing)/for-candidates/page.tsx`
  - Target audience: Students/young professionals
  - Benefits: Verified profile, direct firm access, career opportunities
  - CTA: "Create Your Profile"

- [ ] `apps/www/app/(marketing)/for-firms/page.tsx`
  - Target audience: Boutique PE/VC/Banking firms
  - Benefits: Curated talent, verified credentials, efficient filtering
  - CTA: "Start Recruiting"

- [ ] `apps/www/app/(marketing)/about/page.tsx`
  - Mission statement
  - Team info
  - Why Coastal Haven is different

---

## Phase 7: Testing & Deployment (Week 4)

### 7.1 Local Testing

**Commands**:
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

**Checklist**:
- [ ] All sections render correctly
- [ ] No console errors
- [ ] Animations work smoothly
- [ ] Dark mode toggle works
- [ ] Mobile responsive (test on phone)
- [ ] All links point to correct destinations

### 7.2 Type Checking & Linting

```bash
# Run full check
pnpm check

# Fix auto-fixable issues
pnpm lint:fix
pnpm format:fix
```

**Tasks**:
- [ ] Resolve all TypeScript errors
- [ ] Fix linting warnings
- [ ] Ensure code formatting is consistent

### 7.3 Production Build

```bash
# Build for production
pnpm build

# Test production build locally
pnpm start
```

**Tasks**:
- [ ] Verify build completes without errors
- [ ] Check bundle size (should be reasonable)
- [ ] Test production build locally

### 7.4 Deploy to Vercel

**Tasks**:
- [ ] Push to GitHub main branch:
  ```bash
  git add .
  git commit -m "Rebrand to Coastal Haven Partners"
  git push origin main
  ```
- [ ] Vercel auto-deploys on push
- [ ] Check deployment logs for errors
- [ ] Visit production URL: `www.coastalhavenpartners.com`
- [ ] Test all pages and animations on production

### 7.5 Post-Deployment Checks

**Checklist**:
- [ ] Favicon appears correctly
- [ ] OG image shows when sharing on social media (test with https://www.opengraph.xyz/)
- [ ] Google Analytics tracking works (check Real-Time reports)
- [ ] Mobile responsive on real devices
- [ ] Page load speed is acceptable (test with Lighthouse)
- [ ] All CTAs link to correct Bubble.io URLs

---

## Phase 8: Bubble.io Portal (Week 5+)

### 8.1 Bubble App Setup

**Tasks**:
- [ ] Create Bubble.io account (if not already done)
- [ ] Create new Bubble app: "coastal-haven-partners"
- [ ] In Bubble Settings → Domain/email:
  - Set custom domain: `app.coastalhavenpartners.com`
  - Verify DNS CNAME is configured
- [ ] Configure email settings (for verification emails)

### 8.2 Database Schema

**Data Types to Create**:

- [ ] **User** (extend built-in):
  - Add field: `role` (Option Set: candidate, firm, school, admin)
  - Add field: `full_name` (text)
  - Add field: `email_verified` (yes/no)

- [ ] **CandidateProfile**:
  - `user` → User
  - `school_name` (text)
  - `gpa` (number)
  - `grad_year` (number)
  - `major` (text)
  - `interests` (list of texts)
  - `resume_url` (file)
  - `status` (Option Set: Seeking, Signed, Alumni)

- [ ] **Organization**:
  - `name` (text)
  - `org_type` (Option Set: PE Firm, VC Firm, Bank, Career Services)
  - `asset_class` (text)
  - `website` (text)
  - `primary_contact` → User
  - `city` (text)
  - `aum_range` (Option Set)

### 8.3 Authentication Pages

**Pages to Build**:
- [ ] `/signup-candidate` - Candidate registration form
- [ ] `/signup-firm` - Firm registration form
- [ ] `/login` - Login page
- [ ] `/dashboard` - Main dashboard (candidates & firms)

### 8.4 Privacy Rules

**Configure in Bubble → Data → Privacy**:

- [ ] CandidateProfile:
  - Everyone can see: school_name, grad_year, major, interests
  - Logged-in users: gpa, full_name
  - Owner only: resume_url, status

- [ ] Organization:
  - Everyone can see: name, org_type, website
  - Verified users: primary_contact

- [ ] User:
  - Hide email from searches
  - Show full_name to logged-in users only

### 8.5 Dashboard Interface

**Components to Build**:
- [ ] Top navigation (logo, tabs, profile, logout)
- [ ] Candidates tab with table/repeating group
- [ ] Firms tab with table/repeating group
- [ ] Filters (GPA slider, school dropdown, grad year)
- [ ] Action buttons (Copy Email, Request Intro)

---

## Phase 9: Visual Bridge (Week 6)

### 9.1 Color Sync

**Task**: Match Bubble.io styles to Next.js Tailwind theme

- [ ] Find Tailwind colors in `apps/www/app/globals.css` or Tailwind config
- [ ] In Bubble → Settings → Styles:
  - Set primary color to match
  - Set button colors to match
  - Set success/error colors to match

### 9.2 Font Matching

**Tasks**:
- [ ] Check font used in Next.js (likely Inter - see `app/layout.tsx`)
- [ ] In Bubble → Settings → Styles:
  - Add Google Font: Inter
  - Set as default font

### 9.3 Logo Upload

**Tasks**:
- [ ] Export logo as SVG
- [ ] Upload to Bubble File Manager
- [ ] Use in dashboard header/navigation

### 9.4 Cross-Platform Navigation

**Next.js → Bubble Links**:
- [ ] "Join the Network" → `https://app.coastalhavenpartners.com/signup-candidate`
- [ ] "I'm Hiring" → `https://app.coastalhavenpartners.com/signup-firm`
- [ ] "Login" → `https://app.coastalhavenpartners.com/login`

**Bubble → Next.js Links**:
- [ ] Logo click → `https://www.coastalhavenpartners.com`
- [ ] Footer "About" → `https://www.coastalhavenpartners.com/about`

---

## Phase 10: Launch Preparation (Week 7)

### 10.1 Content Seeding

**Tasks**:
- [ ] Create 10-15 test candidate profiles
- [ ] Create 5-10 test firm profiles
- [ ] Test filtering and search functionality
- [ ] Verify email verification flow works

### 10.2 Alpha Testing

**Tasks**:
- [ ] Invite 3-5 friends to test signup flow
- [ ] Collect feedback on:
  - Signup process clarity
  - Dashboard usability
  - Overall experience
- [ ] Fix critical bugs
- [ ] Iterate on UX issues

### 10.3 SEO & Marketing

**Tasks**:
- [ ] Submit sitemap to Google Search Console
- [ ] Verify domain in Google Search Console
- [ ] Create LinkedIn company page
- [ ] Prepare launch announcement
- [ ] Plan outreach to first cohort (50 candidates, 10 firms)

### 10.4 Monitoring Setup

**Tasks**:
- [ ] Verify Google Analytics is tracking
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Monitor Bubble.io capacity/performance
- [ ] Set up uptime monitoring (optional: UptimeRobot)

---

## Quick Start Guide (This Week)

If you want to start **today**, here's the fastest path:

### Today (2-3 hours):
1. ✅ Create GitHub repo and push code
2. ✅ Connect to Vercel
3. ✅ Configure domain DNS (wait for propagation)
4. ⚡ Update hero section copy (`components/sections/hero-section.tsx`)
5. ⚡ Update metadata (`lib/utils.ts`)

### This Weekend (4-6 hours):
1. Replace all section copy (features, how-it-works, results, CTA)
2. Update header and footer
3. Create temporary logo (or use text-based branding initially)
4. Deploy and test

### Next Week:
1. Gather firm/school logos for IconCloud
2. Create OG images
3. Replace favicons
4. Build Bubble.io prototype

---

## Success Metrics

**Phase 1-7 (Next.js Site) Complete When**:
- ✅ Site loads at www.coastalhavenpartners.com
- ✅ All copy references finance talent network (not email outreach)
- ✅ IconCloud shows finance firms/schools
- ✅ CTAs link to Bubble.io app (even if not built yet)
- ✅ Mobile responsive
- ✅ No TypeScript/build errors

**Phase 8-9 (Bubble Portal) Complete When**:
- ✅ Users can sign up at app.coastalhavenpartners.com
- ✅ Email verification works
- ✅ Dashboard shows candidate/firm tables
- ✅ Filters work correctly
- ✅ Visual consistency with marketing site

**Phase 10 (Launch) Complete When**:
- ✅ 50+ verified candidates
- ✅ 10+ firms registered
- ✅ First successful candidate-firm connection made
- ✅ Feedback collected and initial iterations deployed

---

## Need Help?

**Documentation References**:
- Next.js App Router: https://nextjs.org/docs/app
- Magic UI Components: https://magicui.design/docs
- Vercel Deployment: https://vercel.com/docs
- Bubble.io Tutorials: https://bubble.io/lessons

**Common Issues**:
- DNS propagation: Can take 24-48 hours
- Vercel build errors: Check build logs, verify pnpm version
- TypeScript errors: Run `pnpm typecheck` locally first
- Bubble custom domain: Verify CNAME, check SSL certificate status
