---
title: "FIG Technical Interview Deep Dive: Bank Valuations, Insurance Metrics, and Financial Services Questions"
slug: fig-technical-interview-deep-dive
excerpt: FIG interviews test whether you understand how financial institutions actually make money. Bank valuations, insurance metrics, and regulatory capital create unique analytical challenges. Here's what you need to know.
category: technical-interview
tags: [fig, banks, insurance, fintech, valuation, interviews, technical]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# FIG Technical Interview Deep Dive: Bank Valuations, Insurance Metrics, and Financial Services Questions

"Why can't you use EV/EBITDA to value a bank?"

This question exposes candidates who don't understand financial institutions. The answer isn't complicated, but it requires knowing why banks and insurers are fundamentally different from industrial companies.

Financial Institutions Group (FIG) covers banks, insurers, asset managers, and specialty finance companies. These businesses have unique characteristics: they borrow to lend, regulatory capital constrains growth, and traditional valuation metrics don't apply.

Here's everything you need to know for FIG technical interviews—the metrics, valuation methods, and sector-specific questions that define this specialized coverage area.

---

## Why FIG Is Different

### The Core Distinction

Most companies use debt as a funding source. They borrow money to invest in operations, then repay from operating cash flows.

Financial institutions are different. Debt is their raw material, not just their funding source.

**Banks:** Borrow deposits and short-term funding. Lend at higher rates. The spread is their business.

**Insurers:** Collect premiums today. Pay claims tomorrow. Invest the "float" in between.

**Asset managers:** Gather assets. Charge fees on those assets. Capital structure is secondary.

This means traditional metrics—EV/EBITDA, Free Cash Flow—don't translate directly.

### The Regulatory Reality

Financial institutions face unique regulatory constraints:

**Capital requirements:** Banks must maintain minimum capital ratios. Growth requires capital.

**Stress testing:** Regulators assess whether banks can survive adverse scenarios.

**Reserve requirements:** Insurers must maintain reserves against future claims.

**Systemic importance:** Large financial institutions face additional oversight (SIFI designation).

Regulation shapes strategy, valuation, and deal structure in FIG.

---

## Bank Fundamentals

### How Banks Make Money

**Net Interest Income (NII):**
Revenue from lending minus cost of funding. The spread between loan yields and deposit costs.

NII = Interest Earned on Assets − Interest Paid on Liabilities

**Net Interest Margin (NIM):**
NII as a percentage of earning assets. The efficiency of the lending spread.

NIM = NII / Average Earning Assets

**Non-Interest Income:**
Fees from services: wealth management, trading, investment banking, transaction processing.

**The Income Statement Structure:**

| Line Item | Description |
|-----------|-------------|
| Interest Income | Earnings from loans and securities |
| Interest Expense | Cost of deposits and borrowings |
| Net Interest Income | Interest income minus interest expense |
| Provision for Credit Losses | Reserve for expected loan losses |
| Non-Interest Income | Fee revenue from services |
| Non-Interest Expense | Operating costs (salaries, occupancy) |
| Pre-Tax Income | Operating profit |
| Net Income | After-tax profit |

### Key Bank Metrics

**Return on Equity (ROE):**
Net Income / Average Shareholders' Equity

The primary profitability metric for banks. Well-run banks target 10-15% ROE.

**Return on Assets (ROA):**
Net Income / Average Total Assets

Shows profitability relative to asset base. Typically 1-1.5% for healthy banks.

**Efficiency Ratio:**
Non-Interest Expense / (NII + Non-Interest Income)

Operating costs as percentage of revenue. Lower is better. Target: 55-60%.

**Net Charge-Off Rate:**
Loans written off minus recoveries, as percentage of average loans.

Measures actual credit losses. Lower is better.

**Loan-to-Deposit Ratio:**
Total Loans / Total Deposits

Shows how much of deposits fund loans. Typical range: 70-90%.

### Regulatory Capital

Banks must maintain minimum capital to absorb losses:

**Common Equity Tier 1 (CET1):**
Highest quality capital. Primarily common stock and retained earnings.

**Tier 1 Capital:**
CET1 plus additional Tier 1 (preferred stock, certain hybrids).

**Total Capital:**
Tier 1 plus Tier 2 (subordinated debt, loan loss reserves).

**Key ratios:**

| Ratio | Minimum | Well-Capitalized |
|-------|---------|------------------|
| CET1 Ratio | 4.5% | 7%+ |
| Tier 1 Ratio | 6% | 8%+ |
| Total Capital Ratio | 8% | 10%+ |
| Leverage Ratio | 4% | 5%+ |

**Capital ratio = Capital / Risk-Weighted Assets**

Risk-weighted assets adjust for credit risk. A Treasury bond has lower risk weight than a commercial loan.

---

## Bank Valuation

### Why Not EV/EBITDA?

Standard EV/EBITDA doesn't work for banks because:

**Debt is operational, not financing.**
For banks, deposits and borrowings are part of operations. Excluding them from enterprise value makes no sense.

**EBITDA excludes interest expense.**
Interest expense is a bank's primary operating cost. EBITDA would exclude their biggest expense.

**Capital structure is regulated.**
Banks can't arbitrarily increase leverage. Capital ratios are constrained.

### Primary Bank Valuation Metrics

**Price / Tangible Book Value (P/TBV):**
Market Cap / Tangible Book Value

The most important metric for bank valuation. Compares market value to equity after excluding intangibles.

| P/TBV | Interpretation |
|-------|----------------|
| > 2.0x | Premium—high ROE, growth expectations |
| 1.5-2.0x | Solid—above-average performance |
| 1.0-1.5x | Fair—reasonable returns |
| < 1.0x | Discount—struggling or restructuring |

**Price / Earnings (P/E):**
Market Cap / Net Income

Standard earnings multiple applies to banks.

**Price / Book Value (P/BV):**
Market Cap / Book Value (including intangibles)

Less preferred than P/TBV because goodwill can distort.

### Bank DCF Approach

**Dividend Discount Model (DDM):**
Banks are often valued using DDM because dividends are the primary form of shareholder return (given capital constraints).

Value = Expected Dividends / (Cost of Equity − Growth Rate)

**Excess Return Model:**
Values the bank's ability to generate returns above cost of equity.

Value = Book Value + PV of Future Excess Returns

### What Drives Bank Valuations

**ROE vs. Cost of Equity:**
Banks trading at P/TBV > 1.0x earn ROE above cost of equity.

**Relationship:**
P/TBV ≈ (ROE − g) / (r − g)

Where r = cost of equity, g = growth rate.

Higher ROE → Higher P/TBV
Lower risk → Lower cost of equity → Higher P/TBV

**Other drivers:**
- Loan growth trajectory
- Credit quality trends
- Net interest margin direction
- Fee income diversification
- Capital position
- Management quality

---

## Insurance Fundamentals

### How Insurers Make Money

**Underwriting Income:**
Premiums collected minus claims paid and expenses.

**Investment Income:**
Returns on the "float"—premiums held until claims are paid.

**Combined Ratio:**
(Claims + Expenses) / Premiums Earned

A combined ratio below 100% means underwriting profit. Above 100% means underwriting loss.

| Combined Ratio | Interpretation |
|----------------|----------------|
| < 90% | Excellent underwriting |
| 90-95% | Good underwriting |
| 95-100% | Marginal underwriting |
| > 100% | Underwriting loss |

### Property & Casualty (P&C) Insurance

**Business model:**
Insure against property damage, liability, auto accidents, etc. Premium pricing based on actuarial models.

**Key characteristics:**
- Short-tail (auto) vs. long-tail (liability) claims
- Catastrophe exposure
- Reinsurance relationships
- Reserve adequacy

**Key metrics:**

| Metric | Description |
|--------|-------------|
| Loss Ratio | Claims / Premiums |
| Expense Ratio | Expenses / Premiums |
| Combined Ratio | Loss Ratio + Expense Ratio |
| Reserve Development | Changes to prior-year reserves |

### Life Insurance

**Business model:**
Insure against death (life insurance), provide retirement income (annuities), manage assets.

**Key characteristics:**
- Very long-duration liabilities
- Interest rate sensitivity
- Mortality and longevity assumptions
- Complex product structures

**Key metrics:**
- Embedded value (present value of future profits from in-force business)
- Statutory capital and surplus
- Return on equity
- Persistency (policy retention rates)

### Reinsurance

**Business model:**
Insure insurers. Transfer risk from primary insurers to reinsurers.

**Key characteristics:**
- Catastrophe exposure concentration
- Global diversification
- Capital markets alternatives (cat bonds)
- Retrocessional arrangements

---

## Insurance Valuation

### P&C Insurance

**Book Value multiples:**
P/BV is primary metric. Well-run P&C insurers trade at 1.5-2.5x book.

**Combined ratio analysis:**
Sustainable underwriting profitability supports premium valuations.

**ROE:**
Target ROE of 10-15% for P&C insurers.

### Life Insurance

**Embedded Value:**
Present value of future profits from existing policies plus adjusted net worth.

EV = Adjusted Net Worth + Value of In-Force Business

**P/EV multiples:**
Life insurers often valued relative to embedded value.

**Operating earnings:**
Normalize for investment volatility. Focus on core insurance earnings.

### What Drives Insurance Valuations

**Underwriting quality:**
Consistent combined ratios below 100%.

**Investment returns:**
Float invested profitably.

**Reserve adequacy:**
No adverse development surprises.

**Capital strength:**
Ability to absorb catastrophic events.

**Management reputation:**
Discipline in underwriting and capital allocation.

---

## Asset Management

### How Asset Managers Make Money

**Management fees:**
Percentage of assets under management (AUM). Typically 0.5-1.5% for active management.

**Performance fees:**
Share of returns above benchmark. Common in hedge funds and private equity (carried interest).

**Transaction fees:**
Commissions and trading revenue.

### Key Metrics

**AUM and flows:**
Assets under management growth. Net inflows vs. outflows.

**Fee rates:**
Average management fee percentage. Trend toward fee compression.

**Operating margin:**
Revenue minus expenses. Asset managers have high operating leverage.

### Asset Manager Valuation

**P/E multiples:**
Primary metric. Well-positioned asset managers trade at 10-15x+ earnings.

**AUM-based metrics:**
EV/AUM, Price/AUM. Shows what you're paying per dollar of managed assets.

**Fee yield:**
Revenue / AUM. Higher fee yield supports premium valuation.

---

## Specialty Finance and Fintech

### Specialty Finance

**Examples:** Consumer finance, commercial finance, mortgage REITs, BDCs.

**Key characteristics:**
- Narrower asset classes
- Higher yields, higher risk
- Regulatory differences from banks
- Credit quality is paramount

**Valuation:**
P/Book value, dividend yield, credit loss analysis.

### Fintech

**Business models:**
Payments, lending, insurtech, wealth tech, infrastructure.

**Key characteristics:**
- Technology-enabled financial services
- Often revenue-based valuation (like tech)
- Regulatory status varies
- Customer acquisition and engagement metrics

**Valuation:**
Revenue multiples for growth companies. Traditional metrics for mature fintechs.

---

## Common Interview Questions

### Bank Questions

**"Why can't you use EV/EBITDA for banks?"**

Three reasons:

First, debt is operational for banks, not just financing. Deposits and borrowings fund the lending business. You can't separate them from operations like you would for an industrial company.

Second, EBITDA excludes interest expense. For banks, interest expense is the cost of their raw material (deposits). Excluding it makes the metric meaningless.

Third, bank capital structure is regulated. They can't arbitrarily change leverage. The enterprise value concept doesn't translate cleanly.

Use P/TBV, P/E, and ROE-based analysis instead.

**"Walk me through how you value a bank."**

Start with tangible book value—that's the equity available to shareholders after stripping out intangibles.

Compare P/TBV to peers. Determine what P/TBV the bank should trade at based on its ROE relative to cost of equity.

Banks with higher ROE deserve higher P/TBV multiples. The relationship is roughly:

P/TBV ≈ (ROE − g) / (Cost of Equity − g)

Also run a dividend discount model if the bank has stable dividend payout.

Cross-check with P/E multiples and peer comparisons.

**"What happens to bank profitability when interest rates rise?"**

Generally positive for banks, but with nuances:

Asset-sensitive banks benefit immediately. Their loan yields reprice faster than deposit costs. NIM expands.

Liability-sensitive banks may be hurt. Their funding costs rise faster than asset yields.

Competition matters. If banks compete for deposits by raising rates, the benefit is reduced.

Credit risk may increase. Higher rates can stress borrowers, increasing defaults.

The duration mismatch between assets and liabilities determines sensitivity.

### Insurance Questions

**"What is the combined ratio and why does it matter?"**

Combined ratio measures underwriting profitability.

Combined Ratio = (Claims + Expenses) / Premiums

Below 100% = underwriting profit. Above 100% = underwriting loss.

Insurers can still be profitable with combined ratios above 100% if investment income covers the shortfall. But sustainable profitability requires underwriting discipline.

A company with 95% combined ratio earns $5 of underwriting profit per $100 of premium—plus investment income on the float.

**"How do you value an insurance company?"**

For P&C insurers, use book value multiples. P/BV of 1.5-2.0x for well-managed companies. Adjust for underwriting quality (combined ratio), ROE, and reserve adequacy.

For life insurers, embedded value is important. Value the existing book of policies plus adjusted net worth.

For both, examine ROE relative to cost of equity. Insurers earning above cost of equity deserve premium valuations.

Run scenario analysis for catastrophe exposure and reserve development.

**"What is 'float' and why does it matter?"**

Float is money that insurers hold between collecting premiums and paying claims.

Insurance is essentially negative-cost financing if combined ratio is under 100%. The insurer holds policyholders' money and earns investment returns on it before paying claims.

Warren Buffett built Berkshire Hathaway on this insight. If you underwrite profitably and invest the float well, you create enormous value.

The value of float depends on:
- How long you hold it (longer for life insurance)
- The cost (your combined ratio)
- Investment returns you can earn

### Deal Questions

**"Why would two banks merge?"**

Cost synergies are the primary driver. Banks have high fixed costs (branches, technology, compliance). Combining creates efficiencies.

Common synergy sources:
- Branch consolidation
- Technology platform rationalization
- Back-office consolidation
- Reduced compliance burden (one regulatory relationship)

Revenue synergies are secondary but real:
- Cross-sell products to combined customer base
- Enhanced geographic coverage
- Scale in capital markets businesses

Regulatory approval is a key constraint. Regulators scrutinize community impact, competitive effects, and systemic risk.

**"How do you think about capital in a bank acquisition?"**

Capital is crucial because:

1. The combined entity must meet regulatory capital requirements
2. Acquisition goodwill reduces tangible capital
3. Regulators must approve the transaction

The buyer often needs to raise capital to fund the acquisition while maintaining required ratios.

Deal accretion/dilution analysis focuses on:
- EPS accretion/dilution
- Tangible book value impact
- Effect on capital ratios
- Timeline to earn back tangible book dilution

---

## FIG M&A Dynamics

### Bank M&A

**Drivers:**
- Scale economics
- Geographic expansion
- Fee business diversification
- Management succession

**Constraints:**
- Regulatory approval process
- Capital requirements
- Community Reinvestment Act considerations
- Integration complexity

### Insurance M&A

**Drivers:**
- Distribution expansion
- Diversification across lines
- Capital optimization
- International growth

**Constraints:**
- State regulatory approval (insurance regulated by states)
- Reserve adequacy questions
- Culture integration

### Asset Manager M&A

**Drivers:**
- Scale to compete on fees
- Distribution capability
- Product diversification
- International expansion

**Constraints:**
- Key person retention
- Investment performance risk
- Cultural integration

---

## Key Takeaways

FIG interviews require understanding why financial institutions differ from industrial companies.

**Core distinctions:**
- Debt is operational, not just financing
- Regulatory capital constrains growth
- Traditional EV/EBITDA doesn't apply

**Bank essentials:**
- P/TBV is the primary metric
- ROE drives valuation
- NIM, efficiency ratio, credit quality matter
- Capital ratios are constraints

**Insurance essentials:**
- Combined ratio measures underwriting quality
- Float is the competitive advantage
- Book value multiples for P&C
- Embedded value for life

**What interviewers want:**
- Understanding of how financial institutions make money
- Ability to explain why standard metrics don't apply
- Knowledge of sector-specific valuation approaches
- Awareness of regulatory dynamics

FIG is specialized knowledge. Candidates who understand the fundamentals stand out from those trying to force-fit generic valuation frameworks.

Build that understanding, and the interview questions become applications of core principles rather than memorized answers.
