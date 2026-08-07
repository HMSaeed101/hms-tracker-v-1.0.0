// js/stores/settingsStore.js
import { persistStores } from '../data.js';
import { getStores, fireSaveHook } from '../state.js';
import { debounce } from '../utils.js';

const save = debounce(async () => { await persistStores(); fireSaveHook(); }, 600);

function s() { return getStores().settings; }

export const settingsStore = {
  load() {},

  // Rates
  getRates()      { return { ...s().rates }; },
  setRates(rates) { Object.assign(s().rates, rates); save(); },
  stampRatesDate(){ s().rates.lastUpdated = new Date().toISOString().split('T')[0]; save(); },

  // Theme
  getTheme()       { return s().theme || 'dark'; },
  setTheme(theme)  {
    s().theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    // hms_theme is a pre-unlock hint — written by main.js after setTheme() returns
    save();
  },

  // Zakat Visibility & Reflection Style
  getShowZakat() {
    return s().showZakat !== false; // defaults to true
  },
  setShowZakat(val) {
    s().showZakat = !!val;
    save();
  },
  getReflectionStyle() {
    return s().reflectionStyle || 'spiritual'; // defaults to 'spiritual'
  },
  setReflectionStyle(style) {
    s().reflectionStyle = style;
    save();
  },

  // Export date
  getLastExportDate()    { return s().lastExportDate; },
  setLastExportDate(d)   { s().lastExportDate = d; save(); },

  // Net-worth snapshots
  getSnapshots() { return [...(s().snapshots || [])]; },
  addSnapshot(snap) {
    if (!s().snapshots) s().snapshots = [];
    const idx = s().snapshots.findIndex(x => x.date === snap.date);
    if (idx >= 0) s().snapshots[idx] = snap;
    else s().snapshots.push(snap);
    // Keep last 90 days
    s().snapshots = s().snapshots.sort((a,b) => a.date.localeCompare(b.date)).slice(-90);
    save();
  },

  shouldRemindBackup(days = 7) {
    const last = s().lastExportDate;
    if (!last) return true;
    return Math.floor((Date.now() - new Date(last)) / 86400000) >= days;
  },
};
