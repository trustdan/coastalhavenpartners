---
title: "Enterprise Value vs. Equity Value: The Interview Question That Trips Up Most Candidates"
slug: enterprise-value-vs-equity-value
excerpt: Enterprise value versus equity value trips up more candidates than any other technical question. Here's how to understand the distinction and answer any variation they throw at you.
category: technical-interviews
tags: [enterprise value, equity value, valuation, technical interview, EV, market cap, debt]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# Enterprise Value vs. Equity Value: The Interview Question That Trips Up Most Candidates

Here's a question that ends interviews: "A company has $100 million in cash. Does that increase or decrease enterprise value?"

Most candidates say increase. They're wrong.

Enterprise value versus equity value confuses more candidates than any other technical concept. The formulas seem simple. The intuition isn't. Interviewers know this, so they probe with variations designed to expose whether you truly understand the distinction or just memorized equations.

This guide will build your intuition from the ground up. By the end, you'll handle any EV/equity value question they throw at you.

---

## The Fundamental Distinction

### What Each Represents

**Equity Value** (Market Capitalization):
The value of the company to its shareholders.
What you'd pay to buy all the stock.

**Enterprise Value**:
The value of the company's core business operations.
What you'd pay to buy the whole business, including taking on its debts.

### The House Analogy

Think of buying a house.

**Home value** = The price of the house = **Enterprise Value**
**Home equity** = What you own after paying the mortgage = **Equity Value**

If a house is worth $500,000 and has a $300,000 mortgage:
- Home value (EV): $500,000
- Home equity (Equity Value): $200,000

The mortgage doesn't change what the house is worth. It changes how much of that value belongs to you.

### Why This Matters

Different stakeholders care about different values:
- **Shareholders** care about equity value (their piece)
- **Acquirers** care about enterprise value (total cost of the business)
- **Lenders** care about enterprise value (what secures their debt)

When you buy a company, you pay equity holders for their shares. But you also inherit the debt. Enterprise value captures the true cost of acquisition.

---

## The Bridge Formula

### From Equity Value to Enterprise Value

```
Enterprise Value = Equity Value + Debt - Cash
```

Or more completely:
```
Enterprise Value = Equity Value + Total Debt + Preferred Stock + Minority Interest - Cash and Cash Equivalents
```

### Why We Add Debt

When you acquire a company, you take on its obligations. The debt doesn't disappear. You either:
1. Pay it off (using the company's cash or your own)
2. Keep servicing it

Either way, it's part of your total outlay for the business.

**Example:**
Company A has $100M equity value and no debt.
Company B has $100M equity value and $50M debt.

To own Company A outright costs $100M.
To own Company B outright costs $150M (pay shareholders $100M, owe lenders $50M).

Enterprise value captures this.

### Why We Subtract Cash

Cash is like a rebate. When you buy a company, you get its cash.

**Example:**
You buy a company for $100M. It has $20M cash.
Net cost: $80M. The cash comes with the business.

Enterprise value reflects the net cost of acquiring the operating business.

---

## Common Interview Questions

### The Basic Questions

**"What's the formula for enterprise value?"**

Enterprise Value = Equity Value + Debt + Preferred Stock + Minority Interest - Cash

For a quick answer, just say: EV = Equity Value + Net Debt (where Net Debt = Debt - Cash)

**"Company has $500M market cap, $100M debt, $50M cash. What's EV?"**

EV = $500M + $100M - $50M = $550M

### The Tricky Questions

**"A company raises $100M in debt. What happens to equity value and enterprise value?"**

This is where candidates stumble.

- **Enterprise value**: Unchanged
- **Equity value**: Unchanged (short-term)

Here's why: The company now has $100M more debt but also $100M more cash. These offset in the EV formula.

What about equity value? The company's shares aren't worth more just because it borrowed money. The cash is offset by the new obligation. Net effect: zero.

**"A company raises $100M in equity. What happens to EV and equity value?"**

- **Equity value**: Increases by $100M (more shares outstanding)
- **Enterprise value**: Unchanged ($100M more equity, $100M more cash—offsets)

**"A company uses $50M cash to pay down debt. What happens?"**

- **Equity value**: Unchanged
- **Enterprise value**: Unchanged

You've traded one asset (cash) for the reduction of one liability (debt). Both fall by $50M. Net EV impact: zero.

### The "Does X Increase or Decrease EV?" Framework

Here's the key insight: **Enterprise value represents the value of operating assets.**

Things that change operating asset value change EV. Things that merely shuffle financing don't.

| Action | EV Impact | Equity Value Impact |
|--------|-----------|---------------------|
| Issue debt | No change | No change |
| Issue equity | No change | Increases |
| Pay down debt with cash | No change | No change |
| Pay dividend (cash to shareholders) | Increases | Decreases |
| Buy back stock with cash | Increases | Decreases |
| Acquire a company | Increases | Depends |
| Operating income increases | Increases | Increases |

### The Cash Question Deep Dive

**"Why does paying a dividend increase enterprise value?"**

When you pay a $50M dividend:
- Cash decreases by $50M
- Equity value decreases by $50M (shareholders received value)
- EV = Equity + Debt - Cash
- EV: $50M decrease (equity) - $50M decrease (cash) = Net increase of $0? No!

Wait, let's be careful.

EV = Equity Value + Debt - Cash

If equity falls $50M and cash falls $50M:
EV = (Equity - $50M) + Debt - (Cash - $50M)
EV = Equity + Debt - Cash - $50M + $50M
EV = Original EV

I made an error above. Let me correct:

**Actually, EV doesn't change when you pay a dividend.**

The cash leaves (reduces the cash subtraction) and equity value falls by the same amount. The effects offset.

This illustrates why the intuition is tricky. Let's think about it differently:

The enterprise value represents the value of the business operations. Paying a dividend doesn't change what the business is worth—it just transfers cash from the company to shareholders.

**The correct answer**: Enterprise value is unchanged. Equity value decreases.

### Operating vs. Non-Operating

**"A company sells a non-core subsidiary for $200M cash. What happens to EV?"**

This depends on how you treat the subsidiary.

If the subsidiary was included in EV (via sum-of-the-parts):
- EV decreases (you sold an asset)
- Cash increases by $200M
- Net effect on EV: Decreases by value of subsidiary, partially offset by cash

If the subsidiary wasn't in your EV calculation:
- Cash increases
- EV formula subtracts more cash
- EV decreases by $200M

**Interview tip**: Ask whether the subsidiary was considered part of enterprise value. Show that you understand the nuance.

---

## Which Metrics Use Which Value?

### This Is Where It Gets Practical

The EV vs. equity value distinction determines which valuation multiples make sense.

**The matching principle**: Numerator and denominator must be consistent.

### Enterprise Value Multiples

Use metrics that go to all capital providers (equity AND debt holders).

| Multiple | Metric | Why It Matches EV |
|----------|--------|-------------------|
| EV/Revenue | Revenue | Revenue belongs to the whole enterprise |
| EV/EBITDA | EBITDA | Pre-interest, available to all investors |
| EV/EBIT | EBIT | Pre-interest, available to all investors |

Revenue, EBITDA, and EBIT are generated before debt payments. They're available to both equity and debt holders. So we match them with enterprise value.

### Equity Value Multiples

Use metrics that go only to shareholders (after debt is paid).

| Multiple | Metric | Why It Matches Equity Value |
|----------|--------|----------------------------|
| P/E | Net Income | After interest, belongs to equity |
| Price/Book | Book Equity | Equity component only |
| Price/Cash Flow | Cash flow to equity | After debt service |

Net income is what's left after paying interest. It belongs to shareholders. So we match it with equity value (market cap).

### The Classic Interview Question

**"Why can't you use EV/Net Income or P/E with EBITDA?"**

Because they're mismatched.

- **EV/Net Income**: EV includes debt value, but net income is after interest (already removed debt's share). Mismatch.
- **P/E with EBITDA**: P/E uses equity value, but EBITDA is before interest (includes debt's share). Mismatch.

It's like comparing apples to oranges. The metrics have to represent the same claim on the business.

---

## Negative Enterprise Value?

### When Math Gets Weird

Yes, a company can have negative enterprise value.

**How it happens:**
Cash exceeds equity value plus debt.

**Example:**
- Market cap: $50M
- Debt: $10M
- Cash: $80M
- EV = $50M + $10M - $80M = -$20M

### What Does It Mean?

Negative EV usually signals:
1. **Market expects losses**: Future cash burn will consume the current cash
2. **Market doesn't trust the cash**: Fraud concerns or restricted cash
3. **Market pricing in dissolution**: Liquidation would yield less than balance sheet suggests

Sometimes it's a legitimate opportunity. More often, there's a reason the market is skeptical.

**Interview answer**: "Negative EV typically means the market expects the company to burn through its cash. Investors are essentially saying the business operations are worthless or worse—they'll destroy the cash on the balance sheet."

---

## Minority Interest and Preferred Stock

### Why These Are Added

**Minority Interest (Non-Controlling Interest):**

When a company owns 60% of a subsidiary, it consolidates 100% of the subsidiary's revenue and EBITDA. But 40% belongs to outside shareholders.

To match the 100% of EBITDA in the denominator, we add minority interest value to the numerator. Otherwise, EV/EBITDA is understated.

**Preferred Stock:**

Preferred stock is more like debt than equity. Preferred shareholders have priority over common shareholders. We add it to EV for the same reason we add debt—it's a claim that comes before common equity.

### The Full Formula

```
Enterprise Value = Common Equity (Market Cap)
                 + Debt
                 + Preferred Stock
                 + Minority Interest
                 - Cash and Cash Equivalents
```

For most companies, you can simplify to:
```
EV = Market Cap + Net Debt
```

But know the full formula for interviews.

---

## Worked Examples

### Example 1: Basic Calculation

**Company information:**
- Share price: $50
- Shares outstanding: 10 million
- Total debt: $150M
- Cash: $30M

**Calculate equity value and enterprise value.**

Equity Value = $50 × 10M = $500M
Enterprise Value = $500M + $150M - $30M = $620M

### Example 2: Transaction Impact

**Company A acquires Company B for $200M in cash.**

Company A before:
- Market cap: $1B
- Debt: $200M
- Cash: $300M
- EV: $1B + $200M - $300M = $900M

After acquiring Company B (assuming B worth $200M):
- Cash decreases by $200M (now $100M)
- Assume market cap unchanged at $1B (simplification)
- EV = $1B + $200M - $100M = $1.1B

EV increased by $200M—the value of the acquired business.

### Example 3: Leverage Recapitalization

**Company takes on $100M debt to pay a special dividend.**

Before:
- Market cap: $500M
- Debt: $0
- Cash: $50M
- EV: $500M + $0 - $50M = $450M

After:
- Debt: $100M
- Cash: $50M (temporarily $150M, then $100M paid out)
- Market cap: $400M (decreased by dividend amount)
- EV = $400M + $100M - $50M = $450M

EV unchanged. The company's operating value didn't change—just how it's financed.

---

## Building Your Intuition

### The Conceptual Framework

Think of it this way:

**Enterprise value** = What the whole business is worth
**Equity value** = What shareholders' piece is worth

When something affects the operations, EV changes.
When something just rearranges financing, EV stays the same.

### Practice Questions

Before your interview, work through these:

1. A company uses cash to pay down debt. Impact on EV and equity value?
2. A company issues shares to buy another company. Impact?
3. A company's stock price falls 20%. What happens to EV?
4. A company writes off $50M of goodwill. Impact on EV?
5. A company sells a factory for $30M (book value $20M). Impact?

### Answers

1. **Cash pays debt**: Both decrease by same amount. EV unchanged. Equity unchanged.

2. **Stock-for-stock acquisition**: Equity value increases (more shares). EV increases (acquired company's operations added).

3. **Stock falls 20%**: Equity value falls 20%. EV falls (by equity portion of EV, assuming debt/cash unchanged).

4. **Goodwill write-off**: No impact on EV (non-cash accounting). No change to equity value (already reflected in stock price if known).

5. **Sell factory**: Cash up $30M. Asset (part of EV) down by factory value. Net depends on factory's EV contribution vs. cash received.

---

## Key Takeaways

**The core insight:**
Enterprise value represents total business value. Equity value represents shareholder value. They differ by the claims of other investors (debt) and liquid assets (cash).

**The formula:**
EV = Equity Value + Debt - Cash (simplified)

**The matching principle:**
Pre-interest metrics (Revenue, EBITDA, EBIT) pair with EV.
Post-interest metrics (Net Income, EPS) pair with equity value.

**The trick questions:**
Usually involve transactions that change both sides of the equation. Work through the formula step by step.

**The interview reality:**
Interviewers aren't trying to trick you. They want to see if you understand the concepts well enough to handle variations. Build intuition, not just memorization.

When you can explain why cash decreases enterprise value—not just recite the formula—you're ready.
