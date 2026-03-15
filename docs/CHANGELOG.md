# HMS Tracker — Changelog
`File 8 of 12 | v1.0 | March 2026`

---

## v1.0.0 — March 2026 (Initial Release)

### Added
- **5-Store MVC Architecture** — assetsStore, transactionsStore, goalsStore, zakatStore, settingsStore
- **AES-GCM 256-bit encryption** — PBKDF2-SHA256 (100,000 iterations), PIN-based key derivation
- **Auto-lock** — visibilitychange + 5-minute inactivity timer
- **PIN cooldown** — 30 seconds after 3 failed attempts
- **IndexedDB shadow** — iOS WebKit localStorage eviction protection
- **Capital Velocity** — 30-day net worth delta / 30, displayed as Rs X/day
- **SVG Sparkline** — 30-day net worth trend on dashboard
- **SVG Progress Rings** — goal completion rings on dashboard
- **Canvas Bar Chart** — monthly spending breakdown by category (DPR-corrected)
- **Quick Log (FAB)** — expense, income, adjustment in < 10 seconds
- **Capital Allocation** — allocate income/adjustments to goals, reserve, or reinvest
- **Auto-Sweep** — allocate X% of income > threshold to a linked goal automatically
- **Asset tracking** — cash accounts, physical items, investments (stocks/crypto/funds), liabilities
- **P&L indicators** — % gain/loss on physical items and investments
- **Goal tracker** — short/long term goals, progress bars (red/amber/green), days remaining
- **Zakat calculator** — nisab tracker (gold/silver), hawl countdown, 2.5% calculation
- **Purification Projection** — days until next purification based on Capital Velocity
- **Zakat Year Reset** — archives to JSON before clearing, uses Hijri year in key
- **Sadaqah log** — voluntary giving tracked separately from Zakat
- **CSV export** — `Saeed_Zakat_1447H.csv` with dynamic Hijri year filename
- **Full JSON export/import** — PIN-gated, dated filename, schema validation on import
- **Daily reflection** — 30 rotating prompts from prompts.json, rotates by day of year
- **Unified rates screen** — USD/PKR, Gold 10g, Silver 1g with staleness warning (>7 days)
- **Dark mode first** — deep navy + gold palette, light mode override via CSS variables
- **Toast notifications** — success/error/warning/info with auto-dismiss
- **Save indicator** — "Saved just now" updates in navbar after every persist
- **Empty states** — contextual copy on all empty lists
- **Accessibility baseline** — aria-labels on all interactive elements, 48px touch targets, aria-live on hero numbers
- **Service Worker** — cache-first offline strategy
- **PWA manifest** — installable on Android (Chrome) and iOS (Safari)
- **3 unit test files** — netWorthCalc, zakatCalc, currencyConverter (browser console runner)
- **12 documentation files** — complete project docs in docs/ folder
- **CSP headers** — `_headers` file for GitHub Pages security

### Architecture decisions
- Shared `state.js` eliminates re-decrypt-on-every-save bug
- `_initialized` guard in all page controllers prevents duplicate event listeners
- Canvas DPR-corrected with `offsetWidth` read inside `requestAnimationFrame`
- Single delegation listener on `.bottom-nav` replaces per-item listeners
- Theme toggle wired in exactly one place (main.js `initSettings`)

---

## Bug Log

| Date | Bug | Fix |
|---|---|---|
| 2026-03-14 | Re-decrypt on every save caused ~50ms lag per keystroke | Replaced with shared state.js; decrypt only on unlock |
| 2026-03-14 | Duplicate nav item caused double-routing to expenses page | Removed invisible spacer button from bottom nav |
| 2026-03-14 | Event listeners re-attached on every page revisit | Added `_initialized` guard to all 4 page controllers |
| 2026-03-14 | Canvas `offsetWidth` was 0 on first render | Moved DPR read inside `requestAnimationFrame` |
| 2026-03-14 | Theme toggle wired in two places (inline JS + main.js) | Removed inline script block, single handler in `initSettings()` |
| 2026-03-14 | DOM ready race in boot() | Added `DOMContentLoaded` guard: `if (document.readyState === 'loading')` |

---

## Performance Log

| Metric | Value |
|---|---|
| First meaningful paint | < 200ms (cached) |
| AES-GCM encrypt (full blob) | ~5-15ms |
| PBKDF2 (100k iterations) | ~800ms on mid-range Android |
| Canvas bar chart render | < 16ms (inside rAF) |
| Total JS (unminified) | ~55KB |
| Total CSS (unminified) | ~28KB |
| localStorage blob (typical) | < 50KB |

---

## v1.1.0 — Planned

- Spending insights (top entries, month-over-month)
- Wisdom Journal with Walk & Reflect notes
- prompts.json admin screen (PIN-gated)
- Bump PBKDF2 to 200,000 iterations

## v1.2.0 — Planned

- RTL / Urdu prompts
- Explicit new IV per save
- 6-digit PIN option
- Auto-Sweep keyword feedback loop
- Hawl reset when wealth dips below nisab

## v2.0.0 — Planned

- Firebase/Supabase backend
- Multi-device sync
- Encrypted cloud backup to Google Drive
- WebAuthn biometric unlock
