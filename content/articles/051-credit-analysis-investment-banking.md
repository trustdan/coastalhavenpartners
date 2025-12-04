---
title: "Credit Analysis for Investment Banking: Understanding Debt, Leverage, and Credit Metrics"
slug: credit-analysis-investment-banking
excerpt: Every LBO, every debt raise, every restructuring depends on credit analysis. If you can't evaluate whether a company can service its debt, you're missing half the picture. Here's what you need to know.
category: technical-interviews
tags: [credit-analysis, debt, leverage, credit-metrics, technical-interviews, leveraged-finance]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# Credit Analysis for Investment Banking: Understanding Debt, Leverage, and Credit Metrics

A company with $100 million in EBITDA might be a great equity investment and a terrible credit.

The equity investor asks: "How much can this company grow?"
The credit investor asks: "Can this company pay me back?"

These are fundamentally different questions. Investment bankers need to answer both.

Credit analysis matters for leveraged buyouts, debt capital markets, restructuring, and M&A financing. If you can build a DCF but can't evaluate whether a company can support its debt load, you're missing critical skills.

Here's how credit analysis works—the metrics, the frameworks, and the judgment calls that separate good analysis from bad.

---

## The Credit Mindset

### Equity vs. Credit Perspective

**Equity investors** care about upside. They want growth, expanding margins, and increasing cash flows. They benefit from volatility that might produce outsized returns.

**Credit investors** care about downside. They want stability, predictability, and certainty of repayment. They're hurt by volatility because they don't participate in upside but bear downside risk.

**The asymmetry:**
- Equity upside: Unlimited
- Equity downside: 100% loss
- Credit upside: Capped at interest + principal
- Credit downside: 100% loss

This asymmetry explains why credit analysis focuses on what can go wrong rather than what can go right.

### The Fundamental Question

Credit analysis answers one question: **Can this borrower repay its obligations?**

This breaks into sub-questions:
- Can the company generate enough cash flow to service interest?
- Can it repay or refinance principal at maturity?
- What happens if business deteriorates?
- What protections exist if things go wrong?

---

## Key Credit Metrics

### Leverage Ratios

Leverage ratios measure how much debt a company has relative to its earnings or assets.

**Debt / EBITDA (Total Leverage):**
The most common leverage metric.

```
Debt / EBITDA = Total Debt / LTM EBITDA
```

- 2-3x: Conservative leverage
- 4-5x: Moderate leverage
- 6-7x: High leverage (typical for LBOs)
- 8x+: Very high leverage

**Net Debt / EBITDA (Net Leverage):**
Adjusts for cash on balance sheet.

```
Net Debt / EBITDA = (Total Debt - Cash) / LTM EBITDA
```

More relevant when companies hold significant cash balances.

**Senior Debt / EBITDA:**
Measures only senior (first priority) debt against earnings. Important for understanding senior lender exposure.

**Debt / Total Capitalization:**
Debt as percentage of total capital (debt + equity).

```
Debt / Cap = Total Debt / (Total Debt + Equity Value)
```

### Coverage Ratios

Coverage ratios measure the company's ability to service its debt obligations.

**Interest Coverage (EBITDA / Interest):**
How many times can the company cover its interest expense?

```
Interest Coverage = EBITDA / Interest Expense
```

- 4x+: Strong coverage
- 2-3x: Adequate coverage
- 1-2x: Weak coverage
- <1x: Cannot cover interest from operations

**Fixed Charge Coverage:**
Broader measure including other fixed obligations.

```
Fixed Charge Coverage = (EBITDA - Capex) / (Interest + Required Amortization)
```

More conservative because it accounts for capital expenditure needs.

**Debt Service Coverage:**
Cash flow available for all debt service.

```
DSCR = (EBITDA - Capex - Taxes) / (Interest + Principal Repayment)
```

### Cash Flow Metrics

Cash flow metrics assess actual cash generation relative to obligations.

**Free Cash Flow (FCF):**
```
FCF = EBITDA - Capex - Interest - Taxes - Working Capital Changes
```

**FCF / Debt:**
How quickly could the company pay down debt from free cash flow?

```
FCF / Debt = Free Cash Flow / Total Debt
```

- 10%+: Strong deleveraging capacity
- 5-10%: Moderate deleveraging
- <5%: Limited deleveraging capacity

**Cash Flow to Debt Service:**
Can the company service all debt obligations from cash flow?

### Liquidity Metrics

Liquidity metrics assess short-term financial flexibility.

**Current Ratio:**
```
Current Ratio = Current Assets / Current Liabilities
```
Above 1.0x indicates current assets exceed current liabilities.

**Quick Ratio:**
```
Quick Ratio = (Cash + Receivables) / Current Liabilities
```
Excludes inventory for more conservative view.

**Revolver Availability:**
Undrawn capacity on revolving credit facilities provides liquidity cushion.

---

## Credit Analysis Framework

### Step 1: Understand the Business

Credit quality starts with business quality.

**Key questions:**
- How stable and predictable is revenue?
- What's the competitive position?
- How cyclical is the industry?
- What's the customer concentration?
- Are there long-term contracts or recurring revenue?

**Better credits have:**
- Recurring/subscription revenue
- Diverse customer base
- Market leadership
- High switching costs
- Low cyclicality

**Weaker credits have:**
- Project-based or transactional revenue
- Customer concentration
- Commodity exposure
- High fixed costs with volume variability

### Step 2: Analyze Historical Performance

Past performance reveals patterns.

**What to examine:**
- Revenue stability and growth
- Margin consistency
- Working capital patterns
- Capital expenditure requirements
- Historical leverage levels

**Red flags:**
- Declining revenue trends
- Margin compression
- Increasing working capital needs
- Deferred capital expenditures
- Prior covenant breaches

### Step 3: Assess Capital Structure

Understand all debt obligations and their terms.

**Key elements:**
- Total debt outstanding (by instrument)
- Interest rates (fixed vs. floating)
- Maturity schedule
- Amortization requirements
- Covenant packages
- Collateral and security

**Maturity wall analysis:**
When does debt come due? A company with strong credit metrics but $500 million maturing next year faces refinancing risk.

### Step 4: Build Projections and Stress Cases

Project future performance under multiple scenarios.

**Base case:**
Management projections or consensus estimates. Reasonable assumptions about growth and margins.

**Downside case:**
What happens if revenue declines 10-20%? What's the margin impact? Can the company still service debt?

**Stress case:**
Severe recession scenario. Revenue down 30%+. How bad can it get before the company breaches covenants or can't service debt?

### Step 5: Evaluate Recovery

If things go wrong, what do lenders recover?

**Asset coverage:**
What's the liquidation value of assets relative to debt claims?

**Priority of claims:**
- Secured debt has first claim on collateral
- Senior unsecured ranks above subordinated
- Subordinated ranks above equity

**Recovery analysis:**
In bankruptcy, what percentage of principal would each debt class recover?

---

## EBITDA Adjustments

### Why Adjustments Matter

Reported EBITDA often needs adjustment for credit analysis.

**Common adjustments:**
- Add back non-recurring expenses
- Remove non-recurring income
- Adjust for acquisitions/divestitures
- Normalize for unusual items

**The tension:**
Borrowers want higher EBITDA (more borrowing capacity). Lenders want conservative EBITDA (more protection).

### Common EBITDA Adjustments

**Pro forma adjustments:**
Adding full-year impact of acquisitions or cost synergies.

**Non-recurring costs:**
Restructuring charges, transaction fees, one-time legal settlements.

**Stock-based compensation:**
Often added back, though it represents real economic cost.

**Management fees:**
Fees paid to private equity sponsors often added back.

**Run-rate cost savings:**
Projected savings from initiatives not yet fully realized.

### Adjusted vs. Reported EBITDA

Credit documents define "Adjusted EBITDA" with specific add-backs.

**The spread can be significant:**
- Reported EBITDA: $100 million
- Adjusted EBITDA: $130 million
- Leverage on reported: 5.0x
- Leverage on adjusted: 3.8x

Understanding what adjustments are included matters for comparing credits.

---

## Covenant Analysis

### What Covenants Do

Covenants are contractual restrictions protecting lenders.

**Maintenance covenants:**
Tested regularly (usually quarterly). Company must stay in compliance.

**Incurrence covenants:**
Tested only when company takes specific actions (new debt, dividends, acquisitions).

### Common Financial Covenants

**Leverage covenant:**
Maximum Debt / EBITDA ratio (e.g., not to exceed 5.0x).

**Interest coverage covenant:**
Minimum EBITDA / Interest (e.g., not less than 2.0x).

**Fixed charge coverage:**
Minimum ratio of cash flow to fixed charges.

**Minimum EBITDA:**
Floor on absolute EBITDA level.

### Covenant Cushion Analysis

**Cushion** = difference between actual performance and covenant threshold.

**Example:**
- Covenant: Max 5.0x leverage
- Actual leverage: 4.2x
- Cushion: 0.8x or 16%

**What cushion tells you:**
- How much can performance deteriorate before breach?
- How tight is the covenant package?
- Is the company at risk of tripping covenants?

### Covenant-Lite Structures

Many leveraged loans now have minimal or no maintenance covenants.

**Implications:**
- Less early warning of problems
- Fewer opportunities for lenders to intervene
- Greater flexibility for borrowers
- Higher risk for lenders in downside scenarios

---

## Credit Ratings

### What Ratings Mean

Rating agencies (S&P, Moody's, Fitch) assess credit quality.

**Investment Grade:**
| S&P | Moody's | Meaning |
|-----|---------|---------|
| AAA | Aaa | Highest quality |
| AA | Aa | High quality |
| A | A | Upper medium |
| BBB | Baa | Medium grade |

**High Yield (Speculative Grade):**
| S&P | Moody's | Meaning |
|-----|---------|---------|
| BB | Ba | Speculative |
| B | B | Highly speculative |
| CCC | Caa | Substantial risk |
| CC | Ca | Extremely speculative |
| D | C | Default |

### What Drives Ratings

Rating agencies evaluate:

**Business risk:**
- Industry characteristics
- Competitive position
- Operating efficiency
- Geographic diversification

**Financial risk:**
- Leverage levels
- Coverage ratios
- Cash flow stability
- Financial policy

**The rating process:**
Agencies publish methodologies. Understanding these helps predict rating actions and identify rating-sensitive credits.

### Investment Grade vs. High Yield

The BBB/BB divide matters enormously.

**Investment grade benefits:**
- Lower borrowing costs
- Access to investment-grade-only investors
- More favorable covenant terms
- Generally larger debt capacity

**High yield characteristics:**
- Higher interest rates
- Smaller investor base
- More restrictive terms
- Greater refinancing risk

Many companies manage financial policy to maintain investment grade ratings.

---

## Debt Instruments

### Bank Debt (Loans)

**Revolving Credit Facility (Revolver):**
- Flexible borrowing up to a limit
- Typically secured
- Used for working capital and liquidity
- Floating rate (SOFR + spread)

**Term Loan A (TLA):**
- Amortizing loan (principal paid over time)
- Secured
- Typically held by banks
- Tighter covenants

**Term Loan B (TLB):**
- Minimal amortization (1% per year typical)
- Secured
- Held by institutional investors (CLOs, funds)
- More covenant-lite

### Bonds

**Investment Grade Bonds:**
- Unsecured
- Longer maturities (10-30 years)
- Fixed rate
- Incurrence covenants only

**High Yield Bonds:**
- Often unsecured (rank below bank debt)
- 5-10 year maturities typical
- Fixed rate
- More restrictive covenants than IG

**Secured Bonds:**
- Backed by collateral
- Rank with secured bank debt
- Used in capital structures needing more debt

### Capital Structure Priority

In distress, claims are paid in order:

1. **Secured debt** (first claim on collateral)
2. **Senior unsecured debt**
3. **Subordinated debt**
4. **Mezzanine/preferred**
5. **Equity**

Higher priority = higher recovery but lower yield.

---

## Industry-Specific Considerations

### Cyclical Industries

**Higher risk factors:**
- Revenue volatility
- Operating leverage (high fixed costs)
- Working capital swings
- Commodity exposure

**Credit analysis adjustments:**
- Through-the-cycle EBITDA normalization
- Stress testing for trough conditions
- Liquidity focus for surviving downturns

### Regulated Industries

**Utilities, telecom:**
- More stable cash flows
- Regulatory support for cost recovery
- Often higher leverage tolerance
- Rate case risk

### Asset-Heavy Industries

**Real estate, transportation:**
- Asset values provide collateral support
- Loan-to-value metrics matter
- Depreciation vs. maintenance capex distinction
- Asset quality assessment

### Technology/Growth Companies

**Different metrics:**
- Revenue growth more important than profitability
- ARR (Annual Recurring Revenue) focus
- Net retention and churn metrics
- Path to profitability analysis

---

## Interview Questions

### Basic Questions

**"Walk me through the key credit metrics."**
Cover leverage (Debt/EBITDA), coverage (EBITDA/Interest), and liquidity (cash, revolver). Explain what each measures and typical thresholds.

**"What makes a good credit vs. a bad credit?"**
Good credits have stable/predictable cash flows, strong competitive positions, conservative leverage, and manageable maturities. Bad credits have the opposite.

**"How do you analyze a company's ability to service its debt?"**
Start with coverage ratios, then look at free cash flow generation, then assess liquidity sources. Stress test under downside scenarios.

### Intermediate Questions

**"A company has 4x leverage but 3x interest coverage. Is this a good credit?"**
Depends on business stability, maturity schedule, industry norms, and trends. 4x leverage is moderate; 3x coverage is adequate. Need more context on business quality and trajectory.

**"How would you think about maximum leverage for an LBO?"**
Consider business stability, growth, capex needs, working capital, and margin structure. Model cash flows to ensure debt service under base and downside cases. Typical LBO leverage is 5-7x but varies significantly.

**"What happens when a company breaches a covenant?"**
Technical default. Lenders can accelerate debt but usually negotiate waiver or amendment. Company may pay fees, accept tighter terms, or provide additional collateral.

### Advanced Questions

**"How do you analyze recovery in a bankruptcy scenario?"**
Value the enterprise (going concern or liquidation). Apply waterfall based on priority of claims. Secured debt recovers from collateral; remaining value flows to unsecured and below. Express as cents on the dollar.

**"Why might a company choose bank debt vs. bonds?"**
Bank debt: flexible, prepayable, often secured, floating rate, shorter maturity. Bonds: fixed rate, longer maturity, potentially unsecured, call protection. Choice depends on capital structure, rate view, and flexibility needs.

---

## Practical Application

### In M&A

Credit analysis informs:
- Financing capacity for acquisitions
- Appropriate debt levels post-transaction
- Rating implications of deal
- Covenant impact of acquisition

### In LBOs

Credit analysis is central to:
- Determining maximum purchase price
- Structuring debt tranches
- Setting appropriate leverage
- Modeling debt paydown

### In Restructuring

Credit analysis drives:
- Assessment of viability
- Recovery analysis for creditors
- Negotiations between stakeholders
- Plan of reorganization terms

---

## Key Takeaways

Credit analysis is essential for any investment banker working on leveraged transactions, debt capital markets, or restructuring.

**Core concepts:**
- Leverage ratios measure debt burden
- Coverage ratios measure debt service capacity
- Cash flow analysis shows actual ability to pay
- Covenants provide creditor protection

**The analytical approach:**
1. Understand business quality and stability
2. Analyze historical performance
3. Map capital structure and terms
4. Project cash flows under multiple scenarios
5. Assess recovery if things go wrong

**The credit mindset:**
Think about what can go wrong, not just what can go right. Lenders get their principal back or they don't—they don't share in upside. Analyze accordingly.

Every leveraged transaction depends on credit analysis. Master these concepts, and you'll understand half of what makes deals work—or fall apart.
