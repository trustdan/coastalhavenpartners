# SEO Plan for Full Send Emails

## 1. Executive Summary
**Goal**: Establish "Full Send Emails" as a leader in AI-powered email outreach, targeting 85% open rates and personalization at scale.
**Current Status**: Basic Next.js metadata is present but contains placeholders. Key technical SEO files (`sitemap.ts`, `robots.ts`) are missing. No content marketing strategy (blog) is currently visible in the app structure.

## 2. Technical SEO (Immediate Actions)

### A. Metadata & Configuration
- [ ] **Refactor `layout.tsx`**: The current `app/layout.tsx` manually defines metadata. Switch to using the `constructMetadata` helper found in `lib/utils.ts`.
- [ ] **Fix Placeholders**: 
    - Replace `https://yourdomain.com` with the actual production URL (configure `NEXT_PUBLIC_APP_URL` env var).
    - Replace `@yourtwitterhandle` with the actual Twitter profile.
    - Create and add `og-image.png` to `public/`.
- [ ] **Canonical URLs**: Ensure `metadataBase` is set correctly in `lib/utils.ts` so canonical tags are auto-generated correctly for all pages.

### B. Essential Files (Missing)
- [ ] **Create `app/sitemap.ts`**: Generate a dynamic sitemap including the home page, privacy, terms, and future blog posts.
- [ ] **Create `app/robots.ts`**: Direct bots to the sitemap and define crawling rules.

### C. Structured Data (JSON-LD)
- [ ] **Add Organization Schema**: Implement structured data in `layout.tsx` or the landing page to define the Organization, Logo, and Social profiles.
- [ ] **Add Product Schema**: Define the software as a Product with aggregate ratings (if available) or offers.

## 3. On-Page Optimization

### A. Keyword Strategy
**Primary Keywords**: 
- "AI email outreach"
- "Personalized cold email"
- "B2B sales automation"
- "Email deliverability tools"

**Secondary Keywords**:
- "Cold email open rates"
- "Automated email personalization"
- "Sales prospecting tools"

### B. Content Structure
- [ ] **Heading Hierarchy**: Ensure the Landing Page (`app/(marketing)/page.tsx`) uses exactly one `<h1>` (Hero section) and logically nested `<h2>` and `<h3>` tags for features and results.
- [ ] **Image Optimization**: 
    - Ensure all images (especially in Hero and Results sections) have descriptive `alt` text containing keywords where natural.
    - Use Next.js `<Image>` component for automatic WebP/AVIF conversion.

## 4. Content Marketing Strategy (Growth)

### A. Launch a Blog (`/blog`)
**Why**: To rank for informational queries like "how to write cold emails."
**Action**:
- Create `app/(marketing)/blog` routes.
- Write "How-to" guides and "Case Studies" showing the 85% open rate in action.
- **Initial Topics**:
    1. "The Science Behind 85% Open Rates"
    2. "Manual vs. AI Personalization: A Comparison"
    3. "5 Templates for B2B Cold Outreach"

### B. Use Case Pages
**Why**: Target specific buyer personas.
**Action**: Create dedicated landing pages (e.g., `/for-sales-teams`, `/for-recruiters`) optimizing for those specific terms.

## 5. Analytics & Monitoring
- [x] **Google Analytics**: Already configured (G-SC0JD2CK9H).
- [ ] **Google Search Console**: 
    - specific task: Verify domain ownership using DNS record or HTML file.
    - specific task: Submit `sitemap.xml` once created.

## 6. Implementation Checklist (Next Steps)
1. Update `env` variables.
2. Create `sitemap.ts` & `robots.ts`.
3. Refactor `layout.tsx` to use `constructMetadata`.
4. Create `public/og-image.png`.
5. Deploy and verify with Google Search Console.

