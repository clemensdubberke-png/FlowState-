export function go(path, { replace = false } = {}) {
  const h = '#' + path;
  if (replace) location.replace(h); else location.hash = h;
}
export function back(fallback = '/') {
  if (history.length > 1 && sessionStorage.getItem('bb.nav') === '1') history.back();
  else go(fallback, { replace: true });
}
window.addEventListener('hashchange', () => sessionStorage.setItem('bb.nav', '1'));
