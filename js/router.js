// js/router.js — hash routing

const routes = {};
let currentRoute = null;

export function register(hash, handler) {
  routes[hash] = handler;
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function current() {
  return currentRoute;
}

function resolve() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  if (currentRoute === hash) return;
  currentRoute = hash;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.route === hash);
  });

  // Show target page
  const page = document.getElementById(`page-${hash}`);
  if (page) page.classList.add('active');

  // Call route handler
  if (routes[hash]) routes[hash](hash);
}

export function init() {
  window.addEventListener('hashchange', resolve);
  resolve(); // handle initial load
}
