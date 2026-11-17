import * as store from './store.js';
import * as L from './logic.js';
import * as sync from './sync.js';
import { ROOM_TYPES, AREA_COLORS, monsterSvg, roomSvg, MONSTER_NAME } from './art.js';
import { esc } from './ui.js';
import { go } from './router.js';
import { homeView, areaView, todoView, listView } from './views-main.js';
import { areaEditView, taskEditView, managerView } from './views-edit.js';
import * as S from './views-settings.js';
import { kidsView } from './views-kids.js';
import { timerView, startTimerWatcher } from './views-timer.js';

const routes = [
  [/^\/$/, () => homeView()],
  [/^\/area-new$/, () => areaEditView(null)],
  [/^\/area\/(\w+)$/, id => areaView(id)],
  [/^\/area\/(\w+)\/edit$/, id => areaEditView(id)],
  [/^\/area\/(\w+)\/new-task$/, id => taskEditView(null, id)],
  [/^\/task\/(\w+)$/, id => taskEditView(id)],
  [/^\/todo$/, () => todoView('all')],
  [/^\/todo\/mine$/, () => todoView('mine')],
  [/^\/list$/, () => listView()],
  [/^\/manager$/, () => managerView()],
  [/^\/timer$/, () => timerView()],
  [/^\/settings$/, () => S.settingsView()],
  [/^\/settings\/persons$/, () => S.personsView()],
  [/^\/settings\/me$/, () => S.meView()],
  [/^\/settings\/fairshare$/, () => S.fairshareView()],
  [/^\/settings\/responsibility$/, () => S.responsibilityView()],
  [/^\/settings\/monster$/, () => S.monsterView()],
  [/^\/settings\/vacation$/, () => S.vacationView()],
  [/^\/settings\/kids$/, () => S.kidsSettingsView()],
  [/^\/settings\/sync$/, () => S.syncView()],
  [/^\/join\/(.+)$/, p => S.joinView(p)],
  [/^\/stats$/, () => S.statsView()],
  [/^\/kids$/, () => kidsView(null)],
  [/^\/kids\/(\w+)$/, id => kidsView(id)],
  [/^\/welcome$/, () => welcomeView()],
];

const app = document.getElementById('app');
let current = { path: null, view: null };

function path() { return decodeURIComponent(location.hash.slice(1)) || '/'; }

function render(force = false) {
  let p = path();
  // kids are locked into kids mode until a grown-up solves the gate
  if (sessionStorage.getItem('bb.kids') === '1' && !p.startsWith('/kids')) { go('/kids', { replace: true }); return; }
  if (!store.settings().setupDone && !store.all('areas').length && !p.startsWith('/join') && p !== '/welcome') { go('/welcome', { replace: true }); return; }
  const same = current.path === p;
  if (same && current.view?.static && !force) return;
  const scroller = app.querySelector('.content');
  const scroll = same && scroller ? scroller.scrollTop : 0;
  let view = null;
  for (const [re, fn] of routes) {
    const m = p.match(re);
    if (m) { view = fn(...m.slice(1)); break; }
  }
  if (!view) { go('/', { replace: true }); return; }
  app.innerHTML = view.html;
  app.className = p.startsWith('/kids') ? 'kids-mode' : '';
  view.bind && view.bind(app);
  const sc = app.querySelector('.content');
  if (sc) sc.scrollTop = scroll;
  current = { path: p, view };
  const bar = app.querySelector('.appbar');
  const meta = document.querySelector('meta[name=theme-color]');
  const barColor = bar ? getComputedStyle(bar).backgroundColor : (app.querySelector('.kids-bar') ? '#ff9500' : '#1677f2');
  if (meta) meta.content = barColor;
  if (window.BlitzeblankAndroid) { try { window.BlitzeblankAndroid.setBarColor(rgbToHex(barColor)); } catch (e) { /* ignore */ } }
}

function rgbToHex(c) {
  const m = String(c).match(/\d+/g);
  if (!m || c.startsWith('#')) return c;
  return '#' + m.slice(0, 3).map(n => Number(n).toString(16).padStart(2, '0')).join('');
}

// Android back button: close a sheet first, then go back inside the app
window.bbBack = () => {
  const sheets = document.querySelectorAll('#overlay-root .sheet-wrap');
  if (sheets.length) { sheets[sheets.length - 1].querySelector('.sheet-bg').click(); return true; }
  const p = path();
  if (p.startsWith('/kids')) return true; // kids can't leave without the grown-up gate
  if (p !== '/' && p !== '/welcome') { history.length > 1 ? history.back() : go('/', { replace: true }); return true; }
  return false;
};

// ---------------- first start ----------------
function welcomeView() {
  const preset = new Set(['kueche', 'wohnzimmer', 'schlafzimmer', 'badezimmer', 'flur', 'allgemein']);
  const all = [...ROOM_TYPES.innen, ...ROOM_TYPES.aussen];
  return {
    static: true,
    html: `<main class="content welcome">
      <div class="wel-hero">${monsterSvg('taunt', 'wel-mon')}<h1>Willkommen bei Blitzeblank!</h1>
        <p>Ich bin <b>${MONSTER_NAME}</b> und mache euer Zuhause jeden Tag ein bisschen schmutziger. Wetten, ihr kommt nicht hinterher? 😈</p></div>
      <h2 class="sec">Welche Bereiche habt ihr?</h2>
      <div class="wel-grid">${all.map(([k, n], i) => `<button class="wel-room ${preset.has(k) ? 'on' : ''}" data-r="${k}" style="--c:${AREA_COLORS[i % AREA_COLORS.length]}">${roomSvg(k, 'wel-art')}<span>${esc(n)}</span></button>`).join('')}</div>
      <p class="group-foot">Für jeden Bereich schlage ich passende Aufgaben vor. Ihr könnt alles später ändern.</p>
      <div class="btn-row"><button class="btn orange big" data-start>Los geht's</button></div>
      <p class="group-foot center">Schon ein Haushalt auf einem anderen Handy? Öffne dort <i>Einstellungen → Synchronisation</i> und dann den Einladungslink hier.</p>
    </main>`,
    bind(root) {
      root.querySelectorAll('[data-r]').forEach(b => (b.onclick = () => { b.classList.toggle('on'); preset.has(b.dataset.r) ? preset.delete(b.dataset.r) : preset.add(b.dataset.r); }));
      root.querySelector('[data-start]').onclick = () => {
        let i = 0;
        all.forEach(([k, n]) => { if (preset.has(k)) L.createArea({ name: n, type: k, color: AREA_COLORS[i++ % AREA_COLORS.length] }); });
        store.setSettings({ setupDone: true, raceStart: Date.now() });
        go('/', { replace: true });
      };
    },
  };
}

// ---------------- boot ----------------
store.load();
store.subscribe(() => render());
window.addEventListener('hashchange', () => { document.getElementById('overlay-root').innerHTML = ''; render(true); });
window.addEventListener('bb:render', () => render(true));
// refresh dirt levels every minute and when the app comes back to the foreground
setInterval(() => { if (!document.hidden && !current.view?.static) render(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { L.finalizeRaces(); render(); } });

L.finalizeRaces();
render(true);
startTimerWatcher();
sync.start();
