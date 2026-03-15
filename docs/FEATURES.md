# HMS Tracker — Features
`File 7 of 12 | v1.0 | March 2026`

---

## MVP Features (v1.0)

| # | Feature | Description | Status |
|---|---|---|---|
| 1 | Your Capital Today | Hero net worth card — assets minus liabilities, live | ✅ |
| 2 | Capital Velocity | +Rs X/day from 30-day net worth delta — shown in gold on dashboard | ✅ |
| 3 | Quick Log (FAB) | Deploy / Receive / Adjust capital in under 10 seconds | ✅ |
| 4 | Capital Allocation Modal | On Receive + Adjust: allocate to Goals, Reserve, or Reinvest | ✅ |
| 5 | 5-Store Architecture | assetsStore, transactionsStore, goalsStore, zakatStore, settingsStore | ✅ |
| 6 | Schema Versioning | version + lastUpdated header, migration on mismatch | ✅ |
| 7 | AES-GCM PIN Lock | PBKDF2 + AES-GCM full blob encryption, auto-lock on background | ✅ |
| 8 | Targets Tracker | Short + long term with progress bars, Auto-Sweep, archive | ✅ |
| 9 | Wealth Purification | Zakat calculator, Nisab tracker, Purification Projection | ✅ |
| 10 | Investment Tracking | Stocks & crypto, PKR + USD, P&L indicator | ✅ |
| 11 | Physical Assets | Name, purchase price, current value | ✅ |
| 12 | Unified Rates Screen | USD/PKR + Gold + Silver with timestamps + staleness warning | ✅ |
| 13 | Unit Tests (3 files) | netWorthCalc, zakatCalc, currencyConverter — console-based | ✅ |
| 14 | Dark Mode | Full dark palette via CSS variables | ✅ |
| 15 | SVG Progress Rings | Dashboard goal rings — accessible, CSS animated | ✅ |
| 16 | SVG Sparkline | Net worth history trend — accessible, lightweight | ✅ |
| 17 | Daily Reflection | Rotating prompts from prompts.json by day | ✅ |
| 18 | Full JSON Export | Complete encrypted backup, PIN-gated, dated filename | ✅ |
| 19 | Zakat CSV Export | Saeed_Zakat_${currentHijriYear}H.csv — dynamic filename | ✅ |
| 20 | Zakat Year Reset | Confirmation + archive to JSON before clearing year data | ✅ |
| 21 | Data Import | Restore from JSON with schema version validation | ✅ |
| 22 | Accessibility Baseline | aria-labels on all charts, 48px touch targets | ✅ |
| 23 | Auto-Sweep | Auto-allocate X% of income > Rs 5,000 to a linked target | ✅ |
| 24 | Purification Projection | 'Purify again in X days' using velocity + lunar countdown | ✅ |
| 25 | IndexedDB Shadow | iOS eviction protection | ✅ |
| 26 | Toast Notifications | Feedback on every save, delete, update | ✅ |
| 27 | Empty States | Contextual copy per section | ✅ |
| 28 | Save Indicator | "Saved just now" in navbar after every persist | ✅ |

---

## Won't Build (v1.0)

| # | Feature | Reason |
|---|---|---|
| W1 | Walk & Reflect journal | Deferred to v1.1 |
| W2 | Spending insights / MoM comparison | Deferred to v1.1 |
| W3 | Wisdom Journal (long-press) | Deferred to v1.1 |
| W4 | prompts.json admin screen | Deferred to v1.2 |
| W5 | RTL / Urdu support | Deferred to v1.2 |
| W6 | PWA install prompt | Low priority — browser handles this natively |
| W7 | Weekly backup nudge push | No push notifications in v1.0 |
| W8 | Global benchmarks | Needs data source |
| W9 | Multi-device sync | Needs backend — v2.0 |
| W10 | Biometric unlock | WebAuthn complexity — v2.0 |
| W11 | 6-digit PIN | v1.2 |

---

## Future Ideas

- **v1.1:** Spending insights, Wisdom Journal, Walk & Reflect notes
- **v1.2:** RTL/Urdu, new IV per save, 6-digit PIN, Auto-Sweep feedback
- **v2.0:** Firebase/Supabase sync, cloud backup, biometric
- **v3.0:** Multi-user family accounts, Pakistani fintech API integrations
