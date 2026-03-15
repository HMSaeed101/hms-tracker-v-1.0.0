// js/stores/goalsStore.js
import { persistStores } from '../data.js';
import { getStores, fireSaveHook } from '../state.js';
import { genId, today, debounce } from '../utils.js';

const save = debounce(async () => { await persistStores(); fireSaveHook(); }, 600);

function goals() { return getStores().goals; }

export const goalsStore = {
  load() {},

  getAll() {
    return [...goals()].sort((a,b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return (a.deadline||'9999').localeCompare(b.deadline||'9999');
    });
  },

  getActive() { return goals().filter(g => !g.completed); },

  add(title, targetPKR, savedPKR = 0, deadline = null, type = 'short') {
    const id = genId();
    goals().push({ id, title, targetPKR: Number(targetPKR), savedPKR: Number(savedPKR), deadline, type, autoSweep: null, completed: false, completedAt: null, createdAt: today() });
    save(); return id;
  },

  allocate(id, amountPKR) {
    const g = goals().find(g => g.id === id);
    if (!g) return;
    g.savedPKR = Math.min(g.savedPKR + Number(amountPKR), g.targetPKR);
    if (g.savedPKR >= g.targetPKR) { g.completed = true; g.completedAt = today(); }
    save();
  },

  setAutoSweep(id, percent, thresholdPKR = 5000) {
    const g = goals().find(g => g.id === id);
    if (g) { g.autoSweep = { percent: Number(percent), thresholdPKR: Number(thresholdPKR) }; save(); }
  },

  removeAutoSweep(id) {
    const g = goals().find(g => g.id === id);
    if (g) { g.autoSweep = null; save(); }
  },

  complete(id) {
    const g = goals().find(g => g.id === id);
    if (g) { g.completed = true; g.completedAt = today(); save(); }
  },

  update(id, fields) { const g = goals().find(g => g.id === id); if (g) Object.assign(g, fields); save(); },

  remove(id) { getStores().goals = goals().filter(g => g.id !== id); save(); },

  processAutoSweep(incomeAmount) {
    const allocations = [];
    for (const g of goals().filter(g => !g.completed && g.autoSweep)) {
      const { percent, thresholdPKR } = g.autoSweep;
      if (incomeAmount > thresholdPKR) {
        const amount = Math.floor(incomeAmount * (percent / 100));
        if (amount > 0) { goalsStore.allocate(g.id, amount); allocations.push({ goalId: g.id, title: g.title, amount }); }
      }
    }
    return allocations;
  },
};
