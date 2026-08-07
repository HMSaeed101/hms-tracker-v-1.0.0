// js/data.js — AES-GCM encrypt/decrypt, localStorage + IndexedDB I/O
// Web Crypto API — PBKDF2-SHA256 (100k iterations) + AES-GCM 256-bit

import { getStores, setStores } from './state.js';

const STORAGE_KEY   = 'hms_enc';
const IDB_DB        = 'hms_shadow';
const IDB_STORE     = 'blob';
export const SCHEMA_VERSION = '1.0';

let _masterKey = null;

function buf2hex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function hex2buf(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.substr(i,2), 16);
  return arr.buffer;
}
function buf2b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function b642buf(b64) { return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer; }

export async function deriveKey(pin, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pin), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function aesEncrypt(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  return buf2hex(iv) + ':' + buf2b64(ct);
}

async function aesDecrypt(key, blob) {
  const sep = blob.indexOf(':');
  const iv  = new Uint8Array(hex2buf(blob.slice(0, sep)));
  const ct  = b642buf(blob.slice(sep + 1));
  const pt  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

export function setMasterKey(key) { _masterKey = key; }
export function clearMasterKey()  { _masterKey = null; }
export function isUnlocked()      { return _masterKey !== null; }
export function isFirstRun()      { return !localStorage.getItem('hms_salt'); }

export function buildEmptyStores() {
  return {
    assets:       { cash: [], physical: [], investments: [], liabilities: [] },
    transactions: [],
    goals:        [],
    settings:     { rates: { usdPKR: 278.5, lastUpdated: null }, theme: 'dark', lastExportDate: null, snapshots: [] },
  };
}

export async function setupPin(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem('hms_salt', buf2hex(salt));
  const key = await deriveKey(pin, salt);
  setMasterKey(key);
  setStores(buildEmptyStores());
  await persistStores();
  return key;
}

export async function unlockWithPin(pin) {
  const saltHex = localStorage.getItem('hms_salt');
  if (!saltHex) throw new Error('NO_SALT');
  const salt = new Uint8Array(hex2buf(saltHex));
  const key  = await deriveKey(pin, salt);
  const blob = localStorage.getItem(STORAGE_KEY) || await idbGet();
  if (!blob) { setMasterKey(key); setStores(buildEmptyStores()); return key; }
  try {
    const json   = await aesDecrypt(key, blob);
    const data   = JSON.parse(json);
    const stores = data.version === SCHEMA_VERSION ? data.stores : migrateData(data);
    setMasterKey(key);
    setStores(fillDefaults(stores));
    return key;
  } catch { throw new Error('WRONG_PIN'); }
}

export async function persistStores() {
  if (!_masterKey) throw new Error('LOCKED');
  const blob = await aesEncrypt(_masterKey, JSON.stringify({ version: SCHEMA_VERSION, lastUpdated: new Date().toISOString(), stores: getStores() }));
  localStorage.setItem(STORAGE_KEY, blob);
  idbPut(blob).catch(() => {});
}

export async function changePin(oldPin, newPin) {
  const saltHex = localStorage.getItem('hms_salt');
  if (!saltHex) throw new Error('NO_SALT');
  const oldKey = await deriveKey(oldPin, new Uint8Array(hex2buf(saltHex)));
  const blob   = localStorage.getItem(STORAGE_KEY);
  if (blob) { try { await aesDecrypt(oldKey, blob); } catch { throw new Error('WRONG_PIN'); } }
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem('hms_salt', buf2hex(newSalt));
  setMasterKey(await deriveKey(newPin, newSalt));
  await persistStores();
}

export async function exportJson() {
  if (!_masterKey) throw new Error('LOCKED');
  return JSON.stringify({ version: SCHEMA_VERSION, exported: new Date().toISOString(), stores: getStores() }, null, 2);
}

export async function importJson(jsonStr) {
  const data   = JSON.parse(jsonStr);
  const stores = fillDefaults(data.stores || data);
  setStores(stores);
  await persistStores();
  return stores;
}

function fillDefaults(stores) {
  const e = buildEmptyStores();
  return {
    assets:       { ...e.assets,    ...(stores.assets    || {}) },
    transactions: stores.transactions || [],
    goals:        stores.goals        || [],
    settings:     { ...e.settings,  ...(stores.settings  || {}) },
  };
}

function migrateData(data) { return fillDefaults(data.stores || {}); }

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = () => reject(req.error);
  });
}
async function idbPut(blob) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, 'blob');
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}
async function idbGet() {
  try {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const req = db.transaction(IDB_STORE,'readonly').objectStore(IDB_STORE).get('blob');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => reject(req.error);
    });
  } catch { return null; }
}

export async function wipeAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('hms_salt');
  localStorage.removeItem('hms_theme');
  clearMasterKey();
  try {
    const db = await idbOpen();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
  } catch {}
}
