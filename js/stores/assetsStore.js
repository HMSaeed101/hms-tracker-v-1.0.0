// js/stores/assetsStore.js
import { persistStores } from '../data.js';
import { getStores, fireSaveHook } from '../state.js';
import { genId, today, calcNetWorth, debounce } from '../utils.js';

const save = debounce(async () => { await persistStores(); fireSaveHook(); }, 600);

function assets() { return getStores().assets; }

export const assetsStore = {
  load() {}, // no-op: state already loaded by data.js unlockWithPin

  getAll() { return { ...assets() }; },

  snapshotNetWorth() {
    return { date: today(), valuePKR: calcNetWorth(assets()) };
  },

  // Cash
  addCash(label, amountPKR) {
    const id = genId();
    assets().cash.push({ id, label, amountPKR: Number(amountPKR), createdAt: today() });
    save(); return id;
  },
  updateCash(id, fields) { const i = assets().cash.find(c => c.id === id); if (i) Object.assign(i, fields); save(); },
  removeCash(id) { assets().cash = assets().cash.filter(c => c.id !== id); save(); },

  // Physical
  addPhysicalItem(name, purchasePKR, currentPKR) {
    const id = genId();
    assets().physical.push({ id, name, purchasePKR: Number(purchasePKR), currentPKR: Number(currentPKR), createdAt: today() });
    save(); return id;
  },
  updatePhysicalItem(id, fields) { const i = assets().physical.find(p => p.id === id); if (i) Object.assign(i, fields); save(); },
  removePhysicalItem(id) { assets().physical = assets().physical.filter(p => p.id !== id); save(); },

  // Investments
  addInvestment(name, type, amountPKR, amountUSD = 0) {
    const id = genId();
    assets().investments.push({ id, name, type, amountPKR: Number(amountPKR), amountUSD: Number(amountUSD), purchasePKR: Number(amountPKR), createdAt: today() });
    save(); return id;
  },
  updateInvestment(id, fields) { const i = assets().investments.find(x => x.id === id); if (i) Object.assign(i, fields); save(); },
  removeInvestment(id) { assets().investments = assets().investments.filter(x => x.id !== id); save(); },

  // Liabilities
  addLiability(label, amountPKR) {
    const id = genId();
    assets().liabilities.push({ id, label, amountPKR: Number(amountPKR), createdAt: today() });
    save(); return id;
  },
  updateLiability(id, fields) { const i = assets().liabilities.find(l => l.id === id); if (i) Object.assign(i, fields); save(); },
  removeLiability(id) { assets().liabilities = assets().liabilities.filter(l => l.id !== id); save(); },

  // Generic
  update(type, id, fields) { const i = (assets()[type] || []).find(x => x.id === id); if (i) Object.assign(i, fields); save(); },
  remove(type, id) { if (assets()[type]) { assets()[type] = assets()[type].filter(x => x.id !== id); save(); } },
};
