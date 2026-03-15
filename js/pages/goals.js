// js/pages/goals.js
import { goalsStore } from '../stores/goalsStore.js';
import render         from '../render.js';

let _initialized = false;

export function init() {
  if (!_initialized) {
    _initialized = true;

    document.getElementById('goals-list')?.addEventListener('click', e => {
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
  refresh();
}

export function refresh() {
  render.goalsList(goalsStore.getAll());
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
