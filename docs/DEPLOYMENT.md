# HMS Tracker — Deployment
`File 10 of 12 | v1.0 | March 2026`

---

## GitHub Pages Deploy

```bash
# 1. Create repo on GitHub (private recommended)
# 2. Push code
git init
git add .
git commit -m "feat: HMS Tracker v1.0.0"
git remote add origin https://github.com/[username]/hms-tracker.git
git push -u origin main

# 3. Enable Pages
# GitHub repo → Settings → Pages → Source: Deploy from branch → main / (root) → Save

# 4. Live at:
# https://[username].github.io/hms-tracker
```

---

## Android Install

1. Open Chrome and navigate to the site
2. Wait 30 seconds on the page
3. Chrome shows "Add to Home Screen" banner — tap it
4. OR: tap ⋮ menu → "Add to Home screen"
5. App opens in standalone mode — no browser UI, full screen
6. Icon appears on home screen

---

## iOS Install

1. Open **Safari** (not Chrome — iOS only allows PWA install from Safari)
2. Navigate to the site
3. Tap the Share button (rectangle with arrow)
4. Tap "Add to Home Screen"
5. App opens in standalone mode

> **iOS note:** iOS WebKit may evict localStorage after ~7 days of inactivity. The app automatically uses a 5-day backup reminder on iOS (vs 7 days on Android) and maintains an IndexedDB shadow copy for recovery.

---

## Local Development

```bash
# Service workers require HTTP (not file://)
npx serve .
# OR
python -m http.server 8080

# Open: http://localhost:3000
# Tests: http://localhost:3000/tests/runner.html
```

---

## Update Process

```bash
# 1. Make changes
# 2. Bump CACHE_NAME in sw.js → 'hms-tracker-v1.0.1'
# 3. Push to GitHub
git add . && git commit -m "fix: ..." && git push

# Users get update automatically when they next open the app
# Service worker activates new version on next load after tab close
```

**Checklist before every deploy:**
- [ ] Bump `CACHE_NAME` version in `sw.js`
- [ ] Update `CHANGELOG.md`
- [ ] Run tests: open `tests/runner.html`, verify 0 failures
- [ ] Test PIN flow on mobile (real device, not just DevTools)
- [ ] Verify `_headers` CSP is active (check Network tab → Response Headers)
