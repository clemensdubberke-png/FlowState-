// Schmuddel reacts to what you do: pops up with an animation and a line.
import * as store from './store.js';
import { monsterSvg, MONSTER_NAME } from './art.js';
import { LINES } from './lines.js';
import { esc, speak } from './ui.js';
import * as L from './logic.js';

// event -> how Schmuddel looks and moves
const REACT = {
  done: { mood: 'shock', anim: 'a-shrink' },
  doneOverdue: { mood: 'angry', anim: 'a-stomp' },
  doneHard: { mood: 'shock', anim: 'a-faint' },
  doneAnytime: { mood: 'sad', anim: 'a-sigh' },
  allDone: { mood: 'sad', anim: 'a-melt' },
  goal: { mood: 'sad', anim: 'a-melt' },
  leadFlip: { mood: 'angry', anim: 'a-stomp' },
  undo: { mood: 'happy', anim: 'a-jump' },
  postpone: { mood: 'happy', anim: 'a-dance' },
  dirty: { mood: 'happy', anim: 'a-dance' },
  vacationOn: { mood: 'shock', anim: 'a-jump' },
  vacationOff: { mood: 'wave', anim: 'a-jump' },
  timerStart: { mood: 'taunt', anim: 'a-dance' },
  timerDone: { mood: 'shock', anim: 'a-jump' },
  areaCreated: { mood: 'happy', anim: 'a-jump' },
  taskCreated: { mood: 'taunt', anim: 'a-sigh' },
  taskDeleted: { mood: 'happy', anim: 'a-dance' },
  tickle: { mood: 'happy', anim: 'a-wiggle' },
  dirtyRoom: { mood: 'happy', anim: 'a-dance' },
  areaHint: { mood: 'wave', anim: 'a-jump' },
  catalogAdd: { mood: 'shock', anim: 'a-shrink' },
  tickleMany: { mood: 'angry', anim: 'a-stomp' },
  greetMorning: { mood: 'wave', anim: 'a-jump' },
  greetDay: { mood: 'wave', anim: 'a-jump' },
  greetEvening: { mood: 'wave', anim: 'a-jump' },
  greetNight: { mood: 'wave', anim: 'a-sigh' },
  greetAway: { mood: 'taunt', anim: 'a-dance' },
  kids: { mood: 'taunt', anim: 'a-jump' },
  kidStep: { mood: 'shock', anim: 'a-shrink' },
  kidDone: { mood: 'sad', anim: 'a-melt' },
};

const last = {};
export function line(kind) {
  const list = LINES[kind] || LINES.done;
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === last[kind]) i = (i + 1) % list.length;
  last[kind] = i;
  return list[i];
}

let hideTimer = null;
let queueBusyUntil = 0;

/** Show a pop-up reaction. opts: { text, speak, force, delay } */
export function react(kind, opts = {}) {
  const s = store.settings();
  if (!s.comments && !opts.force) return null;
  const def = REACT[kind] || REACT.done;
  const text = opts.text || line(kind);
  const wait = Math.max(0, opts.delay || 0);
  setTimeout(() => show(def, text, opts), wait);
  return text;
}

function show(def, text, opts) {
  const root = document.getElementById('mascot-root');
  if (!root) return;
  clearTimeout(hideTimer);
  const inKids = document.getElementById('app')?.classList.contains('kids-mode');
  root.innerHTML = `<div class="mascot ${def.anim}" role="status" aria-live="polite">
      <div class="mascot-mon">${monsterSvg(def.mood, 'monster')}</div>
      <div class="m-bubble"><b>${MONSTER_NAME}</b>${esc(text)}</div>
    </div>`;
  const el = root.firstElementChild;
  el.onclick = () => hide();
  requestAnimationFrame(() => el.classList.add('in'));
  if (opts.speak || inKids) speak(text);
  const ms = Math.min(7000, 2600 + text.length * 45);
  queueBusyUntil = Date.now() + ms;
  hideTimer = setTimeout(hide, ms);
}

export function hide() {
  const el = document.querySelector('#mascot-root .mascot');
  if (!el) return;
  el.classList.remove('in');
  el.classList.add('out');
  setTimeout(() => { if (el.isConnected) el.remove(); }, 350);
}

export function busy() { return Date.now() < queueBusyUntil; }

// ---- tapping any monster makes it react (in place if it has a bubble to talk into) ----
let taps = 0, tapTimer = null;
document.addEventListener('click', e => {
  const m = e.target.closest('[data-tickle]');
  if (!m) return;
  e.stopPropagation();
  e.preventDefault();
  taps++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => (taps = 0), 4000);
  const kind = taps >= 5 ? 'tickleMany' : 'tickle';
  if (taps >= 5) taps = 0;
  m.classList.remove('a-wiggle', 'a-stomp');
  void m.getBoundingClientRect();
  m.classList.add(kind === 'tickle' ? 'a-wiggle' : 'a-stomp');
  setTimeout(() => m.classList.remove('a-wiggle', 'a-stomp'), 900);
  const target = m.dataset.say ? document.querySelector(m.dataset.say) : null;
  const text = line(kind);
  if (target) {
    target.textContent = text;
    target.classList.remove('pop'); void target.offsetWidth; target.classList.add('pop');
    if (document.getElementById('app')?.classList.contains('kids-mode')) speak(text);
  } else {
    react(kind, { text, force: true });
  }
}, true);

// ---- greeting when the app is opened ----
/** A joke about a dirty room. Uses the room-type lines if the area keeps its standard name. */
export function roomLine(area) {
  if (!area) return null;
  const typed = LINES['dirtyRoom_' + area.type];
  const standard = typed && typed.some(l => l.includes(area.name)) || /^(küche|wohnzimmer|esszimmer|schlafzimmer|badezimmer|bad|kinderzimmer|arbeitszimmer|flur|wäschekammer|gäste-wc|keller|dachboden|garage|garten|balkon|terrasse|auto)$/i.test(area.name.trim());
  if (typed && standard && Math.random() < 0.6) return line('dirtyRoom_' + area.type);
  return line('dirtyRoom').replace(/\{room\}/g, area.name);
}

/** Pops up a room joke when entering a really dirty area (at most every 3 hours per area). */
export function roomJoke(area) {
  if (!area || L.areaState(area.id).dot !== 'red') return;
  let seen = {};
  try { seen = JSON.parse(sessionStorage.getItem('bb.roomjokes') || '{}'); } catch (e) { /* ignore */ }
  if (Date.now() - (seen[area.id] || 0) < 3 * 3600000) return;
  seen[area.id] = Date.now();
  try { sessionStorage.setItem('bb.roomjokes', JSON.stringify(seen)); } catch (e) { /* ignore */ }
  react('dirtyRoom', { text: roomLine(area), delay: 600 });
}

export function greet() {
  const loc = store.local();
  const now = Date.now();
  const lastOpen = loc.lastOpen || 0;
  store.setLocal({ lastOpen: now });
  if (now - lastOpen < 45 * 60 * 1000) return; // not on every quick switch
  const h = new Date().getHours();
  let kind = h < 5 ? 'greetNight' : h < 11 ? 'greetMorning' : h < 18 ? 'greetDay' : h < 22 ? 'greetEvening' : 'greetNight';
  if (lastOpen && now - lastOpen > 3 * 86400000) kind = 'greetAway';
  const dirty = L.dirtiestArea();
  if (dirty && kind !== 'greetAway' && Math.random() < 0.5) { react('dirtyRoom', { text: roomLine(dirty), delay: 900 }); return; }
  react(kind, { delay: 900 });
}
