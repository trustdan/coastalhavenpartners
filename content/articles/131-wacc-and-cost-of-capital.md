---
title: "WACC and Cost of Capital: The Foundation of Every DCF Model"
slug: wacc-and-cost-of-capital
excerpt: Every DCF model depends on WACC. Get it wrong, and your valuation is worthless. Here's how to calculate cost of capital correctly and defend your assumptions in interviews.
category: technical-interview
tags: [WACC, cost of capital, DCF, valuation, interviews, CAPM]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# WACC and Cost of Capital: The Foundation of Every DCF Model

Change WACC by one percentage point. Watch your valuation move 15%.

That's the power—and the danger—of the weighted average cost of capital. It's the single input that matters most in DCF valuation. It determines what future cash flows are worth today. Get it wrong, and everything else is noise.

Most candidates can define WACC. Fewer can calculate it correctly. Even fewer can defend their assumptions when challenged.

Here's how to master cost of capital—the mechanics, the theory, and the judgment calls that separate adequate answers from excellent ones.

---

## What WACC Actually Means

### The Conceptual Foundation

Companies fund themselves with two sources: debt and equity. Each has a cost. WACC blends these costs based on their proportions.

Think of it as the minimum return a company must earn on its investments. If a project returns less than WACC, it destroys value. Shareholders could have earned more investing elsewhere.

**The formula:**

```
WACC = (E/V) × Re + (D/V) × Rd × (1 - T)
```

Where:
- E = Market value of equity
- D = Market value of debt
- V = E + D (total firm value)
- Re = Cost of equity
- Rd = Cost of debt
- T = Corporate tax rate

**Why tax-adjust debt?** Interest payments are tax-deductible. A company paying 6% interest with a 25% tax rate has an after-tax cost of only 4.5%. The government subsidizes debt financing.

### Why WACC Matters in Valuation

When you discount cash flows, you're answering a question: What would investors require to fund this business?

Risky businesses require higher returns. Safe businesses accept lower returns. WACC captures this risk-return relationship.

**Higher WACC = Lower valuation.** Future cash flows get discounted more heavily.

**Lower WACC = Higher valuation.** Future cash flows retain more value today.

A 10% WACC versus 12% WACC can swing enterprise value by 20% or more. That's billions of dollars on large deals.

---

## Calculating Cost of Equity

### CAPM: The Standard Approach

The Capital Asset Pricing Model is the most common method:

```
Re = Rf + β × (Rm - Rf)
```

Where:
- Rf = Risk-free rate
- β = Beta (systematic risk measure)
- Rm - Rf = Equity risk premium (ERP)

**Example calculation:**
- Risk-free rate: 4.5% (10-year Treasury)
- Beta: 1.2
- Equity risk premium: 5.5%

Cost of Equity = 4.5% + 1.2 × 5.5% = 4.5% + 6.6% = **11.1%**

### The Risk-Free Rate

Use the 10-year Treasury yield for most US valuations. It matches typical DCF projection periods and reflects the time value of money without credit risk.

**Current considerations:**
- 10-year Treasury yields fluctuate with Fed policy and inflation expectations
- As of late 2024, yields sit around 4-5%
- Use the rate as of your valuation date

**Interview trap:** "Why the 10-year Treasury instead of 30-year?"

**Answer:** The 10-year better matches typical DCF horizons. Thirty-year bonds introduce additional duration risk that doesn't reflect the company's operating timeline. Some practitioners use a weighted average matching cash flow duration.

### Understanding Beta

Beta measures how a stock moves relative to the market. It captures systematic risk—risk that can't be diversified away.

| Beta | Interpretation |
|------|----------------|
| 0.5 | Half as volatile as market |
| 1.0 | Moves with market |
| 1.5 | 50% more volatile than market |
| 2.0 | Twice as volatile as market |

**Where to find beta:**
- Bloomberg, Capital IQ, FactSet
- Calculate from regression of stock returns vs. market returns
- Use 2-5 years of weekly or monthly data

**Levered vs. unlevered beta:**

Published betas are "levered"—they reflect the company's actual capital structure. Debt amplifies equity returns, making levered beta higher.

For comparisons and re-levering to a target capital structure:

```
Unlevered Beta = Levered Beta / [1 + (1 - T) × (D/E)]
```

```
Re-levered Beta = Unlevered Beta × [1 + (1 - T) × (D/E)]
```

This allows you to compare operating risk across companies with different leverage.

### The Equity Risk Premium

The ERP represents the extra return investors demand for holding stocks instead of risk-free bonds. It's the most debated input in CAPM.

**Common ranges:**
- Historical average: 5-7% (depending on measurement period)
- Current implied: 4-6% (from market prices)
- Standard practice: 5-6%

**Sources:**
- Duff & Phelps publishes annual ERP recommendations
- Damodaran maintains freely available estimates
- Bank research provides market-specific figures

**Interview trap:** "What ERP do you use and why?"

**Answer:** "I typically use 5-6%, consistent with Duff & Phelps guidance and long-term historical averages. For emerging markets or unusual periods, I'd adjust based on country risk premiums or current market conditions. The key is being consistent across comparisons."

---

## Calculating Cost of Debt

### The Basics

Cost of debt is the interest rate a company pays on its borrowings, adjusted for tax.

```
After-tax Cost of Debt = Rd × (1 - T)
```

**Where to find the pre-tax cost:**

1. **Yield to maturity on traded bonds.** Most accurate for companies with public debt.
2. **Interest rate on recent debt issuances.** Check SEC filings for new debt.
3. **Synthetic rating approach.** Estimate based on credit metrics if no public debt.

**Example:**
- Company has bonds trading at 7% yield to maturity
- Tax rate: 25%
- After-tax cost of debt = 7% × (1 - 0.25) = **5.25%**

### Credit Spreads and Ratings

Companies without traded bonds need synthetic estimates. Match credit metrics to rating categories, then add appropriate spreads to risk-free rates.

| Rating | Typical Spread | Total Cost (with 4.5% Rf) |
|--------|----------------|---------------------------|
| AAA | 0.5% | 5.0% |
| AA | 0.8% | 5.3% |
| A | 1.2% | 5.7% |
| BBB | 1.8% | 6.3% |
| BB | 3.0% | 7.5% |
| B | 4.5% | 9.0% |

**Key metrics for synthetic ratings:**
- Interest coverage ratio (EBIT / Interest)
- Debt / EBITDA
- FFO / Debt
- EBITDA margin

### Common Mistakes

**Mistake:** Using the coupon rate instead of yield to maturity.

**Why it's wrong:** Bonds trade above or below par. A bond with a 5% coupon trading at 90 cents on the dollar yields more than 5%.

**Mistake:** Using historical interest rates on old debt.

**Why it's wrong:** Cost of capital should reflect current market rates. What the company paid five years ago doesn't matter for today's valuation.

**Mistake:** Forgetting to tax-adjust.

**Why it's wrong:** Interest is deductible. Omitting the tax shield overstates the true cost of debt.

---

## Capital Structure Weights

### Market Value vs. Book Value

**Always use market values.** WACC represents the return required by current investors at current prices.

**For equity:** Stock price × shares outstanding. Easy for public companies.

**For debt:** Market value of bonds if traded. Otherwise, book value is a reasonable approximation for investment-grade debt.

**Interview trap:** "The company's stock just dropped 50%. Do you use the old or new market cap?"

**Answer:** "The new market cap. WACC reflects current required returns. If the stock dropped because of increased risk, that risk should be captured in higher cost of equity. The lower market cap also changes weights, typically increasing the debt proportion."

### The Circularity Problem

Here's a conceptual challenge: You need market value of equity to calculate WACC. But you're using WACC to calculate enterprise value, which determines equity value.

**Solutions:**

1. **Iterate:** Start with target capital structure. Calculate WACC and EV. Check if implied weights match assumptions. Adjust and repeat.

2. **Use target weights:** Base weights on industry comparables or management's stated target leverage.

3. **Accept the approximation:** Small changes in weights don't dramatically affect WACC. Get close and move on.

**In practice:** Most analysts use target capital structures based on industry norms or comparable companies. The circularity matters less than people think.

### Industry Benchmarks

| Industry | Typical D/V | Typical E/V |
|----------|-------------|-------------|
| Technology | 10-20% | 80-90% |
| Healthcare | 15-25% | 75-85% |
| Consumer | 20-30% | 70-80% |
| Industrials | 25-35% | 65-75% |
| Utilities | 40-50% | 50-60% |
| Real Estate | 40-60% | 40-60% |

More stable cash flows support higher leverage. Volatile businesses need more equity cushion.

---

## Putting It All Together

### Complete WACC Example

**Company profile:**
- Market cap: $800M
- Total debt: $200M (trading near par)
- Tax rate: 25%
- Beta: 1.3
- Risk-free rate: 4.5%
- Equity risk premium: 5.5%
- Debt yield: 6.5%

**Step 1: Calculate cost of equity**
```
Re = 4.5% + 1.3 × 5.5% = 4.5% + 7.15% = 11.65%
```

**Step 2: Calculate after-tax cost of debt**
```
Rd × (1 - T) = 6.5% × (1 - 0.25) = 6.5% × 0.75 = 4.875%
```

**Step 3: Calculate weights**
```
V = $800M + $200M = $1,000M
E/V = 800/1000 = 80%
D/V = 200/1000 = 20%
```

**Step 4: Calculate WACC**
```
WACC = 80% × 11.65% + 20% × 4.875%
WACC = 9.32% + 0.975%
WACC = 10.295% ≈ 10.3%
```

### Sensitivity Check

Always test how valuation changes with WACC:

| WACC | Change from Base | Impact on Value |
|------|------------------|-----------------|
| 9.3% | -1.0% | +12-15% |
| 10.3% | Base | Base |
| 11.3% | +1.0% | -10-12% |

A full percentage point in WACC moves value significantly. Know your assumptions and be prepared to defend them.

---

## Advanced Considerations

### Country Risk Premiums

International valuations require adjustments for country-specific risks.

```
Re = Rf + β × ERP + Country Risk Premium
```

**Country risk sources:**
- Political instability
- Currency volatility
- Regulatory uncertainty
- Expropriation risk

**Typical country risk premiums:**
- Developed Europe: 0-1%
- Emerging Asia: 2-4%
- Latin America: 3-5%
- Frontier markets: 5-8%+

### Size Premiums

Small companies tend to have higher required returns than CAPM predicts. Some practitioners add a "size premium" for small-cap valuations.

**Duff & Phelps ranges:**
- Micro-cap: 3-5% additional
- Small-cap: 2-3% additional
- Mid-cap: 1-2% additional
- Large-cap: 0%

**Controversy:** Academic debate exists about whether size premiums persist. Many practitioners still use them; others argue they're captured in beta.

### Industry-Specific Adjustments

Some industries warrant modified approaches:

**Financial institutions:** Traditional WACC doesn't apply well. Debt is part of operations, not just financing. Use cost of equity and value equity directly.

**Utilities:** Regulated returns on equity matter. WACC should approximate allowed ROE.

**REITs:** Pass-through entities with different tax treatments require modified tax assumptions.

---

## Interview Deep Dive

### Foundation Questions

**"What is WACC and why do we use it?"**

> "WACC is the weighted average cost of capital—the blended return required by all capital providers. We use it to discount free cash flows because FCF is available to both debt and equity holders. WACC captures the opportunity cost of the capital used to fund the business."

**"Walk me through calculating WACC."**

> "Start with the capital structure weights—market value of equity and debt as percentages of total value. Calculate cost of equity using CAPM: risk-free rate plus beta times equity risk premium. Calculate after-tax cost of debt: yield times one minus tax rate. Multiply each cost by its weight and sum them."

**"Why do we tax-adjust the cost of debt but not cost of equity?"**

> "Interest payments are tax-deductible. Dividend payments are not. The tax shield makes debt cheaper on an after-tax basis. There's no equivalent tax benefit for equity financing."

### Challenge Questions

**"Your WACC is 10%. How confident are you in that number?"**

> "Moderately confident in the direction, less confident in the precision. WACC depends on multiple estimated inputs—ERP, beta, cost of debt. I'd run sensitivities of plus or minus 1-2% to show the valuation range. The key is being consistent across comparable analyses."

**"The company has no debt. How do you calculate WACC?"**

> "WACC equals cost of equity when there's no debt. But I'd ask whether zero debt is the appropriate capital structure going forward. If the company could optimize its structure with some debt, I might use a target structure instead of the current all-equity structure."

**"How does WACC change if the company takes on more debt?"**

> "Initially, WACC usually decreases. Debt is cheaper than equity due to the tax shield. But beyond an optimal point, WACC increases as financial distress risk rises. Cost of debt increases, beta increases, and both push WACC higher. There's a U-shaped relationship."

**"Why might two companies in the same industry have different WACCs?"**

> "Different risk profiles. Higher operating leverage means higher beta. More volatile revenues increase equity risk. Different capital structures change the weighting. Different credit quality affects cost of debt. Same industry doesn't mean same risk."

### Judgment Questions

**"What ERP do you use?"**

> "5.5-6% for US equity valuations, based on Duff & Phelps guidance and long-term averages. It's debatable—some use historical arithmetic means around 6-7%, others use geometric means around 5%. The key is consistency and transparency about your choice."

**"The company's beta is 0.3. Does that seem right?"**

> "That's unusually low—implies the stock moves very little with the market. I'd check if the stock is illiquid, which can suppress measured beta. I might also look at peer betas and use an average. For a truly low-risk business like a regulated utility, 0.3-0.5 might be appropriate."

---

## Common Mistakes and Fixes

### Calculation Errors

| Mistake | Fix |
|---------|-----|
| Using book value for equity | Always use market value |
| Forgetting tax adjustment on debt | Multiply Rd by (1 - T) |
| Using coupon rate instead of YTM | Find current yield to maturity |
| Mixing levered and unlevered betas | Unlever comparable betas, then relever |

### Conceptual Errors

| Mistake | Fix |
|---------|-----|
| Using WACC for levered cash flows | Use cost of equity for FCFE |
| Applying parent WACC to subsidiary | Calculate subsidiary-specific WACC |
| Ignoring country risk | Add country risk premium for international |
| Static WACC for changing capital structure | Consider changing WACC over projection period |

---

## Key Takeaways

WACC is where finance theory meets practical judgment. The formula is simple. The inputs require careful thought.

**Master the mechanics:**
- Cost of equity via CAPM
- After-tax cost of debt
- Market value weights
- Complete WACC calculation

**Understand the drivers:**
- How risk affects cost of equity
- How leverage affects both components
- How tax rates amplify debt benefits
- How capital structure choices optimize WACC

**Develop judgment:**
- Reasonable ranges for each input
- When to adjust standard approaches
- How to defend your assumptions
- What sensitivities matter most

**The bottom line:**

A 1% error in WACC can move valuation by 10-15%. That makes WACC the single most leveraged input in your DCF model.

Interviewers know this. They'll probe your assumptions. They'll challenge your judgment.

Know your numbers. Know why they're defensible. That's what separates candidates who run models from candidates who understand valuation.
