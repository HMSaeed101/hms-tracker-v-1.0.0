// js/pages/expenses.js
import { transactionsStore } from '../stores/transactionsStore.js';
import render                from '../render.js';
import { monthKey, monthLabel, calcCategoryTotals, formatPKR } from '../utils.js';

let _currentMonth = monthKey();
let _initialized  = false;

export function init() {
  if (!_initialized) {
    _initialized = true;

    document.getElementById('month-prev')?.addEventListener('click', () => {
      const [y, m] = _currentMonth.split('-').map(Number);
      _currentMonth = monthKey(new Date(y, m - 2));
      refresh();
    });
    document.getElementById('month-next')?.addEventListener('click', () => {
      const [y, m] = _currentMonth.split('-').map(Number);
      _currentMonth = monthKey(new Date(y, m));
      refresh();
    });

    document.getElementById('expense-filters')?.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      document.querySelectorAll('#expense-filters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      render.transactionsList(transactionsStore.getAll(_currentMonth), filter === 'all' ? null : filter);
    });

    document.getElementById('transactions-list')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-action="delete-tx"]');
      if (btn) {
        transactionsStore.remove(btn.dataset.id);
        render.toast('Deleted ✓', 'success');
        refresh();
      }
    });
  }
  refresh();
}

export function refresh() {
  const txs       = transactionsStore.getAll(_currentMonth);
  const totals    = transactionsStore.getMonthlyTotals(_currentMonth);
  const catTotals = calcCategoryTotals(txs, _currentMonth);

  const setEl = (id, val, style) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    if (style) Object.assign(el.style, style);
  };

  setEl('current-month-label', monthLabel(_currentMonth));
  setEl('exp-income',   formatPKR(totals.income));
  setEl('exp-expenses', formatPKR(totals.expenses));
  setEl('exp-net', formatPKR(Math.abs(totals.net)), {
    color: totals.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
  });

  // Canvas chart — defer until element has layout
  const canvas = document.getElementById('expenses-chart');
  if (canvas) {
    requestAnimationFrame(() => render.expenseChart(canvas, catTotals));
  }

  render.transactionsList(txs, null);
  document.querySelectorAll('#expense-filters .filter-chip')
    .forEach((c, i) => c.classList.toggle('active', i === 0));
}
