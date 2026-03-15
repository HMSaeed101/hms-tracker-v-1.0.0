# HMS Tracker — Zakat Logic
`File 9 of 12 | v1.0 | March 2026`

---

## 1. Scholarly Basis

This implementation follows the **jumhur (majority scholarly consensus)** position from classical Islamic jurisprudence, specifically:

- **Nisab standard:** Gold (85g) — the more conservative and widely accepted standard
- **Rate:** 2.5% of zakatable wealth
- **Hawl:** One complete lunar (Hijri) year must pass while wealth exceeds nisab
- **Eligible assets:** Cash + liquid investments minus liabilities

**Primary references:**
- Al-Nawawi, *Minhaj al-Talibin*
- Ibn Qudama, *Al-Mughni*
- Yusuf al-Qaradawi, *Fiqh al-Zakat* (modern comprehensive treatment)
- AAOIFI Shari'a Standard No. 35 (contemporary institutional standard)

> **Disclaimer:** This app is a practical tool, not a fatwa. For your specific Zakat obligations, consult a qualified Islamic scholar or your local masjid's Zakat committee.

---

## 2. Nisab Calculation

The nisab is the minimum threshold of wealth above which Zakat becomes obligatory.

### Gold Standard (Default — Jumhur Position)
```
Nisab = (gold price per gram) × 85g
      = (gold10gPKR / 10) × 85
```

At gold Rs 285,000 / 10g → Nisab = Rs 28,500 × 85 = **Rs 2,422,500**

### Silver Standard (More Accessible — Hanafi Preference)
```
Nisab = silver price per gram × 595g
      = silver1gPKR × 595
```

At silver Rs 2,800/g → Nisab = **Rs 1,666,000**

The silver standard is lower and therefore more inclusive — it causes more people to pay Zakat. Some scholars (particularly Hanafi) prefer this. The app supports both; gold is the default per contemporary majority opinion.

---

## 3. Eligible (Zakatable) Assets

```
Eligible = sum(cash) + sum(investments) - sum(liabilities)
```

**Included:**
- Cash (bank accounts, physical cash, mobile wallets)
- Liquid investments (stocks, mutual funds, crypto held for investment)

**Excluded:**
- Physical items (laptop, motorcycle, furniture) — personal use items are not zakatable
- Primary residence
- Business equipment in active use

**Formula in code:**
```javascript
export function calcZakatEligible(assets) {
  const cash   = (assets.cash || []).reduce((s,c) => s + (c.amountPKR || 0), 0);
  const invest = (assets.investments || []).reduce((s,i) => s + (i.amountPKR || 0), 0);
  const liab   = (assets.liabilities || []).reduce((s,l) => s + (l.amountPKR || 0), 0);
  return Math.max(0, cash + invest - liab);
}
```

---

## 4. Hawl (Lunar Year)

Zakat is only due if wealth has **continuously** exceeded the nisab for one complete lunar year (hawl).

- A lunar year = approximately **354 days** (12 lunar months × 29.5 days)
- The app starts the hawl countdown from the date nisab is first crossed
- If wealth dips below nisab during the year, the hawl resets (not currently enforced in v1.0 — planned for v1.2)
- When hawl completes (354 days passed), Zakat is due

**Hawl tracking in code:**
```javascript
getStatus(assets, rates) {
  const daysSince    = z().hawlStartDate
    ? Math.floor((Date.now() - new Date(z().hawlStartDate)) / 86400000) : 0;
  const hawlComplete = daysSince >= 354;
  return {
    hawlComplete,
    daysRemaining: Math.max(0, 354 - daysSince),
    amountDue: (nisabReached && hawlComplete) ? calcZakatDue(eligible) : 0,
  };
}
```

---

## 5. Zakat Amount

```
Zakat Due = Eligible Assets × 2.5%
```

```javascript
export function calcZakatDue(eligible) {
  return eligible * 0.025;
}
```

Example: Eligible Rs 3,000,000 → Zakat Due = **Rs 75,000**

---

## 6. Purification Projection

The app shows how many days until the next purification based on Capital Velocity:

```
Projection (days) = Zakat Due ÷ Capital Velocity (Rs/day)
```

```javascript
export function calcPurificationProjection(zakatDue, velocity) {
  if (!velocity || velocity <= 0 || !zakatDue) return null;
  return Math.ceil(zakatDue / velocity);
}
```

This answers: *"At my current wealth-building rate, when will I accumulate enough new wealth to cover my next Zakat payment?"*

---

## 7. Zakat Year Reset

When Zakat is paid and a new year begins:

1. User confirms reset (confirmation dialog)
2. Current year's payments + sadaqah archived to `localStorage('zakat_archive_1447H')`
3. `hawlStartDate`, `payments`, `sadaqah` cleared
4. New hawl begins when nisab is crossed again

The archive key uses the **Hijri year** dynamically calculated from the Gregorian date:

```javascript
export function currentHijriYear() {
  // Julian day approximation → Hijri year
  const jd  = Math.floor((Date.now() / 86400000) + 2440587.5);
  // ... standard Hijri conversion algorithm
  return year; // e.g. 1447
}
```

**CSV export filename:** `Saeed_Zakat_1447H.csv` — dynamic, never hardcoded.

---

## 8. Sadaqah (Voluntary Giving)

Sadaqah is tracked separately from Zakat:
- Not obligatory
- No nisab threshold
- No hawl requirement
- Logged with amount, date, and optional note
- Shows as separate total in the annual summary

> The Prophet ﷺ said: *"Sadaqah does not decrease wealth."* — Sahih Muslim 2588
