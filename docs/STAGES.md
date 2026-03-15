# HMS Tracker — Build Stages
`File 5 of 12 | v1.0 | March 2026`

This is the coding roadmap. 38 stages, each with a clear output. Work through these in order.

---

## Phase 1: Foundation (Stages 1–8)

| # | Stage | Output | Status |
|---|---|---|---|
| 1 | Project structure | All directories created | ✅ |
| 2 | index.html shell | App shell, PIN screen, bottom nav, FAB, all page divs | ✅ |
| 3 | css/base | reset.css, variables.css, typography.css | ✅ |
| 4 | css/components | navbar, fab, modal, cards, buttons, forms, toast, pin, progress | ✅ |
| 5 | css/pages | dashboard, assets, expenses, goals, zakat | ✅ |
| 6 | manifest.json + _headers | PWA installable, CSP headers | ✅ |
| 7 | sw.js | Offline cache-first, all assets listed | ✅ |
| 8 | prompts.json | 30 daily reflection prompts | ✅ |

## Phase 2: Core JS (Stages 9–16)

| # | Stage | Output | Status |
|---|---|---|---|
| 9 | utils.js | All pure functions: format, calc, convert | ✅ |
| 10 | state.js | Shared in-memory store object | ✅ |
| 11 | data.js | PBKDF2 + AES-GCM, setupPin, unlockWithPin, persistStores | ✅ |
| 12 | router.js | Hash routing, register/navigate/current | ✅ |
| 13 | assetsStore.js | Full CRUD for all 4 asset types | ✅ |
| 14 | transactionsStore.js | addExpense, addIncome, addAdjustment, getAll, getMonthlyTotals | ✅ |
| 15 | goalsStore.js | add, allocate, autoSweep, complete, processAutoSweep | ✅ |
| 16 | zakatStore.js | getStatus, logPayment, resetYear, exportCSV | ✅ |

## Phase 3: Render + Pages (Stages 17–28)

| # | Stage | Output | Status |
|---|---|---|---|
| 17 | settingsStore.js | rates, theme, snapshots, backupReminder | ✅ |
| 18 | render.js — dashboard | netWorth, velocity, sparkline, goalRings, reflection, zakatNudge | ✅ |
| 19 | render.js — assets | assetsList for all 4 types, rates display | ✅ |
| 20 | render.js — transactions | list with colour-coded items, delete buttons | ✅ |
| 21 | render.js — canvas chart | bar chart, DPR-corrected, rAF-wrapped | ✅ |
| 22 | render.js — goals | goalsList with progress bars, rings, action buttons | ✅ |
| 23 | render.js — zakat | zakatPage, hawlCountdown, paymentsList | ✅ |
| 24 | render.js — PIN, toast, save | pinDots, pinError, toast system, saveStatus | ✅ |
| 25 | pages/dashboard.js | init + refresh, auto-snapshot, prompt rotation | ✅ |
| 26 | pages/assets.js | tabs, delete delegation, refresh | ✅ |
| 27 | pages/expenses.js | month nav, filter chips, chart, list | ✅ |
| 28 | pages/goals.js | allocate modal, edit modal, delete | ✅ |

## Phase 4: Main + Modals (Stages 29–34)

| # | Stage | Output | Status |
|---|---|---|---|
| 29 | pages/zakat.js | nisab toggle, log forms, CSV export, year reset | ✅ |
| 30 | main.js — PIN flow | setup, unlock, cooldown, auto-lock | ✅ |
| 31 | main.js — app init | router, nav, FAB, modal system, event delegation | ✅ |
| 32 | main.js — forms | all form submit handlers, date defaults | ✅ |
| 33 | main.js — settings | theme toggle, rates form, change PIN, export/import | ✅ |
| 34 | All modals in index.html | quick-log, add-asset, add-goal, allocate, edit, payment, sadaqah, rates, settings | ✅ |

## Phase 5: Quality (Stages 35–38)

| # | Stage | Output | Status |
|---|---|---|---|
| 35 | Unit tests | tests/runner.html + 3 test files, all passing | ✅ |
| 36 | Docs (12 files) | Full docs/ folder | ✅ |
| 37 | PWA icons | 8 PNG sizes in assets/icons/ | ✅ |
| 38 | Final QA + deploy | Zero console errors, all features tested, GitHub Pages live | ⬜ |
