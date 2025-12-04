---
title: "TMT Technical Interview Deep Dive: SaaS Metrics, Software Valuations, and Sector-Specific Questions"
slug: tmt-technical-interview-deep-dive
excerpt: TMT interviews test whether you understand how technology companies actually make money. Here's every metric, valuation method, and question type you'll face—with frameworks for answering them.
category: technical-interview
tags: [tmt, saas, software, technology, valuation, interviews, technical]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# TMT Technical Interview Deep Dive: SaaS Metrics, Software Valuations, and Sector-Specific Questions

A candidate walks into a TMT interview. The interviewer asks: "How would you value a high-growth SaaS company with negative EBITDA?"

The candidate freezes. They know DCF. They know comps. But those assume profitability. This company burns cash. The standard playbook doesn't apply.

TMT interviews expose this gap constantly. The sector has its own language, metrics, and valuation frameworks. Interviewers expect you to speak it fluently.

Here's everything you need to know—the metrics that matter, how to value unprofitable tech companies, and the specific questions that separate prepared candidates from everyone else.

---

## Why TMT Is Different

### The Profitability Problem

Traditional valuation assumes companies make money. You project EBITDA, apply a multiple, calculate enterprise value.

Many tech companies don't fit this model:

**They prioritize growth over profits.** Amazon was unprofitable for years while building market dominance. That was intentional.

**They invest heavily in customer acquisition.** Software companies spend aggressively to land customers, knowing subscription revenue compounds over time.

**Their unit economics may be excellent even when company-wide metrics look terrible.** A company losing money overall might have phenomenal margins on incremental revenue.

This requires different analytical tools.

### The Recurring Revenue Model

Most software companies sell subscriptions, not one-time products.

This changes everything:

**Predictability:** Recurring revenue creates visibility into future cash flows.

**Customer lifetime value:** Each customer represents years of revenue, not a single transaction.

**Compounding:** Revenue from existing customers plus new customer additions creates a growth flywheel.

Understanding recurring revenue mechanics is foundational to TMT analysis.

---

## Essential SaaS Metrics

### Revenue Metrics

**ARR (Annual Recurring Revenue):**
The annualized value of recurring subscription revenue. If you have $5M in monthly recurring revenue, ARR is $60M.

This is the primary revenue metric for subscription businesses.

**MRR (Monthly Recurring Revenue):**
Same concept, measured monthly. More granular for tracking short-term performance.

**ACV (Annual Contract Value):**
The average annualized revenue per customer contract. Important for understanding deal size and customer composition.

**TCV (Total Contract Value):**
The total value of a contract over its full term. A 3-year deal worth $100K/year has ACV of $100K and TCV of $300K.

### Growth Metrics

**ARR Growth Rate:**
Year-over-year percentage increase in ARR. The most watched metric for growth-stage software companies.

| Growth Rate | Interpretation |
|-------------|----------------|
| >100% | Hypergrowth (rare, early-stage) |
| 50-100% | Very high growth |
| 30-50% | Strong growth |
| 20-30% | Solid growth |
| <20% | Mature or struggling |

**Net Revenue Retention (NRR):**
Revenue from existing customers this year divided by revenue from those same customers last year.

NRR > 100% means customers spend more over time (expansion revenue exceeds churn).

| NRR | Interpretation |
|-----|----------------|
| >130% | Exceptional (best-in-class) |
| 110-130% | Strong |
| 100-110% | Healthy |
| <100% | Concerning (shrinking customers) |

**Gross Revenue Retention (GRR):**
Same calculation but excluding expansion—just measuring customer losses. Caps at 100%.

GRR above 90% is typically considered healthy.

### Customer Metrics

**CAC (Customer Acquisition Cost):**
Total sales and marketing cost divided by number of new customers acquired.

**LTV (Lifetime Value):**
The total revenue (or gross profit) you'll generate from a customer over the entire relationship.

Calculated as: (Average Revenue per Customer × Gross Margin) / Churn Rate

**LTV/CAC Ratio:**
How much value you create per dollar of acquisition spend.

| LTV/CAC | Interpretation |
|---------|----------------|
| >5x | Very efficient (could invest more in growth) |
| 3-5x | Healthy |
| 1-3x | Concerning |
| <1x | Destroying value |

**CAC Payback Period:**
Months to recover customer acquisition cost. Under 12 months is generally healthy for SMB; enterprise can be longer.

### Efficiency Metrics

**Rule of 40:**
Growth rate plus profit margin should exceed 40%.

A company growing 50% with -10% margins hits the rule (40%). A company growing 20% needs 20%+ margins.

This balances growth and profitability in a single metric.

**Magic Number:**
Net new ARR divided by prior period sales and marketing spend.

| Magic Number | Interpretation |
|--------------|----------------|
| >1.0 | Efficient—invest more |
| 0.5-1.0 | Normal range |
| <0.5 | Inefficient |

**Net Dollar Retention:**
Another term for NRR. Shows whether existing customers grow, shrink, or leave.

---

## Valuing Tech Companies

### Revenue Multiples

When companies lack meaningful EBITDA, revenue multiples become primary.

**EV/Revenue:**
Enterprise value divided by revenue. The default metric for growth-stage tech.

**EV/ARR:**
Enterprise value divided by annual recurring revenue. Preferred because ARR is more predictable than total revenue.

**What drives revenue multiples:**

| Factor | Higher Multiple | Lower Multiple |
|--------|-----------------|----------------|
| Growth rate | Faster | Slower |
| Net retention | Higher | Lower |
| Gross margin | Higher | Lower |
| TAM | Larger | Smaller |
| Competitive position | Stronger | Weaker |

### The Growth-Adjusted Multiple

Raw revenue multiples are misleading without growth context.

Two companies at 10x revenue:
- Company A: Growing 80%
- Company B: Growing 20%

Company A is much cheaper on a growth-adjusted basis.

**EV/Revenue/Growth (Rule of X):**
Divide the revenue multiple by the growth rate.

Company A: 10x / 80% = 0.125x
Company B: 10x / 20% = 0.5x

Lower is cheaper. Company A is 4x cheaper adjusted for growth.

### DCF for Tech Companies

DCF works for tech—you just need longer projection periods.

**The typical approach:**

1. Project revenue growth over 5-10 years
2. Model margin expansion toward maturity
3. Apply terminal multiple on stabilized metrics
4. Discount to present value

**Key assumptions:**

**Revenue growth trajectory:** High growth decelerates over time. A company growing 100% doesn't sustain that for a decade.

**Margin expansion:** Growth-stage companies invest in growth. As growth slows, they should expand margins. Model the path from current margins to target margins.

**Terminal state:** What does this company look like at maturity? What's the right terminal multiple for a mature software company?

### Sum-of-the-Parts

For diversified tech companies with multiple business lines:

1. Value each segment using appropriate methodology
2. Apply segment-specific multiples
3. Sum the values
4. Adjust for corporate costs

This matters for companies like Amazon (e-commerce, AWS, advertising) or Microsoft (cloud, productivity, gaming).

---

## Sub-Sector Specifics

### Enterprise Software

**What matters:**
- ARR and growth rate
- Net revenue retention
- Sales efficiency (magic number)
- Gross margins (typically 70-80%+)

**Valuation approach:**
EV/ARR with adjustments for growth and retention.

**Key questions:**
- What's the land-and-expand motion?
- How sticky are customers (switching costs)?
- What's the competitive moat?

### Consumer Internet

**What matters:**
- User metrics (DAU, MAU, engagement)
- Monetization (ARPU)
- User acquisition cost
- Network effects

**Valuation approach:**
Often EV/Revenue or EV/User for early-stage. EBITDA multiples for mature platforms.

**Key questions:**
- Is there a network effect?
- What's the path to monetization?
- What's the engagement trajectory?

### E-Commerce

**What matters:**
- GMV (Gross Merchandise Value)
- Take rate (revenue/GMV)
- Customer acquisition cost
- Repeat purchase rate
- Fulfillment economics

**Valuation approach:**
EV/Revenue or EV/GMV. EBITDA multiples for profitable players.

**Key questions:**
- What's the unit economics of a transaction?
- Is there customer loyalty?
- What's the fulfillment cost structure?

### Payments/Fintech

**What matters:**
- Payment volume
- Take rate
- Net revenue (after interchange)
- Customer acquisition and retention

**Valuation approach:**
EV/Revenue is common. Profitable fintechs trade on EV/EBITDA.

**Key questions:**
- What's the value chain position?
- Is the take rate sustainable?
- What's the regulatory exposure?

### Hardware/Semiconductors

**What matters:**
- Revenue growth and cyclicality
- Gross margins
- R&D efficiency
- Design win pipeline

**Valuation approach:**
Traditional EV/EBITDA and P/E. Hardware is more cyclical than software.

**Key questions:**
- Where in the cycle are we?
- What's the technology roadmap?
- What's the competitive position?

---

## Common Interview Questions

### Valuation Questions

**"How would you value a SaaS company with negative EBITDA?"**

Use revenue multiples as the primary approach. Look at EV/ARR or EV/Revenue for comparable companies. Adjust for relative growth rate, net retention, and gross margins.

You can also run a DCF with longer projections that model the path to profitability. Assume growth deceleration and margin expansion as the company matures. The terminal value will be the bulk of the value.

**"Why do software companies trade at higher multiples than traditional businesses?"**

Several reasons compound:

First, high gross margins. Software gross margins are 70-80%+ versus 30-40% for many traditional businesses. More revenue converts to profit.

Second, recurring revenue. Subscription models create predictable, compounding revenue streams. This reduces risk and supports higher valuations.

Third, scalability. Software has minimal marginal cost. Adding customers costs almost nothing compared to manufacturing businesses.

Fourth, network effects. Many software businesses become more valuable as more users adopt them, creating competitive moats.

**"Walk me through how you'd value Salesforce."**

Start with comparable companies—other enterprise SaaS businesses like ServiceNow, Workday, Adobe's cloud business. Calculate EV/Revenue and EV/ARR multiples.

Adjust for Salesforce's specific characteristics: its growth rate, net retention (historically >120%), and profitability profile.

Run a DCF projecting revenue growth decelerating from current rates toward 10-15% at maturity. Model margin expansion toward 25-30% operating margins. Apply a terminal multiple on the stabilized business.

Cross-check revenue-based valuation against EBITDA-based valuation as the company matures and generates meaningful profits.

### Metrics Questions

**"What's the difference between ARR and revenue?"**

ARR is the annualized value of recurring subscription contracts. Revenue includes one-time items like professional services, implementation fees, and hardware.

ARR is typically more valuable because it's predictable and recurring. Revenue can include lower-quality one-time items.

For a pure SaaS company, ARR and annualized revenue might be close. For companies with significant services revenue, they can differ materially.

**"Why does net revenue retention matter?"**

Net revenue retention shows whether your existing customer base is growing, shrinking, or stable.

NRR above 100% means you can grow even without acquiring new customers—existing customers spend more each year than you lose to churn.

This compounds over time. A company with 120% NRR will double its cohort revenue in under 4 years just from expansion. A company with 90% NRR will see its cohorts shrink by half in about 7 years.

High NRR indicates product-market fit, expansion opportunities, and customer satisfaction. It's one of the best predictors of durable growth.

**"How do you calculate LTV/CAC?"**

LTV = (Average Revenue per Customer × Gross Margin) / Annual Churn Rate

CAC = Total Sales and Marketing Spend / Number of New Customers

Example: $10,000 average revenue, 80% gross margin, 10% annual churn.
LTV = ($10,000 × 0.80) / 0.10 = $80,000

If CAC is $20,000, LTV/CAC is 4.0x—healthy but not exceptional.

**"What's Rule of 40?"**

Growth rate plus profit margin should exceed 40%.

For a company growing 60% with -15% EBITDA margins: 60 + (-15) = 45. Passes the rule.

For a company growing 25% with 10% margins: 25 + 10 = 35. Fails the rule.

The rule balances growth and profitability. A company can be excellent by being hypergrowth, by being highly profitable, or by being solid on both dimensions.

### Deal Questions

**"Why would a strategic acquirer pay a premium for a software company?"**

Strategics can extract synergies unavailable to financial buyers:

Revenue synergies: Cross-sell to existing customer base. A CRM company acquiring an email marketing tool can sell to all its CRM customers.

Cost synergies: Eliminate redundant functions. Combined G&A, consolidated infrastructure, shared sales resources.

Product synergies: Integrate capabilities into a more valuable combined offering.

Competitive reasons: Prevent a competitor from acquiring the asset.

**"How would you think about Salesforce acquiring Slack?"**

Strategic rationale: Salesforce wanted a collaboration platform to compete with Microsoft Teams. Slack provides enterprise communication integrated with Salesforce's CRM and productivity tools.

Valuation considerations: Slack was trading at a significant revenue multiple given growth deceleration concerns. Salesforce paid a premium for strategic value.

Synergy case: Cross-sell Slack to Salesforce's 150K+ customers. Integrate Slack into Salesforce workflows. Retain Slack customers in the Salesforce ecosystem.

Risk factors: Integration execution. Microsoft Teams competition. Revenue synergy realization.

---

## Framework for TMT Questions

### The Quick Response Framework

For any TMT technical question, structure your answer:

1. **Define the concept clearly** (what it is)
2. **Explain why it matters** (context and importance)
3. **Give specific examples** (concrete application)
4. **Acknowledge nuances** (when it varies or breaks down)

### The Valuation Framework

When asked to value any tech company:

1. **Identify the business model** (SaaS, marketplace, e-commerce, etc.)
2. **Select appropriate metrics** (ARR for SaaS, GMV for marketplace)
3. **Choose the right methodology** (revenue multiples for growth, EBITDA for mature)
4. **Consider what drives premium/discount** (growth, retention, margins, TAM)
5. **Sanity check your answer** (does the implied value make sense?)

---

## Key Takeaways

TMT interviews test sector-specific knowledge that generic interview prep doesn't cover.

**Master these metrics:**
- ARR, NRR, GRR
- CAC, LTV, LTV/CAC
- Rule of 40, Magic Number
- Growth rates and margin profiles

**Understand these valuation approaches:**
- Revenue multiples for growth companies
- Growth-adjusted multiples for comparison
- DCF with margin expansion modeling
- Sum-of-the-parts for diversified tech

**Be ready to discuss:**
- Why tech trades at premium multiples
- How to value unprofitable companies
- Specific sub-sector dynamics
- Strategic rationale for tech M&A

The best TMT candidates don't just know the metrics—they understand why they matter and how they connect to value creation.

Interviewers can tell the difference between memorized definitions and genuine understanding. Build the understanding first. The interview performance follows.
