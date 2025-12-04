---
title: "LBO Modeling Fundamentals: How Private Equity Values Companies"
slug: lbo-modeling-fundamentals
excerpt: Private equity doesn't buy companies. It buys cash flows and levers them. Understanding LBO mechanics is essential for PE recruiting—and reveals how the buy-side actually thinks about value.
category: technical-interviews
tags: [LBO, private-equity, modeling, valuation, technical-interview, leveraged-buyout]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# LBO Modeling Fundamentals: How Private Equity Values Companies

A private equity firm pays $1 billion for a company. Five years later, they sell it for $2 billion.

Did they create $1 billion in value? Not exactly.

They put in $400 million of equity. They borrowed $600 million. The debt got paid down over five years. When they sold, the equity was worth $1.4 billion.

That's a 3.5x return on their $400 million. A 28% IRR.

This is the LBO model in action. It's the foundation of how private equity thinks about investments. Understanding it isn't optional for PE recruiting—it's the price of admission.

This guide covers LBO mechanics from the ground up. How the model works, why leverage creates returns, and how to build one yourself.

---

## What Is an LBO?

### The Basic Concept

A leveraged buyout is an acquisition funded primarily with debt.

**The typical structure:**
- 60-70% debt financing
- 30-40% equity from the PE fund
- The acquired company's cash flows service the debt
- The PE firm improves operations and eventually sells

**Why it works:**
- Debt is cheaper than equity (interest is tax-deductible)
- Leverage amplifies returns on equity
- Operational improvements increase value
- Multiple expansion can boost returns further

### The Three Levers of LBO Returns

PE returns come from three sources:

**1. Debt paydown**
The company generates cash flow. That cash pays down debt. The equity value grows as debt shrinks—even if enterprise value stays flat.

**2. EBITDA growth**
Improve operations. Cut costs. Grow revenue. Higher EBITDA means higher enterprise value at exit.

**3. Multiple expansion**
Buy at 8x EBITDA. Sell at 10x. The multiple increase directly boosts returns. (But don't count on it—it's not controllable.)

The best deals have all three. Realistic deals rely primarily on the first two.

### A Simple Example

**Acquisition:**
- Purchase price: $500M
- Debt: $300M (60%)
- Equity: $200M (40%)
- Entry EBITDA: $50M (10x multiple)

**After 5 years:**
- EBITDA grows to $70M (40% increase)
- Debt paid down to $150M
- Exit at 10x EBITDA = $700M enterprise value
- Equity value = $700M - $150M = $550M

**Returns:**
- Equity invested: $200M
- Equity at exit: $550M
- Multiple of money (MoM): 2.75x
- IRR: approximately 22%

That's the LBO in miniature.

---

## The LBO Model Structure

### The Five Building Blocks

Every LBO model has the same core components:

**1. Transaction assumptions**
- Purchase price and entry multiple
- Debt structure (amounts, rates, terms)
- Equity contribution
- Transaction fees

**2. Operating model**
- Revenue projections
- Expense assumptions
- EBITDA forecast
- Capital expenditures
- Working capital changes

**3. Debt schedule**
- Opening balances
- Mandatory amortization
- Optional prepayments (cash sweep)
- Interest expense calculations
- Closing balances

**4. Cash flow statement**
- Cash available for debt repayment
- Debt service coverage
- Ending cash balances

**5. Returns analysis**
- Exit assumptions
- Enterprise value at exit
- Equity value at exit
- IRR and MoM calculations

### The Flow of the Model

Here's how the pieces connect:

```
Transaction Assumptions
        ↓
  Sources & Uses
        ↓
   Operating Model
        ↓
   Free Cash Flow
        ↓
   Debt Schedule
        ↓
   Exit Analysis
        ↓
Returns (IRR / MoM)
```

Each section feeds the next. Transaction assumptions define the starting point. The operating model projects cash flows. Cash flows determine debt paydown. Debt paydown affects exit equity value. Exit equity value determines returns.

---

## Transaction Assumptions

### Purchase Price

How much are you paying?

**Approaches:**
- Entry multiple × LTM EBITDA
- Per-share price × shares outstanding (for public targets)
- Negotiated price based on comparable transactions

**Key inputs:**
- LTM (Last Twelve Months) EBITDA
- Entry EV/EBITDA multiple
- Any purchase price adjustments

### Sources and Uses

Where does the money come from? Where does it go?

**Uses of funds:**
- Purchase equity
- Refinance existing debt
- Transaction fees (advisory, financing, legal)
- Debt issuance costs

**Sources of funds:**
- Senior debt (Term Loan A, Term Loan B)
- Subordinated debt (mezzanine, high-yield bonds)
- Sponsor equity
- Management rollover equity
- Cash on balance sheet

**The rule:** Sources must equal uses. Always.

### Debt Structure

LBOs use multiple layers of debt with different characteristics.

| Debt Type | Typical Rate | Amortization | Security |
|-----------|--------------|--------------|----------|
| Revolving Credit | SOFR + 200-300 bps | None (drawn as needed) | First lien |
| Term Loan A | SOFR + 200-350 bps | 5-10% annually | First lien |
| Term Loan B | SOFR + 300-450 bps | 1% annually | First lien |
| High Yield Bonds | 6-10% fixed | Bullet (at maturity) | Second lien or unsecured |
| Mezzanine | 10-15% (cash + PIK) | Bullet | Subordinated |

**Key terms to understand:**

- **SOFR:** The reference rate replacing LIBOR
- **Amortization:** Required principal payments during the loan term
- **Bullet:** Principal due entirely at maturity
- **PIK:** Payment-in-kind—interest that accrues rather than being paid in cash
- **Cash sweep:** Mandatory prepayment from excess cash flow

### Leverage Ratios

How much debt is appropriate?

**Common metrics:**
- **Total Debt / EBITDA:** Overall leverage (typically 4-6x for LBOs)
- **Senior Debt / EBITDA:** First-lien leverage (typically 3-4x)
- **EBITDA / Interest:** Interest coverage (minimum 2.0x usually required)

**What determines leverage capacity:**
- Business stability and cash flow predictability
- Asset base for collateral
- Industry norms
- Credit market conditions
- Lender appetite

---

## The Operating Model

### Revenue Projections

How will the company grow?

**Approaches:**
- Historical growth rates
- Management projections
- Industry analysis
- Specific initiatives (new products, markets, pricing)

**Best practice:** Build a granular revenue model when possible. Units × price. Customers × revenue per customer. Segment by segment.

### EBITDA Bridge

How does revenue become EBITDA?

```
Revenue
- Cost of Goods Sold
= Gross Profit

- Operating Expenses
  - Sales & Marketing
  - General & Administrative
  - Research & Development
= EBITDA
```

**Margin assumptions matter.** A 100 bps improvement in EBITDA margin can significantly impact returns.

### The PE Value Creation Angle

PE firms don't just hold companies. They improve them.

**Common initiatives:**
- Cost reduction (procurement, headcount, facilities)
- Revenue growth (sales force expansion, pricing, new markets)
- Working capital optimization
- Add-on acquisitions
- Management changes

**In the model:** Reflect these initiatives explicitly. Show the bridge from current EBITDA to projected EBITDA.

### Capital Expenditures

Cash spent on long-term assets.

**Types:**
- **Maintenance capex:** Required to maintain current operations
- **Growth capex:** Investments to expand capacity or capabilities

**The PE preference:** Asset-light businesses with low capex requirements generate more free cash flow for debt paydown.

### Working Capital

Cash tied up in operations.

**The calculation:**
```
Working Capital = Current Assets - Current Liabilities
                = (AR + Inventory) - (AP + Accrued Expenses)
```

**Changes in working capital affect cash flow:**
- Increase in AR = cash outflow (you're waiting longer to collect)
- Increase in inventory = cash outflow (cash tied up in goods)
- Increase in AP = cash inflow (you're paying suppliers later)

**In LBO models:** Project working capital as a percentage of revenue, then calculate the year-over-year change.

---

## Free Cash Flow

### The Calculation

Free cash flow available for debt service:

```
EBITDA
- Capital Expenditures
- Change in Working Capital
- Cash Taxes
- Cash Interest
= Free Cash Flow
```

Some models also subtract:
- Management fees (paid to PE sponsor)
- Mandatory debt amortization

### Why FCF Matters

Free cash flow is what pays down debt. Higher FCF = faster deleveraging = better returns.

**The FCF conversion question:** What percentage of EBITDA converts to FCF?

- 80%+ conversion: Very attractive (low capex, stable working capital)
- 60-80%: Good (typical for healthy businesses)
- <60%: Challenging (high capex or working capital needs)

---

## The Debt Schedule

### Structure

The debt schedule tracks each debt tranche year by year:

```
Beginning Balance
+ New Borrowings
- Mandatory Amortization
- Optional Prepayments
= Ending Balance

Interest Expense = Average Balance × Interest Rate
```

### Mandatory Amortization

Required principal payments spelled out in the credit agreement.

**Typical terms:**
- Term Loan A: 5-10% annually
- Term Loan B: 1% annually (99% at maturity)
- High Yield: None until maturity

### Cash Sweep

Excess cash flow used to prepay debt.

**How it works:**
1. Calculate excess cash flow (FCF after required payments)
2. Apply sweep percentage (typically 50-75%)
3. Prepay debt in order of priority (usually senior first)

**The mechanics:**
```
Excess Cash Flow = FCF - Mandatory Amortization - Minimum Cash
Cash Sweep = Excess Cash Flow × Sweep Percentage
```

### Interest Calculations

Interest expense depends on debt type:

**Fixed rate debt:** Principal × Rate

**Floating rate debt:** Principal × (SOFR + Spread)
- Requires SOFR assumption for each year
- Or assume constant spread over current SOFR

**PIK interest:** Added to principal balance rather than paid in cash

### Circular References

Here's where LBO models get tricky.

**The circularity:**
1. Interest expense depends on debt balance
2. Debt balance depends on cash available for paydown
3. Cash available depends on interest expense

**Solutions:**
- Enable iterative calculations in Excel
- Use a circular reference breaker (toggle cell)
- Calculate interest on beginning balance (simplification)

---

## Exit Analysis

### Exit Assumptions

How and when does the PE firm sell?

**Key inputs:**
- Hold period (typically 3-7 years, most common is 5)
- Exit multiple (EV/EBITDA at sale)
- Exit EBITDA (from operating model)

### Exit Multiple Assumptions

What multiple will you achieve at exit?

**Conservative approach:** Assume exit multiple equals entry multiple. No multiple expansion.

**Base case:** Slight expansion if business has improved (better growth, margins, scale).

**Aggressive:** Significant expansion. (Dangerous to rely on this.)

### Calculating Exit Value

```
Exit Enterprise Value = Exit EBITDA × Exit Multiple

Exit Equity Value = Exit Enterprise Value - Net Debt at Exit

Net Debt = Total Debt - Cash
```

### The Returns Calculation

**Multiple of Money (MoM):**
```
MoM = Exit Equity Value / Initial Equity Investment
```

A 2.5x MoM means you got $2.50 back for every $1 invested.

**Internal Rate of Return (IRR):**

The discount rate that makes the NPV of cash flows equal zero.

```
Year 0: -$200M (equity investment)
Year 5: +$500M (equity proceeds)

IRR = 20.1%
```

**The relationship:**

| Hold Period | 2.0x MoM IRR | 2.5x MoM IRR | 3.0x MoM IRR |
|-------------|--------------|--------------|--------------|
| 3 years | 26% | 36% | 44% |
| 5 years | 15% | 20% | 25% |
| 7 years | 10% | 14% | 17% |

Same MoM, different hold periods = very different IRRs.

---

## Building the Model: Step by Step

### Step 1: Set Up Transaction

1. Input purchase price and entry multiple
2. Define debt structure (tranches, amounts, rates, terms)
3. Calculate equity required
4. Build sources and uses table
5. Verify sources = uses

### Step 2: Build Operating Model

1. Project revenue (5-7 years)
2. Project EBITDA and margins
3. Calculate D&A (often simplified as % of revenue)
4. Project capex
5. Project working capital changes
6. Calculate taxes

### Step 3: Calculate Free Cash Flow

1. Start with EBITDA
2. Subtract capex
3. Subtract working capital increase
4. Subtract cash taxes
5. Result: Cash available for debt service

### Step 4: Build Debt Schedule

1. Set up each debt tranche
2. Calculate mandatory amortization
3. Calculate interest expense
4. Determine cash available for optional paydown
5. Apply cash sweep
6. Calculate ending balances
7. Handle circular reference

### Step 5: Calculate Returns

1. Define exit year and multiple
2. Calculate exit enterprise value
3. Subtract ending net debt
4. Calculate equity proceeds
5. Compute IRR and MoM

### Step 6: Sensitivity Analysis

Test how returns change with different assumptions:

- Entry multiple: +/- 0.5x
- Exit multiple: +/- 0.5x
- Revenue growth: +/- 2%
- EBITDA margin: +/- 1%
- Leverage: +/- 0.5x turns

---

## Common Interview Questions

### The Quick LBO

"Walk me through a quick LBO."

**Answer:**
"An LBO is an acquisition funded primarily with debt. A PE firm might buy a company for $500M using $200M of equity and $300M of debt. The company's cash flows service and pay down the debt over the hold period. If EBITDA grows from $50M to $70M over five years, and debt is paid down to $150M, an exit at 10x EBITDA would yield $700M enterprise value. Subtract $150M of net debt, and equity is worth $550M—a 2.75x return on the $200M invested."

### Why Does Leverage Increase Returns?

**Answer:**
"Leverage amplifies equity returns because you're using other people's money to buy the asset. If you buy a company for $100M with all equity and sell for $150M, you make 50%. But if you buy with $40M equity and $60M debt, pay down $20M of debt, and sell for $150M, your equity is worth $110M ($150M - $40M debt). That's a 175% return on your $40M. Same asset appreciation, but leverage concentrated the returns to equity holders."

### What Makes a Good LBO Candidate?

**Answer:**
"Good LBO candidates have: stable, predictable cash flows to service debt; strong market position with defensible margins; low capex requirements so cash converts to debt paydown; opportunities for operational improvement; and a clear exit path. Asset-heavy businesses with volatile cash flows or high reinvestment needs make poor LBO candidates."

### How Do You Increase IRR?

**Answer:**
"Three main ways: increase exit value through EBITDA growth or multiple expansion; accelerate debt paydown through higher cash flow or lower interest; or reduce the hold period—same MoM over fewer years means higher IRR. The most controllable levers are operational improvements that boost EBITDA and cash flow."

---

## Paper LBO: The Interview Format

### What Is a Paper LBO?

Many PE interviews include a paper LBO—doing the analysis by hand without Excel.

**What they're testing:**
- Understanding of LBO mechanics
- Ability to do quick math
- Thought process and structure
- Performance under pressure

### The Approach

1. **Write down the key inputs** (purchase price, EBITDA, debt/equity split, growth rate, hold period, exit multiple)

2. **Calculate sources and uses** (how much debt, how much equity)

3. **Project EBITDA** (apply growth rate for each year)

4. **Estimate debt paydown** (FCF × hold period, roughly)

5. **Calculate exit value** (Exit EBITDA × Exit Multiple)

6. **Calculate equity value** (Exit EV - Remaining Debt)

7. **Calculate returns** (Exit Equity / Entry Equity = MoM)

### Simplifying Assumptions

For paper LBOs, make reasonable simplifications:

- Assume D&A = Capex (no cash impact)
- Ignore working capital changes
- Assume no cash taxes (or simple rate)
- Use rough FCF = EBITDA × 50-60%
- Round numbers liberally

### Practice Problem

**Given:**
- Purchase price: $1,000M
- Entry EBITDA: $100M (10x entry multiple)
- Debt: 60% ($600M at 5% interest)
- Equity: 40% ($400M)
- EBITDA growth: 5% annually
- Capex = D&A, ignore working capital
- 40% tax rate
- 5-year hold
- Exit at 10x EBITDA

**Solution:**

Year 5 EBITDA: $100M × (1.05)^5 = ~$128M

Free cash flow (rough):
- EBITDA: $128M (Year 5)
- Interest: $600M × 5% = $30M (simplified, decreasing)
- Taxes: (~$100M operating income) × 40% = $40M
- FCF: ~$50-60M per year

Total debt paydown over 5 years: ~$250-300M
Remaining debt: $600M - $275M = ~$325M

Exit EV: $128M × 10x = $1,280M
Exit Equity: $1,280M - $325M = $955M

MoM: $955M / $400M = 2.4x
IRR: ~19% (2.4x over 5 years)

---

## Common Mistakes

### Modeling Errors

**Circular reference crashes.** Not handling the interest/debt paydown circularity properly.

**Cash going negative.** Model allows debt paydown that exceeds available cash.

**Wrong tax treatment.** Interest is tax-deductible; principal payments are not.

**Ignoring transaction fees.** Fees increase equity required and reduce returns.

### Conceptual Errors

**Confusing enterprise value and equity value.** EV is total firm value; equity value is what the PE firm receives.

**Assuming multiple expansion.** Don't rely on selling at a higher multiple than you bought.

**Ignoring cyclicality.** Entry at peak EBITDA can destroy returns.

**Underestimating working capital needs.** Growing companies often need cash for working capital.

---

## The Bottom Line

LBO modeling is the language of private equity. It reveals how financial sponsors think about value creation: buy at a reasonable price, use leverage efficiently, improve operations, and generate returns through debt paydown and EBITDA growth.

**The core mechanics:**
- Debt funds 60-70% of the purchase
- Cash flows service and pay down debt
- Returns come from leverage, growth, and (maybe) multiple expansion
- IRR and MoM are the key metrics

**For interviews:**
- Know the structure cold
- Be able to do a paper LBO quickly
- Understand what drives returns
- Articulate what makes a good LBO candidate

The math isn't complicated. What matters is understanding why each piece matters and how they fit together.

Master the LBO, and you speak the language of PE. That's non-negotiable for breaking into the buy side.
