# HMS Tracker — Planning
`File 1 of 12 | v1.2 | March 2026`

---

## Product Vision

A personal finance OS for a young Muslim entrepreneur in Pakistan. Offline-first, encrypted, no cloud accounts required. Treats money as capital — every rupee tracked with intention.

**Target user:** Me (Saeed). One user. Built to last.

---

## MVP Scope (v1.0)

### Must Have
- Net worth (assets − liabilities)
- Capital Velocity (+Rs X/day)
- Quick Log: expense, income, adjustment
- Goal tracker with Auto-Sweep
- Zakat calculator with nisab, hawl, projection
- AES-GCM PIN encryption
- JSON export/import
- Offline PWA

### Won't Have in v1.0
- Spending insights (v1.1)
- Walk & Reflect journal (v1.1)
- Multi-device sync (v2.0)
- Biometric unlock (v2.0)

---

## Store Contracts

| Store | Key Methods |
|---|---|
| assetsStore | addCash, addPhysicalItem, addInvestment, addLiability, remove, update, snapshotNetWorth |
| transactionsStore | addExpense, addIncome, addAdjustment, getAll(month?), getMonthlyTotals |
| goalsStore | add, allocate, setAutoSweep, complete, update, remove, processAutoSweep |
| zakatStore | getStatus, logPayment, logSadaqah, resetYear, exportCSV, getAnnualSummary |
| settingsStore | getRates, setRates, getTheme, setTheme, addSnapshot, getSnapshots |

---

## 30-Day Sprint

| Week | Focus |
|---|---|
| Week 1 | HTML shell, CSS system, PIN screen, data.js, state.js |
| Week 2 | All 5 stores, utils.js, router.js |
| Week 3 | render.js, 5 page controllers, all modals |
| Week 4 | PWA (SW + manifest), tests, docs, deploy |
