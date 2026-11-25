import * as store from './store.js';
import { TEMPLATES, guessEmoji, MONSTER_LINES } from './templates.js';

export const DAY = 86400000;
const UNIT_DAYS = { d: 1, w: 7, m: 30 };
export const UNIT_LABEL = { d: ['Tag', 'Tage'], w: ['Woche', 'Wochen'], m: ['Monat', 'Monate'] };
export const EFFORT_LABEL = { 1: 'Leicht', 2: 'Mittel', 3: 'Schwer' };
// Schmuddel's steady pace: by month end he reaches goal × f
export const DIFFICULTY = { leicht: { label: 'Leicht', f: 0.8 }, normal: { label: 'Normal', f: 1 }, schwer: { label: 'Schwer', f: 1.25 } };
// his extra points for tasks left undone are capped at this share of the monthly goal
export const MISS_CAP = 0.5;

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
// ---------------- seasonal tasks ----------------
// t.seasonal + t.months (1..12): outside these months the task sleeps (not due, no points for Schmuddel).
// When its season starts, the cycle starts fresh.
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
export const MONTHS_LONG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export const SEASONS = [['Winter', [11, 12, 1, 2]], ['Frühling', [3, 4, 5]], ['Sommer', [5, 6, 7, 8, 9]], ['Herbst', [9, 10, 11]]];
export function isSeasonal(t) { return !!(t && t.seasonal && Array.isArray(t.months) && t.months.length > 0 && t.months.length < 12); }
export function activeAt(t, at = now()) { return !isSeasonal(t) || t.months.includes(new Date(at).getMonth() + 1); }
/** first day of the current active streak (handles seasons over new year, e.g. Nov–Feb) */
export function seasonStart(t, at = now()) {
  if (!isSeasonal(t) || !activeAt(t, at)) return 0;
  const d = new Date(at);
  let y = d.getFullYear(), m = d.getMonth();
  for (let i = 0; i < 11; i++) {
    const pm = (m + 11) % 12;
    if (!t.months.includes(pm + 1)) break;
    if (pm === 11) y--;
    m = pm;
  }
  return new Date(y, m, 1).getTime();
}
export function nextActiveMonth(t, at = now()) {
  const m = new Date(at).getMonth();
  for (let i = 1; i <= 12; i++) { const k = (m + i) % 12; if (t.months.includes(k + 1)) return k; }
  return m;
}
/** "Nov–Feb", "Apr–Okt" or "Mär, Jun, Sep" */
export function monthsText(t) {
  if (!isSeasonal(t)) return 'Ganzjährig';
  const set = new Set(t.months);
  const startIdx = [...Array(12).keys()].find(i => set.has(i + 1) && !set.has(((i + 11) % 12) + 1));
  if (startIdx === undefined) return 'Ganzjährig';
  const run = []; for (let i = 0; i < 12; i++) { const k = (startIdx + i) % 12; if (set.has(k + 1)) run.push(k); else break; }
  if (run.length === set.size) return run.length === 1 ? MONTHS_SHORT[run[0]] : `${MONTHS_SHORT[run[0]]}–${MONTHS_SHORT[run[run.length - 1]]}`;
  return [...set].sort((a, b) => a - b).map(m => MONTHS_SHORT[m - 1]).join(', ');
}
/** last-done used for the condition: a new season starts fresh */
export function effLast(t, at = now()) {
  const last = t.lastDone || t.createdAt || at;
  const ss = seasonStart(t, at);
  if (ss && t.seasonFrom === ss) return last; // condition was set explicitly during this season
  return Math.max(last, ss);
}

export function dueAt(t, at = now()) { return effLast(t, at) + intervalDays(t) * DAY; }
export function progress(t, at = now()) {
  if (t.anytime || !activeAt(t, at)) return 0;
  return (at - effLast(t, at)) / (intervalDays(t) * DAY);
}
export function daysUntilDue(t, at = now()) { return Math.round((startOfDay(dueAt(t, at)) - startOfDay(at)) / DAY); }

/** status: fresh | ok | soon | due | overdue | bad */
export function status(t, at = now()) {
  if (t.anytime) return 'anytime';
  if (!activeAt(t, at)) return 'sleep';
  const d = daysUntilDue(t, at), p = progress(t, at);
  if (d > 0) return p < 0.6 ? 'fresh' : (d <= 1 ? 'soon' : 'ok');
  if (d === 0) return 'due';
  return p >= 1.6 ? 'bad' : 'overdue';
}
export function isDue(t, at) { const s = status(t, at); return s === 'due' || s === 'overdue' || s === 'bad'; }

export function dueText(t, at = now()) {
  if (t.anytime) return 'Jederzeit';
  if (!activeAt(t, at)) return `Schlummert bis ${MONTHS_SHORT[nextActiveMonth(t, at)]}.`;
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
  const tasks = tasksOfArea(areaId).filter(t => !t.anytime && activeAt(t, at));
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

/** The dirtiest area that has overdue tasks (for Schmuddel's room jokes), or null */
export function dirtiestArea(at = now()) {
  const list = store.all('areas').map(a => ({ a, st: areaState(a.id, at) })).filter(x => x.st.dot === 'red');
  if (!list.length) return null;
  list.sort((x, y) => y.st.dirt - x.st.dirt || y.st.due - x.st.due);
  return list[0].a;
}

export function sortTasks(list, mode = 'due', at = now()) {
  const arr = [...list];
  if (mode === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  if (mode === 'freq') return arr.sort((a, b) => intervalDays(a) - intervalDays(b) || a.name.localeCompare(b.name, 'de'));
  if (mode === 'effort' || mode === 'effortAsc') {
    const dir = mode === 'effort' ? -1 : 1; // effort: Schwer zuerst · effortAsc: Leicht zuerst
    const byDue = sortTasks(arr, 'due', at);
    const pos = new Map(byDue.map((t, i) => [t.id, i]));
    return arr.sort((a, b) => dir * ((a.effort || 1) - (b.effort || 1)) || pos.get(a.id) - pos.get(b.id));
  }
  return arr.sort((a, b) => {
    const sa = !activeAt(a, at), sb = !activeAt(b, at);
    if (sa !== sb) return sa ? 1 : -1; // sleeping seasonal tasks at the end
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
  // points = effort only (Leicht 1 · Mittel 2 · Schwer 3), no bonus for overdue tasks
  return t.effort || 1;
}

// Anti-cheat: the same task ticked off more than CHEAT_FREE times within CHEAT_WINDOW scores nothing from then on.
export const CHEAT_WINDOW = 5 * 60000;
export const CHEAT_FREE = 3;
export function recentCompletions(t, at = Date.now()) {
  return store.all('completions').filter(c => c.taskId === t.id && c.at <= at && at - c.at < CHEAT_WINDOW).length;
}
let lastComp = null;
/** the completion record created by the latest completeTask() call */
export function lastCompletion() { return lastComp; }
export function wouldCheat(t, at = Date.now()) { return recentCompletions(t, at) >= CHEAT_FREE; }

export function completeTask(t, personId, { kid = false } = {}) {
  const cheat = wouldCheat(t);
  const pts = cheat ? 0 : pointsFor(t);
  const rec = {
    taskId: t.id, areaId: t.areaId, taskName: t.name, personId: personId || null,
    at: Date.now(), points: pts, kid,
  };
  if (cheat) rec.cheat = true;
  lastComp = store.put('completions', rec);
  const patch = { id: t.id, lastDone: now(), mSince: Date.now(), seasonFrom: seasonStart(t), legacy: false };
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
  store.put('tasks', { id: t.id, lastDone: base + days * DAY, mSince: Date.now() });
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
  return dueText({ ...t, lastDone: lastDoneFor(t, key), seasonFrom: seasonStart(t) });
}
/** Which condition best describes a task right now */
export function currentConditionKey(t) {
  if (t.anytime || !t.lastDone || !activeAt(t)) return null;
  const d = daysUntilDue(t), iv = intervalDays(t);
  if (d >= iv) return 'fresh';
  if (d === 0) return 'due';
  if (d < 0) return -d >= Math.max(2, Math.round(iv * 0.8)) ? 'bad' : 'over';
  return d <= Math.max(1, Math.min(3, Math.round(iv * 0.15))) ? 'soon' : 'ok';
}
export function setConditionKey(t, key) { store.put('tasks', { id: t.id, lastDone: lastDoneFor(t, key), seasonFrom: seasonStart(t), mSince: Date.now() }); }

/** Set the condition manually: 0 = clean, 1 = due today, 1.5 = overdue */
export function setCondition(t, p) {
  store.put('tasks', { id: t.id, lastDone: now() - p * intervalDays(t) * DAY, mSince: Date.now() });
}

// ---------------- monster race ----------------
export function autoGoal() {
  const tasks = store.all('tasks').filter(t => !t.anytime && activeAt(t));
  let sum = 0;
  tasks.forEach(t => { sum += (30 / intervalDays(t)) * (t.effort || 1); });
  return Math.max(10, Math.round(sum * 0.5));
}
export function goal() { const s = store.settings(); return s.goalAuto ? autoGoal() : (s.goal || 48); }

// ---------------- Schmuddel's points for tasks left undone ----------------
// Every time a task becomes overdue (the day after its due day) and again after every further
// full cycle it stays undone, Schmuddel scores the task's effort points (Leicht 1 · Mittel 2 · Schwer 3).
// Records get deterministic ids, so two synced phones never count the same miss twice.
export function monsterScan(at = Date.now()) {
  const s = store.settings();
  if (!s.race) return 0;
  const nowT = s.vacation?.since || at;
  const d = new Date(nowT);
  const from = Math.max(new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), s.raceStart || 0);
  const known = store.raw('mpoints');
  const add = [];
  // at most one miss per task and month
  const hit = new Set(Object.values(known).filter(m => !m.deleted).map(m => `${m.taskId}|${monthKey(m.at)}`));
  for (const t of store.all('tasks')) {
    if (t.anytime || !t.lastDone || !activeAt(t, nowT)) continue;
    if (t.legacy) continue; // "Altlast": was already due when it was added – no points for Schmuddel until done once
    const iv = intervalDays(t) * DAY;
    const first = startOfDay(dueAt(t, nowT)) + DAY; // first moment the task counts as overdue
    if (first > nowT) continue;
    const since = Math.max(from, t.mSince || t.createdAt || 0);
    const j0 = first < since ? Math.ceil((since - first) / iv) : 0;
    for (let j = j0; j < j0 + 70 && first + j * iv <= nowT; j++) {
      const ev = first + j * iv;
      const id = `${t.id}-${Math.round(ev / 60000)}`;
      if (known[id]) continue;
      const mk = `${t.id}|${monthKey(ev)}`;
      if (hit.has(mk)) continue;
      hit.add(mk);
      add.push({ id, taskId: t.id, areaId: t.areaId, taskName: t.name, at: ev, points: t.effort || 1 });
    }
  }
  if (add.length) store.putMany('mpoints', add);
  return add.reduce((a, m) => a + m.points, 0);
}
export function monthMissed(t = Date.now()) {
  const { start, end } = monthBounds(t);
  return store.all('mpoints').filter(m => m.at >= start && m.at < end && m.at <= t);
}

export function race(t = Date.now()) {
  const s = store.settings();
  const { start: mStart, end } = monthBounds(t);
  // the very first race starts when the household was set up, not on the 1st of the month
  const start = Math.min(end - DAY, Math.max(mStart, s.raceStart || 0));
  const frac = Math.min(1, Math.max(0, (t - start) / (end - start)));
  const g = goal();
  const f = DIFFICULTY[s.difficulty]?.f || 1;
  const base = Math.round(g * f * frac);                                   // steady pace
  const missedRaw = monthMissed(t).reduce((a, m) => a + (m.points || 0), 0); // tasks left undone
  const missCap = Math.round(g * MISS_CAP);
  const missed = Math.min(missedRaw, missCap);
  const monster = base + missed;
  const user = monthCompletions(t).reduce((a, c) => a + (c.points || 0), 0);
  const day = new Date(t).getDate();
  return { goal: g, base, missed, missCap, missedRaw, monster, user, lead: user - monster, frac, day, monthLabel: new Date(t).toLocaleDateString('de-DE', { month: 'long' }) };
}
/** Is a kid task meant for this kid? Explicit choice in the task wins; otherwise the room's kid
 *  (area.kidId) – tasks in a room that belongs to one kid are only shown to that kid. */
export function kidTaskFor(t, kidId) {
  if (!t.kid?.enabled) return false;
  const who = t.kid.who || [];
  if (who.length) return who.includes(kidId);
  const owner = store.get('areas', t.areaId)?.kidId;
  return !owner || owner === kidId || !store.get('persons', owner);
}
/** points per kid this month (kid tasks only) */
export function kidsContribution(t = Date.now()) {
  const kidIds = new Set(store.all('tasks').filter(x => x.kid?.enabled).map(x => x.id));
  const by = {};
  monthCompletions(t).filter(c => kidIds.has(c.taskId) && c.personId).forEach(c => (by[c.personId] = (by[c.personId] || 0) + (c.points || 0)));
  return by;
}

/** The kids' own race (only shown in kids mode): only tasks marked "Für Kinder" count – for both sides. */
export function kidsRace(t = Date.now()) {
  const s = store.settings();
  const kidIds = new Set(store.all('tasks').filter(x => x.kid?.enabled).map(x => x.id));
  const { start: mStart, end } = monthBounds(t);
  const start = Math.min(end - DAY, Math.max(mStart, s.raceStart || 0));
  const frac = Math.min(1, Math.max(0, (t - start) / (end - start)));
  let sum = 0;
  store.all('tasks').filter(x => kidIds.has(x.id) && !x.anytime && activeAt(x)).forEach(x => { sum += (30 / intervalDays(x)) * (x.effort || 1); });
  const g = kidIds.size ? Math.max(5, Math.round(sum * 0.5)) : 0;
  const f = DIFFICULTY[s.difficulty]?.f || 1;
  const base = Math.round(g * f * frac);
  const missed = Math.min(monthMissed(t).filter(m => kidIds.has(m.taskId)).reduce((a, m) => a + (m.points || 0), 0), Math.round(g * MISS_CAP));
  const user = monthCompletions(t).filter(c => kidIds.has(c.taskId)).reduce((a, c) => a + (c.points || 0), 0);
  const monster = base + missed;
  return { goal: g, base, missed, monster, user, lead: user - monster };
}

/** 'win' | 'draw' | 'loss' for a race-history entry (old entries only have `won`) */
export function raceResult(h) { return h.result || (h.won ? (h.points === h.monster ? 'draw' : 'win') : 'loss'); }
export const RESULT_ICON = { win: '🏆', draw: '🤝', loss: '😈' };

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
      const result = r.user > r.monster ? 'win' : r.user === r.monster ? 'draw' : 'loss';
      hist[key] = { points: r.user, monster: r.monster, result, won: result === 'win' };
      changed = true;
    }
    d.setMonth(d.getMonth() + 1);
  }
  if (changed) store.setSettings({ raceHistory: hist });
}

/** one-time: everything that is due right now and was never done becomes an "Altlast";
 *  Schmuddel's points for those (and duplicates within a month) are removed – fair restart. */
export function migrateLegacy() {
  const s = store.settings();
  if (s.legacyMigrated) return;
  const done = new Set(store.all('completions').map(c => c.taskId));
  const legacy = store.all('tasks').filter(t => !t.anytime && isDue(t) && !done.has(t.id));
  if (legacy.length) store.putMany('tasks', legacy.map(t => ({ id: t.id, legacy: true })));
  const ids = new Set(legacy.map(t => t.id));
  const seen = new Set();
  const drop = store.all('mpoints').sort((a, b) => a.at - b.at).filter(m => {
    if (ids.has(m.taskId)) return true;
    const k = `${m.taskId}|${monthKey(m.at)}`;
    if (seen.has(k)) return true;
    seen.add(k); return false;
  });
  drop.forEach(m => store.remove('mpoints', m.id));
  store.setSettings({ legacyMigrated: true });
}

/** one-time: catalogue tasks are no longer kid-enabled by default (kids mode starts empty) */
export function migrateKidDefaults() {
  const s = store.settings();
  if (s.kidDefaultsOff) return;
  const list = store.all('tasks').filter(t => 'tplDays' in t && t.kid?.enabled);
  if (list.length) store.putMany('tasks', list.map(t => ({ id: t.id, kid: { ...t.kid, enabled: false } })));
  store.setSettings({ kidDefaultsOff: true });
}

// ---------------- vacation ----------------
export function startVacation() { store.setSettings({ vacation: { since: Date.now() } }); }
export function endVacation() {
  const v = store.settings().vacation;
  if (!v) return;
  const shift = Date.now() - v.since;
  store.setSettings({ vacation: null });
  store.putMany('tasks', store.all('tasks').filter(t => t.lastDone).map(t => ({ id: t.id, lastDone: t.lastDone + shift, mSince: Date.now() })));
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
export function createArea({ name, type, color, art = null }) {
  const order = store.all('areas').length;
  return store.put('areas', { name, type, color, art, order });
}

export function templateToTask(areaId, tpl, i = 0, level = intensity()) {
  const [name, n, unit, effort, kid, months] = tpl;
  const base = tplDays(tpl);
  const t = { areaId, name, anytime: n === 0, freqN: 1, freqUnit: unit, effort, order: i, assignees: [], tplDays: base || null };
  if (base) Object.assign(t, scaledFreq(base, level));
  if (months) { t.seasonal = true; t.months = [...months]; }
  // prepared for kids (nice symbol + steps), but only shown in kids mode once "Für Kinder" is switched on
  t.kid = { enabled: false, emoji: (kid && kid.e) || guessEmoji(name), steps: ((kid && kid.steps) || []).map(([e, text]) => ({ e, text })) };
  return t;
}

/** Adds catalogue tasks. overrides: name -> { freqN, freqUnit } chosen by the user. */
export function addTemplateTasks(area, list, overrides = {}, conditions = {}, forKids = new Set()) {
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
    if (conditions[tpl[0]]) t.seasonFrom = seasonStart(t);
    if (forKids.has(tpl[0])) t.kid.enabled = true;
    if (!t.anytime && isDue(t)) t.legacy = true;
    return t;
  });
  store.putMany('tasks', tasks);
  return tasks.length;
}

/** Re-scales all catalogue tasks the user did not adjust by hand. Returns count. */
export function applyIntensity(level = intensity()) {
  const list = store.all('tasks').filter(t => t.tplDays && !t.customFreq && !t.anytime);
  store.putMany('tasks', list.map(t => ({ id: t.id, ...scaledFreq(t.tplDays, level), mSince: Date.now() })));
  return list.length;
}

export function personColor(p) { return p?.color || '#7a8aa0'; }
export const PERSON_COLORS = ['#ff9500', '#e9667b', '#34c759', '#5856d6', '#00a6c8', '#af52de', '#c48a3a', '#2f6fd6'];
export const PERSON_EMOJI = ['🙂', '😎', '🦸', '👩', '👨', '👧', '👦', '🧒', '👵', '👴', '🐱', '🐶', '🦄', '🐻', '🦊', '🐸'];
