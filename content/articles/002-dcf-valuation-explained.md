---
title: "DCF Valuation Explained: A Step-by-Step Guide for Interview Success"
slug: dcf-valuation-explained
excerpt: The discounted cash flow model is the foundation of corporate finance. This guide breaks down the DCF step by step for interview mastery.
category: interview-prep
tags: [valuation, dcf, investment-banking, interviews]
status: published
published_at: 2024-11-20
author: Coastal Haven Partners
---

# DCF Valuation Explained: A Step-by-Step Guide for Interview Success

Every valuation interview includes a DCF question. Every single one.

The discounted cash flow model is the foundation of corporate finance. It's theoretically elegant. It's practically messy. Interviewers love it because it reveals how deeply you understand value creation.

This guide breaks down the DCF step by step. You'll learn the mechanics, the assumptions, and the common traps that catch unprepared candidates.

---

## The Core Concept in 30 Seconds

A company is worth the present value of its future cash flows.

That's it. Everything else is execution.

You project how much cash the business will generate. You discount those cash flows back to today using a rate that reflects risk. You sum them up. That's your value.

The simplicity is deceptive. Each step involves judgment calls. Interviewers probe those judgment calls to see if you understand what you're doing.

---

## Why the DCF Matters

Three reasons make DCF essential:

**It's intrinsic.** Unlike comps or precedent transactions, DCF doesn't depend on what others think a company is worth. It values the business based on its own fundamentals.

**It forces assumptions.** You must take a position on growth, margins, and risk. This makes your thinking transparent and debatable.

**It's the theoretical benchmark.** When comps and DCF disagree, sophisticated investors ask why. The DCF anchors all other valuation methods.

Banks use DCF in every pitch book. Private equity uses it for every investment memo. Hedge funds use it to find mispriced securities. You need to know it cold.

---

## The Five Steps of a DCF

### Step 1: Project Free Cash Flow

Free cash flow (FCF) is the cash a company generates after funding its operations and investments. It's what's available to pay debt holders and equity holders.

The formula:

```
Free Cash Flow = EBIT × (1 - Tax Rate) + Depreciation & Amortization - Capital Expenditures - Change in Net Working Capital
```

Or equivalently:

```
Free Cash Flow = EBITDA - Taxes on EBIT - CapEx - Change in NWC
```

**EBIT** is earnings before interest and taxes. We start here because we're valuing the whole enterprise, not just equity. Interest is a financing decision, not an operating one.

**Tax on EBIT** reflects the cash taxes the company would pay on operating income. Use the marginal tax rate, typically 21-25% for US companies.

**Depreciation & Amortization** gets added back because it's non-cash. The expense hit the income statement but no cash left the building.

**Capital Expenditures** get subtracted because they're real cash outflows required to maintain and grow the business.

**Change in Net Working Capital** matters because growth consumes cash. If receivables grow faster than payables, you need cash to fund that gap.

**Common interview question:** "Why do we add back D&A and subtract CapEx separately?"

**Answer:** They're conceptually different. D&A reflects past capital investments. CapEx reflects current investments. Over time they may roughly equal each other, but in any given year they can differ substantially. A growing company typically has CapEx exceeding D&A.

### Step 2: Choose a Projection Period

Most DCFs project 5-10 years of explicit cash flows.

Why not longer? Forecasting becomes increasingly uncertain. Revenue projections for year 15 are basically fiction.

Why not shorter? You need enough time for the business to reach a "steady state" where growth stabilizes. A high-growth company might need 10 years. A mature company might need only 5.

**The key insight:** Your projection period should capture the years where growth and margins differ meaningfully from steady state. Once the business normalizes, you shift to the terminal value.

### Step 3: Calculate Terminal Value

The terminal value captures all cash flows beyond your projection period. It typically represents 60-80% of total DCF value. This is important—most of your value estimate depends on assumptions about the distant future.

Two methods:

**Perpetuity Growth Method:**

```
Terminal Value = Final Year FCF × (1 + g) / (WACC - g)
```

Where `g` is the perpetual growth rate. This rate should be modest—typically 2-3%, roughly matching long-term GDP or inflation. Higher rates imply the company eventually becomes larger than the entire economy.

**Exit Multiple Method:**

```
Terminal Value = Final Year EBITDA × Exit Multiple
```

The exit multiple comes from comparable companies. If similar companies trade at 8x EBITDA today, you might assume the same multiple at exit.

**Which method is better?** Neither. They should roughly agree. If they don't, your assumptions are inconsistent. Run both and investigate any large discrepancy.

**Common interview trap:** "What perpetual growth rate should you use?"

**Answer:** No more than long-term GDP growth (2-3%). A company can't grow faster than the economy forever—it would eventually exceed 100% of GDP. Higher growth rates also create mathematical problems as `g` approaches WACC.

### Step 4: Discount to Present Value

Future cash flows are worth less than current cash flows. A dollar today beats a dollar tomorrow.

The discount rate for enterprise value is WACC—the weighted average cost of capital.

```
WACC = (E/V) × Cost of Equity + (D/V) × Cost of Debt × (1 - Tax Rate)
```

Where:
- E = market value of equity
- D = market value of debt
- V = E + D (total enterprise value)
- Cost of Equity = typically calculated using CAPM
- Cost of Debt = interest rate on debt, tax-adjusted

**Cost of Equity using CAPM:**

```
Cost of Equity = Risk-Free Rate + Beta × Equity Risk Premium
```

- Risk-free rate: 10-year Treasury yield (currently ~4-5%)
- Beta: measures stock volatility relative to market (1.0 = market average)
- Equity risk premium: typically 5-6%

**Example:** Risk-free rate of 4.5%, beta of 1.2, equity risk premium of 5.5%.

Cost of Equity = 4.5% + 1.2 × 5.5% = 4.5% + 6.6% = 11.1%

**Why tax-adjust the cost of debt?** Interest is tax-deductible. A company paying 6% interest with a 25% tax rate has an after-tax cost of 4.5%.

**Typical WACC ranges:** 8-12% for most companies. Lower for stable utilities. Higher for risky tech companies.

### Step 5: Sum to Enterprise Value

Discount each year's free cash flow and the terminal value back to present.

```
Enterprise Value = Σ [FCF_t / (1 + WACC)^t] + [Terminal Value / (1 + WACC)^n]
```

Where:
- FCF_t = free cash flow in year t
- n = final projection year
- WACC = discount rate

**To get equity value:**

```
Equity Value = Enterprise Value - Net Debt
```

Net Debt = Total Debt - Cash

**To get per-share value:**

```
Share Price = Equity Value / Shares Outstanding
```

Use diluted shares outstanding to account for options and convertible securities.

---

## A Complete Example

Let's value a simplified company.

**Assumptions:**
- Current EBITDA: $100M
- EBITDA growth: 10% year 1-3, 5% year 4-5
- D&A: 10% of revenue (assume revenue = 5x EBITDA)
- CapEx: 12% of revenue
- Change in NWC: 2% of revenue growth
- Tax rate: 25%
- WACC: 10%
- Terminal growth: 2.5%

**Year 1 Calculation:**

- EBITDA: $110M ($100M × 1.10)
- Revenue: $550M (5 × $110M)
- D&A: $55M (10% × $550M)
- EBIT: $55M ($110M - $55M)
- Taxes on EBIT: $13.75M (25% × $55M)
- CapEx: $66M (12% × $550M)
- Change in NWC: $10M (2% × $50M revenue growth)

Free Cash Flow = $55M - $13.75M + $55M - $66M - $10M = **$20.25M**

*(Continue this for years 2-5)*

**Terminal Value (Year 5):**

Assume Year 5 FCF = $35M (after growth calculations)

Terminal Value = $35M × (1.025) / (0.10 - 0.025) = $35.875M / 0.075 = **$478M**

**Present Value Calculation:**

| Year | FCF | Discount Factor | Present Value |
|------|-----|-----------------|---------------|
| 1 | $20.25M | 0.909 | $18.4M |
| 2 | $24.3M | 0.826 | $20.1M |
| 3 | $28.5M | 0.751 | $21.4M |
| 4 | $31.2M | 0.683 | $21.3M |
| 5 | $35.0M | 0.621 | $21.7M |
| TV | $478M | 0.621 | $296.8M |

**Enterprise Value = $399.7M ≈ $400M**

If net debt is $50M:

**Equity Value = $400M - $50M = $350M**

---

## Key Sensitivities

Small changes in assumptions create large changes in value. Run sensitivities on:

**Terminal growth rate.** Moving from 2% to 3% can increase value by 15-20%. This assumption matters enormously.

**WACC.** A 1% change in WACC typically changes value by 10-15%. Higher discount rates mean lower values.

**Revenue growth.** Compound effects make early growth assumptions powerful. 2% higher growth for five years compounds significantly.

**Margins.** Operating margin improvements flow directly to cash flow. A company that can expand margins is worth more.

**Interview insight:** Always acknowledge that DCF is sensitive to assumptions. Saying "it depends on the inputs" shows sophistication. Running sensitivity tables shows rigor.

---

## Common Interview Questions

**"Walk me through a DCF."**

Use this framework (60-90 seconds):

> "A DCF values a company based on its projected future cash flows, discounted to present value.
>
> First, project free cash flows for 5-10 years. Free cash flow equals EBIT minus taxes, plus D&A, minus CapEx, minus changes in working capital.
>
> Second, calculate terminal value using either perpetuity growth or an exit multiple. Terminal value captures everything beyond the projection period.
>
> Third, discount all cash flows back to present using WACC—the weighted average cost of capital.
>
> Finally, sum the present values to get enterprise value. Subtract net debt to get equity value."

**"What discount rate do you use?"**

> "WACC—the weighted average cost of capital. It blends the cost of equity and after-tax cost of debt, weighted by their proportions in the capital structure. Cost of equity typically comes from CAPM."

**"Why do you use unlevered free cash flow?"**

> "Because we're calculating enterprise value, which is independent of capital structure. Unlevered FCF represents cash available to all capital providers—both debt and equity. We account for capital structure in WACC instead."

**"What if FCF is negative?"**

> "Negative FCF is fine—many growing companies burn cash. Project until FCF turns positive and the business reaches steady state. Make sure your terminal value assumptions reflect a normalized, cash-flow-positive business."

**"How do you pick the terminal growth rate?"**

> "It should approximate long-term GDP growth—typically 2-3%. No company can grow faster than the economy forever. I'd also cross-check against the exit multiple method to ensure consistency."

**"What are the limitations of DCF?"**

> "Three main ones. First, it's highly sensitive to terminal value assumptions, which are inherently uncertain. Second, it requires many inputs that involve judgment—growth rates, margins, discount rates. Third, it's less useful for companies with unpredictable cash flows, like early-stage startups or turnarounds."

---

## The DCF Killer Questions

These separate prepared candidates from truly prepared ones:

**"WACC uses market value weights. But if you're valuing the company, you don't know market value yet. How do you solve this circularity?"**

> "It's iterative. Start with an assumed capital structure based on comparables. Calculate enterprise value. Check if the implied debt/equity ratio matches your assumption. Adjust and repeat until it converges. In practice, the circularity matters less than people think—small changes in weights have modest effects."

**"Should you use levered or unlevered beta in WACC?"**

> "Unlevered beta reflects pure business risk. You unlever comparable betas to remove their capital structure effects, then relever to your target's capital structure. This ensures the beta reflects the target's specific leverage, not the comparables'."

**"What's the relationship between WACC and growth in the terminal value formula?"**

> "WACC minus growth is the denominator. As growth approaches WACC, terminal value approaches infinity—which is nonsensical. This mathematical constraint is why terminal growth must stay well below WACC. Practically, growth above 3-4% is almost never defensible."

---

## Practice Problems

**Problem 1:** A company has EBITDA of $50M, D&A of $10M, CapEx of $15M, and working capital increased by $5M. Tax rate is 25%. What's the free cash flow?

**Problem 2:** Terminal year FCF is $20M. WACC is 9%. Terminal growth is 2%. What's the terminal value?

**Problem 3:** You have five years of FCF: $10M, $12M, $14M, $16M, $18M. Terminal value is $300M. WACC is 10%. What's enterprise value?

**Problem 4:** Enterprise value is $500M. The company has $100M debt and $30M cash. 10M shares outstanding. What's the share price?

*(Answers: 1. $25M; 2. $291.4M; 3. $239.5M; 4. $43/share)*

---

## The Bottom Line

The DCF is not complicated. It's five steps with clear mechanics.

The difficulty is judgment. Every input requires a decision. Growth rates, margins, terminal assumptions, discount rates—each involves uncertainty.

Master the mechanics until they're automatic. Then focus on the assumptions. Know why you'd choose 3% terminal growth instead of 2%. Know when a 12% WACC makes sense versus 9%.

That's what separates candidates who memorized formulas from candidates who understand valuation.

Interviewers can tell the difference. Make sure you're in the second group.
