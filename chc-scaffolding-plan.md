# Coastal Haven Capital - Scaffolding Plan

This document outlines the architecture and scaffolding for adding Coastal Haven Capital as a second app in the monorepo.

## Overview

**Goal:** Create a static landing page for Coastal Haven Capital (coastalhavencapital.com) that:
- Lives in the same monorepo as Coastal Haven Partners
- Shares design tokens and select components
- Has its own visual identity (more institutional/refined)
- Cross-links to Partners for all auth/application flows

**Not in scope (for now):**
- Supabase integration
- Authentication
- Application forms (all handled by Partners)

---

## Phase 1: Monorepo Configuration

### 1.1 Create Capital App Directory

```
apps/
├── www/                    # Coastal Haven Partners (existing)
└── capital/                # Coastal Haven Capital (new)
    ├── app/
    │   ├── layout.tsx      # Root layout
    │   ├── page.tsx        # Landing page
    │   ├── globals.css     # Tailwind + custom vars
    │   ├── favicon.ico
    │   ├── robots.ts
    │   └── sitemap.ts
    ├── components/
    │   ├── sections/       # Capital-specific sections
    │   └── magicui/        # Symlink or copy of select components
    ├── lib/
    │   └── utils.ts        # Utilities (cn, metadata, etc.)
    ├── public/
    │   └── og-image.png    # Capital-specific OG image
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

### 1.2 Update pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  # Future: - "packages/*"
```

*(Already configured for apps/* so no change needed)*

### 1.3 Update Root turbo.json

Add Capital-specific tasks if needed, or rely on existing wildcard config:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}
```

### 1.4 Capital package.json

```json
{
  "name": "capital",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0"
  }
}
```

**Note:** Port 3001 to run alongside Partners (3000) during development.

---

## Phase 2: Shared Design Tokens

### 2.1 Strategy: Copy with Modifications

Rather than creating a shared package (overkill for two apps), we'll:
1. Copy the base Tailwind config
2. Copy the globals.css with shared CSS variables
3. Adjust accent colors if desired for Capital

### 2.2 Shared CSS Variables

Both apps use the same CSS variable structure from Partners:

```css
/* Shared color tokens */
--background: ...
--foreground: ...
--primary: ...
--secondary: ...
/* etc. */
```

Capital may adjust:
- Primary color (slightly different hue for distinction)
- Or keep identical for brand cohesion

### 2.3 Shared Utilities

Copy `lib/utils.ts` with Capital-specific metadata defaults:

```typescript
// apps/capital/lib/utils.ts
export function constructMetadata({
  title = "Coastal Haven Capital",
  description = "A private equity firm investing in exceptional lower middle-market companies.",
  // ...
}) { }
```

---

## Phase 3: Component Strategy

### 3.1 Magic UI Components for Capital

**Goal:** More refined, institutional feel vs Partners' playful energy.

| Component | Use in Capital | Notes |
|-----------|----------------|-------|
| `particles.tsx` | ✅ Hero background | Subtle dot field, replaces Meteors |
| `dot-pattern.tsx` | ✅ Section backgrounds | Grid structure = institutional |
| `blur-fade.tsx` | ✅ Text/section reveals | Elegant fade-ins |
| `shimmer-button.tsx` | ✅ Primary CTA | Shared with Partners |
| `shine-border.tsx` | ✅ Cards | Shared with Partners |
| `marquee.tsx` | ✅ Portfolio/logo scroll | Professional logo display |
| `number-ticker.tsx` | ✅ Stats section | "$500M+ deployed" etc. |
| `text-animate.tsx` | ✅ Headlines | Shared with Partners |
| `animated-shiny-text.tsx` | ❌ Skip | Too playful for Capital |
| `meteors.tsx` | ❌ Skip | Partners-only effect |
| `icon-cloud.tsx` | ❌ Skip | Partners-only effect |
| `aurora-text.tsx` | ❌ Skip | Too vibrant for Capital |

### 3.2 New Components to Add

May need to add from Magic UI:
- `particles.tsx` - Subtle floating particles
- `dot-pattern.tsx` - Structured grid background
- `blur-fade.tsx` - Smooth reveal animations
- `marquee.tsx` - Logo/portfolio company scroll

### 3.3 Component File Structure

```
apps/capital/components/
├── sections/
│   ├── hero-section.tsx        # Particles bg, main headline
│   ├── thesis-section.tsx      # Investment thesis
│   ├── internship-section.tsx  # What interns do
│   ├── portfolio-section.tsx   # Marquee of logos (if any)
│   ├── stats-section.tsx       # NumberTicker stats
│   └── cta-section.tsx         # Final CTA to Partners
├── magicui/
│   ├── particles.tsx
│   ├── dot-pattern.tsx
│   ├── blur-fade.tsx
│   ├── shimmer-button.tsx      # Copied from Partners
│   ├── shine-border.tsx        # Copied from Partners
│   ├── marquee.tsx
│   ├── number-ticker.tsx       # Copied from Partners
│   └── text-animate.tsx        # Copied from Partners
├── ui/
│   └── button.tsx              # Base button (copied)
├── site-header.tsx
└── site-footer.tsx
```

---

## Phase 4: Page Structure

### 4.1 Landing Page Sections

```tsx
// apps/capital/app/page.tsx
import { HeroSection } from "@/components/sections/hero-section"
import { ThesisSection } from "@/components/sections/thesis-section"
import { InternshipSection } from "@/components/sections/internship-section"
import { StatsSection } from "@/components/sections/stats-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ThesisSection />
      <InternshipSection />
      <StatsSection />
      <CtaSection />
    </main>
  )
}
```

### 4.2 Section Content Outline

**Hero Section**
- Headline: "Where Ambitious Talent Meets Exceptional Deals"
- Subhead: Brief positioning as PE firm seeking interns
- Primary CTA: "Apply Now" → coastalhavenpartners.com/apply/capital
- Secondary CTA: "Learn About Our Network" → coastalhavenpartners.com
- Background: Particles effect (subtle, dark)

**Thesis Section**
- Investment focus (lower middle-market, specific sectors)
- What makes Capital different
- Dot pattern background

**Internship Section**
- What interns actually do (deal sourcing, research, modeling)
- Why this is better than traditional PE internships
- "Real deals, real impact"

**Stats Section**
- NumberTicker components
- "$X invested" / "X deals sourced" / "X interns placed" (or projected)
- Builds credibility

**CTA Section**
- Final push to apply
- "Join via Coastal Haven Partners"
- ShimmerButton linking to Partners

### 4.3 Header/Footer

**Header:**
- Capital logo/wordmark
- Minimal nav: "About" (anchor), "For Candidates" (→ Partners), "Apply" (→ Partners)
- Clean, no hamburger menu needed for single-page

**Footer:**
- Capital info
- "Powered by Coastal Haven Partners" link
- Legal links (can share with Partners or have own)

---

## Phase 5: Cross-Linking Implementation

### 5.1 Links from Capital → Partners

| Element | Destination |
|---------|-------------|
| "Apply Now" button | `https://coastalhavenpartners.com/apply/capital` |
| "Join Network" button | `https://coastalhavenpartners.com/signup?ref=capital` |
| "For Candidates" nav | `https://coastalhavenpartners.com` |
| Footer "Partners" link | `https://coastalhavenpartners.com` |

### 5.2 Links from Partners → Capital

| Element | Destination |
|---------|-------------|
| Featured firm card | `https://coastalhavencapital.com` |
| "Our Sister Firm" section | `https://coastalhavencapital.com` |
| Footer link | `https://coastalhavencapital.com` |

### 5.3 UTM Tracking (Optional)

Add UTM params for analytics:
```
coastalhavenpartners.com/apply/capital?utm_source=capital&utm_medium=website&utm_campaign=internship
```

---

## Phase 6: Deployment

### 6.1 Vercel Configuration

Two separate Vercel projects, same GitHub repo:

**Project 1: Coastal Haven Partners**
- Root Directory: `apps/www`
- Domain: `coastalhavenpartners.com`
- Existing project

**Project 2: Coastal Haven Capital**
- Root Directory: `apps/capital`
- Domain: `coastalhavencapital.com`
- New project

### 6.2 Environment Variables

Capital app needs minimal env vars (no Supabase yet):

```bash
# apps/capital/.env.local
NEXT_PUBLIC_APP_URL=https://coastalhavencapital.com
NEXT_PUBLIC_PARTNERS_URL=https://coastalhavenpartners.com
```

### 6.3 Build Commands

Vercel auto-detects monorepo. Each project builds independently:

```bash
# Partners
cd apps/www && pnpm build

# Capital
cd apps/capital && pnpm build
```

---

## Implementation Checklist

### Scaffolding Tasks

- [ ] Create `apps/capital/` directory structure
- [ ] Add `package.json` with dependencies
- [ ] Add `next.config.ts`
- [ ] Add `tsconfig.json` (extend from root or standalone)
- [ ] Add `tailwind.config.ts`
- [ ] Add `app/globals.css`
- [ ] Add `app/layout.tsx` (root layout with metadata)
- [ ] Add `lib/utils.ts` (cn, constructMetadata)

### Component Tasks

- [ ] Copy shared Magic UI components from Partners
- [ ] Add new Magic UI components (particles, dot-pattern, blur-fade, marquee)
- [ ] Create `site-header.tsx`
- [ ] Create `site-footer.tsx`

### Section Tasks

- [ ] Create `hero-section.tsx`
- [ ] Create `thesis-section.tsx`
- [ ] Create `internship-section.tsx`
- [ ] Create `stats-section.tsx`
- [ ] Create `cta-section.tsx`

### Page Assembly

- [ ] Create `app/page.tsx` composing all sections
- [ ] Add `app/robots.ts`
- [ ] Add `app/sitemap.ts`

### Deployment Tasks

- [ ] Create Vercel project for Capital
- [ ] Connect to GitHub repo
- [ ] Set root directory to `apps/capital`
- [ ] Configure domain `coastalhavencapital.com`
- [ ] Verify build succeeds

---

## Future Enhancements (Post-Supabase)

Once Supabase is integrated into Partners:

1. **Apply/Capital route on Partners** - Dedicated landing for Capital applicants
2. **Referral tracking** - Track which applicants came from Capital site
3. **Capital-specific application fields** - Additional questions for PE internship
4. **Dashboard integration** - Capital applications visible in Partners dashboard

---

## Visual Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  Coastal Haven Capital                          [Apply Now →]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  (Particles)               │
│                                                                 │
│         Where Ambitious Talent                                  │
│         Meets Exceptional Deals                                 │
│                                                                 │
│    A private equity firm that gives interns                    │
│    real responsibility on real deals.                          │
│                                                                 │
│         [ ✨ Apply via Partners ✨ ]                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │  Our Investment Thesis                (Dot Pattern) │     │
│    │  ...                                                │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    What You'll Actually Do                                      │
│    ────────────────────────                                     │
│    • Source proprietary deals                                   │
│    • Conduct industry research                                  │
│    • Build financial models                                     │
│    • Present to investment committee                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│       $50M+          10+           100%                         │
│      Deployed      Deals        Real Work                       │
│                   Sourced      (No Coffee)                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    Ready to Source Your First Deal?                             │
│                                                                 │
│    [ ✨ Apply Now ✨ ]    [ Learn About the Network ]           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Coastal Haven Capital · Powered by Coastal Haven Partners     │
│  Privacy · Terms                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Completion Status

**Scaffolding Complete!** (November 2024)

All scaffolding tasks have been completed:
- [x] Directory structure and package.json
- [x] Next.js and TypeScript configuration
- [x] Tailwind CSS setup with shared design tokens
- [x] Root layout and utilities
- [x] Shared Magic UI components (shimmer-button, shine-border, number-ticker, text-animate)
- [x] Capital-specific Magic UI components (particles, dot-pattern, blur-fade, marquee)
- [x] Site header and footer with cross-linking
- [x] All section components (hero, thesis, internship, stats, cta)
- [x] Main page, robots.ts, sitemap.ts
- [x] Build verification passed

## Next Steps

1. ~~Review and approve this plan~~ ✓
2. ~~Execute scaffolding tasks (Phase 1-2)~~ ✓
3. ~~Implement components (Phase 3)~~ ✓
4. ~~Build sections and page (Phase 4)~~ ✓
5. ~~Set up cross-links (Phase 5)~~ ✓
6. Deploy to Vercel (Phase 6) - **Pending**
7. **Separately:** Plan Supabase integration for Partners (authentication, profiles, applications)

### To Run Locally

```bash
# Start Capital dev server on port 3001
cd apps/capital && pnpm dev

# Or start both apps
pnpm dev  # Partners on 3000, Capital on 3001
```

### To Deploy

1. Create new Vercel project
2. Set root directory to `apps/capital`
3. Configure domain `coastalhavencapital.com`
4. Add environment variables from `.env.local.example`
