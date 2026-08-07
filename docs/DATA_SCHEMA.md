# HMS Tracker — Data Schema
`File 2 of 12 | v1.2 | March 2026`

---

## 1. Top-Level Envelope

Every `localStorage` save is an AES-GCM encrypted blob. When decrypted, the JSON has this shape:

```json
{
  "version": "1.0",
  "lastUpdated": "2026-03-14T10:30:00.000Z",
  "stores": { ... }
}
```

`version` is checked on load. Mismatch triggers `migrateData()` and a non-intrusive toast.

---

## 2. Four Store Schemas

### 2.1 `stores.assets`

```json
{
  "cash": [
    { "id": "abc123", "label": "HBL Savings", "amountPKR": 45000, "createdAt": "2026-03-01" }
  ],
  "physical": [
    { "id": "def456", "name": "Laptop", "purchasePKR": 120000, "currentPKR": 95000, "createdAt": "2025-12-01" }
  ],
  "investments": [
    { "id": "ghi789", "name": "BTC", "type": "crypto", "amountPKR": 85000, "amountUSD": 300, "purchasePKR": 70000, "createdAt": "2026-01-15" }
  ],
  "liabilities": [
    { "id": "jkl012", "label": "Loan from Uncle", "amountPKR": 20000, "createdAt": "2025-11-01" }
  ]
}
```

**Investment types:** `stock | crypto | fund | other`

### 2.2 `stores.transactions`

```json
[
  {
    "id": "tx001",
    "type": "expense",
    "amount": 500,
    "category": "Food & Chai",
    "note": "Dinner",
    "date": "2026-03-14",
    "createdAt": "2026-03-14T18:30:00.000Z"
  },
  {
    "id": "tx002",
    "type": "income",
    "amount": 15000,
    "source": "Freelance",
    "note": "Logo design",
    "date": "2026-03-10",
    "allocation": { "type": "goal", "goalId": "goal001" },
    "createdAt": "2026-03-10T09:00:00.000Z"
  },
  {
    "id": "tx003",
    "type": "adjustment",
    "amount": -5000,
    "note": "Correction",
    "date": "2026-03-12",
    "allocation": null,
    "createdAt": "2026-03-12T11:00:00.000Z"
  }
]
```

**Expense categories:** `Myself | Food & Chai | Education | Unexpected`
**Income sources:** `Pocket money | Freelance | Gift | Other`

### 2.3 `stores.goals`

```json
[
  {
    "id": "goal001",
    "title": "MacBook Fund",
    "targetPKR": 350000,
    "savedPKR": 147000,
    "deadline": "2026-12-31",
    "type": "long",
    "autoSweep": { "percent": 20, "thresholdPKR": 5000 },
    "completed": false,
    "completedAt": null,
    "createdAt": "2026-01-01"
  }
]
```

**Goal types:** `short | long`

### 2.4 `stores.settings`

```json
{
  "rates": {
    "usdPKR": 278.5,
    "lastUpdated": "2026-03-14"
  },
  "theme": "dark",
  "lastExportDate": "2026-03-10",
  "snapshots": [
    { "date": "2026-03-01", "valuePKR": 230000 },
    { "date": "2026-03-14", "valuePKR": 248500 }
  ]
}
```

**theme:** `dark | light`
**snapshots:** Last 90 days. One per day (same-day overwrites). Used for Capital Velocity and sparkline.

---

## 3. Derived Values (Never Stored)

These are computed from stored data by `utils.js`:

| Derived | Formula | Location |
|---|---|---|
| Net Worth | `sum(cash) + sum(physical.current) + sum(investments) - sum(liabilities)` | `calcNetWorth()` |
| Capital Velocity | `(latestSnapshot - 30dAgoSnapshot) / 30` | `calcVelocity()` |
| P&L % | `(current - purchase) / purchase × 100` | `render.assetsList()` |

---

## 4. Migration

When `data.version !== SCHEMA_VERSION`, `migrateData()` runs:

```javascript
function migrateData(data) {
  const empty  = buildEmptyStores();
  const stores = data.stores || {};
  return {
    assets:       { ...empty.assets,    ...(stores.assets    || {}) },
    transactions: stores.transactions   || [],
    goals:        stores.goals          || [],
    settings:     { ...empty.settings,  ...(stores.settings  || {}) },
  };
}
```
