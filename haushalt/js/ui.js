export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const icons = {
  back: '<svg viewBox="0 0 24 24"><path d="M20 12H5m6-7-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  timer: '<svg viewBox="0 0 48 48"><circle cx="24" cy="27" r="17" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M19 5h10M24 5v5M24 18v10" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><circle cx="24" cy="28" r="2.6" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="9" fill="rgba(255,255,255,.25)" stroke="currentColor" stroke-width="3.5"/><path d="M13 25l8 8 15-17" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  list: '<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="9" fill="rgba(255,255,255,.25)" stroke="currentColor" stroke-width="3.5"/><circle cx="15" cy="15" r="3.4" fill="currentColor"/><circle cx="15" cy="24" r="3.4" fill="currentColor"/><circle cx="15" cy="33" r="3.4" fill="currentColor"/><path d="M22 15h14M22 24h14M22 33h14" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 48 48"><path d="M24 4l4 5 6-2 1 6 6 2-2 6 5 3-5 3 2 6-6 2-1 6-6-2-4 5-4-5-6 2-1-6-6-2 2-6-5-3 5-3-2-6 6-2 1-6 6 2z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" stroke-width="3.5"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.5v7M12 7v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  done: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="var(--tick, #3db37f)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up: '<svg viewBox="0 0 48 24"><path d="M4 20L24 6l20 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  kids: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10" r="1.4" fill="currentColor"/><circle cx="15.5" cy="10" r="1.4" fill="currentColor"/><path d="M7.5 14.5c2.5 3 6.5 3 9 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  speaker: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 20h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
};

let toastTimer;
export function toast(msg, { action, onAction, ms = 3200 } = {}) {
  const el = document.getElementById('toast');
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action)}</button>` : ''}`;
  el.classList.add('show');
  if (action) el.querySelector('button').onclick = () => { el.classList.remove('show'); onAction && onAction(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/** Bottom sheet. content: html string; bind(root, close) wires events. */
export function sheet(html, bind, { cls = '' } = {}) {
  const root = document.getElementById('overlay-root');
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-bg"></div><div class="sheet ${cls}" role="dialog" aria-modal="true"><div class="sheet-handle"></div>${html}</div>`;
  root.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  const close = () => {
    wrap.classList.remove('open');
    setTimeout(() => wrap.remove(), 220);
    document.removeEventListener('keydown', onKey);
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  wrap.querySelector('.sheet-bg').onclick = close;
  if (bind) bind(wrap.querySelector('.sheet'), close);
  return close;
}

export function confirmSheet(title, text, okLabel = 'OK', { danger = false } = {}) {
  return new Promise(res => {
    sheet(`<h3>${esc(title)}</h3><p class="muted">${esc(text)}</p>
      <div class="btn-row"><button class="btn grey" data-x="no">Abbrechen</button><button class="btn ${danger ? 'red' : 'orange'}" data-x="yes">${esc(okLabel)}</button></div>`,
    (el, close) => {
      el.querySelector('[data-x=no]').onclick = () => { close(); res(false); };
      el.querySelector('[data-x=yes]').onclick = () => { close(); res(true); };
    });
  });
}

export function infoSheet(title, text) {
  sheet(`<h3>${esc(title)}</h3><p class="muted pre">${esc(text)}</p><div class="btn-row"><button class="btn orange" data-x>Verstanden</button></div>`,
    (el, close) => { el.querySelector('[data-x]').onclick = close; });
}

export function toggle(name, on) {
  return `<label class="switch"><input type="checkbox" data-toggle="${name}" ${on ? 'checked' : ''}><span></span></label>`;
}

export function confetti(n = 70) {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#ff9500', '#34c759', '#1677f2', '#ff2d55', '#ffcc00', '#af52de'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.4 + 's';
    s.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = 0.95;
    u.pitch = 1.1;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('de'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}

export function vibrate(p = 30) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } }

export function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = [660, 880, 1046][i];
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.25);
    });
  } catch (e) { /* ignore */ }
}
