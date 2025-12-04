---
title: "Comparable Company Analysis (Comps): How to Value Companies Using Multiples"
slug: comparable-company-analysis
excerpt: Comps are the workhorse of investment banking valuation. Every analyst builds them. Every interview tests them. Here's how they actually work.
category: technical-interviews
tags: [valuation, comps, investment-banking, technical-interviews]
status: published
published_at: 2024-12-03
author: Coastal Haven Partners
---

# Comparable Company Analysis (Comps): How to Value Companies Using Multiples

Comparable company analysis is the most common valuation method in investment banking.

The logic is simple: similar companies should trade at similar valuations. Find companies like your target, see what multiples they trade at, apply those multiples to your target. You get a valuation range.

Comps appear in almost every pitch book and fairness opinion. They're tested in almost every interview. Understanding them deeply—not just mechanically—separates strong candidates from average ones.

This guide covers everything: the methodology, the mechanics, the judgment calls, and the interview questions that trip people up.

---

## What Comparable Company Analysis Is

Comps value a company by comparing it to similar publicly traded companies.

The process:
1. Select comparable companies
2. Gather financial data
3. Calculate valuation multiples
4. Apply multiples to the target company
5. Derive an implied valuation range

The output is typically a range: "Based on comparable companies, the target is worth $500-600 million."

Comps are also called "trading comps," "public comps," or "relative valuation."

---

## Why Comps Matter

### In Practice

Comps are everywhere in banking.

**Pitch books:** Every M&A pitch includes a comps analysis showing where the target trades relative to peers.

**Fairness opinions:** Boards need valuation analysis to approve deals. Comps are always included.

**IPO pricing:** Bankers use comps to price IPOs relative to public peers.

**Quick sanity checks:** When someone asks "what's this company worth?", the first answer usually comes from comps.

### In Interviews

Comps questions are interview staples.

Interviewers ask:
- Walk me through a comps analysis
- How do you select comparable companies?
- What multiples would you use for this type of company?
- Why might a company trade at a premium or discount to peers?

You'll answer these questions. Probably multiple times.

---

## Step 1: Select Comparable Companies

Peer selection is where judgment enters. It's also where most mistakes happen.

### Selection Criteria

Good comparables share characteristics with your target:

| Factor | Why It Matters |
|--------|----------------|
| Industry | Same industry means similar business models and risks |
| Size | Similar market cap or revenue implies similar scale economics |
| Growth rate | High-growth companies trade differently than mature ones |
| Profitability | Margin profiles affect valuation multiples |
| Geography | Regional factors affect multiples and risk |
| Business model | How they make money matters (subscription vs. transactional, B2B vs. B2C) |

### The Art of Selection

No company is a perfect comparable. Every peer differs somehow.

The question is: which differences matter most?

**Example:** You're valuing a mid-cap SaaS company growing 25% annually.

- A large-cap SaaS company growing 10% isn't comparable—different growth profile
- A mid-cap SaaS company growing 25% but in a different vertical is closer
- A mid-cap on-premise software company isn't comparable—different business model

Prioritize business model and growth. Size matters less than people think.

### How Many Comparables?

Aim for 5-15 companies.

Too few (under 5): Insufficient data points. One outlier skews results.

Too many (over 15): You're probably stretching the definition of "comparable."

Quality over quantity. Five truly comparable companies beat fifteen loosely related ones.

### Sources for Finding Comps

- **Company filings:** The target's 10-K often lists competitors
- **Equity research:** Analysts cover peer groups together
- **Industry databases:** Capital IQ, FactSet, Bloomberg
- **M&A precedents:** Past deals often identify relevant peers
- **Common sense:** Who competes with this company?

---

## Step 2: Gather Financial Data

Once you have your peer group, collect standardized financial data.

### What Data You Need

**Market data (as of a specific date):**
- Stock price
- Shares outstanding (diluted)
- Market capitalization

**Financial data (LTM or NTM):**
- Revenue
- EBITDA
- EBIT
- Net income
- Industry-specific metrics (subscribers, ARR, GMV, etc.)

**Balance sheet data:**
- Cash and cash equivalents
- Total debt
- Preferred stock
- Minority interest

### LTM vs. NTM

**LTM (Last Twelve Months):** Historical data. Actual results.

**NTM (Next Twelve Months):** Forward estimates. Based on analyst projections.

Both are used. NTM is often preferred for growth companies where the future differs from the past. LTM is useful when projections are uncertain.

Always label which you're using. Mixing them creates nonsensical comparisons.

### Calendarization

Fiscal years differ. One company ends in December, another in June.

Calendarize data to a common period. This ensures apples-to-apples comparison.

**Example:** For December 31, 2024 LTM data:
- Company with December fiscal year: Use FY2024 data
- Company with June fiscal year: Use Q3-Q4 FY2024 + Q1-Q2 FY2025 data

Most databases do this automatically. Understand what's happening.

---

## Step 3: Calculate Enterprise Value

Before calculating multiples, you need enterprise value.

### The Enterprise Value Formula

```
Enterprise Value = Equity Value + Debt - Cash + Preferred Stock + Minority Interest
```

Or more precisely:

```
Enterprise Value = Market Cap + Total Debt + Preferred Stock + Minority Interest - Cash & Equivalents
```

### Why Enterprise Value?

Enterprise value represents the total value of the business—what you'd pay to acquire it entirely.

Equity value only captures shareholder value. But a company also has obligations to debtholders. Enterprise value includes both.

**Analogy:** Buying a house. The equity value is your down payment. The enterprise value is the house price. The mortgage is debt. Cash in the bank account offsets what you need to pay.

### Components Explained

**Market capitalization:** Stock price × diluted shares outstanding. Use diluted shares (including options, RSUs, convertibles) not basic shares.

**Total debt:** All interest-bearing obligations. Short-term debt, long-term debt, capital leases. Not accounts payable (that's operating liability).

**Cash and equivalents:** Cash, marketable securities, short-term investments. Subtract because acquirer gets the cash.

**Preferred stock:** Treated like debt. Has priority over common equity.

**Minority interest:** The portion of subsidiaries not owned. Add because you're valuing the whole enterprise.

### Common Mistakes

**Using basic shares instead of diluted.** Always use fully diluted shares outstanding.

**Missing debt items.** Capital leases, unfunded pensions, and other debt-like items are often missed.

**Including restricted cash.** Only subtract unrestricted cash. Restricted cash isn't available to acquirers.

**Forgetting minority interest.** If the company consolidates subsidiaries it doesn't fully own, add minority interest.

---

## Step 4: Calculate Valuation Multiples

Now divide enterprise value (or equity value) by financial metrics.

### Enterprise Value Multiples

Enterprise value multiples use metrics available to all capital providers (debt and equity).

| Multiple | Formula | When Used |
|----------|---------|-----------|
| EV/Revenue | EV ÷ Revenue | High-growth companies, unprofitable companies |
| EV/EBITDA | EV ÷ EBITDA | Most common; works for profitable companies |
| EV/EBIT | EV ÷ EBIT | When D&A differs significantly across peers |
| EV/EBITDA-CapEx | EV ÷ (EBITDA - CapEx) | Capital-intensive businesses |

### Equity Value Multiples

Equity value multiples use metrics available only to equity holders.

| Multiple | Formula | When Used |
|----------|---------|-----------|
| P/E | Stock Price ÷ EPS | Mature, profitable companies |
| P/B | Stock Price ÷ Book Value per Share | Financial institutions (banks, insurance) |
| PEG | P/E ÷ Growth Rate | Comparing companies with different growth |

### Industry-Specific Multiples

Some industries have unique metrics.

| Industry | Multiple | Metric |
|----------|----------|--------|
| SaaS | EV/ARR | Annual Recurring Revenue |
| E-commerce | EV/GMV | Gross Merchandise Value |
| Telecom | EV/Subscriber | Subscriber count |
| Real Estate | Price/FFO | Funds From Operations |
| Banks | P/TBV | Tangible Book Value |

### Which Multiple to Use?

The right multiple depends on the industry and company characteristics.

**EV/EBITDA** is the default for most industries. It's capital structure neutral and approximates cash flow.

**EV/Revenue** works when companies aren't profitable or have highly variable margins.

**P/E** works for stable, mature companies with comparable capital structures.

**Industry-specific multiples** work when the industry has a standard valuation approach.

Use multiple multiples. They provide different perspectives on value.

---

## Step 5: Apply Multiples to the Target

Now apply peer multiples to your target company.

### The Math

**Example:** Valuing Target Corp using EV/EBITDA

Comparable companies trade at:
- Company A: 8.5x
- Company B: 9.2x
- Company C: 7.8x
- Company D: 10.1x
- Company E: 8.9x

Mean: 8.9x
Median: 8.9x

Target Corp's EBITDA: $50 million

Implied Enterprise Value:
- At mean (8.9x): $445 million
- At median (8.9x): $445 million
- Range (7.8x - 10.1x): $390 - $505 million

### Mean vs. Median

**Mean:** Simple average. Sensitive to outliers.

**Median:** Middle value. Resistant to outliers.

When one company trades at an extreme multiple, median is more reliable. For tight peer groups, they'll be similar.

Report both. Use judgment about which is more representative.

### Creating a Range

Don't give a point estimate. Give a range.

**Methods for creating ranges:**
- Min to max of peer multiples
- 25th to 75th percentile
- Mean minus/plus one standard deviation
- Low/mid/high scenarios based on premium/discount assumptions

The range acknowledges uncertainty. No valuation is precise.

---

## From Enterprise Value to Equity Value

If you calculated enterprise value, convert to equity value for per-share metrics.

### The Bridge

```
Equity Value = Enterprise Value - Debt + Cash - Preferred Stock - Minority Interest
```

This is the enterprise value formula, reversed.

### Per-Share Value

```
Implied Stock Price = Equity Value ÷ Diluted Shares Outstanding
```

This gives you a target share price based on comps.

---

## Making Adjustments

Raw multiples aren't always comparable. Adjustments improve accuracy.

### Normalizing EBITDA

EBITDA should reflect ongoing operations. Adjust for:

**Non-recurring items:**
- Restructuring charges
- Litigation settlements
- Asset write-downs
- One-time gains or losses

**Stock-based compensation:** Some analysts add back SBC. Others don't. Be consistent across the peer group.

**Acquisitions:** Recent acquisitions may not be fully reflected in LTM numbers. Pro forma adjustments may be needed.

### Control Premium

Public comps show minority trading values. Acquisitions involve paying for control.

Acquirers typically pay 20-40% premium over trading price. This "control premium" reflects:
- Synergy value
- Ability to make changes
- Premium required to convince shareholders to sell

If valuing for M&A, consider applying a control premium to comps-derived value.

---

## Explaining Premiums and Discounts

Not all companies trade at the same multiple. Understanding why is crucial.

### Reasons for Premium Multiples

| Factor | Why It Justifies Premium |
|--------|-------------------------|
| Higher growth | More future earnings growth |
| Higher margins | More profitable operations |
| Market leadership | Stronger competitive position |
| Better management | Execution track record |
| Recurring revenue | More predictable cash flows |
| Strong balance sheet | Less financial risk |
| Favorable trends | Tailwinds in the industry |

### Reasons for Discount Multiples

| Factor | Why It Justifies Discount |
|--------|--------------------------|
| Lower growth | Less future potential |
| Lower margins | Weaker profitability |
| Customer concentration | Revenue risk |
| Cyclicality | Earnings volatility |
| Regulatory risk | Uncertain operating environment |
| High leverage | Financial risk |
| Poor management | Execution concerns |
| Competitive threats | Market position at risk |

### Interview Application

When asked "why might Company X trade at a premium to peers?", cite specific factors.

Bad answer: "Because it's a better company."

Good answer: "Company X trades at 12x EBITDA versus the peer median of 9x. This premium likely reflects its higher growth rate (20% vs. peer average of 12%), market-leading position with 35% market share, and recurring revenue model with 95% customer retention."

---

## Comps Output: The Presentation

Comps analyses have a standard format.

### The Comps Table

A typical comps table includes:

| Company | Stock Price | Market Cap | EV | Revenue | EBITDA | EV/Revenue | EV/EBITDA |
|---------|-------------|------------|-------|---------|--------|------------|-----------|
| Comp A | $45.00 | $2,500 | $3,100 | $1,200 | $340 | 2.6x | 9.1x |
| Comp B | $32.00 | $1,800 | $2,200 | $980 | $250 | 2.2x | 8.8x |
| Comp C | $67.00 | $4,200 | $4,800 | $2,100 | $520 | 2.3x | 9.2x |
| **Mean** | | | | | | **2.4x** | **9.0x** |
| **Median** | | | | | | **2.3x** | **9.1x** |

*(Dollars in millions except per share data)*

### The Implied Valuation

Below the comps table, show applied valuation:

| Metric | Target Value | Multiple Range | Implied EV |
|--------|-------------|----------------|------------|
| LTM Revenue | $500 | 2.2x - 2.6x | $1,100 - $1,300 |
| LTM EBITDA | $125 | 8.8x - 9.2x | $1,100 - $1,150 |

### Football Field Chart

Multiple valuation methods are often displayed on a "football field" chart—horizontal bars showing valuation ranges from different methodologies.

This visualization helps clients see where different approaches converge or diverge.

---

## Common Interview Questions

### Walk Me Through a Comps Analysis

**Strong answer:**

"Comparable company analysis values a company by looking at how similar public companies are valued.

First, I select comparable companies based on industry, size, growth profile, and business model. I look for 5-15 companies that are truly similar.

Second, I gather financial and market data for each company—share price, shares outstanding, debt, cash, revenue, EBITDA.

Third, I calculate enterprise value for each company using the formula: market cap plus debt minus cash plus preferred and minority interest.

Fourth, I calculate relevant multiples. For most companies, EV/EBITDA and EV/Revenue. For specific industries, I might use industry-specific metrics like EV/subscriber or EV/ARR.

Fifth, I calculate the mean and median multiples for the peer group.

Finally, I apply those multiples to my target company's financial metrics to derive an implied valuation range."

### How Do You Select Comparable Companies?

**Strong answer:**

"I look for companies that share key characteristics with my target.

Most important is business model—how they make money should be similar. A subscription software company isn't comparable to an enterprise license software company, even if both are 'software.'

Second is growth profile. High-growth companies trade at different multiples than mature ones. I want peers with similar growth rates.

Third is size, though this matters less than people think. A $500 million company can be comparable to a $2 billion company if the business models and growth are similar.

I also consider geography, margin profile, and market position.

I typically aim for 5-15 companies. I'd rather have 7 truly comparable companies than 15 loosely related ones."

### Why Would a Company Trade at a Premium to Its Peers?

**Strong answer:**

"Several factors could justify a premium multiple.

Growth—if the company is growing faster than peers, investors pay more for future earnings.

Margins—higher profitability means more cash flow per dollar of revenue.

Market position—leaders often command premiums due to competitive advantages.

Recurring revenue—predictable, sticky revenue streams reduce risk and justify higher multiples.

Management—a track record of strong execution builds investor confidence.

Balance sheet—companies with low leverage and high cash balances have less financial risk.

In any specific case, I'd want to identify which of these factors most explains the premium."

### EV/EBITDA vs. P/E—When Would You Use Each?

**Strong answer:**

"EV/EBITDA is more versatile and is my default choice.

It's capital structure neutral—companies with different debt levels can be compared because enterprise value includes debt and EBITDA is pre-interest.

It's less affected by accounting differences since it excludes D&A, which varies based on accounting choices and asset age.

I'd use P/E for mature, stable companies with similar capital structures—like comparing large banks or utilities. P/E is simpler and captures what equity holders actually receive.

I'd avoid P/E for companies with different leverage, different tax situations, or significant non-cash charges, because these distort net income without affecting operating performance."

### What's the Difference Between Enterprise Value and Equity Value?

**Strong answer:**

"Equity value is what shareholders own—the market cap.

Enterprise value is what you'd pay to buy the whole business. It includes the value owed to all capital providers—equity holders and debt holders.

The formula is: Enterprise Value equals Equity Value plus Debt minus Cash.

The intuition: if you acquire a company, you buy the equity but you also assume its debt obligations. Cash on the balance sheet offsets what you pay because you get that cash in the acquisition.

This matters for multiples because enterprise value multiples use pre-interest metrics like EBITDA—available to all capital providers. Equity value multiples use post-interest metrics like net income—available only to shareholders."

---

## Common Mistakes to Avoid

### Mixing LTM and NTM

Using LTM multiples for some companies and NTM for others makes the analysis meaningless. Pick one. Apply it consistently.

### Ignoring Business Model Differences

Two companies in the same industry can have completely different business models. A SaaS company and a perpetual license company aren't comparable just because both sell software.

### Including Outliers Without Explanation

If one company trades at 20x EBITDA and peers trade at 10x, either explain why or exclude it. Don't let one outlier distort your mean.

### Forgetting Dilution

Using basic shares instead of fully diluted shares understates equity value and produces incorrect multiples.

### Using Stale Data

Markets move. A comps analysis with three-month-old stock prices is meaningless. Use current data.

### Applying Multiples Mechanically

Comps require judgment. A lower-growth target shouldn't be valued at the peer mean if peers are higher growth. Apply multiples thoughtfully.

---

## Comps vs. Other Valuation Methods

Comps is one of several valuation approaches. Understanding when each applies makes you a better analyst.

### Comps vs. DCF

| Comps | DCF |
|-------|-----|
| Market-based | Intrinsic value |
| What others pay | What it's fundamentally worth |
| Quick to build | Time-intensive |
| Relies on comparability | Relies on projections |
| Circular (market prices from market) | Independent of market |

Use both. They triangulate to a range.

### Comps vs. Precedent Transactions

| Trading Comps | Transaction Comps |
|---------------|-------------------|
| Public market prices | M&A deal prices |
| Minority value | Control value |
| Current prices | Historical prices |
| Many data points | Fewer data points |

Transaction comps include control premiums. Trading comps show minority trading values.

---

## Practice Problems

### Problem 1: Calculate Enterprise Value

Company data:
- Stock price: $50
- Shares outstanding (diluted): 100 million
- Total debt: $800 million
- Cash: $200 million
- Preferred stock: $0
- Minority interest: $50 million

Calculate enterprise value.

**Solution:**
```
Market Cap = $50 × 100M = $5,000M
EV = $5,000M + $800M - $200M + $0 + $50M = $5,650M
```

### Problem 2: Calculate EV/EBITDA

Using the company above:
- LTM Revenue: $3,000 million
- LTM EBITDA: $600 million

Calculate EV/Revenue and EV/EBITDA.

**Solution:**
```
EV/Revenue = $5,650M ÷ $3,000M = 1.88x
EV/EBITDA = $5,650M ÷ $600M = 9.4x
```

### Problem 3: Apply Peer Multiples

Your target company has:
- LTM EBITDA: $150 million
- Total debt: $400 million
- Cash: $50 million
- Diluted shares: 50 million

Peer EV/EBITDA multiples: 8.0x, 8.5x, 9.0x, 9.5x, 10.0x

Calculate the implied equity value and stock price using median.

**Solution:**
```
Median multiple = 9.0x
Implied EV = $150M × 9.0 = $1,350M
Implied Equity Value = $1,350M - $400M + $50M = $1,000M
Implied Stock Price = $1,000M ÷ 50M = $20.00
```

---

## The Bottom Line

Comparable company analysis is foundational. Every banking analyst runs comps. Every interview tests them.

The mechanics are straightforward: find similar companies, calculate multiples, apply to target. The judgment is harder: which companies are truly comparable? Which multiples matter? Why do some companies trade at premiums?

Master both the mechanics and the judgment. Be able to build a comps analysis from scratch and explain every decision you made.

Comps aren't just a valuation method. They're a lens for understanding how markets value businesses. That understanding serves you in every finance role.
