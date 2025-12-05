---
title: "Real Estate Technical Interview Guide: REIT Metrics, Cap Rates, and Property Valuations"
slug: real-estate-technical-interview-guide
excerpt: Real estate interviews test whether you understand how buildings make money. Here's the complete technical guide covering cap rates, NOI, REIT valuations, and the questions you'll actually face.
category: technical-interviews
tags: [real estate, technical interview, cap rate, NOI, REIT, property valuation, FFO, AFFO]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# Real Estate Technical Interview Guide: REIT Metrics, Cap Rates, and Property Valuations

A cap rate is not a magic number. It's a way of expressing how much risk you're taking on a property.

Most candidates memorize the formula (NOI / Property Value) without understanding what it actually tells you. They get tripped up when interviewers ask why cap rates differ across property types or markets. They freeze when asked to walk through a real estate valuation from scratch.

Real estate interviews test whether you think like an investor. Can you analyze a building the way you'd analyze a business? Do you understand what drives value? Can you spot the risks hiding in the assumptions?

This guide covers the technical concepts you'll face—cap rates, NOI, REIT metrics, and property valuations. Master these, and you'll handle whatever they throw at you.

---

## How Real Estate Valuation Differs

### The Fundamental Difference

Traditional corporate valuation focuses on earnings and growth. Real estate valuation focuses on cash flow and assets.

**Why it's different:**
- Buildings are tangible assets with observable market values
- Cash flows are often contractual (leases)
- Depreciation doesn't reflect economic reality
- Leverage plays a larger role in returns

**The implication:**
P/E ratios and EV/EBITDA don't translate directly. Real estate has its own metrics built around these realities.

### The Three Valuation Approaches

**1. Income Approach (Cap Rate / DCF)**
Value based on the cash flow the property produces.
Most common for income-producing properties.

**2. Sales Comparison Approach**
Value based on recent sales of similar properties.
Most common for residential and land.

**3. Cost Approach**
Value based on replacement cost minus depreciation.
Most common for special-purpose properties.

Most interview questions focus on the income approach. That's where we'll spend our time.

---

## Net Operating Income (NOI)

### The Foundation of Everything

NOI is to real estate what EBITDA is to corporate finance. It's the starting point for valuation.

**The formula:**
```
NOI = Gross Rental Revenue - Operating Expenses
```

**What's included in operating expenses:**
- Property taxes
- Insurance
- Utilities (if landlord-paid)
- Maintenance and repairs
- Property management fees
- Common area maintenance

**What's NOT included:**
- Debt service (interest and principal)
- Capital expenditures
- Depreciation
- Income taxes

### Why NOI Matters

NOI represents the cash flow available before financing decisions. It allows comparison across properties with different capital structures.

**Interview insight:**
When asked "Why do we use NOI instead of net income?", the answer is comparability. Net income reflects financing choices. NOI reflects property performance.

### Calculating NOI: A Worked Example

**Property details:**
- Annual gross rent: $1,000,000
- Vacancy rate: 5%
- Operating expenses: $350,000

**Calculation:**
```
Effective Gross Income = $1,000,000 × (1 - 0.05) = $950,000
NOI = $950,000 - $350,000 = $600,000
```

**Common interview trap:**
Don't forget vacancy. Landlords rarely collect 100% of potential rent.

---

## Cap Rates Explained

### What Cap Rates Actually Mean

A cap rate is the yield on a property if purchased with all cash.

**The formula:**
```
Cap Rate = NOI / Property Value
```

Or rearranged:
```
Property Value = NOI / Cap Rate
```

**Example:**
Property generates $600,000 NOI. Cap rate is 6%.
Value = $600,000 / 0.06 = $10,000,000

### What Drives Cap Rates

Cap rates reflect risk. Lower cap rates mean investors accept lower yields because they see less risk.

**Factors that lower cap rates (increase value):**
- Prime location
- Credit-worthy tenants
- Long-term leases
- Strong market fundamentals
- Property quality and condition

**Factors that raise cap rates (decrease value):**
- Secondary/tertiary markets
- Weak tenant credit
- Short lease terms or vacancy
- Functional obsolescence
- Economic uncertainty

### Cap Rate Ranges by Property Type

| Property Type | Typical Cap Rate Range |
|---------------|------------------------|
| Class A Office (Gateway City) | 4.0% - 5.5% |
| Class A Multifamily (Gateway) | 4.0% - 5.0% |
| Industrial/Logistics | 4.5% - 6.0% |
| Retail (Grocery-Anchored) | 5.5% - 7.0% |
| Class B Office (Suburban) | 6.5% - 8.5% |
| Hotels | 7.0% - 10.0%+ |

**Interview insight:**
Be prepared to explain why industrial cap rates have compressed. E-commerce growth made logistics properties more valuable. Supply constraints limit new construction. Institutional demand increased.

### Cap Rate vs. Other Yields

**Cap rate vs. IRR:**
Cap rate is a point-in-time yield. IRR reflects total returns over a hold period including appreciation, cash flows, and exit.

**Cap rate vs. cash-on-cash return:**
Cash-on-cash factors in leverage. Cap rate assumes all-cash purchase.

**Common interview question:**
"Can you buy a property at a 5% cap rate and generate 15% IRR?"

Yes. Through leverage, NOI growth, and selling at a lower cap rate (appreciation).

---

## REIT-Specific Metrics

### Why Traditional Metrics Don't Work

REITs pay minimal income taxes due to their structure. Depreciation charges are large but often don't reflect actual value decline. Net income understates economic performance.

This is why REITs have their own metrics.

### Funds From Operations (FFO)

FFO adds back depreciation and removes gains/losses on property sales.

**The formula:**
```
FFO = Net Income + Depreciation + Amortization - Gains on Sale
```

**Why it matters:**
Depreciation on real estate often doesn't reflect economic reality. A well-maintained building in a good market may appreciate while accounting shows depreciation. FFO adjusts for this.

**FFO per share:**
Like EPS but for REITs. This is what you'll see in REIT earnings releases.

### Adjusted Funds From Operations (AFFO)

AFFO goes further. It deducts recurring capital expenditures needed to maintain the property.

**The formula:**
```
AFFO = FFO - Recurring CapEx - Straight-Line Rent Adjustments
```

**Why it matters:**
Buildings require ongoing investment—roof replacements, HVAC upgrades, tenant improvements. AFFO reflects the cash truly available for distribution.

**Interview insight:**
"Which metric better reflects a REIT's ability to pay dividends?"
AFFO. It accounts for the capital needed to maintain the properties.

### Net Asset Value (NAV)

NAV values the REIT as the sum of its properties minus debt.

**The calculation:**
1. Value each property (usually NOI / Cap Rate)
2. Add other assets (cash, receivables)
3. Subtract liabilities (debt, payables)
4. Divide by shares outstanding

**NAV premium/discount:**
REITs trade at premiums or discounts to NAV based on management quality, growth expectations, and market sentiment.

**Example:**
REIT NAV is $50 per share. Stock trades at $45. That's a 10% discount to NAV.

---

## Valuation Methods for Real Estate

### Direct Capitalization

The simplest approach. Apply a cap rate to stabilized NOI.

**When to use:**
- Stabilized properties
- Predictable cash flows
- Quick valuation estimates

**Formula:**
```
Value = NOI / Cap Rate
```

**Limitation:**
Doesn't capture NOI growth, lease expirations, or capital needs.

### Discounted Cash Flow (DCF)

Project cash flows over a hold period and discount to present value.

**Typical structure:**
1. Project NOI for 5-10 years
2. Estimate terminal value (usually via cap rate on exit-year NOI)
3. Discount all cash flows at appropriate rate
4. Sum to get property value

**Key assumptions:**
- Rent growth
- Vacancy
- Operating expense growth
- Exit cap rate
- Discount rate

**When to use:**
- Development projects
- Value-add opportunities
- Complex lease structures
- Any property not at stabilization

### Comparable Sales Analysis

Value based on recent sales of similar properties.

**Key metrics:**
- Price per square foot
- Price per unit (multifamily)
- Price per key (hotels)
- Cap rate at sale

**Adjustments needed for:**
- Location differences
- Property quality
- Tenant mix
- Lease terms
- Time of sale

---

## Common Interview Questions

### Conceptual Questions

**"Walk me through how you'd value an office building."**

Start with NOI. Review the rent roll to understand tenants, lease terms, and in-place rents versus market. Calculate operating expenses. Apply an appropriate cap rate based on location, tenant quality, and building condition.

For a more detailed analysis, build a DCF projecting lease expirations, renewal assumptions, and capital expenditures over a hold period.

**"Why might two identical buildings have different cap rates?"**

Location is the most likely answer. Same building in Manhattan versus Des Moines will have very different cap rates. Other factors: tenant credit quality, lease duration, local market dynamics.

**"What happens to property values when interest rates rise?"**

Cap rates typically rise when interest rates rise. Investors demand higher yields when risk-free returns increase. Higher cap rates mean lower property values for the same NOI.

However, the relationship isn't perfect. If rates rise due to economic strength, NOI might also grow, partially offsetting the cap rate increase.

### Calculation Questions

**"A property generates $500,000 NOI. Comparable properties trade at 5.5% cap rates. What's the value?"**

$500,000 / 0.055 = $9.09 million

**"That same property is purchased for $9 million with 60% leverage at 5% interest. What's the cash-on-cash return?"**

Equity invested: $9M × 40% = $3.6M
Debt: $9M × 60% = $5.4M
Annual interest: $5.4M × 5% = $270K
Cash flow after debt service: $500K - $270K = $230K
Cash-on-cash return: $230K / $3.6M = 6.4%

**"A REIT reports net income of $100M, depreciation of $40M, and a $10M gain on property sale. What's FFO?"**

FFO = $100M + $40M - $10M = $130M

### Scenario Questions

**"You're evaluating a Class B office building with a 7% cap rate and 40% vacancy. Walk me through your analysis."**

High vacancy means the current NOI doesn't reflect stabilized potential. I'd analyze:
1. What's market rent for this space?
2. What's realistic absorption timeline?
3. What tenant improvements and leasing commissions will be needed?
4. What capital expenditures are required to attract tenants?

I'd build a DCF modeling lease-up, capital costs, and eventual stabilization. The 7% cap rate on current NOI might translate to a much higher cap rate on stabilized NOI, making this a value-add opportunity—or a money pit.

---

## Property Type Deep Dives

### Multifamily

**Key metrics:**
- Rent per square foot
- Price per unit
- Cap rate
- Occupancy rate
- Rent growth

**What drives value:**
- Location (employment, amenities, schools)
- Unit mix (studios vs. family units)
- Rent control exposure
- Operational efficiency

**Interview tip:**
Multifamily trades at low cap rates because of stable demand (everyone needs housing) and strong rent growth in most markets.

### Office

**Key metrics:**
- Rent per square foot (full service vs. NNN)
- Occupancy / vacancy
- WALT (Weighted Average Lease Term)
- Tenant credit quality

**What drives value:**
- Location within market (CBD vs. suburban)
- Building class (A, B, C)
- Tenant roster
- Lease expirations
- Post-COVID usage trends

**Interview tip:**
Office faces headwinds from remote work. Be prepared to discuss how this affects valuations and what types of office perform better.

### Industrial/Logistics

**Key metrics:**
- Rent per square foot
- Clear height
- Loading capacity
- Location relative to population/ports

**What drives value:**
- E-commerce growth
- Last-mile location
- Modern specifications
- Limited supply in key markets

**Interview tip:**
Industrial has been the darling of commercial real estate. Explain why: e-commerce growth, limited supply in infill locations, essential nature of logistics.

### Retail

**Key metrics:**
- Sales per square foot
- Occupancy cost ratio
- Anchor tenant presence
- Co-tenancy clauses

**What drives value:**
- Traffic and visibility
- Tenant sales performance
- Anchor stability
- Online-resistant tenants

**Interview tip:**
Retail is polarized. Grocery-anchored and experiential retail perform well. Commodity retail struggles. Demonstrate nuance.

---

## Common Mistakes to Avoid

### Calculation Errors

**Forgetting vacancy:**
Always deduct vacancy from gross potential rent to get effective gross income.

**Confusing gross and net rent:**
Gross leases include operating expenses in rent. Net leases (NNN) pass expenses to tenants. Know which you're working with.

**Using stabilized NOI on unstabilized property:**
If there's significant vacancy or below-market leases, current NOI doesn't reflect value.

### Conceptual Errors

**Treating cap rates as universal:**
Cap rates vary dramatically by property type, location, and quality. A 6% cap rate means different things for different assets.

**Ignoring capital expenditures:**
Properties require ongoing investment. A building with deferred maintenance trades at a higher cap rate for good reason.

**Assuming cap rates are static:**
Cap rates move with interest rates, market sentiment, and property-specific factors.

---

## Preparing for Real Estate Interviews

### What Firms Look For

**Technical knowledge:**
Understanding of metrics, valuation methods, and property types.

**Analytical ability:**
Can you work through a problem logically? Do the numbers make sense?

**Market awareness:**
What's happening in real estate markets? What's your view on office? Industrial? Interest rate impact?

### Study Approach

**Master the fundamentals:**
- NOI calculation
- Cap rate application
- FFO/AFFO for REITs
- Basic DCF for real estate

**Understand property types:**
Know the key drivers and metrics for each major property type.

**Follow the market:**
Read real estate publications. Know recent deal activity and market trends.

**Practice calculations:**
Work through sample problems until the math becomes automatic.

### Final Preparation

Before your interview:

1. **Review recent deals** in the firm's focus area
2. **Prepare a property investment pitch** (often asked)
3. **Know current market conditions** (cap rates, transaction volume, trends)
4. **Have opinions** on market dynamics (with supporting logic)

Real estate interviews reward candidates who think like investors. Don't just know the formulas. Understand what they mean and when they apply.

The cap rate isn't magic. It's a tool. Use it well.
