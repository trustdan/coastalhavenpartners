---
title: "Sum of the Parts Valuation: When to Use SOTP and How to Build It"
slug: sum-of-the-parts-valuation
excerpt: Some companies are worth more in pieces than as a whole. Sum-of-the-parts analysis identifies hidden value and drives activist campaigns. Here's when to use SOTP and how to build it properly.
category: technical-interview
tags: [SOTP, valuation, conglomerates, breakup analysis, interviews, M&A]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# Sum of the Parts Valuation: When to Use SOTP and How to Build It

General Electric traded at a 25% discount to its sum-of-the-parts value for years. Activists and analysts pointed this out constantly. Eventually, GE broke itself into three separate companies.

That's the power of SOTP analysis. It reveals when diversified companies trade below what their individual businesses would fetch. It drives spinoffs, divestitures, and activist campaigns. It's a staple of investment banking pitch books.

Not every company deserves SOTP analysis. But when it applies, it can be the most insightful valuation method available.

Here's how to know when SOTP is appropriate and how to build one that stands up to scrutiny.

---

## What Sum of the Parts Actually Does

### The Core Concept

SOTP values each business segment separately, then adds them together.

Instead of applying one multiple to consolidated financials, you apply different multiples to each division. A technology segment gets tech multiples. A manufacturing segment gets industrial multiples.

**The formula is simple:**

```
Enterprise Value = Segment A Value + Segment B Value + Segment C Value - Corporate Costs + Cash - Debt
```

**Why this matters:**

When a conglomerate has businesses in different industries, a single blended multiple obscures reality. A holding company with software and steel divisions shouldn't be valued on steel multiples alone.

SOTP reveals the "conglomerate discount"—the gap between what the pieces are worth and what the whole trades for.

### When SOTP Is Necessary

**Diversified conglomerates.** Companies operating in multiple unrelated industries. Think Berkshire Hathaway, Honeywell, or Johnson & Johnson pre-split.

**Companies with distinct business units.** Even focused companies sometimes have segments with very different growth profiles and margins.

**Activist situations.** When investors push for breakups or spinoffs, SOTP justifies the value creation thesis.

**M&A analysis.** Acquirers may want specific divisions, not the whole company. SOTP identifies which pieces drive value.

**Hidden value scenarios.** High-growth divisions buried inside low-growth conglomerates.

### When Not to Use SOTP

**Integrated businesses.** When segments share supply chains, customers, or technology, separating them destroys value.

**Single-industry companies.** A pure-play software company doesn't need SOTP.

**Insufficient segment disclosure.** If you can't get segment-level financials, SOTP becomes guesswork.

**Small segment differences.** If all segments have similar growth and margins, SOTP adds complexity without insight.

---

## The SOTP Framework

### Step 1: Identify Distinct Segments

Start with how the company reports. Most public companies disclose segment-level financials in SEC filings (10-K, 10-Q).

**What to look for:**
- Revenue by segment
- Operating income or EBITDA by segment
- Assets by segment
- Geographic breakdowns

**Example: Healthcare Conglomerate**

| Segment | Revenue | EBITDA | EBITDA Margin |
|---------|---------|--------|---------------|
| Pharmaceuticals | $40B | $16B | 40% |
| Medical Devices | $25B | $6.25B | 25% |
| Consumer Health | $15B | $2.25B | 15% |
| **Total** | **$80B** | **$24.5B** | **30.6%** |

Each segment has different characteristics requiring different valuation approaches.

### Step 2: Select Appropriate Comparables

Each segment needs its own peer group. Don't apply pharmaceutical multiples to consumer health.

**For the healthcare conglomerate:**

| Segment | Comparable Companies | Typical EV/EBITDA |
|---------|---------------------|-------------------|
| Pharmaceuticals | Pfizer, Merck, AbbVie | 10-14x |
| Medical Devices | Medtronic, Stryker, Abbott | 14-18x |
| Consumer Health | P&G (consumer), Church & Dwight | 12-15x |

**Key considerations:**
- Match growth profiles, not just industries
- Consider margin comparability
- Look at size-appropriate peers
- Factor in geographic mix

### Step 3: Apply Segment-Specific Multiples

Multiply each segment's financial metric by its appropriate multiple.

**Example valuation:**

| Segment | EBITDA | Multiple | Segment Value |
|---------|--------|----------|---------------|
| Pharmaceuticals | $16B | 12x | $192B |
| Medical Devices | $6.25B | 16x | $100B |
| Consumer Health | $2.25B | 13x | $29.25B |
| **Sum of Segments** | | | **$321.25B** |

### Step 4: Adjust for Corporate Items

**Subtract corporate costs:**

Holding companies have overhead—corporate management, shared services, public company costs. These don't generate value.

Typical approach: Capitalize unallocated corporate costs at a multiple.

```
Corporate Drag = Unallocated Corporate Expenses × 8-10x
```

If corporate overhead is $500M annually:
Corporate value reduction = $500M × 9x = $4.5B

**Add cash and subtract debt:**

```
Equity Value = Sum of Segment EVs - Corporate Drag + Cash - Debt
```

**Complete example:**

| Component | Value |
|-----------|-------|
| Sum of Segment EVs | $321.25B |
| Less: Corporate costs (capitalized) | ($4.5B) |
| **Total Enterprise Value** | **$316.75B** |
| Plus: Cash | $10B |
| Less: Debt | ($30B) |
| **Equity Value** | **$296.75B** |

If shares outstanding = 2.5B:
**SOTP Share Price = $118.70**

If current share price = $100:
**Implied Discount = 16%**

---

## Advanced SOTP Considerations

### Multiple Selection Nuances

**Growth-adjusted multiples:**

Not all segments within an industry grow equally. A 15% growth segment deserves a higher multiple than a 5% growth peer.

**Approach:** Regression analysis plotting EV/EBITDA against growth rates for comparables. Apply the regression-implied multiple.

**Margin adjustments:**

Higher-margin businesses typically command premium multiples within an industry.

**Size discounts:**

If a segment would be small as a standalone company, apply a size discount to comparables-based multiples.

### Handling Cross-Segment Synergies

**Revenue synergies:**

When segments sell to each other, separation destroys that revenue.

**Example:** A semiconductor company's chip division sells to its device division. Standalone chip company loses that internal customer.

**Adjustment:** Reduce segment revenue to reflect loss of intercompany sales.

**Cost synergies:**

Shared services, procurement scale, and back-office functions may not survive separation.

**Approach:** Add estimated dis-synergy costs to corporate overhead before capitalizing.

### Different Valuation Methods by Segment

SOTP doesn't require identical methods for each segment.

| Segment Type | Appropriate Method |
|--------------|-------------------|
| Stable cash generator | EV/EBITDA multiple |
| High-growth division | Revenue multiple or DCF |
| Real estate holdings | NAV (asset value) |
| Financial services | P/E or P/B |
| Early-stage venture | Funding round benchmarks |

**Example: Technology conglomerate with real estate**

- Software segment: 15x Revenue ($10B revenue = $150B)
- Hardware segment: 10x EBITDA ($5B EBITDA = $50B)
- Real estate: NAV of owned properties ($8B)

---

## The Conglomerate Discount

### Why Discounts Exist

Diversified companies typically trade below sum-of-the-parts value. Reasons include:

**Investor preference for pure-plays.** Fund managers want targeted exposure. Tech funds want tech stocks, not conglomerates that happen to own tech divisions.

**Capital allocation concerns.** Conglomerates may subsidize underperforming divisions with cash from winners. Investors can allocate capital themselves.

**Complexity premium.** Harder to analyze means higher perceived risk means lower valuation.

**Management distraction.** Running disparate businesses dilutes focus.

**Lack of comparables.** Conglomerates don't fit neatly into peer groups.

### Typical Discount Ranges

| Conglomerate Type | Typical Discount |
|-------------------|------------------|
| Related diversified | 5-15% |
| Unrelated diversified | 15-25% |
| Complex holding company | 20-30%+ |

**Note:** Discounts fluctuate with market conditions. During risk-off periods, conglomerate diversification becomes more valuable, narrowing discounts.

### When Discounts Close

**Activist involvement.** Pressure for spinoffs or divestitures.

**Strategic review announcements.** Management signals openness to separation.

**Peer breakups.** When competitors split, investors re-rate remaining conglomerates.

**Leadership changes.** New CEOs may pursue breakups that predecessors resisted.

---

## SOTP in M&A

### Analyzing Acquisition Targets

Acquirers often want specific pieces, not whole companies. SOTP identifies:

**Which segments drive value.** Are you paying for the gem or the rest?

**Implied prices for divestitures.** What could you sell post-acquisition?

**Synergy opportunities by segment.** Where does your company overlap?

**Example:**

Acquirer values target using SOTP. Segment A worth $5B. Segment B worth $2B. Total SOTP: $7B.

Target trades at $6B. Acquirer bids $6.5B. Plans to divest Segment B for $2B, effectively paying $4.5B for Segment A alone.

### Defense Against Activists

Companies use SOTP defensively too. When activists push for breakups:

**Challenge their comparables.** Their peer groups may be cherry-picked.

**Highlight synergies.** Quantify what separation destroys.

**Show execution risks.** Spinoffs have costs and distractions.

**Demonstrate management plan.** Show how current structure creates value.

---

## Interview Applications

### Standard Questions

**"When would you use SOTP analysis?"**

> "When a company has distinct business segments operating in different industries with different growth profiles and margins. The classic case is a diversified conglomerate where applying a single multiple obscures the value of individual businesses. SOTP is also useful for analyzing potential breakups, spinoffs, or targeted acquisitions."

**"Walk me through building an SOTP."**

> "First, identify distinct segments using company disclosure. Second, select appropriate comparables for each segment—peers in the same industry with similar characteristics. Third, apply segment-specific multiples to calculate each segment's enterprise value. Fourth, sum the segment values and adjust for corporate costs, cash, and debt. The result shows what the pieces are worth versus how the market values the whole."

**"What's a conglomerate discount?"**

> "The gap between a company's trading price and its sum-of-the-parts value. Diversified companies typically trade 10-25% below SOTP because investors prefer pure-play exposure, worry about capital allocation across divisions, and find conglomerates harder to analyze."

### Challenge Questions

**"Your SOTP shows 30% upside. Why isn't the stock already there?"**

> "Several reasons. First, my comparable selection or multiples could be aggressive. Second, the market may assign a conglomerate discount for valid reasons—complexity, capital allocation concerns, or perceived synergies I'm not crediting. Third, there may be no catalyst to close the gap. Value exists only if something forces realization."

**"How do you handle segments that transact with each other?"**

> "Intercompany transactions require adjustment. If Division A sells $500M to Division B, a standalone Division A would lose that revenue. I'd model standalone financials by removing intercompany sales and associated margin. Similarly, any shared costs need allocation or adjustment."

**"The company reports four segments, but you're only valuing three. Why?"**

> "When segments are too small to value separately, I might combine them or include them in a larger related segment. Materiality matters—a segment representing 2% of value doesn't need standalone treatment. I'd disclose the approach and ensure nothing material is missed."

### Judgment Questions

**"What multiple would you use for a segment with no pure-play comparables?"**

> "I'd triangulate. Look at the closest available peers, even if imperfect. Consider the segment's growth rate and margins relative to broader industry averages. Use a DCF as a cross-check. And be transparent about the uncertainty—this is where sensitivity analysis matters most."

**"How do you value the corporate segment?"**

> "Corporate overhead should be capitalized and subtracted. Take unallocated corporate costs and multiply by 8-10x—a lower multiple reflecting that these costs don't generate growth. Some analysts skip capitalization and just subtract annual costs, but that understates the ongoing drag."

---

## Practice Problem

**Company XYZ Reports:**

| Segment | Revenue | EBITDA | Description |
|---------|---------|--------|-------------|
| Software | $2B | $600M | Enterprise SaaS platform |
| Services | $1.5B | $225M | IT consulting |
| Hardware | $500M | $50M | Legacy equipment (declining) |
| Corporate | — | ($75M) | Unallocated overhead |

**Additional info:**
- Cash: $300M
- Debt: $800M
- Shares: 100M

**Comparable multiples:**
- SaaS: 20x EBITDA (high growth)
- IT Services: 12x EBITDA
- Hardware: 6x EBITDA

**Calculate:**
1. Segment values
2. Total enterprise value
3. Equity value and implied share price
4. If stock trades at $45, what's the implied discount?

**Solution:**

1. Segment values:
   - Software: $600M × 20x = $12B
   - Services: $225M × 12x = $2.7B
   - Hardware: $50M × 6x = $300M
   - Corporate: ($75M) × 8x = ($600M)
   - **Sum: $14.4B**

2. Enterprise value: $14.4B

3. Equity value: $14.4B + $300M - $800M = **$13.9B**
   Share price: $13.9B / 100M = **$139**

4. Implied discount: ($139 - $45) / $139 = **68% discount**

This enormous discount suggests either the analysis is flawed, the company has significant issues not captured in segment EBITDA, or the market sees something very negative about the business.

---

## Key Takeaways

SOTP analysis is powerful when applied correctly. It reveals hidden value in diversified companies and identifies when the market undervalues specific divisions.

**Know when to use it:**
- Diversified conglomerates
- Companies with distinct segment characteristics
- Breakup or spinoff analysis
- Targeted M&A

**Build it rigorously:**
- Use disclosed segment financials
- Select appropriate comparables for each segment
- Adjust for corporate costs and intercompany items
- Convert to equity value properly

**Interpret results carefully:**
- Conglomerate discounts exist for reasons
- Upside requires a catalyst
- Question your assumptions
- Sensitivity test key multiples

**The bottom line:**

Some companies are worth more dead than alive. SOTP tells you whether that's true and by how much.

But a gap between SOTP and market value isn't automatically an opportunity. You need a thesis for why the gap will close. Spinoffs take years. Activist campaigns face resistance. Management may prefer empire-building to value realization.

SOTP shows what could be. Investment judgment determines whether it will be.
