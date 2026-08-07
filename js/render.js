// js/render.js — all DOM updates. No business logic, no store calls.
import { formatPKR, formatPKRFull, formatDate, formatDateShort,
        historyToPoints, progressColor, ringOffset, ringCircumference,
        daysUntil } from './utils.js';

// ─────────────────────────────────────────
// Category colors — read from CSS variables (single source of truth)
// ─────────────────────────────────────────
function getCatColors() {
  const s = getComputedStyle(document.documentElement);
  const get = v => s.getPropertyValue(v).trim() || null;
  return {
    'Myself':     get('--cat-myself')     || '#7C3AED',
    'Food & Chai':get('--cat-food')       || '#F59E0B',
    'Education':  get('--cat-education')  || '#3B82F6',
    'Unexpected': get('--cat-unexpected') || '#EF4444',
  };
}

const render = {};

// ─────────────────────────────────────────
// Save status
// ─────────────────────────────────────────
render.saveStatus = function(lastSaved) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.classList.add('visible');
  const diff = Date.now() - new Date(lastSaved).getTime();
  el.textContent = diff < 5000 ? 'Saved just now'
    : diff < 60000 ? `Saved ${Math.round(diff/1000)}s ago`
    : 'Saved';
};

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────
const TOAST_ICONS = {
  success: `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-success)"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`,
  error:   `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-danger)"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  warning: `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-warning)"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  info:    `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor" style="color:var(--color-accent)"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
};

render.toast = function(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = (TOAST_ICONS[type] || '') + `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('dismissing');
    setTimeout(() => toast.remove(), 220);
  }, duration);
};

// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────
render.dashboard = function({ netWorth, velocity, snapshots, monthTotals, goals, prompt }) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  // Net worth
  const nwEl = document.getElementById('net-worth-value');
  if (nwEl) {
    nwEl.textContent = formatPKRFull(netWorth);
    nwEl.setAttribute('aria-label', `Your Capital Today: ${formatPKRFull(netWorth)}`);
  }

  // Velocity
  const velEl = document.getElementById('velocity-badge');
  if (velEl) {
    const pos = velocity >= 0;
    velEl.className = `capital-hero__velocity-badge ${pos ? 'velocity-up' : 'velocity-down'}`;
    velEl.textContent = (pos ? '▲ +' : '▼ ') + formatPKR(Math.abs(velocity)) + '/day';
  }

  // Sparkline
  const sparkEl = document.getElementById('sparkline');
  if (sparkEl && snapshots.length >= 2) {
    const pointsStr  = historyToPoints(snapshots.slice(-30));
    const pointArray = pointsStr.split(' ').filter(Boolean);
    const lastPoint  = pointArray.length ? pointArray[pointArray.length - 1].split(',') : [200, 20];
    const color      = velocity >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    sparkEl.innerHTML = `<svg viewBox="0 0 200 40" role="img" aria-label="30-day capital trend" class="sparkline">
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <polygon points="0,40 ${pointsStr} 200,40" fill="url(#sparkGradient)" />
      <polyline points="${pointsStr}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${lastPoint[0]}" cy="${lastPoint[1]}" r="3" fill="${color}" />
    </svg>`;
  }

  // Month totals
  set('month-income',   formatPKR(monthTotals.income));
  set('month-expenses', formatPKR(monthTotals.expenses));

  // Goal rings
  render.goalRings(goals.filter(g => !g.completed).slice(0, 6));

  // Reflection
  if (prompt) set('reflection-text', prompt);
};

// ─────────────────────────────────────────
// Goal rings (SVG)
// ─────────────────────────────────────────
render.goalRings = function(goals) {
  const container = document.getElementById('goal-rings');
  if (!container) return;
  if (!goals.length) {
    container.innerHTML = '<span class="caption text-muted" style="padding:8px 0">No active goals — tap Goals to add one</span>';
    return;
  }
  const circ = ringCircumference(18);
  container.innerHTML = goals.map(g => {
    const pct    = g.targetPKR > 0 ? Math.round((g.savedPKR / g.targetPKR) * 100) : 0;
    const offset = ringOffset(pct, 18);
    const color  = pct >= 70 ? 'var(--color-success)' : pct >= 30 ? 'var(--color-warning)' : 'var(--color-danger)';
    return `<div class="progress-ring-wrap">
      <svg role="img" aria-label="${g.title} — ${pct}% complete" viewBox="0 0 44 44" class="progress-ring">
        <circle cx="22" cy="22" r="18" stroke="var(--color-bg-tertiary)" stroke-width="4" fill="none"/>
        <circle cx="22" cy="22" r="18" stroke="${color}" stroke-width="4" fill="none"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
          transform="rotate(-90 22 22)" stroke-linecap="round"/>
        <text x="22" y="26" text-anchor="middle" font-size="9" font-weight="700"
          fill="${color}" font-family="var(--font-mono)">${pct}%</text>
      </svg>
      <span class="progress-ring__label">${g.title}</span>
    </div>`;
  }).join('');
};

// ─────────────────────────────────────────
// Assets list
// ─────────────────────────────────────────
const TRASH_ICON = `<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v5a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v5a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;

function deleteBtn(type, id) {
  return `<button class="item-action-btn" data-action="delete" data-type="${type}" data-id="${id}" aria-label="Delete">${TRASH_ICON}</button>`;
}

render.assetsList = function(assets, section) {
  const container = document.getElementById(`assets-${section}-list`);
  if (!container) return;
  const items = assets[section] || [];
  if (!items.length) {
    container.innerHTML = render._emptyState('No items yet', 'Tap the button below to add your first entry');
    return;
  }

  const renderers = {
    cash: item => `
      <div class="list-item">
        <div class="list-item__left">
          <div class="list-item__icon">💵</div>
          <div class="list-item__text">
            <div class="list-item__label">${item.label}</div>
            <div class="list-item__meta">${formatDate(item.createdAt)}</div>
          </div>
        </div>
        <div class="list-item__right">
          <span class="list-item__amount list-item__amount--accent">${formatPKRFull(item.amountPKR)}</span>
          ${deleteBtn('cash', item.id)}
        </div>
      </div>`,

    physical: item => {
      const pl    = item.currentPKR - item.purchasePKR;
      const plPct = item.purchasePKR ? ((pl / item.purchasePKR) * 100).toFixed(1) : 0;
      return `<div class="list-item">
        <div class="list-item__left">
          <div class="list-item__icon">📦</div>
          <div class="list-item__text">
            <div class="list-item__label">${item.name}</div>
            <div class="list-item__meta">Bought ${formatPKRFull(item.purchasePKR)}</div>
          </div>
        </div>
        <div class="list-item__right">
          <div style="text-align:right">
            <div class="list-item__amount list-item__amount--accent">${formatPKRFull(item.currentPKR)}</div>
            <span class="pl-indicator ${pl >= 0 ? 'pl-indicator--pos' : 'pl-indicator--neg'}">${pl >= 0 ? '+' : ''}${plPct}%</span>
          </div>
          ${deleteBtn('physical', item.id)}
        </div>
      </div>`;
    },

    investments: item => {
      const pl    = item.amountPKR - item.purchasePKR;
      const plPct = item.purchasePKR ? ((pl / item.purchasePKR) * 100).toFixed(1) : 0;
      return `<div class="list-item">
        <div class="list-item__left">
          <div class="list-item__icon">${item.type === 'crypto' ? '₿' : '📈'}</div>
          <div class="list-item__text">
            <div class="list-item__label">${item.name}</div>
            <div class="list-item__meta">${item.type}${item.amountUSD ? ' · $' + item.amountUSD : ''}</div>
          </div>
        </div>
        <div class="list-item__right">
          <div style="text-align:right">
            <div class="list-item__amount list-item__amount--accent">${formatPKRFull(item.amountPKR)}</div>
            <span class="pl-indicator ${pl >= 0 ? 'pl-indicator--pos' : 'pl-indicator--neg'}">${pl >= 0 ? '+' : ''}${plPct}%</span>
          </div>
          ${deleteBtn('investments', item.id)}
        </div>
      </div>`;
    },

    liabilities: item => `
      <div class="list-item">
        <div class="list-item__left">
          <div class="list-item__icon" style="color:var(--color-danger)">⚠️</div>
          <div class="list-item__text">
            <div class="list-item__label">${item.label}</div>
            <div class="list-item__meta">${formatDate(item.createdAt)}</div>
          </div>
        </div>
        <div class="list-item__right">
          <span class="list-item__amount list-item__amount--negative">${formatPKRFull(item.amountPKR)}</span>
          ${deleteBtn('liabilities', item.id)}
        </div>
      </div>`,
  };

  const renderer = renderers[section];
  container.innerHTML = renderer ? items.map(renderer).join('') : '';
};

// ─────────────────────────────────────────
// Rates
// ─────────────────────────────────────────
render.rates = function(rates) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('rate-usd',    `Rs ${(rates.usdPKR||0).toLocaleString()}`);
  set('rate-gold',   `Rs ${(rates.gold10gPKR||0).toLocaleString()}`);
  set('rate-silver', `Rs ${(rates.silver1gPKR||0).toLocaleString()}`);
  const stale   = !rates.lastUpdated || ((Date.now() - new Date(rates.lastUpdated)) / 86400000) >= 7;
  const staleEl = document.getElementById('rates-stale-warning');
  if (staleEl) staleEl.style.display = stale ? 'block' : 'none';
};

// ─────────────────────────────────────────
// Transactions list
// ─────────────────────────────────────────
render.transactionsList = function(transactions, filter) {
  const container = document.getElementById('transactions-list');
  if (!container) return;
  let list = transactions;
  if (filter) list = transactions.filter(t => t.category === filter || t.source === filter || t.type === filter);
  if (!list.length) {
    container.innerHTML = render._emptyState('No transactions', 'Log an expense or income using the + button');
    return;
  }
  const CAT_COLORS = getCatColors();
  container.innerHTML = list.map(t => {
    const isExp = t.type === 'expense';
    const dot   = CAT_COLORS[t.category] || 'var(--color-text-secondary)';
    return `<div class="list-item">
      <div class="list-item__left">
        <div class="list-item__icon" style="${isExp ? `background:${dot}22;color:${dot}` : 'color:var(--color-success);background:rgba(16,185,129,0.1)'}">
          ${isExp ? '↓' : '↑'}
        </div>
        <div class="list-item__text">
          <div class="list-item__label">${t.category || t.source || t.type}</div>
          <div class="list-item__meta">${t.note ? t.note + ' · ' : ''}${formatDateShort(t.date)}</div>
        </div>
      </div>
      <div class="list-item__right">
        <span class="list-item__amount ${isExp ? 'list-item__amount--negative' : 'list-item__amount--positive'}">
          ${isExp ? '−' : '+'}${formatPKRFull(t.amount)}
        </span>
        <button class="item-action-btn" data-action="delete-tx" data-id="${t.id}" aria-label="Delete">${TRASH_ICON}</button>
      </div>
    </div>`;
  }).join('');
};

// ─────────────────────────────────────────
// Canvas bar chart — fixed DPR scaling
// ─────────────────────────────────────────
render.expenseChart = function(canvas, categoryTotals) {
  if (!canvas) return;
  const entries = Object.entries(categoryTotals || {}).filter(([,v]) => v > 0);

  requestAnimationFrame(() => {
    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth  || canvas.offsetWidth  || 300;
    const cssH = 140;
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    if (!entries.length) {
      ctx.fillStyle = 'var(--color-text-secondary, #A8A8B3)';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('No expenses this month', cssW / 2, cssH / 2);
      return;
    }

    const max    = Math.max(...entries.map(([,v]) => v));
    const barW   = (cssW / entries.length) - 12;
    const COLORS = getCatColors();
    const OTHER  = getComputedStyle(document.documentElement).getPropertyValue('--cat-other').trim() || '#6B7280';
    const LABEL  = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() || '#A8A8B3';

    entries.forEach(([cat, val], i) => {
      const barH = ((val / max) * (cssH - 30)) || 2;
      const x    = i * (barW + 12) + 6;
      const y    = cssH - barH - 20;
      ctx.fillStyle = COLORS[cat] || OTHER;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, 4);
      else ctx.rect(x, y, barW, barH);
      ctx.fill();
      ctx.fillStyle = LABEL;
      ctx.font = `600 10px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(cat.split(' ')[0], x + barW / 2, cssH - 4);
    });
  });
};

// ─────────────────────────────────────────
// Goals list
// ─────────────────────────────────────────
render.goalsList = function(goals) {
  const container = document.getElementById('goals-list');
  if (!container) return;
  if (!goals.length) {
    container.innerHTML = render._emptyState('No goals yet', 'Tap "+ New Goal" to set your first financial target');
    return;
  }
  const active    = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  const renderGoal = g => {
    const pct       = g.targetPKR > 0 ? Math.min(100, Math.round((g.savedPKR / g.targetPKR) * 100)) : 0;
    const colorCls  = `progress-bar--${progressColor(pct)}`;
    const daysLeft  = g.deadline ? daysUntil(g.deadline) : null;
    const dayCls    = daysLeft === null ? '' : daysLeft < 0 ? 'goal-card__days--urgent' : daysLeft < 30 ? 'goal-card__days--urgent' : 'goal-card__days--good';
    const dayStr    = daysLeft === null ? '' : daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`;

    let paceStr = '';
    if (!g.completed && daysLeft !== null && daysLeft > 0 && g.savedPKR < g.targetPKR) {
      const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
      const remPKR = g.targetPKR - g.savedPKR;
      const monthlyRate = Math.ceil(remPKR / monthsLeft);
      paceStr = `<span class="goal-card__pace-badge">Pace: ${formatPKR(monthlyRate)}/mo</span>`;
    }

    return `<div class="goal-card${g.completed ? ' goal-card--completed' : ''}">
      <div class="goal-card__header">
        <div>
          <div class="goal-card__title">${g.title}</div>
          ${g.autoSweep ? `<div class="autosweep-badge">⚡ Auto-Sweep ${g.autoSweep.percent}%</div>` : ''}
        </div>
        <span class="goal-card__type-badge goal-card__type-badge--${g.type}">${g.type === 'short' ? 'Short-term' : 'Long-term'}</span>
      </div>
      <div class="goal-card__amounts">
        <span class="goal-card__saved">${formatPKRFull(g.savedPKR)}</span>
        <span class="goal-card__target">of ${formatPKRFull(g.targetPKR)}</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar ${colorCls}" style="width:${pct}%"></div></div>
      <div class="goal-card__progress-text">
        <span class="goal-card__pct">${pct}%</span>
        ${paceStr}
        ${dayStr ? `<span class="${dayCls}">${dayStr}</span>` : ''}
      </div>
      ${!g.completed ? `<div class="goal-card__actions">
        <button class="btn btn--secondary btn--sm" data-action="allocate-goal" data-id="${g.id}">+ Add</button>
        <button class="btn btn--ghost btn--sm"     data-action="edit-goal"     data-id="${g.id}">Edit</button>
        <button class="btn btn--danger btn--sm"    data-action="delete-goal"   data-id="${g.id}">Delete</button>
      </div>` : ''}
    </div>`;
  };

  let html = active.map(renderGoal).join('');
  if (completed.length) {
    html += `<div class="section-title" style="margin-top:var(--space-lg)">Completed (${completed.length})</div>
      <div class="completed-goals">${completed.map(renderGoal).join('')}</div>`;
  }
  container.innerHTML = html;
};

// ─────────────────────────────────────────
// PIN screen
// ─────────────────────────────────────────
render.pinDots = function(filled, error = false) {
  document.querySelectorAll('.pin-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < filled);
    dot.classList.toggle('error', error);
  });
  if (error) setTimeout(() => document.querySelectorAll('.pin-dot').forEach(d => d.classList.remove('error')), 600);
};

render.pinError = function(msg) {
  const el = document.getElementById('pin-error');
  if (el) el.textContent = msg || '';
};

render.pinCooldown = function(seconds) {
  const el = document.getElementById('pin-cooldown');
  if (el) el.textContent = seconds > 0 ? `Try again in ${seconds}s` : '';
};

// ─────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────
render._emptyState = function(title, text) {
  return `<div class="empty-state">
    <div class="empty-state__icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <div class="empty-state__title">${title}</div>
    <div class="empty-state__text">${text}</div>
  </div>`;
};

export default render;
