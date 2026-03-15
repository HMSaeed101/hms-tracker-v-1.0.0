// js/pages/zakat.js
import { zakatStore }    from '../stores/zakatStore.js';
import { assetsStore }   from '../stores/assetsStore.js';
import { settingsStore } from '../stores/settingsStore.js';
import render            from '../render.js';
import { calcVelocity }  from '../utils.js';

let _initialized = false;

export function init() {
  if (!_initialized) {
    _initialized = true;

    document.getElementById('nisab-gold-btn')?.addEventListener('click', () => {
      zakatStore.setNisabStandard('gold'); refresh();
    });
    document.getElementById('nisab-silver-btn')?.addEventListener('click', () => {
      zakatStore.setNisabStandard('silver'); refresh();
    });

    document.getElementById('log-payment-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const amount    = parseFloat(document.getElementById('payment-amount').value);
      const recipient = document.getElementById('payment-recipient').value.trim();
      const date      = document.getElementById('payment-date').value;
      if (!amount || amount <= 0) return;
      zakatStore.logPayment(amount, date || undefined, recipient);
      render.toast('Zakat payment logged ✓', 'success');
      e.target.reset();
      document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];
      closeModal('log-payment-modal'); refresh();
    });

    document.getElementById('log-sadaqah-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById('sadaqah-amount').value);
      const note   = document.getElementById('sadaqah-note').value.trim();
      const date   = document.getElementById('sadaqah-date').value;
      if (!amount || amount <= 0) return;
      zakatStore.logSadaqah(amount, date || undefined, note);
      render.toast('Sadaqah logged ✓', 'success');
      e.target.reset();
      document.getElementById('sadaqah-date').value = new Date().toISOString().split('T')[0];
      closeModal('log-sadaqah-modal'); refresh();
    });

    document.getElementById('zakat-payments-list')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-action="delete-payment"]');
      if (btn) { zakatStore.removePayment(btn.dataset.id); render.toast('Removed', 'success'); refresh(); }
    });

    document.getElementById('zakat-csv-btn')?.addEventListener('click', () => {
      const { csv, filename } = zakatStore.exportCSV();
      downloadFile(csv, filename, 'text/csv');
      render.toast('CSV downloaded ✓', 'success');
    });

    document.getElementById('zakat-reset-btn')?.addEventListener('click', async () => {
      if (!confirm('Reset Zakat year? This will archive all payment records and start a new year.')) return;
      const summary    = zakatStore.getAnnualSummary();
      const archiveKey = await zakatStore.resetYear(summary);
      render.toast(`Year reset. Archived as ${archiveKey}`, 'success');
      refresh();
    });
  }
  refresh();
}

export function refresh() {
  const assets     = assetsStore.getAll();
  const rates      = settingsStore.getRates();
  const snaps      = settingsStore.getSnapshots();
  const velocity   = calcVelocity(snaps);
  const status     = zakatStore.getStatus(assets, rates);
  const summary    = zakatStore.getAnnualSummary();
  const projection = zakatStore.getProjection(velocity, status.amountDue);

  document.getElementById('nisab-gold-btn')?.classList.toggle('active',   status.nisabStandard === 'gold');
  document.getElementById('nisab-silver-btn')?.classList.toggle('active', status.nisabStandard === 'silver');

  render.zakatPage({ status, summary, projection });
}

function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function downloadFile(content, filename, type) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type })), download: filename,
  });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}
