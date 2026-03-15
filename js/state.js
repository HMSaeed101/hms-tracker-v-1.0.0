// js/state.js — single shared in-memory store object
// All stores read/write this object. data.js encrypts it on save.
// This eliminates the re-decrypt-on-every-save bug.

const _state = {
  stores: null,       // populated after unlock
  saveCallback: null, // called after every persist
};

export function getStores() {
  return _state.stores;
}

export function setStores(stores) {
  _state.stores = stores;
}

export function onSaveHook(fn) {
  _state.saveCallback = fn;
}

export function fireSaveHook() {
  if (_state.saveCallback) _state.saveCallback();
}
