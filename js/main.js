// js/main.js — app entry. Runs after DOMContentLoaded.
import { isFirstRun, isUnlocked, setupPin, unlockWithPin, clearMasterKey,
         exportJson, importJson, changePin } from './data.js';
import { onSaveHook } from './state.js';
import { assetsStore }       from './stores/assetsStore.js';
import { transactionsStore } from './stores/transactionsStore.js';
import { goalsStore }        from './stores/goalsStore.js';
import { zakatStore }        from './stores/zakatStore.js';
import { settingsStore }     from './stores/settingsStore.js';
import render                from './render.js';
import * as router           from './router.js';
import * as dashPage         from './pages/dashboard.js';
import * as assetsPage       from './pages/assets.js';
import * as expensesPage     from './pages/expenses.js';
import * as goalsPage        from './pages/goals.js';
import * as zakatPage        from './pages/zakat.js';
import { isIOS, today, genId, debounce } from './utils.js';

// ─────────────────────────────────────────
// PIN state
// ─────────────────────────────────────────
let _pinBuffer    = '';
let _pinAttempts  = 0;
let _pinMode      = 'unlock'; // 'unlock' | 'setup'
let _pinSetupStep = 'enter';  // 'enter' | 'confirm'
let _pinSetupFirst= '';
let _inCooldown   = false;
let _cooldownInterval = null;

// ─────────────────────────────────────────
// Inactivity auto-lock
// ─────────────────────────────────────────
let _inactivityTimer = null;
const INACTIVITY_MS  = 5 * 60 * 1000;

function resetInactivity() {
  clearTimeout(_inactivityTimer);
  _inactivityTimer = setTimeout(lockApp, INACTIVITY_MS);
}

function lockApp() {
  clearMasterKey();
  clearTimeout(_inactivityTimer);
  showPinScreen(isFirstRun() ? 'setup' : 'unlock');
}

// ─────────────────────────────────────────
// Boot — waits for DOM
// ─────────────────────────────────────────
function boot() {
  // Apply saved theme before anything renders
  const savedTheme = localStorage.getItem('hms_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Wire up PIN keypad (single listener, always present)
  document.querySelector('.pin-keypad')?.addEventListener('click', e => {
    const key = e.target.closest('.pin-key');
    if (key && key.dataset.key) handlePinKey(key.dataset.key);
  });

  if (isFirstRun()) {
    showPinScreen('setup');
  } else {
    showPinScreen('unlock');
  }
}

// ─────────────────────────────────────────
// PIN screen
// ─────────────────────────────────────────
function showPinScreen(mode) {
  _pinMode = mode;
  _pinBuffer = '';
  _pinSetupStep  = 'enter';
  _pinSetupFirst = '';

  document.getElementById('app-shell')?.classList.add('hidden');
  document.getElementById('pin-screen')?.classList.add('active');

  if (mode === 'setup') {
    document.getElementById('pin-title').textContent    = 'Create your PIN';
    document.getElementById('pin-subtitle').textContent = 'Set a 4-digit PIN to protect your data';
  } else {
    document.getElementById('pin-title').textContent    = 'Welcome back';
    document.getElementById('pin-subtitle').textContent = 'Enter your PIN to unlock';
  }
  render.pinDots(0);
  render.pinError('');
  render.pinCooldown(0);
}

function hidePinScreen() {
  document.getElementById('pin-screen')?.classList.remove('active');
  document.getElementById('app-shell')?.classList.remove('hidden');
}

function handlePinKey(key) {
  if (_inCooldown) return;
  if (key === 'del') {
    _pinBuffer = _pinBuffer.slice(0, -1);
    render.pinDots(_pinBuffer.length);
    return;
  }
  if (_pinBuffer.length >= 4) return;
  _pinBuffer += key;
  render.pinDots(_pinBuffer.length);
  if (_pinBuffer.length === 4) {
    const pin = _pinBuffer;
    _pinBuffer = '';
    setTimeout(() => submitPin(pin), 180);
  }
}

async function submitPin(pin) {
  if (_pinMode === 'setup') {
    if (_pinSetupStep === 'enter') {
      _pinSetupFirst = pin;
      _pinSetupStep  = 'confirm';
      render.pinDots(0);
      document.getElementById('pin-title').textContent    = 'Confirm PIN';
      document.getElementById('pin-subtitle').textContent = 'Enter the same PIN again';
      return;
    }
    if (pin !== _pinSetupFirst) {
      render.pinDots(4, true);
      render.pinError('PINs do not match — try again');
      setTimeout(() => {
        _pinSetupStep = 'enter'; _pinSetupFirst = '';
        render.pinDots(0); render.pinError('');
        document.getElementById('pin-title').textContent    = 'Create your PIN';
        document.getElementById('pin-subtitle').textContent = 'Set a 4-digit PIN to protect your data';
      }, 1200);
      return;
    }
    try {
      await setupPin(pin);
      await afterUnlock();
    } catch(e) {
      console.error(e);
      render.pinError('Setup failed — try again');
    }
    return;
  }

  // Unlock mode
  try {
    await unlockWithPin(pin);
    _pinAttempts = 0;
    await afterUnlock();
  } catch(e) {
    _pinAttempts++;
    render.pinDots(4, true);
    if (_pinAttempts >= 3) {
      startCooldown(30);
    } else {
      render.pinError(`Wrong PIN · ${3 - _pinAttempts} attempt${3 - _pinAttempts !== 1 ? 's' : ''} left`);
      setTimeout(() => render.pinDots(0), 600);
    }
  }
}

function startCooldown(secs) {
  _inCooldown = true;
  render.pinError('Too many attempts');
  let remaining = secs;
  render.pinCooldown(remaining);
  clearInterval(_cooldownInterval);
  _cooldownInterval = setInterval(() => {
    remaining--;
    render.pinCooldown(remaining);
    if (remaining <= 0) {
      clearInterval(_cooldownInterval);
      _inCooldown = false; _pinAttempts = 0;
      render.pinDots(0); render.pinError(''); render.pinCooldown(0);
    }
  }, 1000);
}

// ─────────────────────────────────────────
// After unlock
// ─────────────────────────────────────────
async function afterUnlock() {
  // Apply theme from settings
  const theme = settingsStore.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('hms_theme', theme);

  // Sync theme toggle UI
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const isLight = theme === 'light';
    toggle.classList.toggle('on', isLight);
    toggle.setAttribute('aria-checked', String(isLight));
  }

  // Hook save callback → save-status in navbar
  onSaveHook(() => render.saveStatus(new Date().toISOString()));

  hidePinScreen();
  initApp();
}

// ─────────────────────────────────────────
// App init (called once after first unlock)
// ─────────────────────────────────────────
let _appInited = false;

function initApp() {
  if (_appInited) {
    // Already inited — just navigate to dashboard and refresh
    router.navigate('dashboard');
    return;
  }
  _appInited = true;

  // Register routes
  router.register('dashboard', () => dashPage.init());
  router.register('assets',    () => assetsPage.init());
  router.register('expenses',  () => expensesPage.init());
  router.register('goals',     () => goalsPage.init());
  router.register('zakat',     () => zakatPage.init());
  router.init();

  // Inactivity lock
  ['touchstart','click','keydown','scroll'].forEach(ev =>
    document.addEventListener(ev, resetInactivity, { passive: true })
  );
  resetInactivity();

  // Auto-lock on background
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) lockApp();
  });

  // Bottom nav — single delegation listener
  document.querySelector('.bottom-nav')?.addEventListener('click', e => {
    const item = e.target.closest('.nav-item[data-route]');
    if (item) router.navigate(item.dataset.route);
  });

  // FAB
  document.getElementById('fab')?.addEventListener('click', () => openModal('quick-log-modal'));

  // Settings button
  document.getElementById('settings-btn')?.addEventListener('click', () => {
    // Populate rates inputs before opening
    const rates = settingsStore.getRates();
    const setV  = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    setV('rate-usd-input',    rates.usdPKR);
    setV('rate-gold-input',   rates.gold10gPKR);
    setV('rate-silver-input', rates.silver1gPKR);
    openModal('settings-modal');
  });

  // Modal backdrop close & [data-close-modal] — single delegation
  document.addEventListener('click', e => {
    // Close via button
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) { closeModal(closeBtn.dataset.closeModal); return; }
    // Close via backdrop
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
    }
  });

  // Modal tab switching — delegation
  document.addEventListener('click', e => {
    const tab = e.target.closest('.modal-tab');
    if (!tab || !tab.dataset.panel) return;
    const container = tab.closest('.modal') || tab.closest('.modal-backdrop');
    if (!container) return;
    container.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    container.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.panel);
    if (panel) panel.classList.add('active');
  });

  // [data-open-modal] delegation
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-open-modal]');
    if (!btn) return;
    const modalId = btn.dataset.openModal;
    openModal(modalId);
    // Switch to correct asset tab if specified
    const assetTab = btn.dataset.assetTab;
    if (assetTab) {
      const tabMap = { cash: 'add-cash-panel', physical: 'add-physical-panel', investment: 'add-investment-panel', liability: 'add-liability-panel' };
      const panelId = tabMap[assetTab];
      const modal   = document.getElementById(modalId);
      if (modal && panelId) {
        modal.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
        modal.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.toggle('active', p.id === panelId));
      }
    }
  });

  // Set today's date on all date inputs
  const todayStr = today();
  document.querySelectorAll('input[type="date"]').forEach(el => { if (!el.value) el.value = todayStr; });

  initForms();
  initSettings();

  // Backup nudge
  const backupDays = isIOS() ? 5 : 7;
  if (settingsStore.shouldRemindBackup(backupDays)) {
    setTimeout(() => render.toast('💾 No backup in a while — consider exporting', 'warning', 5000), 3000);
  }
}

// ─────────────────────────────────────────
// Form handlers (all attached once)
// ─────────────────────────────────────────
function initForms() {
  // Quick Log — Expense
  on('expense-form', 'submit', e => {
    e.preventDefault();
    const fd       = new FormData(e.target);
    const amount   = parseFloat(fd.get('amount'));
    const category = fd.get('category');
    if (!amount || amount <= 0 || !category) { render.toast('Fill in amount and category', 'warning'); return; }
    transactionsStore.addExpense(amount, category, fd.get('note')||'', fd.get('date')||today());
    render.toast('Expense logged ✓', 'success');
    e.target.reset(); setTodayOnDates(e.target);
    closeModal('quick-log-modal');
    refreshCurrentPage();
  });

  // Quick Log — Income
  on('income-form', 'submit', e => {
    e.preventDefault();
    const fd     = new FormData(e.target);
    const amount = parseFloat(fd.get('amount'));
    const source = fd.get('source');
    if (!amount || amount <= 0 || !source) { render.toast('Fill in amount and source', 'warning'); return; }
    const sweeps = goalsStore.processAutoSweep(amount);
    transactionsStore.addIncome(amount, source, fd.get('note')||'', fd.get('date')||today());
    sweeps.forEach(sw => render.toast(`⚡ Rs ${sw.amount.toLocaleString()} swept to "${sw.title}"`, 'info', 4000));
    render.toast('Income logged ✓', 'success');
    e.target.reset(); setTodayOnDates(e.target);
    closeModal('quick-log-modal');
    refreshCurrentPage();
  });

  // Quick Log — Adjust
  on('adjust-form', 'submit', e => {
    e.preventDefault();
    const fd     = new FormData(e.target);
    const amount = parseFloat(fd.get('amount'));
    if (!amount) { render.toast('Enter an amount', 'warning'); return; }
    transactionsStore.addAdjustment(amount, fd.get('note')||'', fd.get('date')||today());
    render.toast('Adjustment logged ✓', 'success');
    e.target.reset(); setTodayOnDates(e.target);
    closeModal('quick-log-modal');
    refreshCurrentPage();
  });

  // Add Cash
  on('add-cash-form', 'submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const label = fd.get('label')?.trim(); const amount = parseFloat(fd.get('amount'));
    if (!label || !amount) return;
    assetsStore.addCash(label, amount);
    render.toast('Cash account added ✓', 'success');
    e.target.reset(); closeModal('add-asset-modal');
    if (router.current() === 'assets') assetsPage.refresh();
    if (router.current() === 'dashboard') dashPage.refresh();
  });

  // Add Physical
  on('add-physical-form', 'submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    assetsStore.addPhysicalItem(fd.get('name'), parseFloat(fd.get('purchasePrice'))||0, parseFloat(fd.get('currentValue'))||0);
    render.toast('Physical item added ✓', 'success');
    e.target.reset(); closeModal('add-asset-modal');
    if (router.current() === 'assets') assetsPage.refresh();
  });

  // Add Investment
  on('add-investment-form', 'submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    assetsStore.addInvestment(fd.get('name'), fd.get('investType'), parseFloat(fd.get('amountPKR'))||0, parseFloat(fd.get('amountUSD'))||0);
    render.toast('Investment added ✓', 'success');
    e.target.reset(); closeModal('add-asset-modal');
    if (router.current() === 'assets') assetsPage.refresh();
  });

  // Add Liability
  on('add-liability-form', 'submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    assetsStore.addLiability(fd.get('label'), parseFloat(fd.get('amount'))||0);
    render.toast('Liability added ✓', 'success');
    e.target.reset(); closeModal('add-asset-modal');
    if (router.current() === 'assets') assetsPage.refresh();
  });

  // Add Goal
  on('add-goal-form', 'submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title')?.trim(); const target = parseFloat(fd.get('targetPKR'));
    if (!title || !target) { render.toast('Enter a title and target amount', 'warning'); return; }
    goalsStore.add(title, target, parseFloat(fd.get('savedPKR'))||0, fd.get('deadline')||null, fd.get('type')||'short');
    render.toast('Goal created ✓', 'success');
    e.target.reset(); closeModal('add-goal-modal');
    if (router.current() === 'goals') goalsPage.refresh();
    if (router.current() === 'dashboard') dashPage.refresh();
  });
}

// ─────────────────────────────────────────
// Settings
// ─────────────────────────────────────────
function initSettings() {
  // Theme toggle
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const isOn = toggle.classList.toggle('on');
    toggle.setAttribute('aria-checked', String(isOn));
    const newTheme = isOn ? 'light' : 'dark';
    settingsStore.setTheme(newTheme);
    localStorage.setItem('hms_theme', newTheme); // pre-unlock hint only
  });
  toggle?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
  });

  // Rates form
  on('rates-form', 'submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    settingsStore.setRates({
      usdPKR:      parseFloat(fd.get('usdPKR'))      || settingsStore.getRates().usdPKR,
      gold10gPKR:  parseFloat(fd.get('gold10gPKR'))  || settingsStore.getRates().gold10gPKR,
      silver1gPKR: parseFloat(fd.get('silver1gPKR')) || settingsStore.getRates().silver1gPKR,
      lastUpdated: today(),
    });
    render.toast('Rates updated ✓', 'success');
    render.rates(settingsStore.getRates());
    closeModal('rates-modal');
    if (router.current() === 'zakat') zakatPage.refresh();
  });

  on('rates-stamp-btn', 'click', () => {
    settingsStore.stampRatesDate();
    render.toast('Rate date confirmed for today ✓', 'success');
    render.rates(settingsStore.getRates());
  });

  // Change PIN
  on('change-pin-form', 'submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const oldPin = fd.get('oldPin'); const newPin = fd.get('newPin'); const confirm = fd.get('confirmPin');
    if (newPin !== confirm)  { render.toast('New PINs do not match', 'error'); return; }
    if (!/^\d{4}$/.test(newPin)) { render.toast('PIN must be exactly 4 digits', 'error'); return; }
    try {
      await changePin(oldPin, newPin);
      render.toast('PIN changed ✓', 'success');
      e.target.reset(); closeModal('settings-modal');
    } catch { render.toast('Wrong current PIN', 'error'); }
  });

  // Export
  on('export-json-btn', 'click', handleExport);

  // Import
  on('import-json-btn', 'click', () => document.getElementById('import-file-input')?.click());
  on('import-file-input', 'change', handleImport);
}

// ─────────────────────────────────────────
// Export / Import
// ─────────────────────────────────────────
async function handleExport() {
  const pin = prompt('Enter your PIN to export:');
  if (pin === null) return;
  try {
    // Verify PIN by attempting decrypt
    await unlockWithPin(pin);
    const json = await exportJson();
    const d    = today();
    downloadFile(json, `HMS_Tracker_Backup_${d}.json`, 'application/json');
    settingsStore.setLastExportDate(d);
    render.toast('Backup exported ✓', 'success');
  } catch { render.toast('Wrong PIN — export cancelled', 'error'); }
}

async function handleImport(e) {
  const file = e.target.files[0]; if (!file) return;
  const pin = prompt('Enter your PIN to import:'); if (pin === null) return;
  try {
    await unlockWithPin(pin); // verify
    const text   = await file.text();
    const stores = await importJson(text);
    render.toast('Data imported ✓ — reloading', 'success');
    setTimeout(() => location.reload(), 1000);
  } catch { render.toast('Import failed — invalid file or wrong PIN', 'error'); }
  e.target.value = '';
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function on(id, event, handler) {
  document.getElementById(id)?.addEventListener(event, handler);
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function setTodayOnDates(form) {
  const t = today();
  form.querySelectorAll('input[type="date"]').forEach(el => { el.value = t; });
}

function refreshCurrentPage() {
  const cur = router.current();
  if (cur === 'dashboard') dashPage.refresh();
  else if (cur === 'expenses') expensesPage.refresh();
  else if (cur === 'assets')   assetsPage.refresh();
  else if (cur === 'goals')    goalsPage.refresh();
  else if (cur === 'zakat')    zakatPage.refresh();
}

function downloadFile(content, filename, type) {
  const a   = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(new Blob([content], { type })),
    download: filename,
  });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}

// ─────────────────────────────────────────
// Entry point — wait for DOM
// ─────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
