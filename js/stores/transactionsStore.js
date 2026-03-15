// js/stores/transactionsStore.js
import { persistStores } from '../data.js';
import { getStores, fireSaveHook } from '../state.js';
import { genId, today, calcMonthlyTotals, debounce } from '../utils.js';

const save = debounce(async () => { await persistStores(); fireSaveHook(); }, 600);

function txs() { return getStores().transactions; }

export const transactionsStore = {
  load() {},

  getAll(month) {
    const all = [...txs()].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    return month ? all.filter(t => t.date && t.date.startsWith(month)) : all;
  },

  getMonthlyTotals(month) { return calcMonthlyTotals(txs(), month); },

  addExpense(amount, category, note = '', date = today()) {
    const id = genId();
    txs().push({ id, type: 'expense', amount: Number(amount), category, note, date, createdAt: new Date().toISOString() });
    save(); return id;
  },

  addIncome(amount, source, note = '', date = today(), allocation = null) {
    const id = genId();
    txs().push({ id, type: 'income', amount: Number(amount), source, note, date, allocation, createdAt: new Date().toISOString() });
    save(); return id;
  },

  addAdjustment(amount, note = '', date = today(), allocation = null) {
    const id = genId();
    txs().push({ id, type: 'adjustment', amount: Number(amount), note, date, allocation, createdAt: new Date().toISOString() });
    save(); return id;
  },

  update(id, fields) { const t = txs().find(t => t.id === id); if (t) Object.assign(t, fields); save(); },
  remove(id) { getStores().transactions = txs().filter(t => t.id !== id); save(); },
};
