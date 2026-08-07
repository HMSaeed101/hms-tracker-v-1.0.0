# HMS Tracker — Planning
`File 1 of 12 | v1.2 | March 2026`

---

## Product Vision

A personal finance OS built for disciplined capital management and financial net worth tracking. Offline-first, encrypted, no cloud accounts required. Treats money as capital — every rupee tracked with intention.

**Target user:** Me (Saeed). One user. Built for speed, security, and long-term durability.

---

## Active Scope (v1.2)

### Must Have
- Net worth calculation (assets − liabilities)
- Capital Velocity (+Rs X/day momentum)
- Quick Log: expense, income, adjustment in < 10s
- Goal tracker with Auto-Sweep rules
- AES-GCM PIN encryption & auto-lock
- Factory Reset & Data Wipe mechanism
- JSON encrypted export/import
- Offline PWA Service Worker caching

---

## Store Contracts

| Store | Key Methods |
|---|---|
| assetsStore | addCash, addPhysicalItem, addInvestment, addLiability, remove, update, snapshotNetWorth |
| transactionsStore | addExpense, addIncome, addAdjustment, getAll(month?), getMonthlyTotals |
| goalsStore | add, allocate, setAutoSweep, complete, update, remove, processAutoSweep |
| settingsStore | getRates, setRates, getTheme, setTheme, addSnapshot, getSnapshots |
