# HMS Tracker — Architecture Decision Records
`File 11 of 12 | v1.0 | March 2026`

---

## ADR-001: Vanilla JS over React/Vue

**Status:** Accepted

**Context:** Needed to choose a frontend framework for a single-user offline PWA.

**Decision:** Vanilla JavaScript ES Modules. No framework, no build step.

**Rationale:**
- Zero runtime bundle — the app loads instantly on 3G
- No dependency vulnerabilities, no npm audit alerts, no breaking upgrades
- ES Modules are natively supported in all modern browsers
- Full control over the DOM — no virtual DOM overhead for a data-heavy app
- Consistent with the HMS Portfolio pattern I already know

**Consequences:** More boilerplate for DOM updates, but render.js centralises this cleanly.

---

## ADR-002: AES-GCM over simpler encryption

**Status:** Accepted

**Context:** Personal finance data needs strong encryption at rest.

**Decision:** Web Crypto API — PBKDF2-SHA256 (100k iterations) + AES-GCM 256-bit.

**Rationale:**
- AES-GCM provides authenticated encryption — detects tampering
- Built into every modern browser, no library needed
- 100k PBKDF2 iterations makes brute-force of the PIN computationally expensive
- Industry standard — same scheme used by 1Password, Bitwarden

**Consequences:** Async-only API. All crypto calls must be awaited. Forgotten PIN = unrecoverable data (by design).

---

## ADR-003: localStorage + IndexedDB dual storage

**Status:** Accepted

**Context:** iOS Safari aggressively evicts localStorage after 7 days of inactivity.

**Decision:** localStorage as primary, IndexedDB as shadow copy. Every save writes to both.

**Rationale:**
- localStorage is synchronous-ish and well-supported
- IndexedDB is preserved longer on iOS and survives eviction cycles
- Silent fallback: if localStorage blob is missing on load, try IDB

**Consequences:** Every save has a second async IDB write. Low overhead — the blob is small (<100KB even with years of data). Failures are silent (catch(() => {})) to avoid blocking the save flow.

---

## ADR-004: Shared state.js over per-store localStorage reads

**Status:** Accepted

**Context:** Original design had each store calling loadStores() (decrypt) before every save. This caused a full AES-GCM decrypt on every debounced save, even for small changes.

**Decision:** Single shared in-memory object in state.js. All stores mutate their slice directly. persistStores() encrypts the whole object once.

**Rationale:**
- Eliminates N decryptions per session — only one on unlock
- Simpler store code — stores just mutate and call save()
- Single source of truth makes debugging easier

**Consequences:** All stores must import from state.js. The entire stores object is encrypted on every save (not just the changed slice) — acceptable since the blob is small.

---

## ADR-005: Canvas for bar chart (one exception)

**Status:** Accepted

**Context:** The spending breakdown chart needs to render category bars with labels. SVG is used everywhere else.

**Decision:** Canvas 2D for the monthly spending bar chart in expenses.js.

**Rationale:**
- Canvas is more performant for dense bar charts with many redraws
- Wrapped in requestAnimationFrame — never blocks main thread
- DPR-corrected for retina displays
- Cached for last 6 months to avoid redraw on navigation

**Consequences:** One non-SVG render path. Documented as a justified exception in architecture docs.

---

## ADR-006: Gold nisab as default (not silver)

**Status:** Accepted

**Context:** Two nisab standards exist in Islamic jurisprudence — gold (85g) and silver (595g). Silver is lower and would make more users zakatable.

**Decision:** Gold nisab as the default, silver available as a toggle.

**Rationale:**
- Contemporary majority scholarly opinion (jumhur) favours gold standard
- Yusuf al-Qaradawi and most modern fatawa bodies recommend gold
- Silver standard may be too low given current silver/gold price divergence
- User can toggle to silver if their madhab/scholar prefers it

**Consequences:** Some users following Hanafi silver standard must manually switch. Toggle is one tap.

---

## ADR-007: Hash routing over History API

**Status:** Accepted

**Context:** GitHub Pages serves static files. The History API requires server-side redirect rules (e.g. all 404s → index.html).

**Decision:** Hash-based routing (`/#dashboard`, `/#goals`, etc.)

**Rationale:**
- Zero server config required
- Works on GitHub Pages out of the box
- Deep links work (share `https://user.github.io/hms-tracker/#zakat`)

**Consequences:** URLs contain `#`. Not as clean as `/goals`, but acceptable for a personal app.

---

## ADR-008: Single index.html (no bundling)

**Status:** Accepted

**Context:** Some PWA boilerplates use Vite/Webpack to bundle and tree-shake.

**Decision:** No bundler. Single index.html loads all CSS via `<link>` and JS via `<script type="module">`.

**Rationale:**
- No build step = no CI/CD needed, no node_modules in the repo
- Instant deploy: `git push` → GitHub Pages is live in 60 seconds
- Native ES module imports are fast enough for a single-user app
- Full source transparency — anyone can read the code directly

**Consequences:** No tree-shaking, no minification. Acceptable — total JS is ~50KB unminified, well within performance budget.

---

## ADR-009: 4-digit PIN (not password)

**Status:** Accepted

**Context:** The app needs frictionless unlock on mobile while still protecting sensitive data.

**Decision:** 4-digit numeric PIN with 3-attempt cooldown.

**Rationale:**
- One-handed unlock on mobile
- Custom keypad prevents keyboard autocomplete/autofill leaking the PIN
- 100k PBKDF2 iterations compensates for the small keyspace
- 30-second cooldown after 3 failures makes automated attacks impractical on-device

**Consequences:** 10,000 possible PINs. Not suitable for protecting against a determined adversary with physical device access and offline attack capabilities. Acceptable for a personal app where the attacker would need to extract and crack an AES-256 blob.

---

## ADR-010: Debounced saves (600ms) over immediate saves

**Status:** Accepted

**Context:** AES-GCM encryption is async but adds ~10-50ms overhead. Saving on every keystroke would be perceptibly slow.

**Decision:** 600ms debounced save after the last mutation in a batch.

**Rationale:**
- 600ms is imperceptible lag for a user who just tapped "Save"
- Multiple rapid mutations (e.g. allocating to multiple goals) collapse into one save
- The save indicator ("Saved just now") provides reassurance

**Consequences:** A crash within the 600ms window loses the last mutation. Acceptable risk — users aren't typing continuously.
