// Putz-Timer: short focused cleaning sessions.
// - pick due tasks to focus on, they stay pinned while the timer runs
// - alarm: sound, vibration or both (per device, store.local().alarmMode)
// - synced with the Wear OS watch app via the native bridge (Wearable Data Layer)
import * as store from './store.js';
import * as L from './logic.js';
import { monsterSvg, MONSTER_NAME } from './art.js';
import { esc, beep, confetti, native } from './ui.js';
import { appbar, bindCommon, taskRow, taskSheet } from './views-main.js';
import * as mascot from './mascot.js';

const KEY = 'blitzeblank.timer';
const MODES = [['sound', '🔔 Ton'], ['vibrate', '📳 Vibration'], ['both', '🔔📳 Beides']];

export function getT() { try { return JSON.parse(localStorage.getItem(KEY)) || { mins: 15, focus: [] }; } catch (e) { return { mins: 15, focus: [] }; } }
/** Saves the timer. `bump` marks a user change (newer version wins on phone and watch). */
function setT(v, bump = true) {
  const cur = getT();
  const next = { focus: cur.focus || [], ...v };
  if (bump) next.v = Date.now(); else next.v = v.v ?? cur.v ?? 0;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
  return next;
}
export function alarmMode() { const m = store.local().alarmMode; return MODES.some(x => x[0] === m) ? m : 'both'; }

function remaining(t) {
  if (t.endAt) return Math.max(0, t.endAt - Date.now());
  if (t.pausedLeft != null) return t.pausedLeft;
  return t.mins * 60000;
}
const fmt = ms => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const rerender = () => window.dispatchEvent(new Event('bb:render'));

const dueTasks = () => L.sortTasks(store.all('tasks').filter(x => !x.anytime && L.isDue(x)));
/** done during the current session? */
function doneSince(id, since) { return !!since && store.all('completions').some(c => c.taskId === id && c.at >= since); }
function focusTasks(t) { return (t.focus || []).map(id => store.get('tasks', id)).filter(Boolean); }

// ---------- alarm ----------
function ring() {
  // three little "ding-ding-ding" bursts
  [0, 900, 1800].forEach(d => setTimeout(beep, d));
}
function buzz() { try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 400]); } catch (e) { /* ignore */ } }
function webAlarm(mode) { if (mode !== 'vibrate') ring(); if (mode !== 'sound') buzz(); }
function preview(mode) {
  if (native && native.previewAlarm) { native.previewAlarm(mode); return; }
  if (mode !== 'vibrate') beep();
  if (mode !== 'sound') { try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (e) { /* ignore */ } }
}
function scheduleNative(t) {
  if (!native) return;
  const f = focusTasks(t);
  const body = f.length ? `Fokus: ${f.map(x => x.name).join(', ')}` : `${MONSTER_NAME} ist beeindruckt. Gut gemacht!`;
  if (native.scheduleTimer) native.scheduleTimer(t.endAt, 'Putz-Timer: Zeit um! ⏰', body, alarmMode());
  else native.scheduleAlarm(t.endAt, 'Putz-Timer: Zeit um! ⏰', body);
}
const cancelNative = () => { if (native) native.cancelAlarm(); };

// ---------- watch sync ----------
let lastPushed = '';
function watchState() {
  const t = getT();
  const since = t.startedAt;
  const row = x => {
    const area = store.get('areas', x.areaId);
    return { id: x.id, name: x.name, area: area ? area.name : '', color: L.barColor(x), fill: Math.round(L.barFill(x) * 100) / 100, text: L.dueText(x), done: doneSince(x.id, since) };
  };
  return {
    timer: { mins: t.mins, endAt: t.endAt || 0, pausedLeft: t.pausedLeft ?? -1, focus: t.focus || [], startedAt: t.startedAt || 0, v: t.v || 0 },
    mode: alarmMode(),
    focus: focusTasks(t).map(row),
    due: dueTasks().slice(0, 25).map(row),
  };
}
export function pushWatch(force = false) {
  if (!native || !native.wearSync) return;
  try {
    const s = JSON.stringify(watchState());
    if (!force && s === lastPushed) return;
    lastPushed = s;
    native.wearSync(s);
  } catch (e) { /* ignore */ }
}
/** Timer change coming from the watch (the native side already scheduled/cancelled the phone alarm). */
function applyWatchTimer(json) {
  try {
    const w = typeof json === 'string' ? JSON.parse(json) : json;
    const before = getT();
    if (!w || !w.v || w.v <= (before.v || 0)) return false;
    setT({
      mins: w.mins || 15,
      endAt: w.endAt > Date.now() ? w.endAt : undefined,
      pausedLeft: w.pausedLeft >= 0 ? w.pausedLeft : undefined,
      focus: Array.isArray(w.focus) ? w.focus : getT().focus,
      startedAt: w.startedAt || undefined,
      v: w.v,
    }, false);
    if (w.endAt > Date.now() && !before.endAt) mascot.react('timerStart');
    rerender();
    return true;
  } catch (e) { return false; }
}

export function startTimerWatcher() {
  window.__bbWatchTimer = applyWatchTimer;
  if (native && native.watchTimer) applyWatchTimer(native.watchTimer());
  // fires the alarm even if the user is on another screen
  setInterval(() => {
    const t = getT();
    if (t.endAt && Date.now() >= t.endAt) {
      const f = focusTasks(t);
      const done = f.filter(x => doneSince(x.id, t.startedAt)).length;
      setT({ mins: t.mins, focus: t.focus, startedAt: t.startedAt, lastResult: f.length ? { done, of: f.length } : null }, false);
      if (!native) webAlarm(alarmMode()); // the app's native alarm rings itself
      confetti(50); mascot.react('timerDone');
      try { if (!native && Notification.permission === 'granted') new Notification('Blitzeblank', { body: 'Putz-Timer: Zeit um!', icon: 'icons/icon-192.png' }); } catch (e) { /* ignore */ }
      rerender();
    }
    pushWatch();
  }, 1000);
  store.subscribe(() => setTimeout(pushWatch, 50));
}

// ---------- view ----------
let ticker = null;
let picking = false;

function pickRow(x, on) {
  const area = store.get('areas', x.areaId);
  return `<button class="pick-row ${on ? 'on' : ''}" data-pick="${x.id}" aria-pressed="${on}">
    <span class="pick-box">${on ? '✓' : ''}</span>
    <span class="pick-main"><b>${esc(x.name)}</b>${area ? `<small>${esc(area.name)}</small>` : ''}</span>
    <span class="pick-bar"><i style="width:${Math.round(L.barFill(x) * 100)}%;background:${L.barColor(x)}"></i></span>
  </button>`;
}

export function timerView() {
  const t = getT();
  const running = !!t.endAt;
  const paused = !running && t.pausedLeft != null;
  const active = running || paused;
  const left = remaining(t);
  const total = t.mins * 60000;
  const frac = 1 - left / total;
  const C = 2 * Math.PI * 88;
  const due = dueTasks();
  const focusIds = new Set(t.focus || []);
  const focus = focusTasks(t);
  const fDone = focus.filter(x => doneSince(x.id, t.startedAt)).length;
  const others = due.filter(x => !focusIds.has(x.id));
  const mode = alarmMode();

  let focusHtml = '';
  if (!active) {
    const sel = due.filter(x => focusIds.has(x.id));
    focusHtml = due.length
      ? `<h2 class="sec">Worauf konzentrierst du dich?</h2>
         <p class="pick-hint">${sel.length ? `<b>${sel.length}</b> ausgewählt – die bleiben während des Timers oben.` : 'Tipp die fälligen Aufgaben an, die du in dieser Runde schaffen willst.'}${sel.length ? ' <button class="linkbtn" data-clear>Auswahl leeren</button>' : ''}</p>
         <div class="pick-list">${due.map(x => pickRow(x, focusIds.has(x.id))).join('')}</div>`
      : '<p class="pick-hint">Gerade ist nichts fällig. Du kannst den Timer trotzdem starten.</p>';
  } else if (focus.length) {
    focusHtml = `<h2 class="sec">Dein Fokus <span class="focus-count">${fDone} von ${focus.length}</span></h2>
      <div class="card-list focus-list">${focus.map(x => doneSince(x.id, t.startedAt)
        ? `<div class="task-row focus-done" data-task="${x.id}"><span class="quick-check done">✓</span><div class="task-main"><div class="task-name">${esc(x.name)}</div><div class="task-under">Geschafft!</div></div></div>`
        : taskRow(x, { showArea: true, quick: true })).join('')}</div>
      ${others.length ? `<button class="btn light small" data-morepick>${picking ? 'Fertig' : '+ Weitere Aufgabe in den Fokus'}</button>` : ''}
      ${picking ? `<div class="pick-list">${others.map(x => pickRow(x, false)).join('')}</div>` : ''}`;
  } else if (due.length) {
    focusHtml = `<h2 class="sec">Jetzt fällig</h2><div class="card-list">${due.slice(0, 8).map(x => taskRow(x, { showArea: true, quick: true })).join('')}</div>`;
  }

  const result = !active && t.lastResult ? `<div class="timer-result">Letzte Runde: <b>${t.lastResult.done} von ${t.lastResult.of}</b> Fokus-Aufgaben geschafft${t.lastResult.done === t.lastResult.of ? ' 🎉' : ''}</div>` : '';
  const tip = running
    ? (focus.length && fDone === focus.length ? `${MONSTER_NAME}: „Alles erledigt?! Das war doch nicht abgesprochen!“` : `${MONSTER_NAME}: „Wie, ihr putzt jetzt einfach drauflos?!“`)
    : 'Wähle fällige Aufgaben als Fokus und erledige sie, bevor der Timer klingelt.';

  return {
    html: `${appbar('Putz-Timer', { backTo: '/' })}
      <main class="content timer">
        <div class="ring-wrap">
          <svg class="ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" class="ring-bg"/><circle cx="100" cy="100" r="88" class="ring-fg" data-ring stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
          <div class="ring-center"><b data-left>${fmt(left)}</b><span>${running ? 'Los, los, los!' : paused ? 'Pausiert' : 'Bereit?'}</span>${focus.length && active ? `<small class="ring-focus">Fokus ${fDone}/${focus.length}</small>` : ''}</div>
        </div>
        ${!active ? `<div class="chips center">${[5, 10, 15, 20, 30, 45].map(m => `<button class="chip ${m === t.mins ? 'on' : ''}" data-m="${m}">${m} Min.</button>`).join('')}</div>` : ''}
        <div class="btn-row">
          ${running ? '<button class="btn grey" data-pause>Pause</button>' : `<button class="btn orange big" data-start>${paused ? 'Weiter' : focusIds.size && due.some(x => focusIds.has(x.id)) ? `Start mit ${due.filter(x => focusIds.has(x.id)).length} Aufgabe${due.filter(x => focusIds.has(x.id)).length === 1 ? '' : 'n'}` : 'Start'}</button>`}
          ${active ? '<button class="btn light" data-reset>Zurücksetzen</button>' : ''}
        </div>
        ${result}
        <div class="alarm-mode"><span>Wenn die Zeit um ist:</span><div class="chips center">${MODES.map(([k, l]) => `<button class="chip ${k === mode ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('')}</div></div>
        ${focusHtml}
        <div class="timer-tip">${monsterSvg(running ? 'shock' : 'taunt', 'mini-mon', { tickle: true, say: '.timer-tip p' })}<p>${tip}</p></div>
        ${native && native.wearSync ? '<p class="watch-hint">⌚ Läuft synchron mit der Blitzeblank-App auf deiner Uhr.</p>' : ''}
      </main>`,
    bind(root) {
      bindCommon(root);
      const change = (patch, after) => { const n = setT({ ...getT(), ...patch }); if (after) after(n); pushWatch(true); rerender(); };
      root.querySelectorAll('[data-m]').forEach(b => (b.onclick = () => change({ mins: Number(b.dataset.m), endAt: undefined, pausedLeft: undefined })));
      root.querySelectorAll('[data-mode]').forEach(b => (b.onclick = () => {
        store.setLocal({ alarmMode: b.dataset.mode });
        preview(b.dataset.mode);
        const cur = getT();
        if (cur.endAt) scheduleNative(cur); // re-arm with the new signal
        pushWatch(true);
        rerender();
      }));
      root.querySelectorAll('[data-pick]').forEach(b => (b.onclick = () => {
        const id = b.dataset.pick;
        const f = new Set(getT().focus || []);
        f.has(id) ? f.delete(id) : f.add(id);
        change({ focus: [...f] });
      }));
      const clear = root.querySelector('[data-clear]');
      if (clear) clear.onclick = () => change({ focus: [] });
      const more = root.querySelector('[data-morepick]');
      if (more) more.onclick = () => { picking = !picking; rerender(); };
      const start = root.querySelector('[data-start]');
      if (start) start.onclick = () => {
        const cur = getT();
        const fresh = cur.pausedLeft == null;
        // only keep focus tasks that are still due when starting fresh
        const dueIds = new Set(dueTasks().map(x => x.id));
        const focusNow = fresh ? (cur.focus || []).filter(id => dueIds.has(id)) : cur.focus || [];
        picking = false;
        change({ endAt: Date.now() + remaining(cur), pausedLeft: undefined, focus: focusNow, startedAt: fresh ? Date.now() : cur.startedAt, lastResult: null }, scheduleNative);
        mascot.react('timerStart');
        try { if (!native && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) { /* ignore */ }
      };
      const pause = root.querySelector('[data-pause]');
      if (pause) pause.onclick = () => { cancelNative(); const cur = getT(); change({ endAt: undefined, pausedLeft: remaining(cur) }); };
      const reset = root.querySelector('[data-reset]');
      if (reset) reset.onclick = () => { cancelNative(); picking = false; change({ endAt: undefined, pausedLeft: undefined, startedAt: undefined }); };
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
