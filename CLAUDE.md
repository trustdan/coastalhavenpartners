# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Full Send Emails** is an AI-powered email outreach landing page built to showcase personalized email outreach at scale. This repository contains a high-performance marketing website with polished animations and modern UI components.

**Note**: The [overview.md](overview.md) file contains a detailed plan for rebranding this codebase into "Coastal Haven Partners" - a finance talent network. This template is designed to be cloned and rebranded.

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router with RSC)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion, Motion library
- **UI Components**: Magic UI (custom components) + Radix UI primitives
- **Package Manager**: pnpm 9+
- **Monorepo**: Turborepo 2.3+
- **Node Version**: >= 22.14.0

## Development Commands

### Essential Commands

```bash
# Development
pnpm dev              # Start development server with Turbo (port 3000)

# Building
pnpm build            # Build all packages for production
pnpm build:registry   # Build Magic UI component registry (Phase 2)

# Code Quality
pnpm check            # Run lint + typecheck + format:check (pre-commit check)
pnpm lint             # Lint all code
pnpm lint:fix         # Auto-fix linting issues
pnpm typecheck        # Type check all TypeScript
pnpm format:check     # Check code formatting with Prettier
pnpm format:fix       # Auto-fix formatting issues

# Production
pnpm start            # Start production server

# Cleanup
pnpm clean            # Remove all build artifacts and node_modules
```

### App-Specific Commands

```bash
# From apps/www directory
pnpm dev              # Next.js dev server with Turbo mode
pnpm build            # Build Next.js app
pnpm typecheck        # Type check this app only
```

## Project Architecture

### Monorepo Structure

```
coastalhavenpartners/
├── apps/
│   └── www/                    # Main Next.js application
│       ├── app/
│       │   ├── (marketing)/    # Route group for marketing pages
│       │   │   ├── page.tsx    # Home page (sections-based)
│       │   │   └── layout.tsx  # Marketing layout with header/footer
│       │   ├── privacy/        # Legal pages
│       │   ├── terms/
│       │   ├── test-components/
│       │   ├── layout.tsx      # Root layout with theme + analytics
│       │   ├── globals.css     # Tailwind + custom CSS variables
│       │   ├── robots.ts       # SEO: robots.txt generation
│       │   └── sitemap.ts      # SEO: sitemap.xml generation
│       ├── components/
│       │   ├── magicui/        # Magic UI animated components
│       │   ├── sections/       # Landing page sections
│       │   ├── landing/        # Alternative section components
│       │   ├── ui/             # Shadcn/UI base components
│       │   ├── site-header.tsx
│       │   ├── site-footer.tsx
│       │   └── theme-provider.tsx
│       ├── lib/
│       │   └── utils.ts        # Utilities (cn, constructMetadata, etc.)
│       └── public/             # Static assets
├── turbo.json                  # Turborepo task configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root package with shared scripts
```

### Component Organization Pattern

The app uses a **sections-based architecture** for the landing page:

**Main Page** (`app/(marketing)/page.tsx`):
- Imports section components
- Composes them vertically
- Each section is self-contained

**Section Components** (`components/sections/`):
- Self-contained UI sections
- Accept optional className for layout control
- Use Magic UI components internally
- Examples: `hero-section.tsx`, `features-section.tsx`, `tech-stack-section.tsx`

**Magic UI Components** (`components/magicui/`):
- Animated, interactive UI primitives
- Client-side components (use "use client")
- Examples: `meteors.tsx`, `animated-shiny-text.tsx`, `icon-cloud.tsx`, `shimmer-button.tsx`

**Base UI Components** (`components/ui/`):
- Shadcn/UI components (Radix UI + Tailwind)
- Forms, buttons, inputs, labels
- Installed via `components.json` config

## Magic UI Integration

Magic UI components are **copied directly into the codebase** (not installed as npm packages). This gives full control over customization.

### Current Magic UI Components

| Component | File | Usage in Project |
|-----------|------|------------------|
| `<Meteors />` | `magicui/meteors.tsx` | Hero background effect |
| `<AnimatedShinyText />` | `magicui/animated-shiny-text.tsx` | Hero headline shimmer |
| `<AuroraText />` | `magicui/aurora-text.tsx` | Hero subtitle gradient |
| `<ShimmerButton />` | `magicui/shimmer-button.tsx` | Primary CTA button |
| `<ShineBorder />` | `magicui/shine-border.tsx` | Feature card borders |
| `<TextAnimate />` | `magicui/text-animate.tsx` | Section title animations |
| `<AnimatedBeam />` | `magicui/animated-beam.tsx` | Process flow connections |
| `<IconCloud />` | `magicui/icon-cloud.tsx` | 3D rotating icon cloud |
| `<AnimatedThemeToggler />` | `magicui/animated-theme-toggler.tsx` | Dark/light mode switch |
| `<NumberTicker />` | `magicui/number-ticker.tsx` | Animated counting numbers |
| `<TypingAnimation />` | `magicui/typing-animation.tsx` | Typewriter effect |
| `<MorphingText />` | `magicui/morphing-text.tsx` | Text transformation animation |

### Adding New Magic UI Components

Magic UI components can be added in the future by:
1. Copying component files into `components/magicui/`
2. Updating imports in section files
3. Magic UI docs: https://magicui.design/docs

## Key Configuration Files

### Path Aliases (`tsconfig.json`)
```typescript
"@/*" maps to apps/www/* root
```

Example imports:
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Meteors } from "@/components/magicui/meteors"
```

### Shadcn/UI Config (`components.json`)
- Style: `new-york`
- Base color: `neutral`
- CSS variables: enabled
- Icon library: `lucide-react`

### Turborepo Task Graph
- `build` depends on `^build` (dependencies build first)
- `dev` and `start` are persistent tasks (long-running servers)
- `lint` and `typecheck` run in dependency order

## Metadata & SEO

### Metadata Pattern
Use the `constructMetadata` utility from `lib/utils.ts`:

```typescript
export const metadata = constructMetadata({
  title: "Page Title",
  description: "Page description",
  image: absoluteUrl("/custom-og-image.png"),
});
```

This automatically generates:
- OpenGraph tags
- Twitter card tags
- SEO meta tags
- Proper metadata base URL

### Environment Variables
The project expects `NEXT_PUBLIC_APP_URL` in `.env.local`:
```bash
NEXT_PUBLIC_APP_URL=https://fullsendemails.com
```

### SEO Files
- [robots.ts](apps/www/app/robots.ts) - Robots.txt configuration
- [sitemap.ts](apps/www/app/sitemap.ts) - Dynamic sitemap generation
- [SEO-plan.md](SEO-plan.md) - Detailed SEO implementation plan

## Analytics

Google Analytics is configured in [app/layout.tsx](apps/www/app/layout.tsx):
- Tracking ID: `G-SC0JD2CK9H`
- Loaded via Next.js `<Script>` component with `strategy="afterInteractive"`

## Rebranding for Coastal Haven Partners

The [overview.md](overview.md) file contains a comprehensive blueprint for rebranding this template into a finance talent network platform. Key transformation points:

### Component Reuse Mapping
- `<AnimatedShinyText />`: "Outbound that reads like..." → "Where Elite Talent Meets Boutique Opportunity"
- `<IconCloud />`: AI tool logos → Finance firm logos (Goldman Sachs, Blackstone, Sequoia, etc.)
- `<AnimatedBeam />`: Research → Personalize → Deliver → Student Profile → GPA Verified → Firm Match
- `<ShimmerButton />`: "Start Outreach" → "Join the Network"

### Next Steps for Rebranding
1. Update copy in section components (`components/sections/`)
2. Replace IconCloud logos in `tech-stack-section.tsx`
3. Update metadata in `lib/utils.ts` and `app/layout.tsx`
4. Replace favicon and OG images in `app/` directory
5. Update footer links in `site-footer.tsx`
6. Configure DNS for new domain
7. Update environment variables

## Important Notes

- **Package Manager**: Only pnpm is allowed (enforced by `preinstall` script)
- **Node Version**: Requires Node 22.14.0+
- **Animation Performance**: Magic UI components use GPU-accelerated transforms (transform/opacity only)
- **Theme Support**: Dark mode enabled via `next-themes` with `attribute="class"`
- **Route Groups**: `(marketing)` route group allows shared layouts without affecting URL structure
- **No Backend**: This is a static marketing site - all data is hardcoded in components

## Development Workflow

1. Run `pnpm install` (first time only)
2. Run `pnpm dev` to start development server
3. Edit section components in `components/sections/`
4. Edit Magic UI components in `components/magicui/` for animation tweaks
5. Run `pnpm check` before committing
6. Run `pnpm build` to test production build locally
7. Deploy to Vercel (connects to GitHub automatically)

## Resources

- Magic UI Documentation: https://magicui.design/docs
- Next.js App Router: https://nextjs.org/docs/app
- Tailwind CSS 4: https://tailwindcss.com/docs
- Shadcn/UI: https://ui.shadcn.com/
- Turborepo: https://turbo.build/repo/docs
