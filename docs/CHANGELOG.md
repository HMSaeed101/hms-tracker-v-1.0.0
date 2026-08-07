# HMS Tracker — Changelog
`File 8 of 12 | v1.2 | March 2026`

---

## v1.2.0 — March 2026 (System Refactoring & Optimization)

### Added
- **Factory Reset / Data Wipe** — Double-confirmation reset mechanism clearing `localStorage` and `IndexedDB` shadow store.
- **Preset Amount Pills** — Quick increment buttons (`+100`, `+500`, `+1,000`, `+5,000`) for fast amount entry in Quick Log.
- **Goal Pace Calculation** — Monthly required savings rate (`Pace: Rs X/mo`) badge displayed on active goal cards.
- **SVG Sparkline Area Fill** — Gradient fill area and end-point dot indicator for 30-day velocity visual momentum.
- **Tactile Touch Micro-Interactions** — Press scale transforms across cards and buttons.
- **Copywriting & Branding Master Guide** — Comprehensive copy inventory in `docs/COPY_AND_BRANDING.md`.

### Fixed & Refactored
- **GitHub Pages PWA 404** — Fixed `start_url` and `scope` relative path resolution for repo subpaths (`./index.html`).
- **Portfolio Tab Routing Bug** — Fixed route handling to cleanly switch sub-tabs between Assets and Goals view.
- **Cleaned Undefined Controller Reference** — Resolved `ReferenceError: assetsPage is not defined` bug on page refresh.
- **Zakat & Islamic Finance Feature Removal** — Fully removed Zakat, Nisab, Hawl, Sadaqah, and Gold/Silver pricing tools to deliver a streamlined 4-store Personal Finance Command Center.

---

## v1.0.0 — March 2026 (Initial Release)

### Added
- **4-Store MVC Architecture** — assetsStore, transactionsStore, goalsStore, settingsStore
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
- **Full JSON export/import** — PIN-gated, dated filename, schema validation on import
- **Daily reflection** — 25 rotating prompts from prompts.json, rotates by day of year
- **Dark mode first** — deep navy + gold palette, light mode override via CSS variables
- **Toast notifications** — success/error/warning/info with auto-dismiss
- **Save indicator** — "Saved just now" updates in navbar after every persist
- **Service Worker** — cache-first offline strategy (v1.2.0)
- **PWA manifest** — installable on Android (Chrome) and iOS (Safari)
