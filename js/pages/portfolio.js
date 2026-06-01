// js/pages/portfolio.js
import { assetsStore }   from '../stores/assetsStore.js';
import { goalsStore }    from '../stores/goalsStore.js';
import { settingsStore } from '../stores/settingsStore.js';
import render            from '../render.js';
import { calcNetWorth }  from '../utils.js';

let _activePortfolioTab = 'assets'; // 'assets' | 'goals'
let _activeAssetSection = 'cash';
let _initialized   = false;

export function init() {
  if (!_initialized) {
    _initialized = true;

    // Handle Portfolio-level tab switching
    document.querySelector('.portfolio-tabs')?.addEventListener('click', e => {
      const btn = e.target.closest('.portfolio-tab-btn');
      if (!btn) return;
      _activePortfolioTab = btn.dataset.portfolioTab;
      updateTabUI();
      refresh();
    });

    // Handle Asset-specific section switching
    document.getElementById('portfolio-view-assets')?.addEventListener('click', e => {
      const tab = e.target.closest('.asset-tab-btn');
      if (tab) {
        _activeAssetSection = tab.dataset.section;
        document.querySelectorAll('.asset-tab-btn')
          .forEach(b => b.classList.toggle('active', b === tab));
        document.querySelectorAll('.asset-section')
          .forEach(s => s.classList.toggle('active', s.id === `assets-section-${_activeAssetSection}`));
        refresh();
        return;
      }
      // Delete asset item
      const del = e.target.closest('[data-action="delete"]');
      if (del) {
        if (confirm('Delete this item?')) {
          assetsStore.remove(del.dataset.type, del.dataset.id);
          render.toast('Deleted ✓', 'success');
          refresh();
        }
      }
    });

    // Handle Goals-specific actions
    document.getElementById('portfolio-view-goals')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === 'allocate-goal')  openAllocateModal(id);
      if (action === 'edit-goal')      openEditModal(id);
      if (action === 'delete-goal') {
        if (confirm('Delete this goal?')) {
          goalsStore.remove(id);
          render.toast('Goal deleted', 'success');
          refresh();
        }
      }
    });

    // Form handlers for goals
    document.getElementById('allocate-goal-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const id     = e.target.dataset.goalId;
      const amount = parseFloat(document.getElementById('allocate-amount').value);
      if (!amount || amount <= 0) return;
      goalsStore.allocate(id, amount);
      render.toast('Capital allocated ✓', 'success');
      closeModal('allocate-modal'); refresh();
    });

    document.getElementById('edit-goal-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const id      = e.target.dataset.goalId;
      const title   = document.getElementById('edit-goal-title').value.trim();
      const target  = parseFloat(document.getElementById('edit-goal-target').value);
      const deadline= document.getElementById('edit-goal-deadline').value;
      const type    = document.getElementById('edit-goal-type').value;
      if (!title || !target) return;
      goalsStore.update(id, { title, targetPKR: target, deadline: deadline || null, type });
      render.toast('Goal updated ✓', 'success');
      closeModal('edit-goal-modal'); refresh();
    });
  }

  // Handle URL param ?tab=goals
  const hash = window.location.hash;
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    if (params.get('tab') === 'goals') _activePortfolioTab = 'goals';
    else if (params.get('tab') === 'assets') _activePortfolioTab = 'assets';
  }
  
  updateTabUI();
  refresh();
}

function updateTabUI() {
  document.querySelectorAll('.portfolio-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.portfolioTab === _activePortfolioTab);
  });
  document.querySelectorAll('.portfolio-view').forEach(v => {
    v.classList.toggle('active', v.id === `portfolio-view-${_activePortfolioTab}`);
  });
}

export function refresh() {
  if (_activePortfolioTab === 'assets') {
    const assets = assetsStore.getAll();
    const nw     = calcNetWorth(assets);
    const rates  = settingsStore.getRates();

    const nwEl = document.getElementById('assets-net-worth');
    if (nwEl) nwEl.textContent = 'Rs ' + Math.round(nw).toLocaleString('en-PK');

    render.assetsList(assets, _activeAssetSection);
    render.rates(rates);
  } else {
    render.goalsList(goalsStore.getAll());
  }
}

function openAllocateModal(id) {
  const g = goalsStore.getAll().find(g => g.id === id); if (!g) return;
  const form = document.getElementById('allocate-goal-form');
  if (form) form.dataset.goalId = id;
  const titleEl = document.getElementById('allocate-goal-title');
  if (titleEl) titleEl.textContent = g.title;
  document.getElementById('allocate-amount').value = '';
  openModal('allocate-modal');
}

function openEditModal(id) {
  const g = goalsStore.getAll().find(g => g.id === id); if (!g) return;
  const form = document.getElementById('edit-goal-form');
  if (form) form.dataset.goalId = id;
  const sv = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v ?? ''; };
  sv('edit-goal-title',    g.title);
  sv('edit-goal-target',   g.targetPKR);
  sv('edit-goal-deadline', g.deadline || '');
  sv('edit-goal-type',     g.type);
  openModal('edit-goal-modal');
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
