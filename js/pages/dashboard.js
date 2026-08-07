// js/pages/dashboard.js
import { assetsStore } from '../stores/assetsStore.js';
import { transactionsStore } from '../stores/transactionsStore.js';
import { goalsStore } from '../stores/goalsStore.js';
import { settingsStore } from '../stores/settingsStore.js';
import render from '../render.js';
import { calcNetWorth, calcVelocity, monthKey } from '../utils.js';

let _promptsArray = null;
let _initialized = false;

export async function init() {
  if (!_initialized) {
    _initialized = true;
    // Load prompts
    try {
      const resp = await fetch('./prompts.json');
      _promptsArray = await resp.json();
    } catch { _promptsArray = null; }
  }
  refresh();
}

export function refresh() {
  const assets      = assetsStore.getAll();
  const snapshots   = settingsStore.getSnapshots();
  const netWorth    = calcNetWorth(assets);
  const velocity    = calcVelocity(snapshots);
  const currentMon  = monthKey();
  const monthTotals = transactionsStore.getMonthlyTotals(currentMon);
  const goals       = goalsStore.getAll();

  // Auto-snapshot on dashboard load
  const snap = assetsStore.snapshotNetWorth();
  settingsStore.addSnapshot(snap);

  // Daily prompt (rotate by day of year)
  const promptList = Array.isArray(_promptsArray) ? _promptsArray : [];
  const dayOfYear  = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const prompt     = promptList.length ? promptList[dayOfYear % promptList.length] : '';

  render.dashboard({
    netWorth,
    velocity,
    snapshots,
    monthTotals,
    goals,
    prompt
  });
}
