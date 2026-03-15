// js/utils.js — pure helpers. No DOM, no store calls, no side effects.

// ── Currency formatting ──
export function formatPKR(amount) {
  if (amount === null || amount === undefined) return 'Rs 0';
  const abs = Math.abs(amount);
  let str;
  if (abs >= 10_000_000) {
    str = (abs / 10_000_000).toFixed(2) + 'Cr';
  } else if (abs >= 100_000) {
    str = (abs / 100_000).toFixed(2) + 'L';
  } else if (abs >= 1000) {
    str = (abs / 1000).toFixed(1) + 'K';
  } else {
    str = abs.toLocaleString('en-PK');
  }
  return (amount < 0 ? '-' : '') + 'Rs ' + str;
}

export function formatPKRFull(amount) {
  if (amount === null || amount === undefined) return 'Rs 0';
  return 'Rs ' + Math.round(amount).toLocaleString('en-PK');
}

export function parsePKR(str) {
  return parseFloat(String(str).replace(/[^0-9.-]/g, '')) || 0;
}

// ── Date helpers ──
export function today() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export function monthKey(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0');
}

export function monthLabel(key) {
  const [y, m] = key.split('-');
  return new Date(y, m-1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
}

export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date();
  const target = new Date(isoDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export function daysSince(isoDate) {
  if (!isoDate) return 0;
  const now = new Date();
  const past = new Date(isoDate);
  return Math.floor((now - past) / (1000 * 60 * 60 * 24));
}

// ── ID generation ──
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ── Net worth calculation ──
export function calcNetWorth(assets) {
  const cash     = (assets.cash || []).reduce((s, c) => s + (c.amountPKR || 0), 0);
  const physical = (assets.physical || []).reduce((s, p) => s + (p.currentPKR || 0), 0);
  const invest   = (assets.investments || []).reduce((s, i) => s + (i.amountPKR || 0), 0);
  const liab     = (assets.liabilities || []).reduce((s, l) => s + (l.amountPKR || 0), 0);
  return cash + physical + invest - liab;
}

// ── Capital Velocity (30-day delta / 30) ──
export function calcVelocity(snapshots) {
  if (!snapshots || snapshots.length < 2) return 0;
  const sorted = [...snapshots].sort((a,b) => new Date(a.date) - new Date(b.date));
  const latest = sorted[sorted.length - 1];
  const thirtyDaysAgo = new Date(latest.date);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  // Find snapshot closest to 30 days ago (must not be the same date as latest)
  const candidates = sorted.filter(s => s.date !== latest.date);
  if (!candidates.length) return 0;
  const old = candidates.reduce((best, s) => {
    const d = new Date(s.date);
    const diff = Math.abs(d - thirtyDaysAgo);
    return diff < Math.abs(new Date(best.date) - thirtyDaysAgo) ? s : best;
  }, candidates[0]);
  return (latest.valuePKR - old.valuePKR) / 30;
}

// ── Sparkline points (for SVG polyline) ──
export function historyToPoints(history, width = 200, height = 40) {
  if (!history || history.length < 2) return '';
  const vals = history.map(s => s.valuePKR);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return history.map((s, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((s.valuePKR - min) / (max - min || 1)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// ── Zakat calculation ──
export function calcZakatEligible(assets) {
  const cash   = (assets.cash || []).reduce((s,c) => s + (c.amountPKR || 0), 0);
  const invest = (assets.investments || []).reduce((s,i) => s + (i.amountPKR || 0), 0);
  const liab   = (assets.liabilities || []).reduce((s,l) => s + (l.amountPKR || 0), 0);
  // Physical assets excluded (not zakatable by default)
  return Math.max(0, cash + invest - liab);
}

export function calcZakatDue(eligible) {
  return eligible * 0.025; // 2.5%
}

export function calcNisab(rates, standard = 'gold') {
  // Gold: 85g — rates.gold10gPKR is per 10g
  if (standard === 'gold') return (rates.gold10gPKR / 10) * 85;
  // Silver: 595g — rates.silver1gPKR is per 1g
  return rates.silver1gPKR * 595;
}

export function calcPurificationProjection(zakatDue, velocity) {
  if (!velocity || velocity <= 0 || !zakatDue) return null;
  // Days until current net worth grows by zakatDue
  return Math.ceil(zakatDue / velocity);
}

// ── Hijri year helpers (approximate) ──
export function currentHijriYear() {
  const now = new Date();
  // Julian day number
  const jd = Math.floor((now.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631*n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719)
          + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const year = 30*n + Math.floor((8*j + 1) / 60) - 30;
  return year;
}

// ── Progress bar color ──
export function progressColor(pct) {
  if (pct >= 70) return 'high';
  if (pct >= 30) return 'mid';
  return 'low';
}

// ── SVG Progress ring stroke offset ──
export function ringOffset(pct, r = 18) {
  const circumference = 2 * Math.PI * r;
  return ((1 - Math.min(pct/100, 1)) * circumference).toFixed(1);
}
export function ringCircumference(r = 18) {
  return (2 * Math.PI * r).toFixed(1);
}

// ── Monthly totals ──
export function calcMonthlyTotals(transactions, month) {
  const filtered = transactions.filter(t => t.date && t.date.startsWith(month));
  const income   = filtered.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expenses = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  return { income, expenses, net: income - expenses };
}

export function calcCategoryTotals(transactions, month) {
  const filtered = transactions.filter(t => t.type === 'expense' && t.date && t.date.startsWith(month));
  const totals = {};
  for (const t of filtered) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  return totals;
}

// ── Auto-sweep ──
export function shouldAutoSweep(amount, thresholdPKR) {
  return amount > thresholdPKR;
}

export function calcAutoSweepAmount(amount, percent) {
  return Math.floor(amount * (percent / 100));
}

// ── iOS detection ──
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// ── Debounce ──
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Rates stale check (>7 days) ──
export function isRatesStale(lastUpdated, days = 7) {
  if (!lastUpdated) return true;
  return daysSince(lastUpdated) >= days;
}
