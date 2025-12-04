---
title: "The Investment Banking Case Study: Frameworks for Live Modeling Tests and Take-Home Assignments"
slug: investment-banking-case-study
excerpt: Case studies separate candidates who know concepts from candidates who can apply them. Whether you have 3 hours or 3 days, here's how to approach investment banking case studies—and what evaluators actually look for.
category: technical-interviews
tags: [case-study, modeling-test, investment-banking, interviews, technical-skills, valuation]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# The Investment Banking Case Study: Frameworks for Live Modeling Tests and Take-Home Assignments

You receive an email Friday evening: "Please complete the attached case study and return by Monday 9am."

The attachment contains a company overview, three years of financials, and instructions to value the business, recommend an offer price, and prepare a brief presentation.

Your weekend just disappeared.

Case studies are the highest-fidelity test in investment banking recruiting. They reveal whether you can actually do the work—not just answer questions about it. Technical interviews test knowledge; case studies test application.

This guide covers how to approach both timed live tests and take-home assignments, what evaluators prioritize, and the frameworks that produce strong work under pressure.

---

## Types of Case Studies

### Take-Home Case Studies

**Format:** Materials sent via email, typically 2-7 days to complete.

**Typical deliverables:**
- Excel model (DCF, LBO, or comps)
- PowerPoint presentation (5-15 slides)
- Written memo or recommendations

**What it tests:**
- Technical accuracy and modeling skill
- Presentation and communication
- Judgment and recommendations
- Work quality without time pressure

**Evaluation:** Thoroughness, accuracy, and polish matter. You have time—use it.

### Live/Timed Case Studies

**Format:** In-office or virtual, typically 1-3 hours.

**Typical structure:**
- Materials provided at start
- Work in Excel, sometimes Word or PowerPoint
- May include presentation to evaluators

**What it tests:**
- Speed and efficiency
- Ability to prioritize under pressure
- Core technical skills without references
- How you handle stress

**Evaluation:** Completeness and judgment matter more than perfection. Evaluators understand time constraints.

### Paper LBOs

**Format:** 15-30 minutes, pen and paper or whiteboard.

**What you're given:**
- Purchase price and financial metrics
- Debt structure and terms
- Exit assumptions

**What you produce:**
- IRR and multiple of money calculation
- Sensitivity to key assumptions

**What it tests:**
- Mental math and estimation
- Understanding of LBO mechanics
- Ability to think under pressure

---

## The General Framework

### Step 1: Read Everything First

Before touching Excel, read all materials completely.

**What to look for:**
- Exactly what deliverables are required
- What information is provided vs. what you need to assume
- Any specific instructions or constraints
- Hints about what the evaluator cares about

**Common mistake:** Jumping into modeling before understanding what's being asked.

### Step 2: Plan Your Approach

Allocate your time before starting work.

**For a 3-hour live case:**
- 15 minutes: Read and plan
- 90 minutes: Build model
- 30 minutes: Develop recommendations
- 30 minutes: Prepare presentation (if required)
- 15 minutes: Review and quality check

**For a weekend take-home:**
- Day 1: Read materials, research company/industry, plan approach
- Day 2: Build model, iterate on assumptions
- Day 3: Develop presentation, refine recommendations, quality check

### Step 3: Execute Methodically

Work through the case systematically.

**Model building order:**
1. Historical financials (if needed)
2. Revenue and operating projections
3. Working capital and capex
4. Debt schedule (if applicable)
5. Valuation output
6. Sensitivity analysis

### Step 4: Develop a Point of View

The case isn't just about the math—it's about your judgment.

**Questions to answer:**
- What is this company worth?
- Would you recommend this investment/acquisition?
- What are the key risks?
- What additional information would you want?

### Step 5: Present Clearly

Your output should be professional and easy to follow.

**Model standards:**
- Clear labels and organization
- Assumptions documented
- No hardcoded numbers in formulas
- Error checks where possible

**Presentation standards:**
- Executive summary upfront
- Key findings and recommendations clear
- Supporting analysis available
- Professional formatting

---

## DCF Case Study Approach

### What You're Typically Given

- 2-3 years of historical financials
- Industry information or context
- Sometimes management projections
- Sometimes comparable company data

### Building the Model

**Revenue projections:**
- Understand revenue drivers
- Project 5-10 years forward
- Support growth assumptions with reasoning

**Operating projections:**
- Gross margin (may be given or assumed)
- Operating expenses as % of revenue or specific line items
- EBITDA margin trajectory

**Working capital:**
- Days sales outstanding (receivables)
- Days inventory outstanding
- Days payables outstanding
- Calculate annual working capital change

**Capital expenditures:**
- As % of revenue, or specific projections
- Maintenance vs. growth capex if relevant

**Free cash flow:**
```
FCF = EBIT × (1 - Tax Rate) + D&A - Capex - Change in NWC
```

**Terminal value:**
- Perpetuity growth method (more common)
- Exit multiple method
```
TV (perpetuity) = FCF × (1 + g) / (WACC - g)
```

**WACC:**
- Cost of equity: CAPM (Risk-free + Beta × Market Risk Premium)
- Cost of debt: Interest rate × (1 - Tax Rate)
- Weight by target capital structure

**Enterprise value:**
```
EV = PV of projected FCFs + PV of Terminal Value
```

### Common DCF Mistakes

**Unrealistic assumptions:**
- Terminal growth above GDP growth
- Margins expanding forever
- No normalization of capex

**Mechanical errors:**
- Wrong discounting periods (mid-year vs. end-of-year)
- Inconsistent assumptions
- Circular references without iteration

**Missing components:**
- No sensitivity analysis
- No sanity check against comparables
- Assumptions not documented

---

## LBO Case Study Approach

### What You're Typically Given

- Target company financials
- Purchase price or valuation guidance
- Debt structure parameters
- Exit assumptions

### Building the Model

**Sources and uses:**
```
Sources = Uses
Debt + Equity = Purchase Price + Fees + Cash to Balance Sheet
```

**Operating model:**
- Revenue and EBITDA projections
- Working capital and capex
- Free cash flow generation

**Debt schedule:**
- Interest expense by tranche
- Mandatory amortization
- Cash flow sweep (if applicable)
- Revolver draws/repayments

**Returns calculation:**
```
Exit Equity Value = Exit EV - Net Debt at Exit
MOIC = Exit Equity / Entry Equity
IRR = Internal rate of return on equity cash flows
```

### Key LBO Outputs

**Entry metrics:**
- Purchase price / EBITDA
- Debt / EBITDA
- Equity contribution

**Exit metrics:**
- Exit price / EBITDA
- Net debt at exit
- Exit equity value

**Returns:**
- IRR (20%+ typically attractive)
- Multiple of invested capital (2.0x+ typically attractive)

### Sensitivity Analysis

**Key sensitivities for LBO:**
- Entry multiple vs. exit multiple
- Revenue growth vs. EBITDA margin
- Exit timing (3 years vs. 5 years vs. 7 years)
- Debt paydown assumptions

---

## Comparable Company Analysis

### Building Comps

**Select comparable companies:**
- Similar business model
- Similar size
- Similar growth profile
- Same industry/sector

**Calculate trading multiples:**
- EV / Revenue
- EV / EBITDA
- P / E
- Relevant sector multiples

**Apply to target:**
- Identify appropriate multiple
- Apply to target's metrics
- Calculate implied valuation range

### Comps Mistakes to Avoid

**Poor company selection:**
- Companies aren't actually comparable
- Too few companies (need 5+ typically)
- No acknowledgment of differences

**Stale data:**
- Using outdated share prices
- Not adjusting for recent events

**No adjustments:**
- Applying mean/median without thinking about where target fits
- Ignoring why target might deserve premium/discount

---

## The Paper LBO

### The Standard Format

You're given key metrics and 15-30 minutes.

**Typical information:**
- Purchase price: 10x EBITDA ($500M EV on $50M EBITDA)
- Debt: 6x EBITDA ($300M)
- EBITDA growth: 5% annually
- Exit: 5 years at same multiple

**What to calculate:**
- Entry equity
- Exit EBITDA and enterprise value
- Debt paydown (simplified)
- Exit equity
- MOIC and IRR

### Mental Math Approach

**Entry:**
- EV = $500M
- Debt = $300M
- Equity = $200M

**Exit (Year 5):**
- EBITDA = $50M × (1.05)^5 ≈ $64M
- Exit EV = $64M × 10 = $640M
- Assume debt paid to $200M (simplified)
- Exit Equity = $640M - $200M = $440M

**Returns:**
- MOIC = $440M / $200M = 2.2x
- IRR ≈ 17% (use rule of 72: doubling in ~4.5 years ≈ 16%)

### Paper LBO Shortcuts

**Rule of 72:**
To double your money at X% return, takes 72/X years.
- 20% IRR → 3.6 years to double
- 25% IRR → 2.9 years to double

**Quick IRR estimation:**
- 2.0x in 3 years ≈ 26% IRR
- 2.0x in 5 years ≈ 15% IRR
- 2.5x in 5 years ≈ 20% IRR
- 3.0x in 5 years ≈ 25% IRR

---

## Making Recommendations

### What Evaluators Want

Beyond technical correctness, evaluators assess your judgment.

**Strong recommendations include:**
- Clear answer (buy/don't buy, acceptable price range)
- Key factors driving the recommendation
- Risks and mitigants
- What additional information you'd want

### Structuring Your Recommendation

**Format:**
1. Bottom line recommendation (first)
2. Valuation summary (DCF, comps, LBO implied values)
3. Key investment considerations (bull case)
4. Key risks (bear case)
5. Process considerations (if applicable)

**Example:**
"Based on my analysis, the target is worth $450-550 million. At the proposed price of $500 million, I would proceed with the acquisition because [reasons]. Key risks include [risks], which I would mitigate by [approaches]."

### Common Judgment Mistakes

**No clear recommendation:**
"It depends on several factors..." is not helpful. Make a call.

**Ignoring obvious risks:**
Every investment has risks. Acknowledge them.

**Overconfidence:**
Acknowledge uncertainty and sensitivity of conclusions to assumptions.

---

## Time Management

### For Timed Cases

**Hour 1 (if 3-hour case):**
- Read everything (15 min)
- Set up model structure (15 min)
- Input historical data (15 min)
- Build revenue and operating projections (15 min)

**Hour 2:**
- Complete operating model (20 min)
- Build valuation (DCF, comps, or LBO) (40 min)

**Hour 3:**
- Sensitivity analysis (15 min)
- Develop recommendations (15 min)
- Prepare output/presentation (20 min)
- Review and check (10 min)

### For Take-Home Cases

**Don't wait until the deadline.**
Start immediately. You'll find questions you need to think about, and you want buffer time for unexpected issues.

**Iterate:**
First pass won't be perfect. Build, review, refine.

**Get fresh eyes:**
After sleeping on it, review again. You'll catch errors.

---

## Presentation Tips

### If Presenting Your Work

**Know your model cold:**
Evaluators will ask detailed questions. Know where every number comes from.

**Lead with conclusions:**
Don't walk through model build sequentially. Start with recommendation, then support it.

**Handle questions professionally:**
If you don't know something, say so. Offer to show how you'd figure it out.

### Slide Deck Best Practices

**Executive summary slide:**
Key recommendation, valuation range, critical factors.

**Valuation slides:**
Methodology, key assumptions, output, sensitivity.

**Appendix:**
Supporting details, additional analysis, data sources.

**Formatting:**
Clean, professional, consistent. No typos. Labeled axes on charts.

---

## Quality Control Checklist

### Before Submitting

**Model checks:**
- [ ] Formulas work (no errors)
- [ ] Assumptions are reasonable and documented
- [ ] Balance sheet balances (if included)
- [ ] Sensitivity analysis included
- [ ] No hardcoded numbers in formulas

**Output checks:**
- [ ] Valuation makes sense (sanity check against comps or intuition)
- [ ] Recommendation is clear
- [ ] Risks acknowledged
- [ ] Professional formatting

**Mechanical checks:**
- [ ] Correct file names
- [ ] All requested deliverables included
- [ ] Submitted before deadline

### Common Errors to Catch

**Math errors:**
- Signs wrong (adding when should subtract)
- Units inconsistent (millions vs. thousands)
- Dates/periods misaligned

**Logic errors:**
- Terminal growth > WACC (model breaks)
- Negative free cash flow treated incorrectly
- Circular references causing errors

**Presentation errors:**
- Typos in client or company names
- Charts with unclear labels
- Missing sources or assumptions

---

## What Evaluators Actually Assess

### Technical Execution (40%)

- Model structure and organization
- Accuracy of calculations
- Appropriate methodology selection
- Reasonable assumptions

### Judgment and Recommendations (30%)

- Quality of investment recommendation
- Identification of key drivers
- Recognition of risks
- Business sense and intuition

### Communication (20%)

- Clarity of presentation
- Professional quality of output
- Ability to explain and defend work
- Written/verbal communication

### Process and Efficiency (10%)

- Time management
- Ability to prioritize
- Handling of pressure
- Response to questions or feedback

---

## Practice Approach

### Before the Case Study

**Technical preparation:**
- Practice building models from scratch
- Time yourself on DCF, LBO, comps
- Know shortcuts and formulas cold

**Mental preparation:**
- Accept that you won't do everything perfectly
- Prioritize completeness over perfection
- Stay calm under pressure

### Practice Cases

**Where to find cases:**
- Wall Street Prep, Breaking Into Wall Street (paid)
- Company 10-Ks for DIY practice
- Your school's finance club resources
- Online banking prep communities

**How to practice:**
- Set timer, simulate real conditions
- Review your work critically
- Focus on weak areas

---

## Key Takeaways

Case studies reveal whether you can actually do investment banking work—not just talk about it.

**The general approach:**
1. Read everything before starting
2. Plan your time allocation
3. Execute methodically
4. Develop a clear recommendation
5. Present professionally
6. Quality check before submitting

**What matters most:**
- Technical competence (model works and makes sense)
- Business judgment (sensible recommendations)
- Communication (clear and professional output)

**Time management:**
- In timed cases, completeness beats perfection
- In take-home cases, you're expected to be thorough and polished

**The ultimate test:**
Could this work be shown to a client? If your case study output looks like real banking work product, you've succeeded.

Walk in prepared. Stay calm. Show you can do the work. That's what case studies are for.
