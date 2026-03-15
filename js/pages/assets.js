// js/pages/assets.js
import { assetsStore }   from '../stores/assetsStore.js';
import { settingsStore } from '../stores/settingsStore.js';
import render            from '../render.js';
import { calcNetWorth }  from '../utils.js';

let _activeSection = 'cash';
let _initialized   = false;

export function init() {
  if (!_initialized) {
    _initialized = true;

    document.getElementById('page-assets')?.addEventListener('click', e => {
      // Tab switching
      const tab = e.target.closest('.asset-tab-btn');
      if (tab) {
        _activeSection = tab.dataset.section;
        document.querySelectorAll('.asset-tab-btn')
          .forEach(b => b.classList.toggle('active', b === tab));
        document.querySelectorAll('.asset-section')
          .forEach(s => s.classList.toggle('active', s.id === `assets-section-${_activeSection}`));
        refresh();
        return;
      }
      // Delete item button
      const del = e.target.closest('[data-action="delete"]');
      if (del) {
        assetsStore.remove(del.dataset.type, del.dataset.id);
        render.toast('Deleted ✓', 'success');
        refresh();
      }
    });
  }
  refresh();
}

export function refresh() {
  const assets = assetsStore.getAll();
  const nw     = calcNetWorth(assets);
  const rates  = settingsStore.getRates();

  const nwEl = document.getElementById('assets-net-worth');
  if (nwEl) nwEl.textContent = 'Rs ' + Math.round(nw).toLocaleString('en-PK');

  render.assetsList(assets, _activeSection);
  render.rates(rates);
}
