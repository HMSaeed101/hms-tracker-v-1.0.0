# Finance Tracker

**Personal Finance Command Center** — a fully offline PWA for net worth, capital velocity, goals, and encrypted data.

Built by Saeed — CS Student, UET Taxila — 2026
`v1.2.0 | Vanilla JS | No framework | No build tools | 100% offline`

---

## What it is

This Finance Tracker tracks cash, bank balances, physical items, stock/crypto investments, and financial goals — all in one interface, all encrypted on-device. No spreadsheets, no cloud accounts, no third-party tracking. It's a Progressive Web App: installable straight from the browser, works fully offline, zero server, zero sync, zero telemetry.

For the product philosophy and full feature set, see the **[Product Vision](../../wiki/Product-Vision)** wiki page.

## Tech stack

| Layer | Choice |
|---|---|
| Language | Vanilla JS — ES Modules |
| CSS | Custom properties only |
| Storage | localStorage + IndexedDB shadow |
| Encryption | Web Crypto API — PBKDF2-SHA256 + AES-GCM 256-bit |
| Charts | SVG (rings, sparkline) + Canvas (bar chart) |
| PWA | Service Worker + manifest.json |
| Hosting | GitHub Pages |
| Build tools | None |
| Dependencies | Zero runtime |

Why these choices were made is documented in the **[Architecture Decisions](../../wiki/Architecture-Decisions)** wiki page.

## Quick start

```bash
git clone https://github.com/hmsaeed-dev/hms-tracker.git
cd hms-tracker

# Service workers require HTTP, not file://
npx serve .
# OR
python -m http.server 8080

open http://localhost:3000
```

**Run tests:** open `http://localhost:3000/tests/runner.html`, check DevTools → Console.

**Install on your phone:**
- Android: Chrome → wait 30s → tap the install banner, or ⋮ → Add to Home Screen
- iOS: Safari (not Chrome) → Share → Add to Home Screen

## Deploy

```bash
git push origin main
# Repo Settings → Pages → Deploy from branch: main / (root)
# Live at: https://hmsaeed-dev.github.io/hms-tracker
```

## Project structure

```
hms-tracker/
├── index.html          # single HTML entry point
├── manifest.json       # PWA metadata
├── sw.js               # service worker (offline cache)
├── prompts.json        # daily reflection prompts
├── _headers            # CSP security headers (GitHub Pages)
│
├── css/                # design system — see wiki/Design-System
├── js/
│   ├── main.js          # app entry — init, router, PIN flow
│   ├── data.js           # AES-GCM encrypt/decrypt, localStorage I/O
│   ├── state.js          # shared in-memory store state
│   ├── render.js          # all DOM updates
│   ├── utils.js            # pure helpers
│   ├── router.js
│   ├── stores/             # 4 data stores — see wiki/Architecture
│   └── pages/               # page controllers
│
├── assets/
└── tests/
```

## Learn more

Full documentation — architecture, data schema, security model, design system, financial formulas, changelog, and roadmap — lives in the **[project wiki](../../wiki)**.

| Topic | Wiki page |
|---|---|
| Architecture & data schema | [Architecture](../../wiki/Architecture) |
| Why specific technical choices were made | [Architecture Decisions](../../wiki/Architecture-Decisions) |
| Encryption, PIN flow, threat model | [Security](../../wiki/Security) |
| Net worth / velocity formulas, brand terminology | [Financial Calculations](../../wiki/Financial-Calculations) |
| Colours, typography, components | [Design System](../../wiki/Design-System) |
| Version history | [Changelog](../../wiki/Changelog) |
| What's planned next | [Roadmap](../../wiki/Roadmap) |

---

**Security note:** all data is AES-GCM 256-bit encrypted before it touches localStorage. The PIN is never stored — only used to derive the key. If the PIN is forgotten, data cannot be recovered, by design. See [Security](../../wiki/Security) for the full model.

**Version:** 1.2.0 · **Built:** March 2026 · **License:** Private — personal use only

> *"Every rupee is capital. Deploy it with intention."*
