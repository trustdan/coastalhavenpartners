# CoastalHavenPartners.com - The Vibe Coding Blueprint

_Last updated: 2025-11-22_

**How to use this document:** treat this as the vibe and messaging blueprint. For the task-by-task execution plan, hop to `[ROADMAP.md](ROADMAP.md)`. For the Bubble build playbook, see `[BUBBLE-IMPLEMENTATION.md](BUBBLE-IMPLEMENTATION.md)`.

*Elite finance talent meets boutique opportunity. Built fast, built right.*

------

## 🎯 The Big Picture

**Marketing Storefront:** `www.coastalhavenpartners.com` (Next.js + Magic UI)
 **The Portal:** `app.coastalhavenpartners.com` (Bubble.io)

**The Thesis:** High-finance firms (PE, VC, Banking) care about two things: **prestige** and **efficiency**. Your Next.js front-door delivers the prestige (animations, polish, "this is exclusive"). Your Bubble backend delivers the efficiency (Excel-style tables, GPA filters, direct contact info). Keep this mental model handy as you work through the `[ROADMAP](ROADMAP.md)` tasks.

------

## ⚡ Phase 1: Clone & Rebrand the Storefront (Next.js)

### 1.1 Setup & Strip

```bash
git clone <full-send-repo> coastal-haven-partners
cd coastal-haven-partners
pnpm install
```

**Nuke the email context:**

- Delete any references to "outbound," "deliverability," "SPF/DKIM"
- This is now a **talent network**, not an email tool

### 1.2 Component Remapping (The Magic UI Overhaul)

| Current Component       | Current Use                      | New Use for Finance Portal                                   |
| ----------------------- | -------------------------------- | ------------------------------------------------------------ |
| `<AnimatedShinyText />` | "Outbound that reads like..."    | **"Where Elite Talent Meets Boutique Opportunity"**          |
| `<AuroraText />`        | Email subtitle                   | **"Banking • Private Equity • Venture Capital"**             |
| `<Meteors />`           | Background effect                | Keep - gives "fast-moving markets" energy                    |
| `<IconCloud />`         | AI tool logos (OpenAI, etc.)     | **Swap for:** Goldman Sachs, Blackstone, Sequoia Capital, KKR, Wharton, HBS, Booth logos |
| `<AnimatedBeam />`      | Research → Personalize → Deliver | **Student Profile → GPA Verified → Firm Match**              |
| `<ShineBorder />`       | Feature cards                    | **"Verified GPAs" • "Direct Desk Access" • "Curated Network"** |
| `<ShimmerButton />`     | "Start Outreach" CTA             | **"Join the Network"** → `app.coastalhavenpartners.com/signup` |

### 1.3 The New Copy (Drop-in Headlines)

**Hero Section** _(CTA destinations are placeholders until the Bubble signup/login pages are live; point them to a waitlist or Typeform in the interim)_: 

```typescript
headline: "Where Elite Talent Meets Boutique Opportunity"
subheadline: "A curated network for high-intent banking, PE, and VC recruiting"
primary_cta: "Join as a Candidate"
secondary_cta: "I'm Hiring Talent"
```

**Features (3 cards with `<ShineBorder />`):**

1. **Verified Credentials**
    *"GPA-verified profiles. School-confirmed enrollment. No resume fluff."*
2. **Direct Access**
    *"Skip the black hole. Connect directly with decision-makers at boutique firms."*
3. **Curated Network**
    *"Quality over quantity. Pre-vetted candidates and hand-selected firms."*

### 1.4 Deploy

```bash
git remote add origin <your-new-repo>
git push -u origin main
```

Connect to **Vercel** → Point `www.coastalhavenpartners.com` to deployment.

------

## 🧠 Phase 2: Build the Bubble Brain (The Portal)

### 2.1 Domain Setup

In your DNS provider (Namecheap, Cloudflare, etc.):

```
Type: CNAME
Host: app
Value: app.bubble.io
TTL: Auto
```

In Bubble settings → Domain/email:

- Set custom domain to `app.coastalhavenpartners.com`

### 2.2 Database Schema (The Core Engine)

**User (Built-in Bubble type + custom fields):**

```
- email (text, unique)
- password (auto-hashed)
- role (Option Set: "candidate", "firm", "school", "admin")
- full_name (text)
- email_verified (yes/no)
- created_date (date)
```

**CandidateProfile (New Data Type):**

```
- user → User
- school_name (text)
- gpa (number, 0-4.0 scale)
- grad_year (number)
- major (text)
- interests (list of texts: "Investment Banking", "Growth Equity", etc.)
- resume_url (file, optional)
- status (Option Set: "Seeking", "Signed", "Alumni")
```

**Organization (New Data Type):**

```
- name (text) // e.g., "Blackstone", "Wharton Career Services"
- org_type (Option Set: "PE Firm", "VC Firm", "Bank", "Career Services")
- asset_class (text, optional) // "Buyout", "Growth", "Distressed"
- website (text)
- primary_contact → User (link)
- city (text)
- aum_range (Option Set: "$100M-$500M", "$500M-$2B", "$2B+")
```

**Connection (Future, Phase 2+):**

```
- candidate → User
- firm → Organization
- status (Option Set: "Intro Requested", "Connected", "Interview")
- created_date (date)
```

### 2.3 The Auth Flow (Email Verification = Gate)

**Signup Page (`/signup-candidate`):**

- Fields: Email, Password, Full Name, School, GPA, Grad Year, Major
- Workflow on "Submit":
  1. Create User
  2. Create CandidateProfile linked to User
  3. **Send verification email** (Bubble built-in)
  4. Show message: "Check your .edu email to confirm"

**Email Verification:**

- User clicks link → Bubble auto-marks `email_verified = yes`
- Redirect to → `/dashboard`

**Login Page (`/login`):**

- Standard Bubble login element
- After login: Check `email_verified` → If no, show warning; if yes, go to dashboard

### 2.4 The Dashboard (The Money View)

**Top Nav Structure:**

```
[Logo] CoastalHaven | [Tab: Candidates] [Tab: Firms] | [Profile] [Logout]
```

**Candidates Tab (Intern Directory):**

- Repeating Group (Table style):
  - Columns: Name | School | GPA | Grad Year | Major | Interests
  - Data source: `Do a search for CandidateProfile` where `User's email_verified = yes`
  - Filters (above table):
    - Dropdown: School (dynamic from database)
    - Slider: Min GPA (3.0 - 4.0)
    - Dropdown: Grad Year

**Firms Tab (Opportunity Directory):**

- Repeating Group (Table style):
  - Columns: Firm Name | Type | Asset Class | AUM | Website | Contact
  - Data source: `Do a search for Organization` where `org_type ≠ "Career Services"`
  - Quick action buttons:
    - "Copy Email" (tooltip: primary contact email)
    - "View Details" (future: detailed firm page)

### 2.5 Firm Dashboard (Phase 2, Minimal for Now)

For users where `role = "firm"`:

- **Single tab:** "Candidate Directory" (read-only access to verified candidates)
- Filters: Same as candidate view (GPA, school, grad year)
- Action: "Request Intro" button (creates Connection record, sends email to candidate)

------

## 🎨 Phase 3: The Visual Bridge (Make It Feel Like One App)

### 3.1 Color Sync

From your Next.js `tailwind.config.ts`, copy hex codes to Bubble **Styles** tab:

**Example mapping:**

```typescript
// In Next.js tailwind.config:
primary: "#0F172A"    // Slate 900
accent: "#3B82F6"     // Blue 500
success: "#10B981"    // Emerald 500

// In Bubble Styles:
Primary color: #0F172A
Button color: #3B82F6
Success green: #10B981
```

### 3.2 Font Match

- Next.js likely uses `Geist` or `Inter`
- In Bubble: Settings → Styles → Font → Add Google Font: `Inter`
- Set default font to match

### 3.3 Logo Consistency

- Export your logo as SVG from Next.js `/public` folder (store master assets in `apps/www/public/brand/` so the whole team knows where to pull from)
- Upload same file to Bubble File Manager
- Use in top-left nav of dashboard

### 3.4 Navigation Flow

**From Next.js → Bubble:**

- "Join the Network" button → `https://app.coastalhavenpartners.com/signup-candidate` _(placeholder until Bubble signup launches; use a waitlist link meanwhile)_
- "I'm Hiring" button → `https://app.coastalhavenpartners.com/signup-firm` _(placeholder)_
- "Login" (navbar) → `https://app.coastalhavenpartners.com/login` _(placeholder)_

**From Bubble → Next.js:**

- Logo click → `https://www.coastalhavenpartners.com`
- Footer link: "About CoastalHaven" → marketing site `/about` page

------

## 📊 Phase 4: Privacy & Permissions (Don't Leak Data)

In Bubble → Data → Privacy:

**CandidateProfile:**

- Everyone can see: `school_name`, `grad_year`, `major`, `interests`
- Only logged-in users can see: `gpa`, `full_name`
- Only the profile owner can see: `resume_url`, `status`

**Organization:**

- Everyone can see: `name`, `org_type`, `website`
- Only verified users can see: `primary_contact` email

**User:**

- Hide `email` from all searches (prevent scraping)
- Only show `full_name` to logged-in users

------

## 🚀 The MVP Execution Roadmap

### Week 1: Infrastructure

- [ ] Buy domain `coastalhavenpartners.com`
- [ ] Configure DNS (root → Vercel, app → Bubble CNAME)
- [ ] Clone Full Send repo, create new GitHub repo
- [ ] Initialize Bubble app

### Week 2: Marketing Site

- [ ] Replace all copy (hero, features, CTAs)
- [ ] Swap IconCloud logos (gather 20-30 firm/school SVGs)
- [ ] Update AnimatedBeam flow to Student → Verified → Firm
- [ ] Deploy to Vercel, connect custom domain

### Week 3: Bubble Core

- [ ] Build data types (User fields, CandidateProfile, Organization)
- [ ] Create signup flows (candidate + firm)
- [ ] Implement email verification workflow
- [ ] Build basic dashboard with two tabs

### Week 4: Polish & Test

- [ ] Match colors/fonts between platforms
- [ ] Add filters to tables (GPA, school, firm type)
- [ ] Seed database with 10 test candidates, 5 test firms
- [ ] Alpha test with 3-5 friends

### Week 5: Launch

- [ ] Invite first cohort (50 candidates, 10 firms)
- [ ] Monitor verification rates
- [ ] Iterate based on feedback

------

## 🎯 Why This Architecture Dominates

**For Candidates:**

- Slick Next.js site = "This is legit, not another spammy job board"
- Verified GPA system = "My credentials stand out"
- Direct firm contact = "No black hole applications"

**For Firms:**

- Prestige signaling (animations, polish) = "This is where serious people are"
- Excel-style data tables = "I can filter 200 candidates in 30 seconds"
- Pre-vetted .edu emails = "No fake profiles wasting my time"

**For You:**

- Rapid deployment (reuse existing template)
- No custom backend coding (Bubble handles auth + database)
- Scalable (add features like messaging, job posts, analytics later)

------

## 🔧 Next Action

Pick one:

**A) Start with the front-door (my recommendation):**

```bash
git clone <repo> coastal-haven-partners
cd coastal-haven-partners
pnpm dev
# Then start swapping copy + logos
```

**B) Validate the concept first:**

- Build Bubble app this weekend
- Deploy to `app-test.coastalhavenpartners.com`
- Test with 10 friends
- If it works, polish the Next.js frontend

Given your systematic approach, I'd go with **Option A** - the polished storefront helps you recruit your first cohort of high-quality candidates (which creates the network effect that makes firms want to join).

**Want me to draft the exact copy for your Hero section + feature cards, or would you rather start with the Bubble database schema as a detailed checklist?**