---
title: "Walk Me Through a DCF: How to Deliver the Perfect Answer to Finance's Most Common Question"
slug: walk-me-through-a-dcf
excerpt: "Walk me through a DCF" is the most common question in finance interviews. Here's exactly how to answer it—with the structure, depth, and confidence that gets offers.
category: technical-interviews
tags: [DCF, discounted cash flow, valuation, technical interview, WACC, terminal value, free cash flow]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# Walk Me Through a DCF: How to Deliver the Perfect Answer to Finance's Most Common Question

"Walk me through a DCF."

Six words. Delivered in almost every finance interview. How you answer reveals whether you understand valuation or just memorized formulas.

Most candidates rush through the mechanics. They rattle off steps without explaining why. They mention WACC without knowing what it represents. They calculate terminal value without questioning the assumptions.

The best candidates do something different. They tell a story. A DCF is a story about a company's future—how much cash it will generate and what that cash is worth today. When you frame it that way, the interview becomes a conversation, not an interrogation.

Here's how to deliver the perfect DCF walkthrough.

---

## The 30-Second Answer

When asked "Walk me through a DCF," start with the high-level structure:

> "A DCF values a company based on the present value of its future cash flows. There are three main steps: First, project the company's free cash flows for 5-10 years. Second, calculate a terminal value representing all cash flows beyond the projection period. Third, discount everything back to today using the weighted average cost of capital. The sum of the discounted cash flows and terminal value gives you enterprise value. To get equity value, subtract net debt."

That's your opening. It shows you understand the concept and can communicate clearly. Most interviewers will then drill down into specific components.

---

## The Full Walkthrough

### Step 1: Project Free Cash Flows

**What you're doing:**
Estimating how much cash the company will generate each year.

**Start with revenue:**
Build from historical growth rates, industry trends, management guidance, or bottoms-up analysis. For a quick interview answer, you might assume 5-10% annual growth for a mature company.

**Get to EBIT (Operating Income):**
Apply operating margin assumptions. Are margins expanding, stable, or compressing? Why?

**Calculate taxes:**
Apply the marginal tax rate to EBIT.

**EBIT × (1 - Tax Rate) = NOPAT (Net Operating Profit After Tax)**

**Adjust for non-cash and investment items:**

```
Free Cash Flow = NOPAT
              + Depreciation & Amortization
              - Capital Expenditures
              - Changes in Working Capital
```

**Why each adjustment:**
- **Add D&A**: Non-cash expense that reduced EBIT but didn't use cash
- **Subtract CapEx**: Cash spent on assets needed for growth
- **Subtract Working Capital increases**: Cash tied up in operations

**The projection period:**
Typically 5-10 years. Long enough to capture growth trajectory. Not so long that you're just making things up.

### Step 2: Calculate Terminal Value

**The problem:**
Companies don't stop existing after year 5 or 10. You need to capture the value of all future cash flows.

**Two methods:**

**A) Gordon Growth Model (Perpetuity Growth)**
```
Terminal Value = Final Year FCF × (1 + g) / (WACC - g)
```

Where g = perpetual growth rate (typically 2-3%, in line with GDP growth)

**B) Exit Multiple Method**
```
Terminal Value = Final Year EBITDA × Exit Multiple
```

Exit multiple based on comparable company valuations.

**Which to use:**
Gordon Growth is theoretically cleaner. Exit multiple is more common in practice. Know both. Most models calculate both for a sanity check.

**Critical insight:**
Terminal value often represents 60-80% of total DCF value. Small changes in assumptions (growth rate, exit multiple) dramatically impact valuation. This is why DCFs require sensitivity analysis.

### Step 3: Determine the Discount Rate (WACC)

**What WACC represents:**
The blended cost of all capital (debt and equity). It's the return investors require given the risk.

**The formula:**
```
WACC = (E/V × Re) + (D/V × Rd × (1 - T))
```

Where:
- E/V = Equity weight
- Re = Cost of equity
- D/V = Debt weight
- Rd = Cost of debt
- T = Tax rate

**Cost of equity (using CAPM):**
```
Re = Rf + β × (Rm - Rf)
```

Where:
- Rf = Risk-free rate (10-year Treasury)
- β = Beta (stock's sensitivity to market)
- Rm - Rf = Equity risk premium

**Cost of debt:**
Interest rate on the company's debt, tax-adjusted because interest is deductible.

**Typical WACC ranges:**
- Large, stable companies: 7-10%
- Growth companies: 10-14%
- High-risk or startups: 15%+

### Step 4: Discount and Sum

**The mechanics:**
```
Present Value = FCF₁/(1+WACC)¹ + FCF₂/(1+WACC)² + ... + (FCFₙ + TV)/(1+WACC)ⁿ
```

**What you get:**
Enterprise Value—the value of the operating business.

### Step 5: Bridge to Equity Value

**The adjustment:**
```
Equity Value = Enterprise Value - Net Debt
```

Where Net Debt = Total Debt - Cash

**Why:**
Enterprise value represents total business value. To get what shareholders own, subtract claims senior to equity (debt) and add liquid assets (cash).

**Per share value:**
```
Implied Share Price = Equity Value / Shares Outstanding
```

Compare to current stock price to assess under/overvaluation.

---

## The Interview Dialogue

Here's how the full conversation might go:

**Interviewer:** "Walk me through a DCF."

**You:** "A DCF values a company based on the present value of its future cash flows. There are three main steps.

First, I'd project free cash flows for 5-10 years. I'd start with revenue projections based on historical growth and industry trends, apply margin assumptions to get operating income, tax-adjust to NOPAT, then adjust for depreciation, capital expenditures, and working capital changes.

Second, I'd calculate a terminal value to capture cash flows beyond the projection period. I could use either the Gordon Growth model—applying a perpetual growth rate to final year cash flow—or an exit multiple approach using comparable company EBITDA multiples.

Third, I'd discount all cash flows and terminal value back to present using WACC. That gives me enterprise value. To get equity value, I'd subtract net debt."

**Interviewer:** "How do you calculate WACC?"

**You:** "WACC is the weighted average of the cost of equity and after-tax cost of debt, weighted by their proportions in the capital structure.

For cost of equity, I'd use CAPM: risk-free rate plus beta times the equity risk premium. Risk-free rate is typically the 10-year Treasury. Beta measures the stock's volatility relative to the market. Equity risk premium is usually 5-6%.

For cost of debt, I'd use the company's current borrowing rate, tax-adjusted since interest is deductible."

**Interviewer:** "Why do we use WACC as the discount rate?"

**You:** "WACC represents the return required by all capital providers. Since free cash flow is available to both debt and equity holders—it's calculated before interest payments—we discount it at the blended cost of all capital. If we were discounting cash flows just to equity, we'd use cost of equity instead."

---

## Common Follow-Up Questions

### On Free Cash Flow

**"Why do we add back depreciation?"**

Depreciation is a non-cash expense. It reduced EBIT, but no cash left the company. Since we're measuring cash flow, we add it back.

**"Why do we subtract CapEx?"**

Capital expenditures are actual cash spent on assets. Unlike depreciation (which allocates past spending), CapEx represents current cash outflows needed to maintain and grow the business.

**"How do you project working capital?"**

Typically as a percentage of revenue. Calculate historical working capital ratios (receivables, inventory, payables as percent of revenue), then apply to projected revenue. Increase in working capital consumes cash; decrease releases cash.

### On Terminal Value

**"What growth rate do you use in the Gordon Growth model?"**

Typically 2-3%—in line with long-term GDP growth. A company can't grow faster than the economy forever. If it did, it would eventually become larger than the entire economy.

**"What if the perpetual growth rate exceeds WACC?"**

The formula breaks down. Terminal value would be infinite or negative. This signals your assumptions are unrealistic. Perpetual growth must be less than WACC.

**"Why might you prefer exit multiples over Gordon Growth?"**

Exit multiples are based on observable market data. They're easier to defend and sanity-check. The Gordon Growth model is theoretically elegant but very sensitive to the growth rate assumption.

### On WACC

**"Where does beta come from?"**

Published betas from financial databases (Bloomberg, Capital IQ) or calculated from historical stock returns versus market returns. For private companies, use comparable company betas and unlever/relever for different capital structures.

**"What if the company has no debt?"**

Then WACC equals cost of equity. But pure equity financing is rare for established companies.

**"How does changing WACC affect the valuation?"**

Higher WACC means more discounting, lower present value, lower valuation. Lower WACC means less discounting, higher valuation. The relationship is inverse.

### On the Output

**"Your DCF says the stock is worth $50. It trades at $40. What do you conclude?"**

I'd conclude the stock might be undervalued, but I'd want to understand why. DCF outputs depend heavily on assumptions. I'd run sensitivity analysis on key drivers—revenue growth, margins, WACC, terminal value—to see the range of outcomes. If the stock is worth $50 in my base case but $35-45 in downside scenarios, the market might be more pessimistic than I am.

**"What are the main limitations of DCF analysis?"**

Three big ones:
1. **Assumption sensitivity**: Small changes in growth or discount rate dramatically change the output.
2. **Terminal value dominance**: Most of the value comes from years we can't reliably forecast.
3. **Garbage in, garbage out**: DCF is only as good as the projections feeding it.

---

## The 2-Minute Version

Sometimes interviewers want speed. Here's the compressed answer:

> "A DCF values a company by discounting its future cash flows to present value.
>
> I'd project free cash flows for five to ten years—starting with revenue, applying margins, adjusting for taxes, D&A, CapEx, and working capital.
>
> I'd calculate terminal value using either Gordon Growth or an exit multiple.
>
> I'd discount everything at WACC—the blended cost of debt and equity.
>
> The sum gives me enterprise value. Subtract net debt to get equity value. Divide by shares for implied share price."

That's 30 seconds. Delivered with confidence, it's a strong answer. The interviewer will probe on specific areas if they want more depth.

---

## Building the Full Model

### The Conceptual Framework

A complete DCF model has these sections:

1. **Assumptions page**: Revenue growth, margins, CapEx, working capital, WACC components
2. **Income statement projections**: Revenue to EBIT
3. **Free cash flow buildup**: NOPAT to FCF
4. **Terminal value calculation**: Both methods
5. **Discounting schedule**: Present value factors and calculations
6. **Enterprise to equity bridge**: Net debt adjustment
7. **Sensitivity analysis**: Key variable impacts
8. **Football field chart**: Range of outcomes versus other methodologies

### The Mental Model

When building or explaining a DCF, think in layers:

**Layer 1: The Business**
What does this company do? How does it make money? What drives growth?

**Layer 2: The Projections**
Can the business sustain this growth? Are margins realistic? What investment is needed?

**Layer 3: The Value**
What return do investors require? How do you handle the distant future?

**Layer 4: The Reality Check**
Does the output make sense? How does it compare to market value and other methods?

---

## Common Mistakes

### Mechanical Errors

**Double-counting depreciation:**
If you start with net income (which already includes D&A), add D&A back. If you start with EBITDA (which excludes D&A), don't add it again.

**Forgetting working capital:**
Working capital changes affect cash flow. Growing companies typically require more working capital, consuming cash.

**Using book values for WACC:**
Cost of equity and debt weights should use market values, not book values.

### Conceptual Errors

**Unrealistic terminal growth:**
3% is reasonable. 6% forever means the company outgrows the economy.

**Ignoring capital structure in WACC:**
If you're valuing a company with different leverage than comparables, adjust for the difference.

**Not running sensitivities:**
A DCF with one output is useless. Always show how value changes with different assumptions.

### Presentation Errors

**Starting with the formula:**
"DCF stands for discounted cash flow and the formula is..." Boring. Start with what you're doing and why.

**Getting lost in details:**
Interviewers want to see that you understand the concept, not that you've memorized every step. Structure first, details when asked.

---

## The Deeper Understanding

### Why DCF Matters

DCF is the theoretical foundation of all valuation. Every other method (comps, precedents) is ultimately a shortcut for estimating what a DCF would show.

When you buy a stock, you're buying a claim on future cash flows. DCF makes that claim explicit. It forces you to articulate your assumptions.

### When DCF Works Best

- Stable, mature companies with predictable cash flows
- Situations where comparables aren't available
- Long-term investment analysis
- Understanding what's priced into a stock

### When DCF Works Less Well

- Early-stage companies with negative cash flows
- Highly cyclical businesses
- Companies facing disruption
- When comparable transactions are available

---

## Final Answer Template

Here's a complete template you can adapt:

> "A DCF values a company by discounting its projected future cash flows to present value.
>
> **Step one** is projecting free cash flows. I'd start with revenue, apply operating margin assumptions to get EBIT, tax-adjust to get NOPAT, then add back depreciation and subtract CapEx and working capital changes. That gives me unlevered free cash flow for each year.
>
> **Step two** is terminal value. Beyond the projection period—usually 5-10 years—I'd estimate remaining value using either the Gordon Growth model, applying a 2-3% perpetual growth rate, or an exit multiple on final year EBITDA. Terminal value often represents the majority of total value.
>
> **Step three** is discounting. I'd discount all cash flows at WACC, which blends the cost of equity—calculated using CAPM—and the after-tax cost of debt, weighted by their proportions in the capital structure.
>
> The sum of discounted cash flows and terminal value equals enterprise value. Subtract net debt to get equity value, then divide by shares outstanding for implied share price.
>
> The key is sensitivity analysis—DCF outputs are only as reliable as the assumptions. I'd always show how the value changes with different growth rates, margins, and discount rates."

Say this with confidence, and you'll handle any DCF question they ask.
