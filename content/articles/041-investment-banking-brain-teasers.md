---
title: "Investment Banking Brain Teasers: How to Solve Quantitative and Logic Puzzles Under Pressure"
slug: investment-banking-brain-teasers
excerpt: Brain teasers aren't about right answers. They're about watching you think. Here's how to approach quantitative and logic puzzles when the pressure is on—without freezing up.
category: technical-interviews
tags: [brain-teasers, interviews, quantitative, logic-puzzles, investment-banking, problem-solving]
status: published
published_at: 2024-12-04
author: Coastal Haven Partners
---

# Investment Banking Brain Teasers: How to Solve Quantitative and Logic Puzzles Under Pressure

Your interviewer slides a piece of paper across the table. "You have 8 balls. One is heavier than the rest. You have a balance scale. What's the minimum number of weighings to find the heavy ball?"

You have 30 seconds before the silence gets uncomfortable.

Brain teasers show up less often than they used to, but they haven't disappeared. Trading desks love them. Quantitative roles expect them. Even traditional banking interviews occasionally throw one at you to see how you react.

The good news: these puzzles follow patterns. The frameworks are learnable. And the interviewers care more about your process than your answer.

Here's how to handle brain teasers without your mind going blank.

---

## Why Brain Teasers Exist

### What Interviewers Actually Assess

Brain teasers test cognitive skills that matter in finance:

**Structured thinking:** Can you break a complex problem into manageable pieces?

**Grace under pressure:** How do you behave when you don't immediately know the answer?

**Communication:** Can you explain your thought process clearly as you work?

**Intellectual curiosity:** Do you engage with the problem or give up quickly?

The right answer matters less than you think. An elegant wrong approach often beats a lucky right answer with no explanation.

### The Silent Evaluation

While you're thinking, the interviewer is watching:

- Do you panic or stay calm?
- Do you ask clarifying questions?
- Do you think aloud or sit in silence?
- Do you give up or keep trying new approaches?
- Can you recognize when you're stuck and pivot?

They're simulating what you'll be like at 2am when a model breaks and the MD needs an answer.

---

## Categories of Brain Teasers

### Market Sizing / Estimation Questions

**The type:** "How many golf balls fit in a school bus?"

**What they test:** Breaking down unknowable problems into estimable components.

**Framework:**
1. Define the problem dimensions
2. Make reasonable assumptions (state them clearly)
3. Build from base units
4. Sanity check your answer

**Example walkthrough:**

"How many gas stations are in the United States?"

Start with population: ~330 million people.
Assume ~2.5 people per household: ~130 million households.
Assume ~1.5 cars per household: ~195 million cars.
Average car fills up every ~2 weeks: ~100 million fill-ups per week.
Each gas station handles maybe 500 fill-ups per week (8 pumps × 10 fills × 6 days).
Number of stations: 100M / 500 = ~200,000 stations.

Actual answer: roughly 150,000. Close enough. The process matters.

### Probability Questions

**The type:** "What's the probability of rolling at least one six in four dice rolls?"

**What they test:** Probability fundamentals and mental math.

**Framework:**
1. Identify if it's easier to calculate directly or use complement
2. Break into independent events if possible
3. Use the multiplication rule for "and" and addition for "or"

**Example:**

Probability of at least one six in four rolls.

Complement approach is easier:
- P(no six in one roll) = 5/6
- P(no six in four rolls) = (5/6)^4 = 625/1296 ≈ 48%
- P(at least one six) = 1 - 48% ≈ 52%

### Logic Puzzles

**The type:** "You have 3 light switches outside a room. One controls a bulb inside..."

**What they test:** Working through constraints systematically.

**Framework:**
1. List all constraints explicitly
2. Identify what you can vary and what's fixed
3. Work through cases methodically
4. Look for hidden information

**Example - The light switch puzzle:**

Three switches outside, one bulb inside. You can flip switches however you want, then enter the room once. Which switch controls the bulb?

The insight: light bulbs get hot.

Solution: Turn on switch 1 for 5 minutes. Turn it off. Turn on switch 2. Enter room.
- If bulb is on → Switch 2
- If bulb is off and hot → Switch 1
- If bulb is off and cold → Switch 3

### Mathematical Tricks

**The type:** "What's the angle between the hour and minute hand at 3:15?"

**What they test:** Attention to detail and avoiding obvious traps.

**Framework:**
1. Don't jump to the obvious answer
2. Identify what moves and how fast
3. Calculate precisely

**Example:**

At 3:15, the minute hand points at 3 (90 degrees from 12).

But the hour hand isn't exactly on 3. It moves too.

Hour hand moves 360°/12 hours = 30° per hour = 0.5° per minute.
At 3:15, hour hand has moved 3×30 + 15×0.5 = 90 + 7.5 = 97.5° from 12.
Minute hand at 3 = 90° from 12.

Angle between them = 97.5 - 90 = 7.5°

The trap was answering "0 degrees" without realizing the hour hand moves continuously.

---

## The Classic Problems

### The Heavy Ball Problem

**8 balls, one heavier. Minimum weighings with a balance scale?**

Answer: 2 weighings.

Approach:
- Divide into three groups: 3, 3, 2
- Weigh 3 vs 3
- If one side heavier: heavy ball is in that group. Weigh any 2 from that group.
- If balanced: heavy ball is in the group of 2. One weighing finds it.

**Key insight:** A balance scale gives three outcomes (left heavy, right heavy, balanced), not two. This lets you eliminate 2/3 of possibilities each time.

### The Two Egg Problem

**100-floor building. Eggs break at some floor and above. Two eggs. Minimize worst-case drops to find the breaking floor.**

Answer: 14 drops.

The trap: binary search doesn't work because you only have 2 eggs.

Approach: If first egg breaks, you must linear search with second egg.

Let first drops be at floors: n, n+(n-1), n+(n-1)+(n-2), ...

For worst case to be equal regardless of when first egg breaks, this sequence should reach 100.
n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 ≥ 100
n = 14 (since 14×15/2 = 105)

Start at 14, then 27, then 39, etc. Worst case is 14 drops.

### The Burning Rope Problem

**Two ropes, each takes exactly 60 minutes to burn. They burn non-uniformly. How do you measure 45 minutes?**

Answer: Light both ends of rope 1 and one end of rope 2 simultaneously.

- Rope 1 burns out in 30 minutes (from both ends)
- At that moment, light the other end of rope 2
- Rope 2 has 30 minutes left of "rope time" but now burns from both ends
- It finishes in 15 more minutes
- Total: 30 + 15 = 45 minutes

### The Bridge Crossing Problem

**Four people cross a bridge at night with one flashlight. Bridge holds two people max. Crossing times: 1, 2, 5, 10 minutes. What's minimum total crossing time?**

Answer: 17 minutes.

The intuitive approach (send fastest person back each time) gives 19 minutes.

Optimal solution:
1. 1 and 2 cross (2 minutes)
2. 1 returns (1 minute)
3. 5 and 10 cross (10 minutes)
4. 2 returns (2 minutes)
5. 1 and 2 cross (2 minutes)
Total: 17 minutes

**Key insight:** Keep the slow people together so their slow times overlap.

---

## Mental Math Shortcuts

### The Rule of 72

To estimate doubling time: 72 / growth rate = years to double.

At 6% growth: 72/6 = 12 years to double.

Works in reverse too: 72 / years = required growth rate.

### Percentage Math

10% of anything: move decimal left.
5% of anything: half of 10%.
15%: 10% + half of 10%.
20%: double 10%.

For 17% of 340:
- 10% = 34
- 5% = 17
- 2% = 6.8
- 17% = 34 + 17 + 6.8 ≈ 58

### Multiplication Shortcuts

**Multiplying by 5:** Divide by 2, multiply by 10.
84 × 5 = 42 × 10 = 420

**Multiplying by 25:** Divide by 4, multiply by 100.
48 × 25 = 12 × 100 = 1,200

**Squaring numbers ending in 5:**
(n5)² = n × (n+1) followed by 25.
65² = 6 × 7 = 42, so 4225.
35² = 3 × 4 = 12, so 1225.

---

## The Interview Protocol

### When You Get the Question

**Step 1: Pause and clarify.**

Don't start talking immediately. Take 5 seconds to process. Ask clarifying questions if anything is ambiguous.

"Just to make sure I understand—these are standard six-sided dice?"

**Step 2: Announce your approach.**

"Let me think about this systematically. I'll start by..."

This signals structure and buys you thinking time.

**Step 3: Think aloud.**

Silence is uncomfortable for everyone. Share your reasoning, even if incomplete.

"My first instinct is X, but let me check if that's actually optimal..."

**Step 4: Sanity check your answer.**

"That gives me 14 drops. Let me verify that makes sense—if we had just one egg, we'd need up to 100 drops, so 14 is a big improvement."

### When You're Stuck

**Try a simpler version.**

Can't solve 8 balls? Start with 4. Can't solve 100 floors? Try 10. Pattern often reveals itself.

**Work backwards.**

What would the answer need to look like? What constraints would it satisfy?

**Change representation.**

Draw it out. Use a table. Sometimes visual representation unlocks insight.

**State what you know.**

"I know the answer is between X and Y because of constraint Z..." Sometimes articulating partial progress suggests next steps.

### If You Don't Get the Answer

This is fine. It happens.

Say: "I'm not getting to the optimal answer here, but here's where my thinking is and what I'd try next..."

Showing metacognition—awareness of your own reasoning—matters more than luck.

---

## Practice Problems

### Warm-Up (5 minutes each)

1. **Coin flip:** You flip a fair coin until you get heads. Expected number of flips?

2. **Sock drawer:** 10 black socks, 10 white socks. How many do you need to grab (in the dark) to guarantee a matching pair?

3. **Birthday problem:** How many people needed for >50% chance two share a birthday?

### Intermediate (10 minutes each)

4. **Expected value:** A game costs $1 to play. You roll a die and win that many dollars. Should you play?

5. **Water jugs:** You have a 3-gallon jug and a 5-gallon jug. How do you measure exactly 4 gallons?

6. **Cards:** What's the probability of drawing two cards of the same suit from a standard deck?

### Advanced (15+ minutes)

7. **Prisoners and hats:** 100 prisoners in a line, each wearing a random black or white hat. Each can see all hats in front. Starting from the back, each guesses their own hat color. One wrong guess and everyone dies. They can strategize beforehand. What's the maximum number of guaranteed survivors?

8. **Counterfeit coin:** You have 12 coins, one counterfeit (either heavier or lighter). With 3 weighings on a balance scale, how do you identify the counterfeit and determine if it's heavier or lighter?

---

## Answers to Practice Problems

**1. Expected coin flips:** 2. (Sum of geometric series with p=0.5)

**2. Sock drawer:** 3 socks. (Pigeonhole principle)

**3. Birthday problem:** 23 people. (Counterintuitive but calculable)

**4. Die game:** Yes, play. Expected win = (1+2+3+4+5+6)/6 = 3.5 > $1 cost.

**5. Water jugs:** Fill 5, pour into 3 until full (leaving 2 in 5). Empty 3. Pour 2 into 3. Fill 5. Pour from 5 into 3 until full (3 has 2, so 1 more goes in). Left with 4 in the 5-gallon jug.

**6. Same suit:** 13/52 × 12/51 × 4 suits = 12/51 ≈ 23.5%

**7. Prisoners and hats:** 99 guaranteed (last person is 50/50). Strategy: first person says "black" if odd number of black hats ahead, "white" if even. Each subsequent person can calculate their own color from prior answers and what they see.

**8. Counterfeit coin:** The full solution is extensive. Key insight: use a reference group and track "heavy-side" vs "light-side" across weighings.

---

## The Mindset Shift

Brain teasers used to cause panic. Now they should trigger curiosity.

When you hear the question, your internal response should be: "Interesting. Let me see what constraints I'm working with."

Not: "Oh no, I don't know the answer."

The interviewer has seen dozens of candidates freeze. What differentiates you is staying calm, thinking out loud, and treating the puzzle as a collaboration rather than a test.

You won't solve every brain teaser. Nobody does. But approaching them with structured thinking and visible effort shows exactly the qualities that matter in finance.

The heavy ball is in one of three groups. Start weighing.
