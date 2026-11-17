import * as store from './store.js';
import { TEMPLATES, guessEmoji, MONSTER_LINES } from './templates.js';

export const DAY = 86400000;
const UNIT_DAYS = { d: 1, w: 7, m: 30 };
export const UNIT_LABEL = { d: ['Tag', 'Tage'], w: ['Woche', 'Wochen'], m: ['Monat', 'Monate'] };
export const EFFORT_LABEL = { 1: 'Leicht', 2: 'Mittel', 3: 'Schwer' };
export const DIFFICULTY = { leicht: { label: 'Leicht', f: 0.7 }, normal: { label: 'Normal', f: 1 }, schwer: { label: 'Schwer', f: 1.3 } };

export function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
export function monthKey(t = Date.now()) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
export function monthName(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}
function monthBounds(t = Date.now()) {
  const d = new Date(t);
  const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
  return { start, end };
}

/** The clock used for dirt: frozen while vacation mode is on. */
export function now() {
  const v = store.settings().vacation;
  return v && v.since ? v.since : Date.now();
}

export function intervalDays(t) { return t.anytime ? 0 : Math.max(1, (t.freqN || 1) * UNIT_DAYS[t.freqUnit || 'd']); }
export function freqText(t) {
  if (t.anytime) return 'Jederzeit';
  const n = t.freqN || 1;
  if (n === 1) return { d: 'Täglich', w: 'Wöchentlich', m: 'Monatlich' }[t.freqUnit];
  return `Alle ${n} ${UNIT_LABEL[t.freqUnit][1]}`;
}
export function dueAt(t) { return (t.lastDone || t.createdAt || Date.now()) + intervalDays(t) * DAY; }
export function progress(t, at = now()) {
  if (t.anytime) return 0;
  return (at - (t.lastDone || at)) / (intervalDays(t) * DAY);
}
export function daysUntilDue(t, at = now()) { return Math.round((startOfDay(dueAt(t)) - startOfDay(at)) / DAY); }

/** status: fresh | ok | soon | due | overdue | bad */
export function status(t, at = now()) {
  if (t.anytime) return 'anytime';
  const d = daysUntilDue(t, at), p = progress(t, at);
  if (d > 0) return p < 0.6 ? 'fresh' : (d <= 1 ? 'soon' : 'ok');
  if (d === 0) return 'due';
  return p >= 1.6 ? 'bad' : 'overdue';
}
export function isDue(t, at) { const s = status(t, at); return s === 'due' || s === 'overdue' || s === 'bad'; }

export function dueText(t, at = now()) {
  if (t.anytime) return 'Jederzeit';
  const d = daysUntilDue(t, at);
  if (d === 0) return 'Heute fällig';
  if (d === 1) return 'Morgen fällig';
  if (d > 1) return `Fällig in ${d} Tg.`;
  if (d === -1) return 'Seit gestern fällig';
  return `Überfällig seit ${-d} Tg.`;
}

/** Fill fraction for the condition bar: ~0.25 when fresh, 0.59 at due day, 1.0 when very overdue. */
/** Fill of the condition capsule: a small dark-green stub right after completion,
 *  growing steadily until the due day (0.59 = middle tick), then on to full when very overdue. */
export const BAR_MIN = 0.06;
export function barFill(t, at = now()) {
  const p = Math.max(0, progress(t, at));
  if (p <= 1) return BAR_MIN + (0.59 - BAR_MIN) * p;
  return Math.min(1, 0.59 + 0.41 * Math.min(1, (p - 1) / 0.8));
}
// colour runs from dark green (just done) via light green and yellow to orange and red
const BAR_STOPS = [[0, [30, 132, 58]], [0.35, [76, 175, 60]], [0.7, [180, 220, 60]], [0.92, [234, 213, 59]], [1.0, [245, 194, 43]], [1.35, [245, 154, 35]], [1.7, [239, 75, 58]]];
export function barColor(t, at = now()) {
  const p = Math.max(0, progress(t, at));
  let i = BAR_STOPS.findIndex(s => s[0] > p);
  if (i === -1) i = BAR_STOPS.length - 1;
  if (i === 0) i = 1;
  const [p0, c0] = BAR_STOPS[i - 1], [p1, c1] = BAR_STOPS[i];
  const k = Math.max(0, Math.min(1, (p - p0) / (p1 - p0)));
  return '#' + c0.map((v, j) => Math.round(v + (c1[j] - v) * k).toString(16).padStart(2, '0')).join('');
}

/** Dirt splats shown next to a task: 0..3 */
export function dirtLevel(t, at) {
  const s = status(t, at);
  return { due: 1, overdue: 2, bad: 3 }[s] || 0;
}

export function tasksOfArea(areaId) { return store.all('tasks').filter(t => t.areaId === areaId); }

export function areaState(areaId, at = now()) {
  const tasks = tasksOfArea(areaId).filter(t => !t.anytime);
  if (!tasks.length) return { dot: 'none', dirt: 0, due: 0 };
  let worst = 0, due = 0, dirt = 0;
  const rank = { fresh: 0, ok: 0, soon: 1, due: 2, overdue: 3, bad: 4 };
  tasks.forEach(t => {
    const r = rank[status(t, at)];
    worst = Math.max(worst, r);
    if (r >= 2) due++;
    dirt += Math.min(1.5, Math.max(0, progress(t, at)));
  });
  const dirtiness = dirt / tasks.length; // ~0..1.5
  const dot = worst >= 3 ? 'red' : worst === 2 ? 'orange' : worst === 1 ? 'yellow' : 'green';
  return { dot, due, dirt: Math.min(4, Math.round(dirtiness * 4)) };
}

export function sortTasks(list, mode = 'due', at = now()) {
  const arr = [...list];
  if (mode === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  if (mode === 'freq') return arr.sort((a, b) => intervalDays(a) - intervalDays(b) || a.name.localeCompare(b.name, 'de'));
  return arr.sort((a, b) => {
    if (a.anytime !== b.anytime) return a.anytime ? -1 : 1;
    if (a.anytime) return a.name.localeCompare(b.name, 'de');
    return (dueAt(a) - dueAt(b)) || a.name.localeCompare(b.name, 'de');
  });
}

// ---------------- persons, responsibility, fairshare ----------------
export function persons() { return store.all('persons').sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)); }
export function me() { const id = store.local().me; return id ? store.get('persons', id) : null; }
export function personName(id) { return store.get('persons', id)?.name || '—'; }

export function responsible(t) {
  const s = store.settings();
  if (!s.multiPerson || !s.responsibility) return null;
  const list = (t.assignees || []).filter(id => store.get('persons', id));
  return list.length ? list[0] : null;
}

export function monthCompletions(t = Date.now()) {
  const { start, end } = monthBounds(t);
  return store.all('completions').filter(c => c.at >= start && c.at < end);
}

export function fairStats(t = Date.now()) {
  const ps = persons();
  const comps = monthCompletions(t);
  const total = comps.reduce((s, c) => s + (c.points || 0), 0);
  const targets = store.settings().fairTargets || {};
  const defTarget = ps.length ? 100 / ps.length : 0;
  return ps.map(p => {
    const pts = comps.filter(c => c.personId === p.id).reduce((s, c) => s + (c.points || 0), 0);
    const share = total ? (pts / total) * 100 : 0;
    const target = targets[p.id] ?? defTarget;
    return { person: p, points: pts, share, target, deficit: target - share };
  });
}

/** Who should do this task? (used as default in the completion sheet) */
export function suggestedPerson(t) {
  const s = store.settings();
  if (!s.multiPerson) return me()?.id || null;
  const resp = responsible(t);
  if (resp) return resp;
  if (s.fairshare) {
    const stats = fairStats().filter(x => !x.person.kid);
    if (stats.length) return stats.sort((a, b) => b.deficit - a.deficit)[0].person.id;
  }
  return me()?.id || null;
}

// ---------------- completing ----------------
export function pointsFor(t) {
  // effort points, +1 bonus when the task was really overdue
  return (t.effort || 1) + (status(t) === 'bad' ? 1 : 0);
}

export function completeTask(t, personId, { kid = false } = {}) {
  const pts = pointsFor(t);
  store.put('completions', {
    taskId: t.id, areaId: t.areaId, taskName: t.name, personId: personId || null,
    at: Date.now(), points: pts, kid,
  });
  const patch = { id: t.id, lastDone: now() };
  if (t.anytime) patch.anytimeCount = (todayCount(t) || 0) + 1;
  const s = store.settings();
  if (s.multiPerson && s.responsibility && s.rotation && (t.assignees || []).length > 1) {
    const a = [...t.assignees];
    const idx = Math.max(0, a.indexOf(personId));
    const done = a.splice(idx === -1 ? 0 : idx, 1);
    patch.assignees = [...a, ...done];
  }
  store.put('tasks', patch);
  return pts;
}

export function undoCompletion(c, prevLastDone) {
  store.remove('completions', c.id);
  const t = store.get('tasks', c.taskId);
  if (t) store.put('tasks', { id: t.id, lastDone: prevLastDone });
}

export function todayCount(t) {
  const sod = startOfDay(Date.now());
  return store.all('completions').filter(c => c.taskId === t.id && c.at >= sod).length;
}

/** Postpone: pretend it was done a bit later (keeps history clean) */
export function postpone(t, days = 1) {
  const base = Math.max(t.lastDone || 0, now() - intervalDays(t) * DAY);
  store.put('tasks', { id: t.id, lastDone: base + days * DAY });
}

// ---------------- current condition when creating a task ----------------
// dueIn(iv) = days until the task is due, measured from today
export const CONDITIONS = [
  { key: 'fresh', emoji: '✨', label: 'Gerade erledigt', dueIn: iv => iv },
  { key: 'ok', emoji: '🙂', label: 'Hat noch Zeit', dueIn: iv => Math.max(1, Math.round(iv * 0.55)) },
  { key: 'soon', emoji: '😐', label: 'Bald fällig', dueIn: iv => Math.min(iv, Math.max(1, Math.min(3, Math.round(iv * 0.15)))) },
  { key: 'due', emoji: '⏰', label: 'Heute fällig', dueIn: () => 0 },
  { key: 'over', emoji: '😬', label: 'Überfällig', dueIn: iv => -Math.max(1, Math.round(iv * 0.3)) },
  { key: 'bad', emoji: '🤢', label: 'Sehr schmutzig', dueIn: iv => -Math.max(2, Math.round(iv * 0.8)) },
];
/** lastDone timestamp so that the task (with its cycle) ends up in the chosen condition */
export function lastDoneFor(t, key, at = now()) {
  const c = CONDITIONS.find(x => x.key === key) || CONDITIONS[0];
  const iv = intervalDays(t);
  return startOfDay(at) + 12 * 3600000 - (iv - c.dueIn(iv)) * DAY;
}
/** Short preview of what a condition means for this task, e.g. "Fällig in 4 Tg." */
export function conditionPreview(t, key) {
  if (t.anytime) return 'Jederzeit';
  return dueText({ ...t, lastDone: lastDoneFor(t, key) });
}
/** Which condition best describes a task right now */
export function currentConditionKey(t) {
  if (t.anytime || !t.lastDone) return null;
  const d = daysUntilDue(t), iv = intervalDays(t);
  if (d >= iv) return 'fresh';
  if (d === 0) return 'due';
  if (d < 0) return -d >= Math.max(2, Math.round(iv * 0.8)) ? 'bad' : 'over';
  return d <= Math.max(1, Math.min(3, Math.round(iv * 0.15))) ? 'soon' : 'ok';
}
export function setConditionKey(t, key) { store.put('tasks', { id: t.id, lastDone: lastDoneFor(t, key) }); }

/** Set the condition manually: 0 = clean, 1 = due today, 1.5 = overdue */
export function setCondition(t, p) {
  store.put('tasks', { id: t.id, lastDone: now() - p * intervalDays(t) * DAY });
}

// ---------------- monster race ----------------
export function autoGoal() {
  const tasks = store.all('tasks').filter(t => !t.anytime);
  let sum = 0;
  tasks.forEach(t => { sum += (30 / intervalDays(t)) * (t.effort || 1); });
  return Math.max(10, Math.round(sum * 0.5));
}
export function goal() { const s = store.settings(); return s.goalAuto ? autoGoal() : (s.goal || 48); }

export function race(t = Date.now()) {
  const s = store.settings();
  const { start: mStart, end } = monthBounds(t);
  // the very first race starts when the household was set up, not on the 1st of the month
  const start = Math.min(end - DAY, Math.max(mStart, s.raceStart || 0));
  const frac = Math.min(1, Math.max(0, (t - start) / (end - start)));
  const g = goal();
  const f = DIFFICULTY[s.difficulty]?.f || 1;
  const monster = Math.round(g * f * frac);
  const user = monthCompletions(t).reduce((a, c) => a + (c.points || 0), 0);
  const day = new Date(t).getDate();
  return { goal: g, monster, user, lead: user - monster, frac, day, monthLabel: new Date(t).toLocaleDateString('de-DE', { month: 'long' }) };
}

export function raceLine(r = race(), seed = 0) {
  let key;
  if (r.day <= 2 && r.user === 0) key = 'start';
  else if (r.lead <= -6) key = 'aheadBig';
  else if (r.lead < 0) key = 'aheadSmall';
  else if (r.lead === 0) key = 'tied';
  else if (r.lead < 6) key = 'behindSmall';
  else key = 'behindBig';
  const list = MONSTER_LINES[key];
  const idx = (seed + new Date().getHours()) % list.length;
  return { key, text: list[idx], mood: key.startsWith('ahead') || key === 'start' ? 'taunt' : key === 'tied' ? 'angry' : key === 'behindBig' ? 'sad' : 'shock' };
}
export function randomLine(key) { const l = MONSTER_LINES[key]; return l[Math.floor(Math.random() * l.length)]; }

/** Close finished months into the race history (idempotent). */
export function finalizeRaces() {
  const s = store.settings();
  if (!s.race) return;
  const hist = { ...(s.raceHistory || {}) };
  const comps = store.all('completions');
  if (!comps.length) return;
  const firstAt = Math.min(...comps.map(c => c.at));
  const cur = monthKey();
  let changed = false;
  const d = new Date(firstAt); d.setDate(1);
  while (monthKey(d.getTime()) !== cur) {
    const key = monthKey(d.getTime());
    if (!hist[key]) {
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() - 1;
      const r = race(endOfMonth);
      hist[key] = { points: r.user, monster: r.monster, won: r.user >= r.monster };
      changed = true;
    }
    d.setMonth(d.getMonth() + 1);
  }
  if (changed) store.setSettings({ raceHistory: hist });
}

// ---------------- vacation ----------------
export function startVacation() { store.setSettings({ vacation: { since: Date.now() } }); }
export function endVacation() {
  const v = store.settings().vacation;
  if (!v) return;
  const shift = Date.now() - v.since;
  store.setSettings({ vacation: null });
  store.putMany('tasks', store.all('tasks').filter(t => t.lastDone).map(t => ({ id: t.id, lastDone: t.lastDone + shift })));
}

// ---------------- cleaning intensity ----------------
// factor multiplies the suggested interval: >1 = less often, <1 = more often
export const INTENSITY = [
  { label: 'Sehr locker', f: 2, mood: 'happy', hint: 'Nur das Nötigste – Hauptsache, es stinkt nicht.' },
  { label: 'Locker', f: 1.5, mood: 'happy', hint: 'Entspannt putzen, ohne Stress.' },
  { label: 'Normal', f: 1, mood: 'taunt', hint: 'Ein gepflegtes Zuhause im Alltag.' },
  { label: 'Ordentlich', f: 0.7, mood: 'shock', hint: 'Es soll richtig sauber sein.' },
  { label: 'Intensiv', f: 0.5, mood: 'sad', hint: 'Blitzeblank, immer. Besuch kann jederzeit kommen.' },
];
export function intensity() { const l = store.settings().intensity; return Number.isInteger(l) ? l : 2; }

const TPL_UNIT_DAYS = { d: 1, w: 7, m: 30 };
export function tplDays(tpl) { return tpl[1] ? tpl[1] * TPL_UNIT_DAYS[tpl[2]] : 0; }

/** Turns a number of days into a "nice" frequency (Tage / Wochen / Monate). */
export function niceFreq(days) {
  const d = Math.max(1, Math.round(days));
  if (d < 14) return { freqN: d, freqUnit: 'd' };
  if (d < 63) return { freqN: Math.max(2, Math.round(d / 7)), freqUnit: 'w' };
  return { freqN: Math.max(2, Math.round(d / 30)), freqUnit: 'm' };
}
export function scaledFreq(baseDays, level = intensity()) { return niceFreq(baseDays * INTENSITY[level].f); }

// ---------------- areas from templates ----------------
export function createArea({ name, type, color }) {
  const order = store.all('areas').length;
  return store.put('areas', { name, type, color, order });
}

export function templateToTask(areaId, tpl, i = 0, level = intensity()) {
  const [name, n, unit, effort, kid] = tpl;
  const base = tplDays(tpl);
  const t = { areaId, name, anytime: n === 0, freqN: 1, freqUnit: unit, effort, order: i, assignees: [], tplDays: base || null };
  if (base) Object.assign(t, scaledFreq(base, level));
  if (kid) {
    t.kid = { enabled: true, emoji: kid.e || guessEmoji(name), steps: (kid.steps || []).map(([e, text]) => ({ e, text })) };
  }
  return t;
}

/** Adds catalogue tasks. overrides: name -> { freqN, freqUnit } chosen by the user. */
export function addTemplateTasks(area, list, overrides = {}, conditions = {}) {
  const n = Date.now();
  const start = tasksOfArea(area.id).length;
  const tasks = list.map((tpl, i) => {
    const t = templateToTask(area.id, tpl, start + i);
    const o = overrides[tpl[0]];
    if (o && !t.anytime && (o.freqN !== t.freqN || o.freqUnit !== t.freqUnit)) Object.assign(t, o, { customFreq: true });
    // spread the initial state so not everything is due on day one (nothing starts overdue)
    const iv = intervalDays(t);
    const r = ((i * 37) % 100) / 100; // deterministic pseudo-random 0..1
    t.lastDone = t.anytime ? null : conditions[tpl[0]] ? lastDoneFor(t, conditions[tpl[0]]) : n - iv * DAY * (0.1 + r * 0.85);
    return t;
  });
  store.putMany('tasks', tasks);
  return tasks.length;
}

/** Re-scales all catalogue tasks the user did not adjust by hand. Returns count. */
export function applyIntensity(level = intensity()) {
  const list = store.all('tasks').filter(t => t.tplDays && !t.customFreq && !t.anytime);
  store.putMany('tasks', list.map(t => ({ id: t.id, ...scaledFreq(t.tplDays, level) })));
  return list.length;
}

export function personColor(p) { return p?.color || '#7a8aa0'; }
export const PERSON_COLORS = ['#ff9500', '#e9667b', '#34c759', '#5856d6', '#00a6c8', '#af52de', '#c48a3a', '#2f6fd6'];
export const PERSON_EMOJI = ['🙂', '😎', '🦸', '👩', '👨', '👧', '👦', '🧒', '👵', '👴', '🐱', '🐶', '🦄', '🐻', '🦊', '🐸'];
