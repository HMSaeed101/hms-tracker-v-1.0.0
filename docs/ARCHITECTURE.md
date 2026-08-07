# HMS Tracker — Architecture
`File 3 of 12 | v1.2 | March 2026`

---

## 1. Overview

HMS Tracker is a 6-layer MVC application built entirely in vanilla JavaScript ES Modules. No framework, no build step, no runtime dependencies.

```
┌─────────────────────────────────────────────────────┐
│  Layer 1 — index.html   (single entry point)        │
├─────────────────────────────────────────────────────┤
│  Layer 2 — main.js      (init, router, PIN, events) │
├─────────────────────────────────────────────────────┤
│  Layer 3 — pages/*.js   (MVC controllers)           │
├─────────────────────────────────────────────────────┤
│  Layer 4 — render.js    (DOM — no logic)            │
├─────────────────────────────────────────────────────┤
│  Layer 5 — stores/*.js  (MVC model, in-memory)      │
├─────────────────────────────────────────────────────┤
│  Layer 6 — data.js      (encrypt/decrypt/persist)   │
└─────────────────────────────────────────────────────┘
```

**utils.js** sits outside the stack — pure functions, no DOM, no store access.
**state.js** holds the single shared in-memory store object.

---

## 2. Module Map

```
main.js
  ├── data.js ──────────── state.js
  ├── state.js
  ├── render.js ─────────── utils.js
  ├── router.js
  ├── stores/
  │   ├── assetsStore.js ── data.js, state.js, utils.js
  │   ├── transactionsStore.js
  │   ├── goalsStore.js
  │   └── settingsStore.js
  └── pages/
      ├── dashboard.js ──── stores/*, render.js, utils.js
      ├── portfolio.js
      └── expenses.js
```

**Rule:** Stores never import other stores. Page controllers pass plain data objects to `render.js`.

---

## 3. State Architecture

All four stores share a single in-memory object via `state.js`:

```javascript
// state.js — the one source of truth
const _state = { stores: null, saveCallback: null };

export function getStores()    { return _state.stores; }
export function setStores(s)   { _state.stores = s; }
export function onSaveHook(fn) { _state.saveCallback = fn; }
export function fireSaveHook() { if (_state.saveCallback) _state.saveCallback(); }
```

Each store mutates its slice of `_state.stores` directly, then calls the debounced `persistStores()` from `data.js`.

**Data flow on save:**
```
store.addCash()
  → mutates getStores().assets.cash
  → debouncedSave() after 600ms
  → persistStores()
      → aesEncrypt(masterKey, JSON.stringify(getStores()))
      → localStorage.setItem(STORAGE_KEY, blob)
      → idbPut(blob)  ← IndexedDB shadow
  → fireSaveHook()
      → render.saveStatus()
```

---

## 4. Security Flow

```
First Run:
  user sets 4-digit PIN
  → PBKDF2(pin, randomSalt, 100000 iterations, SHA-256) → 256-bit masterKey
  → AES-GCM encrypt(masterKey, JSON.stringify(emptyStores)) → cipherBlob
  → localStorage.setItem('hms_enc', cipherBlob)
  → localStorage.setItem('hms_salt', saltHex)
  → masterKey stored in memory only

Unlock:
  user enters PIN
  → PBKDF2(pin, saltHex) → masterKey
  → AES-GCM decrypt(masterKey, cipherBlob) → JSON
  → setStores(parsedData)
```
