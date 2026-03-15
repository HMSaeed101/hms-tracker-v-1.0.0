// js/stores/zakatStore.js
import { persistStores } from '../data.js';
import { getStores, fireSaveHook } from '../state.js';
import { genId, today, currentHijriYear, calcZakatEligible, calcZakatDue,
         calcNisab, calcPurificationProjection, debounce } from '../utils.js';

const save = debounce(async () => { await persistStores(); fireSaveHook(); }, 600);

function z() { return getStores().zakat; }

export const zakatStore = {
  load() {},

  getStatus(assets, rates) {
    const eligible     = calcZakatEligible(assets);
    const nisab        = calcNisab(rates, z().nisabStandard);
    const nisabReached = eligible >= nisab;
    const daysSince    = z().hawlStartDate
      ? Math.floor((Date.now() - new Date(z().hawlStartDate)) / 86400000) : 0;
    const hawlComplete = daysSince >= 354;
    return {
      eligible, nisab, nisabReached, hawlComplete,
      hawlStartDate: z().hawlStartDate, daysSince,
      daysRemaining: Math.max(0, 354 - daysSince),
      amountDue:     (nisabReached && hawlComplete) ? calcZakatDue(eligible) : 0,
      nisabStandard: z().nisabStandard,
    };
  },

  getProjection(velocity, zakatDue) { return calcPurificationProjection(zakatDue, velocity); },

  startHawl() {
    if (!z().hawlStartDate) { z().hawlStartDate = today(); z().nisabReached = true; save(); }
  },

  setNisabStandard(standard) { z().nisabStandard = standard; save(); },

  logPayment(amount, date = today(), recipient = '') {
    const id = genId();
    z().payments.push({ id, amount: Number(amount), date, recipient });
    save(); return id;
  },
  removePayment(id) { z().payments = z().payments.filter(p => p.id !== id); save(); },

  logSadaqah(amount, date = today(), note = '') {
    const id = genId();
    z().sadaqah.push({ id, amount: Number(amount), date, note });
    save(); return id;
  },
  removeSadaqah(id) { z().sadaqah = z().sadaqah.filter(s => s.id !== id); save(); },

  getAnnualSummary() {
    const paid    = z().payments.reduce((s,p) => s + p.amount, 0);
    const sadaqah = z().sadaqah.reduce((s,p) => s + p.amount, 0);
    return { paid, sadaqah, total: paid + sadaqah, payments: [...z().payments], sadaqahLog: [...z().sadaqah] };
  },

  async resetYear(exportData) {
    const year      = currentHijriYear();
    const archiveKey = `zakat_archive_${year}H`;
    localStorage.setItem(archiveKey, JSON.stringify({ year, archivedAt: today(), ...exportData }));
    const zakat = z();
    zakat.hawlStartDate = null;
    zakat.nisabReached  = false;
    zakat.payments      = [];
    zakat.sadaqah       = [];
    await persistStores();
    fireSaveHook();
    return archiveKey;
  },

  exportCSV() {
    const year    = currentHijriYear();
    const summary = zakatStore.getAnnualSummary();
    const rows    = [
      ['Type','Amount (Rs)','Date','Recipient/Note'],
      ...summary.payments.map(p  => ['Zakat',   p.amount, p.date, p.recipient]),
      ...summary.sadaqahLog.map(s => ['Sadaqah', s.amount, s.date, s.note]),
    ];
    return {
      csv:      rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n'),
      filename: `Saeed_Zakat_${year}H.csv`,
    };
  },
};
