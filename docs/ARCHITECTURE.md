# HMS Tracker — Architecture
`File 3 of 12 | v1.1 | March 2026`

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
  │   ├── zakatStore.js
  │   └── settingsStore.js
  └── pages/
      ├── dashboard.js ──── stores/*, render.js, utils.js
      ├── assets.js
      ├── expenses.js
      ├── goals.js
      └── zakat.js
```

**Rule:** Stores never import other stores. Cross-store reads (e.g. Zakat needs assets) happen in page controllers, which pass plain data objects.

---

## 3. State Architecture

All five stores share a single in-memory object via `state.js`:

```javascript
// state.js — the one source of truth
const _state = { stores: null, saveCallback: null };

export function getStores()    { return _state.stores; }
export function setStores(s)   { _state.stores = s; }
export function onSaveHook(fn) { _state.saveCallback = fn; }
export function fireSaveHook() { if (_state.saveCallback) _state.saveCallback(); }
```

Each store mutates its slice of `_state.stores` directly, then calls the debounced `persistStores()` from `data.js`. This eliminates the re-decrypt-on-every-save bug from the naive pattern.

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
  → PBKDF2(pin, storedSalt, 100000, SHA-256) → candidateKey
  → AES-GCM decrypt(candidateKey, cipherBlob) → plaintext or THROW
  → if THROW: wrong PIN, increment attempts, cooldown after 3
  → if success: setMasterKey(candidateKey), setStores(parsedData)

Lock (auto):
  visibilitychange (app backgrounded)  OR  5 min inactivity
  → clearMasterKey()  ← key gone from memory
  → show PIN screen

Auto-lock code:
  const INACTIVITY_MS = 5 * 60 * 1000;
  ['touchstart','click','keydown','scroll'].forEach(ev =>
    document.addEventListener(ev, resetInactivity, { passive: true })
  );
```

---

## 5. Router

Hash-based SPA router. No history API — compatible with GitHub Pages without a 404 redirect hack.

```javascript
// router.js
export function register(hash, handler) { routes[hash] = handler; }
export function navigate(hash) { window.location.hash = hash; }

// On hashchange:
// 1. Hide all .page elements
// 2. Toggle .active on matching .nav-item[data-route]
// 3. Show #page-{hash}
// 4. Call routes[hash]()
```

Page controllers use an `_initialized` flag so listeners are attached exactly once even if the user navigates back:

```javascript
let _initialized = false;
export function init() {
  if (!_initialized) {
    _initialized = true;
    // attach listeners once
  }
  refresh(); // always refresh data
}
```

---

## 6. CSS Architecture

### Import Chain (`css/main.css` — no rules, only `@import`)
```css
@import 'base/reset.css';
@import 'base/variables.css';
@import 'base/typography.css';
@import 'components/navbar.css';
@import 'components/fab.css';
@import 'components/modal.css';
@import 'components/cards.css';
@import 'components/buttons.css';
@import 'components/forms.css';
@import 'components/toast.css';
@import 'components/pin.css';
@import 'components/progress.css';
@import 'pages/dashboard.css';
@import 'pages/assets.css';
@import 'pages/expenses.css';
@import 'pages/goals.css';
@import 'pages/zakat.css';
```

### Design Token System
All colors, spacing, radius, and typography defined as CSS custom properties in `variables.css`. No hex values outside `variables.css`. Light mode via `[data-theme="light"]` attribute overrides.

```css
:root {
  --color-bg-primary:     #1A1A2E;
  --color-bg-secondary:   #16213E;
  --color-bg-tertiary:    #0F3460;
  --color-accent:         #C9A84C;
  --color-accent-soft:    #F5DFA0;
  --color-text-primary:   #F0EAD6;
  --color-text-secondary: #A8A8B3;
  --color-success:        #10B981;
  --color-danger:         #EF4444;
  --color-warning:        #F59E0B;
}
```

---

## 7. Render Patterns

### SVG Progress Ring
```javascript
// circumference = 2π × r = 2π × 18 ≈ 113.1
// offset = (1 - pct/100) × circumference
// ring starts from top: transform="rotate(-90 22 22)"
```

### SVG Sparkline
```javascript
function historyToPoints(history, width = 200, height = 40) {
  const vals = history.map(s => s.valuePKR);
  const min  = Math.min(...vals), max = Math.max(...vals);
  return history.map((s, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((s.valuePKR - min) / (max - min || 1)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
```

### Canvas Bar Chart (one exception)
Justified by data density. Wrapped in `requestAnimationFrame`. DPR-corrected:
```javascript
const dpr  = window.devicePixelRatio || 1;
canvas.width  = cssW * dpr;
canvas.height = cssH * dpr;
ctx.scale(dpr, dpr);
// draw at CSS pixels, canvas scales up for retina
```

---

## 8. Anti-Patterns — Never Do These

| Anti-pattern | Rule |
|---|---|
| Direct localStorage outside data.js | Always go through `persistStores()` |
| DOM manipulation outside render.js | No `querySelector` in stores or utils |
| Storing derived values | Net worth, velocity, Zakat due — always compute, never store |
| Cross-store imports in stores | Use page controller to pass plain data objects |
| Business logic in render.js | render.js receives formatted data and paints it |
| Multiple `<script>` tags | `index.html` has exactly one `<script type="module" src="js/main.js">` |
| Hardcoded colors outside variables.css | All colors as CSS custom properties |
| Synchronous crypto on main thread | Web Crypto API is async — always `await` |
| Skipping `role="status"` on dynamic content | Toasts, save indicators, hero numbers need `aria-live` |
| Attaching listeners more than once | Use `_initialized` guard in all page controllers |
