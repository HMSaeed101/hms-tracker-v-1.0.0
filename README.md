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

## Quick Start

### Run Locally
```bash
# Clone the repo
git clone https://github.com/[username]/hms-tracker.git
cd hms-tracker

# Start a local server (service workers require HTTP, not file://)
npx serve .
```

---

**Version:** 1.2.0 · **Built:** March 2026 · **License:** Private — personal use only
