# HMS Tracker
**Personal Finance Command Center**
*A fully offline PWA — net worth, capital velocity, goals, and encrypted data.*

Built by Saeed — CS Student, UET Taxila — 2026
`v1.2.0 | Vanilla JS | No framework | No build tools | 100% offline`

---

## What Is HMS Tracker

HMS Tracker is a personal finance OS built for disciplined capital management. It tracks everything — cash, bank balances, physical items, stocks and crypto investments, and financial goals — in a single clean interface. No spreadsheets, no cloud accounts, no third-party tracking required.

It is a Progressive Web App (PWA). Install it directly from your browser — no app store needed. Works fully offline. All data is AES-GCM encrypted on your device. Zero server, zero sync, zero telemetry.

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
| Storage | localStorage + IndexedDB shadow | No backend required |
| Encryption | Web Crypto API — PBKDF2-SHA256 + AES-GCM 256-bit | Industry standard, built-in |
| Charts | SVG (progress rings, sparkline) + Canvas (bar chart) | No external chart library |
| PWA | Service Worker + manifest.json | Installable on Android & iOS |
| Architecture | MVC — 4 isolated stores | Independently testable, no cross-store imports |
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
├── prompts.json        # 25 daily reflection prompts
├── _headers            # CSP security headers (GitHub Pages)
├── README.md
│
├── css/
│   ├── main.css            # @import chain only — no rules
│   ├── base/               # variables, reset, typography
│   ├── components/         # navbar, fab, modal, cards, forms, toast, pin, progress, buttons
│   └── pages/              # dashboard, assets, expenses, goals
│
├── js/
│   ├── main.js             # app entry — init, router, PIN flow, event delegation
│   ├── data.js             # AES-GCM encrypt/decrypt, localStorage I/O
│   ├── state.js            # shared in-memory store state
│   ├── render.js           # all DOM updates — no logic
│   ├── utils.js            # pure helpers — format, calculate, convert
│   ├── router.js           # hash routing
│   ├── stores/             # 4 data stores (MVC model layer)
│   └── pages/              # page controllers (MVC controller layer)
│
├── assets/
│   ├── icons/              # PWA icons (8 sizes)
│   └── sprites.svg         # SVG icon sprite system
│
├── tests/
│   ├── runner.html         # browser test runner
│   ├── netWorthCalc.test.js
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

### Security
On PIN setup, PBKDF2-SHA256 at 100,000 iterations derives a 256-bit master key from the PIN. AES-GCM encrypts the entire data blob. The key lives in memory only — never persisted. On background/lock, the key is cleared. Wrong PIN after 3 attempts: 30-second cooldown.

### Capital Velocity
Dashboard shows `+Rs X/day` or `-Rs X/day`. Calculated as `(latest net worth snapshot − 30-day-ago snapshot) / 30`. Auto-snapshot fires on every dashboard load.

---

## Security Notes

- All data encrypted with AES-GCM 256-bit before written to localStorage
- The PIN is never stored — only used to derive the encryption key via PBKDF2
- If the PIN is forgotten, data cannot be recovered — by design
- An encrypted blob export is available for emergency recovery
- IndexedDB shadow copy protects against iOS WebKit localStorage eviction
- No data ever leaves the device — zero network transmissions of personal data

---

## Roadmap

| Version | Scope |
|---|---|
| v1.2 (current) | Core features: net worth, quick log, goals, PIN encryption, GitHub Pages deploy |
| v1.3 | Advanced spending insights, category analytics, Web Worker encryption offloading |
| v2.0 | Multi-device sync via Firebase/Supabase, encrypted cloud backup to Google Drive |

---

**Version:** 1.2.0 · **Built:** March 2026 · **License:** Private — personal use only

> *"Every rupee is capital. Deploy it with intention."*
