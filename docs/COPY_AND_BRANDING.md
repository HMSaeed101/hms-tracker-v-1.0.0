# HMS Tracker — Copywriting & Branding Master Guide
`File 13 of 13 | March 2026`

---

## 1. Brand Philosophy & Identity

**HMS Tracker** is not a standard expense tracker or budget ledger. It is a **Personal Finance Command Center** built for a young Muslim entrepreneur in Pakistan.

### Core Brand Axiom
> *"Money is not merely spent; it is capital deployed with intention. Wealth is not just accumulated; it is purified."*

---

## 2. Terminology & Vocabulary Matrix

Use this dictionary to maintain consistent branding across all screens, tooltips, toasts, and buttons.

| Standard Finance Term | HMS Tracker Brand Copy | Context & Strategic Rationale |
|---|---|---|
| **Net Worth** | **Your Capital Today** | Reframes total assets minus liabilities as active, deployable capital. |
| **Daily Growth / Change** | **Capital Velocity** | Measures financial momentum in `+Rs X/day` calculated from 30-day delta. |
| **Expense / Spending** | **Deploy Capital** | Replaces passive spending with intentional resource allocation. |
| **Income / Earnings** | **Receive Capital** | Positions earnings as incoming resources to be assigned with purpose. |
| **Zakat Due** | **Wealth Purification** | Focuses on spiritual purification (*Tazkiyah*) rather than a tax obligation. |
| **Budget / Savings Target** | **Capital Target / Goal** | Shifts focus from restrictive budgets to goal-oriented capital growth. |
| **Emergency Fund** | **Liquidity Reserve** | Emphasizes readiness and capital safety rather than panic. |
| **Investment** | **Capital Deployment (Yield)** | Tracks stocks, crypto, and physical assets in PKR/USD. |

---

## 3. Screen-by-Screen Copy Inventory

Use this section to audit and refine the exact strings rendered in the UI.

### 🔐 PIN Lock & Boot Screen
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Screen Header | `Welcome back` | Friendly, secure entry prompt. |
| Subtitle (Unlock) | `Enter your PIN to unlock` | Clear action instruction. |
| Header (First Run) | `Create your PIN` | First-time onboarding title. |
| Subtitle (Setup) | `Set a 4-digit PIN to protect your data` | Emphasizes client-side Web Crypto security. |
| Error Message | `PINs do not match — try again` | Direct error feedback. |
| Cooldown Warning | `Try again in 30s` | Triggered after 3 failed PIN attempts. |

---

### 📊 Dashboard Screen
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Hero Label | `YOUR CAPITAL TODAY` | Uppercase, tracked small-caps label above net worth. |
| Hero Value | `Rs 250,000` | Rendered in Space Mono font with `formatPKRFull`. |
| Velocity Badge | `▲ +Rs 1,200/day` | Gold/Green indicator showing 30-day momentum. |
| Sparkline Label | `30-day capital trend` | Accessibility `aria-label` for trend curve. |
| Stats Label 1 | `Received` | Monthly income total. |
| Stats Label 2 | `Deployed` | Monthly expense total. |
| Goals Section | `Active Targets` | Header above active progress rings. |
| Reflection Label | `DAILY REFLECTION` | Header for daily prompt card. |

---

### 💼 Portfolio & Assets Screen
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Tab 1 Header | `Assets` | Liquid cash, physical items, investments, liabilities. |
| Tab 2 Header | `Targets` | Financial goals & Auto-Sweep targets. |
| Sub-tab 1 | `Cash` | Bank accounts, cash in hand, wallet. |
| Sub-tab 2 | `Physical` | Laptops, vehicles, physical assets (current value). |
| Sub-tab 3 | `Investments` | Stocks, crypto, mutual funds (PKR/USD). |
| Sub-tab 4 | `Liabilities` | Debts, loans, unpaid obligations. |
| Action Button | `+ Add Asset` | Opens creation modal. |

---

### 🎯 Targets & Goals Screen
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Badge — Short Term | `Short-term` | Target duration under 12 months. |
| Badge — Long Term | `Long-term` | Multi-year target (e.g. Hajj, Real Estate). |
| Badge — Auto-Sweep | `⚡ Auto-Sweep X%` | Highlights automatic allocation from income. |
| Pace Badge | `Pace: Rs X/mo` | Calculated monthly savings needed to hit deadline. |
| Deadline — Good | `120d left` | Shown in emerald green when deadline is safe. |
| Deadline — Urgent | `12d left` / `Overdue` | Shown in red when deadline is near or passed. |

---

### 🌙 Zakat & Sadaqah Screen
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Hero Card Title | `Zakat Due` | Live Zakat obligation calculated at 2.5%. |
| Status 1 | `Below Nisab — Not Obligatory` | Net eligible assets are under current Nisab threshold. |
| Status 2 | `Nisab Reached — Hawl in Progress` | Nisab crossed; 354-day lunar Hawl year active. |
| Status 3 | `Zakat Due — Purify Your Wealth` | 354 days completed; Zakat payment due. |
| Nisab Standard 1 | `Gold Standard (85g)` | Traditional Nisab standard (~85g 24K Gold). |
| Nisab Standard 2 | `Silver Standard (595g)` | Alternative Nisab standard (~595g Pure Silver). |
| Hawl Card Title | `Hawl (Lunar Year)` | Tracks progress towards 354 lunar days. |
| Hawl Progress Text | `X% of Hawl Completed (Y of 354 days)` | Visual timeline percentage text. |
| Projection Text | `At current velocity, next purification in ~X days` | Projection based on daily velocity. |

---

### ⚡ Quick Log Modal (FAB)
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Modal Title | `Quick Log` | Header for 10-second fast logging modal. |
| Tab 1 | `Deploy Capital` | Expense logging tab. |
| Tab 2 | `Receive Capital` | Income logging tab. |
| Tab 3 | `Adjust` | Net worth manual adjustment tab. |
| Preset Pills | `+100` `+500` `+1,000` `+5,000` | 1-tap quick amount increment pills. |
| Expense Categories | `Myself` `Food & Chai` `Education` `Unexpected` | Custom category radio pills tailored for Saeed. |

---

### ⚙️ Settings & System Modal
| UI Element | Current String | Brand Guidance / Context |
|---|---|---|
| Theme Switch | `Light Mode` / `Dark Mode` | Switches color palette via CSS `data-theme`. |
| Zakat Toggle | `Zakat & Sadaqah` | Show/hide Zakat tracking features. |
| Reflection Style | `Spiritual` vs `General` | Selects prompt pool in `prompts.json`. |
| Market Rates Button | `Load Market Benchmarks` | 1-click update for USD/Gold/Silver rates. |
| Rate Stamp Button | `Confirm Today's Date` | Updates `lastUpdated` rate timestamp. |
| Backup Buttons | `Export Backup` / `Import Backup` | Full JSON encryption backup actions. |
| Danger Zone Button | `Wipe All Data & Reset App` | Factory reset button with double confirmation. |

---

## 4. Notifications & Toast Copy Guidelines

Toasts should be short, functional, and include visual checkmarks (`✓`) or status emojis (`⚡`).

| Event | Toast Message String | Type |
|---|---|---|
| Expense Saved | `Expense logged ✓` | `success` |
| Income Saved (No Sweeps) | `Income logged ✓` | `success` |
| Income Saved (Auto-Sweep) | `Income logged (Rs X auto-swept to goals) ✓` | `success` |
| Auto-Sweep Triggered | `⚡ Rs X swept to "Goal Title"` | `info` |
| Rates Updated | `Rates updated ✓` | `success` |
| Market Presets Loaded | `Loaded market benchmarks ✓` | `info` |
| PIN Changed | `PIN changed ✓` | `success` |
| Export Completed | `Backup exported ✓` | `success` |
| Import Completed | `Data imported ✓ — reloading` | `success` |
| App Wiped | `All data wiped — resetting app` | `warning` |

---

## 5. Daily Reflection Prompts (`prompts.json`)

Reflection prompts rotate automatically by day of year (`dayOfYear % promptList.length`).

### Spiritual Style Sample Copy
- *"Are your financial goals serving your akhirah, or competing with it?"*
- *"Barakah is not in the size of the number, but in the purity of the source."*
- *"Have you calculated Zakat with exactness, or estimation?"*
- *"Every rupee in your possession is a trust (Amanah). Deploy it with intention."*

### General Style Sample Copy
- *"Is your daily velocity positive or negative over the last 30 days?"*
- *"Are you funding your priority targets before non-essential expenses?"*
- *"Review your liquidity reserves — are you prepared for unexpected shifts?"*

---

## 6. How to Edit & Customize Copy in Codebase

If you wish to modify any copy in the app:
1. **Screen Labels & Headers**: Update HTML strings in [`index.html`](file:///D:/Work/projects/Apps/Finance%20Tracker/index.html).
2. **Dynamic UI Text & Toasts**: Update string literals in [`js/render.js`](file:///D:/Work/projects/Apps/Finance%20Tracker/js/render.js) and [`js/main.js`](file:///D:/Work/projects/Apps/Finance%20Tracker/js/main.js).
3. **Daily Reflection Prompts**: Update prompts array in [`prompts.json`](file:///D:/Work/projects/Apps/Finance%20Tracker/prompts.json).
