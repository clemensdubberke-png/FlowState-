import * as store from './store.js';
import * as L from './logic.js';
import * as sync from './sync.js';
import { ROOM_TYPES, AREA_COLORS, monsterSvg, roomSvg, MONSTER_NAME } from './art.js';
import { esc } from './ui.js';
import { go } from './router.js';
import { homeView, areaView, todoView, listView } from './views-main.js';
import { areaEditView, taskEditView, managerView, catalogView } from './views-edit.js';
import * as S from './views-settings.js';
import { kidsView } from './views-kids.js';
import { timerView, startTimerWatcher } from './views-timer.js';
import { intensityWidget, bindIntensity, intensityView } from './views-intensity.js';
import * as mascot from './mascot.js';

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
  [/^\/settings\/intensity$/, () => intensityView()],
  [/^\/area\/(\w+)\/catalog$/, id => catalogView(id)],
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
  if (!store.settings().setupDone && !store.all('areas').length && !p.startsWith('/join') && !p.startsWith('/settings/sync') && p !== '/welcome') { go('/welcome', { replace: true }); return; }
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
  if (p.startsWith('/kids')) { if (sessionStorage.getItem('bb.kids') === '1') import('./views-kids.js').then(m => m.exitGate()); else go('/', { replace: true }); return true; }
  if (p !== '/' && p !== '/welcome') { history.length > 1 ? history.back() : go('/', { replace: true }); return true; }
  return false;
};

// ---------------- first start ----------------
function welcomeView() {
  let level = 2;
  return {
    static: true,
    html: `<main class="content welcome">
      <div class="wel-hero"><h1>Willkommen bei Blitzeblank!</h1>
        <p>Ich bin <b>${MONSTER_NAME}</b> und mache euer Zuhause jeden Tag ein bisschen schmutziger. Wetten, ihr kommt nicht hinterher? 😈</p></div>
      <h2 class="sec">Wie intensiv wollt ihr putzen?</h2>
      ${intensityWidget(level)}
      <p class="group-foot">Danach richten sich die vorgeschlagenen Frequenzen. Ihr könnt das später unter <i>Einstellungen → Putz-Intensität</i> ändern und jede Aufgabe einzeln anpassen.</p>
      <div class="btn-row"><button class="btn orange big" data-start>Los geht's</button></div>
      <p class="group-foot center small">Schon ein Haushalt auf einem anderen Handy? Dann dort unter <i>Einstellungen → Synchronisation</i> den Einladungslink holen und hier einfügen: <a href="#/settings/sync" data-later>Einladung einfügen</a></p>
    </main>`,
    bind(root) {
      bindIntensity(root, l => (level = l));
      root.querySelector('[data-start]').onclick = () => {
        store.setSettings({ setupDone: true, raceStart: Date.now(), intensity: level, kidDefaultsOff: true, legacyMigrated: true });
        go('/', { replace: true });
        mascot.react('areaHint', { delay: 700, force: true });
      };
      root.querySelector('[data-later]').onclick = e => { e.preventDefault(); store.setSettings({ setupDone: true, raceStart: Date.now(), intensity: level }); go('/settings/sync'); };
    },
  };
}

// ---------------- boot ----------------
store.load();
store.subscribe(() => render());
window.addEventListener('hashchange', () => { document.getElementById('overlay-root').innerHTML = ''; render(true); });
window.addEventListener('bb:render', () => render(true));
// refresh dirt levels every minute and when the app comes back to the foreground
setInterval(() => { if (!document.hidden) L.monsterScan(); if (!document.hidden && !current.view?.static) render(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { L.monsterScan(); L.finalizeRaces(); render(); } });

L.migrateKidDefaults();
L.migrateLegacy();
L.monsterScan();
L.finalizeRaces();
render(true);
startTimerWatcher();
sync.start();
if (store.settings().setupDone && !sessionStorage.getItem('bb.kids')) mascot.greet();
