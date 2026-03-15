// js/pages/dashboard.js
import { assetsStore } from '../stores/assetsStore.js';
import { transactionsStore } from '../stores/transactionsStore.js';
import { goalsStore } from '../stores/goalsStore.js';
import { zakatStore } from '../stores/zakatStore.js';
import { settingsStore } from '../stores/settingsStore.js';
import render from '../render.js';
import { calcNetWorth, calcVelocity, monthKey } from '../utils.js';

let _prompts = [];
let _initialized = false;

export async function init() {
  if (!_initialized) {
    _initialized = true;
    // Load prompts
    try {
      const resp = await fetch('./prompts.json');
      const data = await resp.json();
      _prompts = data.prompts || [];
    } catch { _prompts = []; }
  }
  refresh();
}

export function refresh() {
  const assets      = assetsStore.getAll();
  const snapshots   = settingsStore.getSnapshots();
  const rates       = settingsStore.getRates();
  const netWorth    = calcNetWorth(assets);
  const velocity    = calcVelocity(snapshots);
  const currentMon  = monthKey();
  const monthTotals = transactionsStore.getMonthlyTotals(currentMon);
  const goals       = goalsStore.getAll();
  const zakatStatus = zakatStore.getStatus(assets, rates);
  const zakatSummary = zakatStore.getAnnualSummary();
  const zakatDue    = zakatStatus.amountDue;
  const projection  = zakatStore.getProjection(velocity, zakatDue);

  // Auto-snapshot on dashboard load
  const snap = assetsStore.snapshotNetWorth();
  settingsStore.addSnapshot(snap);

  // Auto-start hawl when nisab crossed
  if (zakatStatus.nisabReached && !zakatStatus.hawlStartDate) {
    zakatStore.startHawl();
  }

  // Daily prompt (rotate by day of year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const prompt = _prompts.length ? _prompts[dayOfYear % _prompts.length] : '';

  render.dashboard({
    netWorth,
    velocity,
    snapshots,
    monthTotals,
    goals,
    zakatStatus,
    zakatSummary,
    projection,
    prompt
  });
}
