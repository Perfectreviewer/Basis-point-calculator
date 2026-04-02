---
title: "How to Calculate Basis Points: Formulas, Examples & Excel Guide"
description: "Learn how to calculate basis points with simple formulas. Convert BPS to percentage, find BPS between two rates, calculate dollar impact, and use Excel formulas — with worked examples."
date: 2026-04-02
author: "Admin"
category: "Guides"
image: "/uploads/how-to-calculate-basis-points.svg"
status: "published"
visibility: "public"
seoKeywords: "how to calculate basis points, how to calculate basis points in excel, how to calculate basis points between two percentages, how to calculate basis points from a percentage, how to calculate basis point change, how to calculate basis point value, how do you calculate basis points to dollars, how to calculate 25 basis points, how to calculate 50 basis points, basis points formula"
seoTitle: "How to Calculate Basis Points: Formulas, Excel & Examples (2026)"
ogTitle: "How to Calculate Basis Points — Complete Formula Guide"
ogDescription: "The complete guide to calculating basis points. Covers all formulas: BPS from two rates, BPS to dollars, BPS in Excel, commission, and more."
tags: "basis points, bps formula, how to calculate, excel, interest rates"
---

**Knowing how to calculate basis points can save — or cost — you thousands of dollars.** Whether you're evaluating a mortgage offer, reading a Fed announcement, analyzing bond yields, or calculating a sales commission, basis points show up everywhere in finance. Getting the math wrong by even a small margin has real consequences.

This guide covers every basis point calculation you'll ever need: the core formula, converting from percentages, finding the BPS difference between two rates, converting to dollar amounts, using Excel, and calculating BPS for commissions and spreads.

---

## The Core Formula for Basis Points

Every basis point calculation flows from one fundamental relationship:

> **1 basis point = 0.01% = 0.0001**

From this, two master formulas cover most situations:

**To find BPS from two rates:**
> **BPS = (Rate A − Rate B) × 100**

*(Use percentage values directly — e.g., 6.50 and 6.25, not decimals)*

**To find BPS from a single percentage:**
> **BPS = Percentage × 100**

*(e.g., 0.25% × 100 = 25 BPS)*

![How to Calculate Basis Points — Formula Reference and Quick Table](/uploads/how-to-calculate-basis-points.svg)

Everything else in this guide is an application of these two formulas to different contexts.

---

## How to Calculate Basis Points from a Percentage

This is the most common calculation — converting a known percentage into basis points.

**Formula:**
> **BPS = Percentage (%) × 100**

**Or in reverse:**
> **Percentage = BPS ÷ 100**

**Worked examples:**

| Percentage | Calculation | Basis Points |
|---|---|---|
| 0.01% | 0.01 × 100 | 1 BPS |
| 0.10% | 0.10 × 100 | 10 BPS |
| 0.25% | 0.25 × 100 | 25 BPS |
| 0.50% | 0.50 × 100 | 50 BPS |
| 0.75% | 0.75 × 100 | 75 BPS |
| 1.00% | 1.00 × 100 | 100 BPS |
| 2.50% | 2.50 × 100 | 250 BPS |

**Practical example:** Your investment fund charges a fee of 0.75% per year. In basis points, that's 0.75 × 100 = **75 BPS** annually.

---

## How to Calculate Basis Points Between Two Percentages

This calculates the size of a rate change or the spread between two rates.

**Formula:**
> **BPS = (Rate A − Rate B) × 100**

The result is positive when Rate A is higher, negative when Rate A is lower. Take the absolute value if you only care about the size of the difference.

![BPS Formula Visual — Step-by-Step Breakdown with Examples](/uploads/infographic-bps-formula-visual.svg)

**Three worked examples:**

**Example 1 — Mortgage rate negotiation:**
Your lender's initial offer: 7.00%. After negotiating: 6.50%.
> (7.00 − 6.50) × 100 = **50 BPS reduction**

That 50 BPS saves roughly $87/month on a $300,000 loan.

**Example 2 — Federal Reserve rate hike:**
Fed funds rate before: 5.25%. After the decision: 5.50%.
> (5.50 − 5.25) × 100 = **25 BPS increase**

A standard Fed move — the smallest increment they typically use.

**Example 3 — Bond yield spread:**
10-year Treasury yield: 4.20%. Corporate bond yield: 5.85%.
> (5.85 − 4.20) × 100 = **165 BPS spread**

This 165 BPS spread represents the credit risk premium of the corporate bond over the risk-free rate.

---

## How to Calculate Basis Point Change

A basis point *change* measures how much a rate moved over time — upward or downward.

**Formula:**
> **BPS Change = (New Rate − Old Rate) × 100**

A positive result = rate increased. A negative result = rate decreased.

**Examples:**

| Scenario | Old Rate | New Rate | BPS Change |
|---|---|---|---|
| Small Fed hike | 4.75% | 5.00% | **+25 BPS** |
| Aggressive Fed hike | 4.50% | 5.25% | **+75 BPS** |
| Mortgage rate drop | 7.25% | 6.75% | **−50 BPS** |
| Bond yield rise | 3.80% | 4.40% | **+60 BPS** |
| Rate cut | 5.50% | 5.00% | **−50 BPS** |

**Why this matters:** When the media reports the Fed "cut rates by 50 basis points," this is exactly the calculation behind that statement — the new target rate minus the old target rate, expressed in BPS.

---

## How to Calculate Basis Point Value (Dollar Impact)

Basis point *value* (BPV) tells you the dollar impact of a 1 BPS change on a loan or investment. This is critical for mortgages, bonds, and portfolios.

**Formula:**
> **Dollar Impact = Loan Amount × (BPS ÷ 10,000)**

Or equivalently:
> **Dollar Impact = Loan Amount × Percentage Change**

**Example: $300,000 mortgage, 25 BPS rate change**

> $300,000 × (25 ÷ 10,000) = $300,000 × 0.0025 = **$750 per year**

That's ~$62.50/month in additional interest for every 25 BPS.

**Dollar impact table for a $300,000 loan:**

| BPS Change | % Change | Annual Dollar Impact | Monthly Impact |
|---|---|---|---|
| 10 BPS | 0.10% | $300/yr | $25/mo |
| 25 BPS | 0.25% | $750/yr | $62.50/mo |
| 50 BPS | 0.50% | $1,500/yr | $125/mo |
| 75 BPS | 0.75% | $2,250/yr | $187.50/mo |
| 100 BPS | 1.00% | $3,000/yr | $250/mo |
| 200 BPS | 2.00% | $6,000/yr | $500/mo |

> **Note:** These figures represent the change in annual interest, not the full monthly payment change (which also depends on amortization). Use our [Basis Point Calculator](https://www.basispointcalculator.com) for an exact payment comparison.

**For bond portfolios**, BPV (also called DV01 — "dollar value of a basis point") is:

> **DV01 = Portfolio Value × Modified Duration × 0.0001**

For a $1,000,000 bond portfolio with a modified duration of 5:
> $1,000,000 × 5 × 0.0001 = **$500 per basis point**

---

## How to Calculate Basis Points in Excel

Excel makes basis point calculations fast and repeatable. Here are the four formulas you'll use most often.

![Basis Points in Excel — 4 Ready-to-Use Formulas](/uploads/infographic-bps-excel-formulas.svg)

### Formula 1: BPS Between Two Rates
```
=(B2-C2)*10000
```
Put Rate 1 in B2 and Rate 2 in C2 as **decimals** (e.g., 6.5% = 0.065).

### Formula 2: Convert Percentage to BPS
```
=B3*10000
```
Put the percentage as a decimal in B3 (e.g., 0.75% = 0.0075). Result: 75 BPS.

### Formula 3: Convert BPS to Percentage
```
=B4/10000
```
Put the BPS value in B4 (e.g., 50). Result: 0.005 — format the cell as Percentage to display 0.50%.

### Formula 4: Dollar Impact of BPS on a Loan
```
=B5*(C5/10000)
```
Put loan amount in B5, BPS in C5. Result: annual dollar cost of that BPS change.

**Pro tip:** If your rates are entered as percentages (e.g., the cell shows "6.5" not "0.065"), adjust the formula:
```
=(B2-C2)*100
```
This works when your rate values are already in percentage form.

---

## How to Calculate Basis Points for Commission

Basis points are widely used to express commission rates in financial services, real estate, and trading — because they eliminate ambiguity about whether a "1% fee" is relative or absolute.

**Formula:**
> **Commission BPS = Commission Rate (%) × 100**

**Common commission examples:**

| Role / Context | Typical Rate | In BPS |
|---|---|---|
| Mortgage broker commission | 1.00% | 100 BPS |
| Financial advisor (AUM fee) | 0.75–1.00% | 75–100 BPS |
| ETF expense ratio (low-cost) | 0.03–0.10% | 3–10 BPS |
| Hedge fund management fee | 1.50–2.00% | 150–200 BPS |
| Stock trade commission | 0.05% | 5 BPS |
| Real estate agent (each side) | 2.50–3.00% | 250–300 BPS |

**Dollar value of a commission in BPS:**
> **Commission $ = Transaction Value × (Commission BPS ÷ 10,000)**

**Example:** A mortgage broker earns 75 BPS on a $400,000 loan:
> $400,000 × (75 ÷ 10,000) = $400,000 × 0.0075 = **$3,000**

---

## How to Calculate Basis Points for a Spread

A *spread* is the difference between two rates — between a bid and ask price, between a loan rate and a benchmark, or between two bond yields. Spreads are almost always expressed in basis points.

**Formula:**
> **Spread (BPS) = (Higher Rate − Lower Rate) × 100**

**Examples:**

**Mortgage spread over Treasury:**
30-year mortgage rate: 6.80%. 10-year Treasury: 4.25%.
> (6.80 − 4.25) × 100 = **255 BPS spread**

Historically, mortgage rates run 150–200 BPS above the 10-year Treasury. A 255 BPS spread indicates tighter credit conditions or elevated risk premiums.

**Forex bid-ask spread:**
EUR/USD bid: 1.0850. Ask: 1.0853.
> (1.0853 − 1.0850) × 10,000 = **3 pips** (equivalent to 3 BPS in FX pricing)

**Credit card rate over prime:**
Prime rate: 8.50%. Credit card rate: 24.99%.
> (24.99 − 8.50) × 100 = **1,649 BPS spread**

---

## Quick Reference: All BPS Calculations in One Place

| What You Want to Calculate | Formula | Example |
|---|---|---|
| BPS from two rates | (Rate A − Rate B) × 100 | (6.50 − 6.25) × 100 = 25 BPS |
| BPS from a percentage | % × 100 | 0.75% × 100 = 75 BPS |
| Percentage from BPS | BPS ÷ 100 | 50 BPS ÷ 100 = 0.50% |
| Dollar impact on loan | Loan × (BPS ÷ 10,000) | $300k × (25÷10,000) = $750/yr |
| BPS in Excel (two rates) | =(A1−B1)×10000 | =(0.065−0.0625)×10000 = 25 |
| Commission in dollars | Value × (BPS ÷ 10,000) | $400k × (75÷10,000) = $3,000 |
| Spread between two rates | (High − Low) × 100 | (6.80−4.25) × 100 = 255 BPS |

---

## Frequently Asked Questions

**How do you calculate basis points from a percentage?**

Multiply the percentage by 100. For example, 0.25% × 100 = 25 basis points. In reverse, divide basis points by 100 to get a percentage: 75 BPS ÷ 100 = 0.75%.

**How do you calculate basis points between two interest rates?**

Subtract the smaller rate from the larger rate, then multiply by 100. Example: (6.50% − 6.25%) × 100 = 25 basis points. This works for any two percentages, not just interest rates.

**How do you calculate 25 basis points?**

25 basis points equals 0.25%. To find the dollar value on a loan, multiply the loan amount by 0.0025. On a $200,000 loan: $200,000 × 0.0025 = $500 per year.

**How do you calculate 50 basis points?**

50 basis points equals 0.50%. On a $300,000 mortgage, 50 BPS = $300,000 × 0.005 = $1,500 per year in additional interest, or about $125/month.

**How do I calculate basis points to dollars?**

Use: Dollar Impact = Loan Amount × (BPS ÷ 10,000). For example, 100 basis points on a $500,000 loan = $500,000 × (100 ÷ 10,000) = $5,000 per year.

**What is the Excel formula for basis points?**

To find BPS between two rates (entered as decimals): =(A1−B1)×10000. To convert a percentage to BPS: =A1×10000. To convert BPS to percentage: =A1/10000. Always enter rates as decimals (6.5% = 0.065) unless you adjust the multiplier.

**How do you calculate basis point value (BPV)?**

For loans: BPV = Loan Amount × 0.0001. For a $1,000,000 loan, each basis point = $100. For bond portfolios: BPV = Portfolio Value × Modified Duration × 0.0001.

**How do you calculate basis points for a commission?**

Divide the commission in dollars by the transaction value, then multiply by 10,000. Example: $3,000 commission on a $400,000 loan = (3,000 ÷ 400,000) × 10,000 = 75 BPS.

---

## Final Thoughts

Every basis point calculation reduces to one concept: **basis points are hundredths of a percentage point.** Once that clicks, every formula in this guide becomes intuitive — multiply by 100 to go from percentage to BPS, divide by 100 to go back, and multiply by your loan or portfolio value to convert to dollars.

The calculations that trip people up most are the dollar impact formulas — specifically remembering to divide by 10,000 (not 100) when working with decimal rate values. When in doubt, use our calculator to verify your math instantly.

**Try our free [Basis Point Calculator](https://www.basispointcalculator.com) to instantly convert BPS to percentage, decimal, or dollar impact — no formulas required.**

---

*Disclaimer: This article is for educational purposes only and does not constitute financial or investment advice. Always verify calculations with a qualified financial professional before making borrowing or investment decisions.*
