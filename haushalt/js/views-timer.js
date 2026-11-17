// Putz-Timer: short focused cleaning sessions with suggested due tasks.
import * as store from './store.js';
import * as L from './logic.js';
import { monsterSvg, MONSTER_NAME } from './art.js';
import { esc, beep, vibrate, confetti, native } from './ui.js';
import { appbar, bindCommon, taskRow, taskSheet } from './views-main.js';
import * as mascot from './mascot.js';

const KEY = 'blitzeblank.timer';
function getT() { try { return JSON.parse(localStorage.getItem(KEY)) || { mins: 15 }; } catch (e) { return { mins: 15 }; } }
function setT(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }

function remaining(t) {
  if (t.endAt) return Math.max(0, t.endAt - Date.now());
  if (t.pausedLeft != null) return t.pausedLeft;
  return t.mins * 60000;
}
const fmt = ms => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

let ticker = null;
export function startTimerWatcher() {
  // fires the alarm even if the user is on another screen
  setInterval(() => {
    const t = getT();
    if (t.endAt && Date.now() >= t.endAt) {
      setT({ mins: t.mins });
      beep(); vibrate([200, 100, 200]); confetti(50); mascot.react('timerDone');
      try { if (!native && Notification.permission === 'granted') new Notification('Blitzeblank', { body: `Zeit um! ${MONSTER_NAME} ist beeindruckt.`, icon: 'icons/icon-192.png' }); } catch (e) { /* ignore */ }
      window.dispatchEvent(new Event('bb:render'));
    }
  }, 1000);
}

export function timerView() {
  const t = getT();
  const running = !!t.endAt;
  const left = remaining(t);
  const total = t.mins * 60000;
  const frac = 1 - left / total;
  const C = 2 * Math.PI * 88;
  const due = L.sortTasks(store.all('tasks').filter(x => !x.anytime && L.isDue(x))).slice(0, 8);
  return {
    html: `${appbar('Putz-Timer', { backTo: '/' })}
      <main class="content timer">
        <div class="ring-wrap">
          <svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" class="ring-bg"/><circle cx="100" cy="100" r="88" class="ring-fg" data-ring stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
          <div class="ring-center"><b data-left>${fmt(left)}</b><span>${running ? 'Los, los, los!' : t.pausedLeft != null ? 'Pausiert' : 'Bereit?'}</span></div>
        </div>
        ${!running && t.pausedLeft == null ? `<div class="chips center">${[5, 10, 15, 20, 30, 45].map(m => `<button class="chip ${m === t.mins ? 'on' : ''}" data-m="${m}">${m} Min.</button>`).join('')}</div>` : ''}
        <div class="btn-row">
          ${running ? '<button class="btn grey" data-pause>Pause</button>' : `<button class="btn orange big" data-start>${t.pausedLeft != null ? 'Weiter' : 'Start'}</button>`}
          ${running || t.pausedLeft != null ? '<button class="btn light" data-reset>Zurücksetzen</button>' : ''}
        </div>
        <div class="timer-tip">${monsterSvg(running ? 'shock' : 'taunt', 'mini-mon', { tickle: true, say: '.timer-tip p' })}<p>${running ? `${MONSTER_NAME}: „Wie, ihr putzt jetzt einfach drauflos?!“` : `Schnapp dir ein paar fällige Aufgaben und erledige sie, bevor der Timer abläuft.`}</p></div>
        ${due.length ? `<h2 class="sec">Jetzt fällig</h2><div class="card-list">${due.map(x => taskRow(x, { showArea: true, quick: true })).join('')}</div>` : ''}
      </main>`,
    bind(root) {
      bindCommon(root);
      root.querySelectorAll('[data-m]').forEach(b => (b.onclick = () => { setT({ mins: Number(b.dataset.m) }); window.dispatchEvent(new Event('bb:render')); }));
      const start = root.querySelector('[data-start]');
      if (start) start.onclick = () => {
        const cur = getT();
        const endAt = Date.now() + remaining(cur);
        setT({ mins: cur.mins, endAt });
        mascot.react('timerStart');
        if (native) native.scheduleAlarm(endAt, 'Putz-Timer: Zeit um! ⏰', `${MONSTER_NAME} ist beeindruckt. Gut gemacht!`);
        try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) { /* ignore */ }
        window.dispatchEvent(new Event('bb:render'));
      };
      const pause = root.querySelector('[data-pause]');
      if (pause) pause.onclick = () => { if (native) native.cancelAlarm(); const cur = getT(); setT({ mins: cur.mins, pausedLeft: remaining(cur) }); window.dispatchEvent(new Event('bb:render')); };
      const reset = root.querySelector('[data-reset]');
      if (reset) reset.onclick = () => { if (native) native.cancelAlarm(); setT({ mins: getT().mins }); window.dispatchEvent(new Event('bb:render')); };
      root.querySelectorAll('[data-task]').forEach(r => (r.onclick = e => { if (!e.target.closest('[data-quick]')) taskSheet(r.dataset.task); }));
      root.querySelectorAll('[data-quick]').forEach(b => (b.onclick = () => taskSheet(b.dataset.quick)));
      clearInterval(ticker);
      ticker = setInterval(() => {
        const el = root.querySelector('[data-left]');
        if (!el || !el.isConnected) { clearInterval(ticker); return; }
        const cur = getT();
        const l = remaining(cur);
        el.textContent = fmt(l);
        root.querySelector('[data-ring]').setAttribute('stroke-dashoffset', C * (l / (cur.mins * 60000)));
      }, 250);
    },
  };
}
