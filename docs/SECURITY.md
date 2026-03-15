# HMS Tracker — Security
`File 6 of 12 | v1.0 | March 2026`

---

## 1. Threat Model

| Threat | Mitigation |
|---|---|
| Device stolen, unlocked | AES-GCM blob is unreadable without PIN. localStorage stores only ciphertext. |
| Shoulder surfing PIN | 4-digit keypad, dots not digits. Auto-lock on background. |
| Brute-force PIN | 3 attempts → 30s cooldown. 10,000 combinations × 100k PBKDF2 = ~1 year per device. |
| iOS WebKit localStorage eviction | IndexedDB shadow copy. Restore from IDB on missing localStorage blob. |
| Data loss (accidental) | PIN-gated JSON export. Zakat Year Reset archives before clearing. |
| XSS injection | CSP header via `_headers`. No `innerHTML` with user data unescaped. |
| Forgotten PIN | Data unrecoverable by design. Export prompt nudges regular backups. |

---

## 2. Cryptographic Implementation

### Key Derivation (PBKDF2)
```javascript
const keyMaterial = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(pin),
  { name: 'PBKDF2' },
  false,
  ['deriveKey']
);
const masterKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,         // not extractable
  ['encrypt', 'decrypt']
);
```

**Parameters:**
- Salt: 16 bytes, `crypto.getRandomValues()`, stored as hex in `localStorage('hms_salt')`
- Iterations: 100,000 (NIST recommended minimum as of 2023)
- Hash: SHA-256
- Key length: 256 bits
- Key is **not extractable** — cannot be read back from the SubtleCrypto object

### Encryption (AES-GCM)
```javascript
async function aesEncrypt(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return buf2hex(iv) + ':' + buf2b64(ct);
}
```

- IV: 12 bytes (96 bits), random per save via `crypto.getRandomValues()`
- Stored format: `ivHex:ciphertextBase64`
- AES-GCM provides both confidentiality and integrity (128-bit authentication tag)

### Why AES-GCM is the right choice
- Built into every modern browser via WebCrypto API
- No external library needed
- Authenticated encryption: tampering with the ciphertext causes decryption failure
- 256-bit key with 96-bit random IV: computationally infeasible to brute-force

---

## 3. PIN Flow

### Setup (First Run)
```
User enters PIN (4 digits)
  → User confirms PIN
  → PINs match? Generate salt, derive key, encrypt empty stores, store salt
  → PINs mismatch? Show error, restart
```

### Unlock
```
User enters PIN
  → Derive candidate key with stored salt
  → Attempt AES-GCM decrypt
  → Success? setMasterKey(), setStores(), show app
  → Failure? Increment attempts
      3 failures → 30s cooldown (setInterval countdown)
      After cooldown → reset attempts, allow retry
```

### Auto-Lock Triggers
1. `document.addEventListener('visibilitychange')` — fires when app is backgrounded on mobile
2. 5-minute inactivity timer — reset on any `touchstart`, `click`, `keydown`, `scroll`

On lock:
```javascript
clearMasterKey(); // key gone from memory
showPinScreen('unlock');
```

### Change PIN
1. Verify old PIN (attempt decrypt with old key)
2. Generate new random salt
3. Derive new key from new PIN + new salt
4. Re-encrypt in-memory stores with new key
5. Store new salt, overwrite localStorage blob

---

## 4. Data Storage

### What is stored in localStorage

| Key | Value |
|---|---|
| `hms_enc` | AES-GCM encrypted JSON blob (entire app state) |
| `hms_salt` | PBKDF2 salt as hex string (not secret — needed to rederive key) |
| `hms_theme` | `'dark'` or `'light'` (not sensitive) |
| `zakat_archive_*` | Archived Zakat year JSON (encrypted separately) |

**Never stored:** The PIN, the derived master key, or any plaintext sensitive data.

### IndexedDB Shadow
A copy of the encrypted blob is written to IndexedDB after every save:

```javascript
idbPut(blob).catch(() => {}); // silent failure — localStorage is primary
```

On load, if `localStorage` blob is missing (iOS eviction), the app falls back to the IDB copy. The user sees no interruption.

---

## 5. Export Security

Full JSON export is PIN-gated:
1. User clicks Export
2. `prompt()` asks for PIN
3. `unlockWithPin(pin)` re-verifies (does not rely on app already being unlocked)
4. Only on success: `exportJson()` returns decrypted JSON
5. Downloaded as a dated file: `HMS_Tracker_Backup_YYYY-MM-DD.json`

The export is **plaintext JSON** — the user is responsible for storing it securely.

---

## 6. Known Limitations

| Limitation | Notes |
|---|---|
| 4-digit PIN | 10,000 combinations. Acceptable for a personal offline app. v1.2 plans 6-digit option. |
| Single IV per save | Currently the same IV pattern per encrypt call. v1.2 will enforce new IV per save explicitly. |
| `prompt()` for PIN re-entry | Uses browser native `prompt()` for export/import. Not styleable but secure. |
| No biometric | Biometric (Face ID / fingerprint) not implemented in v1.0. Possible via WebAuthn in v2.0. |
| No encrypted export | Export is plaintext JSON. Future: encrypt export with a passphrase. |
| CSP on GitHub Pages | `_headers` file only works on Netlify and GitHub Pages. Verify CSP is applied after deploy. |
