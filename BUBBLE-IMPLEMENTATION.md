# Bubble.io Portal - Quick Start Guide

**Goal**: Build a working prototype of the Coastal Haven Partners portal to validate the concept before rebranding the marketing site.

**Timeline**: This weekend (6-8 hours total)

## TL;DR Checklist

| Step | What happens | Est. time | Status |
| --- | --- | --- | --- |
| 1 | Create Bubble app + configure settings | 15 min | Not started |
| 2 | Build data types (User, CandidateProfile, Organization) | 45 min | Not started |
| 3 | Ship candidate signup + verification flow | 90 min | Not started |
| 4 | Stand up dashboard (tabs + filters) | 120 min | Not started |
| 5 | Lock privacy rules + seed sample data | 60 min | Not started |
| 6 | Deploy to live + wire domains | 30 min | Not started |

_Update the status column as you move so everyone stays aligned. For positioning guidance revisit `[overview.md](overview.md)` and for the broader delivery plan check `[ROADMAP.md](ROADMAP.md)`._

---

## Prerequisites

- [ ] Bubble.io account (free tier is fine for now)
- [ ] Domain purchased (for custom domain later)
- [ ] Basic understanding of no-code platforms (Bubble has great tutorials)

**Asset handoff:** store approved logos, favicons, and OG images in `apps/www/public/brand/` inside the Next.js repo. When Bubble needs an asset (nav logo, favicons), download from that folder so both platforms stay in sync.

---

## Part 1: Initial Setup (15 minutes)

### 1.1 Create Bubble App

1. Go to https://bubble.io
2. Sign up / Log in
3. Click "Create an app"
4. App name: `coastal-haven-partners`
5. Choose template: **Blank** (we're building from scratch)
6. Click "Create"

### 1.2 App Settings

**Settings → General**:
- App name: "Coastal Haven Partners"
- Application type: "Public" (for now)
- Timezone: Your timezone

**Settings → Languages**:
- Primary language: English

**Settings → SEO/metatags**:
- Skip for now (prototype phase)

---

## Part 2: Database Schema (45 minutes)

Bubble's database is in **Data → Data types**. We'll create 3 custom types.

### 2.1 Extend Built-in User Type

Go to **Data → Data types → User**

Click "Create a new field" and add:

| Field Name | Field Type | Notes |
|------------|-----------|-------|
| `role` | Option Set | Create new: candidate, firm, school, admin |
| `full_name` | text | - |
| `email_verified` | yes/no | Default: no |

**To create Option Set for `role`:**
1. When selecting field type, choose "Option set"
2. Click "Create a new option set"
3. Name: "UserRole"
4. Options:
   - `candidate` (display: "Candidate")
   - `firm` (display: "Firm")
   - `school` (display: "School")
   - `admin` (display: "Admin")
5. Save

### 2.2 Create CandidateProfile Data Type

Go to **Data → Data types → Create a new type**

Type name: `CandidateProfile`

Add these fields:

| Field Name | Field Type | Notes |
|------------|-----------|-------|
| `user` | User | This links to User table |
| `school_name` | text | e.g., "Wharton" |
| `gpa` | number | 0-4.0 scale |
| `grad_year` | number | e.g., 2025 |
| `major` | text | e.g., "Finance" |
| `interests` | text (list) | Multiple values allowed |
| `resume_url` | file | Optional attachment |
| `status` | Option Set | Create new: Seeking, Signed, Alumni |

**To create interests as a list:**
- Field type: text
- Check "This field is a list (multiple entries)"

**To create status Option Set:**
- Name: "CandidateStatus"
- Options:
  - `seeking` (display: "Seeking")
  - `signed` (display: "Signed")
  - `alumni` (display: "Alumni")

### 2.3 Create Organization Data Type

Create a new type: `Organization`

Add these fields:

| Field Name | Field Type | Notes |
|------------|-----------|-------|
| `name` | text | e.g., "Blackstone" |
| `org_type` | Option Set | Create new: PE Firm, VC Firm, Bank, Career Services |
| `asset_class` | text | e.g., "Buyout" (optional) |
| `website` | text | e.g., "blackstone.com" |
| `primary_contact` | User | Link to User |
| `city` | text | e.g., "New York" |
| `aum_range` | Option Set | Create new: $100M-$500M, $500M-$2B, $2B+ |

**Option Set for org_type:**
- Name: "OrgType"
- Options: PE Firm, VC Firm, Bank, Career Services

**Option Set for aum_range:**
- Name: "AUMRange"
- Options: $100M-$500M, $500M-$2B, $2B+

---

## Part 3: Authentication Pages (90 minutes)

### 3.1 Create Signup Page (Candidate)

**Pages → Create new page**
- Page name: `signup-candidate`
- Clone from: Blank page

**Design the page:**

1. **Add a Group** (for centering):
   - Type: Group
   - Layout: Column
   - Alignment: Center
   - Width: 400px
   - Padding: 20px

2. **Add Text element** for title:
   - Content: "Join as a Candidate"
   - Font size: 32px
   - Bold: yes

3. **Add Input fields** (one for each):
   - Email (type: email)
   - Password (type: password, "Password" checkbox)
   - Full Name (type: text)
   - School Name (type: text)
   - GPA (type: number, min: 0, max: 4.0)
   - Graduation Year (type: number)
   - Major (type: text)

4. **Add Button**:
   - Text: "Create Account"
   - Primary style: yes

**Create Workflow** (click the button → "Start/Edit workflow"):

Action 1: **Sign the user up**
- Email: `Input Email's value`
- Password: `Input Password's value`
- Uncheck "Log the user in"

Action 2: **Create a new thing**
- Type: CandidateProfile
- Fields:
  - `user` = `Result of step 1 (Sign the user up)`
  - `full_name` = `Input Full Name's value`
  - `school_name` = `Input School's value`
  - `gpa` = `Input GPA's value`
  - `grad_year` = `Input Grad Year's value`
  - `major` = `Input Major's value`
  - `status` = `Seeking` (set default)

Action 3: **Make changes to a thing**
- Thing: `Result of step 1 (Sign the user up)`
- Changes:
  - `role` = `candidate`
  - `full_name` = `Input Full Name's value`

Action 4: **Send email** (Bubble built-in)
- To: `Result of step 1's email`
- Subject: "Verify your email - Coastal Haven Partners"
- Body: (use default verification template)
- Include verification link: **Yes**

Action 5: **Navigate to page**
- Destination: `check-email` (we'll create this)

### 3.2 Create "Check Email" Page

**Pages → Create new page**
- Page name: `check-email`

Add text:
```
Check your email

We've sent a verification link to your email address.
Please verify your email to access your dashboard.
```

### 3.3 Email Verification Landing Page

Bubble automatically creates this. Configure it:

**Settings → Email → Email verification**
- Enable: Yes
- Redirect to page: `dashboard` (we'll create this)

When user clicks verification link in email:
- Bubble auto-sets `email_verified` to `yes`
- Redirects to dashboard

### 3.4 Create Login Page

**Pages → Create new page**
- Page name: `login`

**Design:**
1. Add title: "Login"
2. Add Input: Email
3. Add Input: Password
4. Add Button: "Log In"

**Workflow** (button click):

Action 1: **Log the user in**
- Email: `Input Email's value`
- Password: `Input Password's value`

Action 2: **Navigate to page**
- Destination: `dashboard`
- Only when: `Current User's email_verified is yes`

Action 2b: **Navigate to page** (add another action)
- Destination: `check-email`
- Only when: `Current User's email_verified is no`

### 3.5 Create Firm Signup (Optional for MVP)

For now, you can duplicate `signup-candidate` and modify:
- Page name: `signup-firm`
- Skip CandidateProfile creation
- Just create User with `role = firm`
- Add fields for company name, position

---

## Part 4: Dashboard Interface (2 hours)

### 4.1 Create Dashboard Page

**Pages → Create new page**
- Page name: `dashboard`
- Clone from: Blank

**Page Settings:**
- This page can be accessed by: "Everyone" → Change to "Users logged in"

### 4.2 Top Navigation Bar

1. **Add a Group** (full width, height: 60px):
   - Background color: #0F172A (dark blue)
   - Layout: Row
   - Padding: 10px 20px

2. **Add Text** (logo/brand):
   - Content: "Coastal Haven"
   - Color: white
   - Font size: 20px
   - Bold: yes

3. **Add Text** (user name):
   - Content: `Current User's full_name`
   - Color: white
   - Align: right

4. **Add Link** (logout):
   - Text: "Logout"
   - Workflow: Log the user out → Navigate to `login`

### 4.3 Tab Navigation

Below the nav bar, add:

1. **Add a Group** (for tabs):
   - Layout: Row
   - Height: 50px

2. **Add Text** (Candidates tab):
   - Content: "Candidates"
   - Clickable: yes
   - Workflow: Set state → `dashboard_tab` = "candidates"

3. **Add Text** (Firms tab):
   - Content: "Firms"
   - Clickable: yes
   - Workflow: Set state → `dashboard_tab` = "firms"

**To create custom state:**
- Click page background → Workflow tab → Custom states
- Create state: `dashboard_tab` (type: text, default: "candidates")

### 4.4 Candidates Tab Content

**Add a Group** (main content area):
- Visible when: `dashboard's dashboard_tab is "candidates"`
- Layout: Column

**Add Repeating Group** (table of candidates):
- Type of content: CandidateProfile
- Data source: `Do a search for CandidateProfile`
  - Constraint: `user's email_verified = yes`
- Layout: Full list (vertical scrolling)
- Rows: 20

**Inside the Repeating Group cell**, add Text elements:
- `Current cell's user's full_name`
- `Current cell's school_name`
- `Current cell's gpa`
- `Current cell's grad_year`
- `Current cell's major`

**Add table headers** (above the repeating group):
- Text elements: "Name | School | GPA | Grad Year | Major"

### 4.5 Firms Tab Content

**Add a Group**:
- Visible when: `dashboard's dashboard_tab is "firms"`

**Add Repeating Group**:
- Type: Organization
- Data source: `Do a search for Organization`
  - Constraint: `org_type ≠ Career Services` (optional)

**Inside cells**, display:
- `Current cell's name`
- `Current cell's org_type's display`
- `Current cell's city`
- `Current cell's website`

### 4.6 Add Filters (Candidates Tab)

Above the Candidates repeating group, add:

1. **Dropdown** (School filter):
   - Choices: `Do a search for CandidateProfile`
   - Option caption: `This CandidateProfile's school_name`
   - Make list unique: yes

2. **Slider Input** (GPA filter):
   - Min: 0
   - Max: 4.0
   - Initial: 0

3. **Dropdown** (Grad Year):
   - Manual choices: 2025, 2026, 2027, 2028

**Update Repeating Group Data Source:**
```
Do a search for CandidateProfile
  Constraints:
    - user's email_verified = yes
    - school_name = Dropdown School's value (Only when dropdown is not empty)
    - gpa ≥ Slider GPA's value
    - grad_year = Dropdown Year's value (Only when dropdown is not empty)
```

---

## Part 5: Privacy Rules (30 minutes)

Critical for protecting user data!

Go to **Data → Privacy**

### 5.1 User Privacy

Click **User** → New rule

**Rule 1: Hide emails**
- When: Everyone
- Find this in searches: ❌
- View all fields: ✅
- Except for: `email` ❌

**Rule 2: Only show verified users**
- When: Current User is logged in
- Find this in searches: ✅
- View all fields: ✅

### 5.2 CandidateProfile Privacy

**Rule 1: Public basic info**
- When: Everyone
- Find this in searches: ✅
- View fields: `school_name`, `grad_year`, `major`, `interests` only

**Rule 2: Logged-in users see more**
- When: Current User is logged in
- View fields: Add `gpa`, `full_name`

**Rule 3: Owner sees everything**
- When: Current User = This CandidateProfile's user
- View all fields: ✅
- Modify all fields: ✅

### 5.3 Organization Privacy

**Rule 1: Public directory info**
- When: Everyone
- View fields: `name`, `org_type`, `website`, `city`

**Rule 2: Verified users see contact**
- When: Current User is logged in and Current User's email_verified = yes
- View fields: Add `primary_contact`

---

## Part 6: Testing (45 minutes)

### 6.1 Preview Mode

Click **Preview** button (top right)

### 6.2 Test Signup Flow

1. Go to `/signup-candidate` page
2. Fill out form with fake data:
   - Email: Use a real email you can access
   - Password: test123
   - Name: John Doe
   - School: Harvard
   - GPA: 3.8
   - Grad Year: 2025
   - Major: Finance

3. Click "Create Account"
4. Should redirect to "Check Email" page
5. Check your email for verification link
6. Click verification link
7. Should redirect to dashboard

### 6.3 Test Dashboard

1. Verify you see the Candidates tab
2. Should see your own profile in the list
3. Try switching to Firms tab (empty for now)

### 6.4 Create Test Data

**Data → App Data → CandidateProfile**

Click "New entry" and manually create 5-10 test candidates:
- Make sure to set `user's email_verified = yes`
- Vary GPA, school, grad year

**Create test firms:**
- Create Users with `role = firm`
- Create Organization entries linked to those users

### 6.5 Test Filters

1. Go back to dashboard
2. Try filtering by school
3. Try filtering by GPA (move slider)
4. Verify results update correctly

---

## Part 7: Deploy & Domain (30 minutes)

### 7.1 Deploy to Live

1. Click **Deploy** button (top right)
2. Review changes
3. Click "Deploy to live"
4. Wait 30-60 seconds

Your app is now live at: `your-app-name.bubbleapps.io`

### 7.2 Configure Custom Domain (Optional for now)

**Only do this if you're ready to commit:**

1. Go to your domain registrar (Namecheap, etc.)
2. Add CNAME record:
   ```
   Type: CNAME
   Host: app
   Value: proxy.bubbleapps.io
   TTL: Auto
   ```

3. In Bubble → Settings → Domain/email:
   - Click "Custom domains"
   - Add domain: `app.coastalhavenpartners.com`
   - Click "Initialize"
   - Wait for SSL certificate (5-10 minutes)

4. Test: Visit `app.coastalhavenpartners.com`

---

## Quick Validation Checklist

After completing all steps, you should have:

- ✅ Signup flow that creates User + CandidateProfile
- ✅ Email verification working
- ✅ Login that checks email_verified status
- ✅ Dashboard with two tabs (Candidates, Firms)
- ✅ Candidate table showing verified profiles
- ✅ Filters working (school, GPA, grad year)
- ✅ Privacy rules protecting sensitive data
- ✅ 10+ test candidates in database
- ✅ App deployed to live version

---

## Common Bubble Issues & Fixes

### Email verification not working
- Check Settings → Email → Enable email authentication
- Make sure you're using a real email address
- Check spam folder
- For testing: Settings → Email → Use test email (bubble sends to admin)

### Can't see data in repeating group
- Check privacy rules (most common issue!)
- Verify data source has actual records
- Use debugger: Click "Inspect" in preview mode

### Filters not working
- Check "Only when" conditions on constraints
- Make sure dropdown values match database values exactly
- Clear browser cache

### Custom domain not working
- Wait 24-48 hours for DNS propagation
- Verify CNAME record is correct: `proxy.bubbleapps.io` (no http://)
- Check SSL certificate status in Bubble settings

---

## Next Steps After Validation

Once you confirm the Bubble portal works:

1. **Add firm signup flow** (duplicate candidate signup)
2. **Build "Request Intro" feature** (create Connection records)
3. **Add messaging** between candidates and firms
4. **Polish the UI** (colors, spacing, professional styling)
5. **Rebrand the Next.js marketing site** (see main ROADMAP.md)

---

## Time Estimate Breakdown

- **Part 1** (Setup): 15 min
- **Part 2** (Database): 45 min
- **Part 3** (Auth pages): 90 min
- **Part 4** (Dashboard): 120 min
- **Part 5** (Privacy): 30 min
- **Part 6** (Testing): 45 min
- **Part 7** (Deploy): 30 min

**Total**: ~6 hours

---

## Resources

**Bubble.io Tutorials** (highly recommended to watch first):
- Bubble 101: https://bubble.io/lessons
- Building a marketplace: https://bubble.io/lessons/marketplace-tutorial
- Privacy rules explained: https://bubble.io/lessons/privacy-rules

**Community Help**:
- Bubble Forum: https://forum.bubble.io/
- Bubble Documentation: https://manual.bubble.io/

**Pro Tips**:
- Save often (Ctrl+S or Cmd+S)
- Use Chrome for best compatibility
- Duplicate elements instead of rebuilding
- Test in incognito to clear sessions
- Use the debugger (Step-by-step mode)
