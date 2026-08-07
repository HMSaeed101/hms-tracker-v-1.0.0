# HMS Tracker
**Personal Finance Command Center**
*A fully offline PWA — net worth, capital velocity, Zakat, goals, and encrypted data.*

Built by Saeed — CS Student, UET Taxila — 2026
`v1.0.0 | Vanilla JS | No framework | No build tools | 100% offline`

---

## What Is HMS Tracker

HMS Tracker is a personal finance OS built for one person: me. It tracks everything — cash, bank balances, physical items, stocks and crypto investments, financial goals, and Zakat obligations — in a single clean interface. No spreadsheets, no Western-centric apps, no cloud accounts required.

It is a Progressive Web App. Install it from your browser — no app store needed. Works fully offline. Data is AES-GCM encrypted on your device. No server, no sync, no account.

| Feature | Description |
|---|---|
| ◆ Your Capital Today | Live net worth calculation |
| ◆ Capital Velocity | +Rs X/day momentum metric |
| ◆ Quick Log | Expense or income logging in 10s |
| ◆ Capital Allocation | Intentional resource tracking |
| ◆ Goal tracker | Auto-Sweep allocation rules |
| ◆ AES-GCM encryption | PBKDF2 + PIN lock protection |
| ◆ Offline-first | Service Worker PWA caching |
| ◆ IndexedDB shadow | iOS eviction-resistant backup |
| ◆ SVG progress rings | Visual target completion |
| ◆ Capital Velocity sparkline | 30-day net worth trend |
| ◆ Dark mode first | Premium fintech UI/UX feel |

---

## Design Philosophy

Most finance apps treat money as a passive ledger. HMS Tracker treats it as active capital — every rupee is a resource to deploy intentionally. The language reflects this: *Capital Deployed* for expenses, *Your Capital Today* for net worth, and *Capital Velocity* for momentum.

Built for an entrepreneur in Pakistan who thinks in terms of compound growth, disciplined capital allocation, and long-term financial independence.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | Vanilla JS — ES Modules | No transpilation, fast, zero overhead |
| CSS | Custom properties only | No Tailwind, no Bootstrap |
| Storage | localStorage + IndexedDB shadow | No backend |
| Encryption | Web Crypto API — PBKDF2-SHA256 + AES-GCM 256-bit | Industry standard, built-in |
| Charts | SVG (progress rings, sparkline) + Canvas (bar chart) | No Chart.js |
| PWA | Service Worker + manifest.json | Installable on Android & iOS |
| Architecture | MVC — 5 isolated stores | Independently testable, no cross-store imports |
| Hosting | GitHub Pages | Free, HTTPS, zero configuration |
| Build tools | **None** | Open index.html — that's it |
| Dependencies | **Zero runtime** | npx serve for local dev only |

---

## Quick Start

### Run Locally
```bash
# Clone the repo
git clone https://github.com/[username]/hms-tracker.git
cd hms-tracker

# Start a local server (service workers require HTTP, not file://)
npx serve .
# OR
python -m http.server 8080

# Open in Chrome
open http://localhost:3000
```

### Run Tests
```bash
npx serve .
# Open http://localhost:3000/tests/runner.html
# Check DevTools → Console
```

### Deploy to GitHub Pages
```bash
git push origin main
# GitHub repo → Settings → Pages → Deploy from branch: main / (root)
# Site live at: https://[username].github.io/hms-tracker
```

### Install on Phone
- **Android**: Chrome → wait 30s → tap install banner or ⋮ → Add to Home Screen
- **iOS**: Safari (not Chrome) → tap Share → Add to Home Screen
- App opens standalone — no browser UI, full screen

---

## Project Structure

```
hms-tracker/
├── index.html          # single HTML entry point
├── manifest.json       # PWA metadata
├── sw.js               # service worker (offline cache)
├── prompts.json        # 30 daily reflection prompts
├── _headers            # CSP security headers (GitHub Pages)
├── README.md
│
├── css/
│   ├── main.css            # @import chain only — no rules
│   ├── base/               # variables, reset, typography
│   ├── components/         # navbar, fab, modal, cards, forms, toast, pin, progress, buttons
│   └── pages/              # dashboard, assets, expenses, goals, zakat
│
├── js/
│   ├── main.js             # app entry — init, router, PIN flow, event delegation
│   ├── data.js             # AES-GCM encrypt/decrypt, localStorage I/O
│   ├── state.js            # shared in-memory store state
│   ├── render.js           # all DOM updates — no logic
│   ├── utils.js            # pure helpers — format, calculate, convert
│   ├── router.js           # hash routing
│   ├── stores/             # 5 data stores (MVC model layer)
│   └── pages/              # 5 page controllers (MVC controller layer)
│
├── assets/
│   ├── icons/              # PWA icons (8 sizes)
│   └── sprites.svg         # SVG icon sprite system
│
├── tests/
│   ├── runner.html         # browser test runner
│   ├── netWorthCalc.test.js
│   ├── zakatCalc.test.js
│   └── currencyConverter.test.js
│
└── docs/                   # 12 documentation files
```

---

## How It Works

### Data Flow
Every user action follows the same path:
```
user tap
  → page controller
  → store method (validates + writes in-memory state)
  → debouncedSave (encrypts + writes to localStorage)
  → render function (updates DOM)
```
No shortcuts. No bypassing layers.

### Security
On PIN setup, PBKDF2-SHA256 at 100,000 iterations derives a 256-bit master key from the PIN. AES-GCM encrypts the entire data blob. The key lives in memory only — never persisted. On background/lock, the key is cleared. Wrong PIN after 3 attempts: 30-second cooldown.

### Zakat
Nisab checked against current gold price (85g standard, toggleable to silver 595g). Zakat due = eligible assets (cash + investments − liabilities) × 2.5%, only when nisab crossed and a full Hijri lunar year (hawl, ~354 days) has passed. Purification Projection shows how many days until next purification based on Capital Velocity.

### Capital Velocity
Dashboard shows `+Rs X/day` or `-Rs X/day`. Calculated as (latest net worth snapshot − 30-day-ago snapshot) / 30. Auto-snapshot fires on every dashboard load.

---

## Security Notes

- All data encrypted with AES-GCM 256-bit before written to localStorage
- The PIN is never stored — only used to derive the encryption key via PBKDF2
- If the PIN is forgotten, data cannot be recovered — by design
- An encrypted blob export is available for emergency recovery
- IndexedDB shadow copy protects against iOS WebKit localStorage eviction
- No data ever leaves the device — zero network transmissions of personal data

---

## Islamic Finance Note

HMS Tracker implements Zakat calculation based on established scholarly consensus (*jumhur*) from classical Islamic jurisprudence — gold nisab standard (85g), 2.5% rate, hawl tracking, eligible asset classification. Both gold and silver nisab standards are supported.

The app is a practical tool, not a fatwa. For your specific Zakat obligations, consult a qualified Islamic scholar or your local masjid's Zakat committee.

---

## Roadmap

| Version | Scope |
|---|---|
| v1.0 (current) | Core features: net worth, quick log, Zakat, goals, PIN encryption, GitHub Pages deploy |
| v1.1 | Spending insights, Wisdom Journal, Walk & Reflect prompts admin, Crypto Web Worker |
| v1.2 | RTL/Urdu prompts, new IV per save, 6-digit PIN option, Auto-Sweep keyword feedback |
| v2.0 | Multi-device sync via Firebase/Supabase, encrypted cloud backup to Google Drive |
| v3.0 | Multi-user, family accounts, Pakistani fintech integrations, Islamic finance tools |

---


**Version:** 1.0.0 · **Built:** March 2026 · **License:** Private — personal use only

> *"Every rupee is capital. Deploy it with intention."*
