// Local-first data store. Every record has {id, updatedAt, deleted?}.
// Records are merged per document (last write wins), which keeps two phones in sync safely.

export const COLS = ['areas', 'tasks', 'persons', 'completions', 'settings'];
const LS_KEY = 'blitzeblank.data.v1';
const LS_LOCAL = 'blitzeblank.local.v1';

export const DEFAULT_SETTINGS = {
  id: 'main',
  multiPerson: false,
  fairshare: false,
  fairTargets: {},          // personId -> percent
  responsibility: false,
  rotation: true,
  race: true,
  difficulty: 'normal',     // leicht | normal | schwer
  goalAuto: true,
  goal: 48,
  comments: true,
  vacation: null,           // { since: ms }
  raceHistory: {},          // 'YYYY-MM' -> { points, monster, won }
  kidRewards: {},           // personId -> { goal, text }
  kidsMode: true,
  sortArea: 'due',          // due | name
  setupDone: false,
};

let state = {};
const listeners = new Set();
let pusher = null;
let emitTimer = null;

function blank() { const s = {}; COLS.forEach(c => (s[c] = {})); return s; }

export function load() {
  state = blank();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      COLS.forEach(c => (state[c] = parsed[c] || {}));
    }
  } catch (e) { /* storage unavailable */ }
  if (!state.settings.main) state.settings.main = { ...DEFAULT_SETTINGS, updatedAt: 0 };
}

let persistTimer = null;
function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }, 50);
}

function emit() {
  clearTimeout(emitTimer);
  emitTimer = setTimeout(() => listeners.forEach(fn => fn()), 16);
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setPusher(fn) { pusher = fn; }

export function uid(len = 14) {
  const a = 'abcdefghijkmnopqrstuvwxyz23456789';
  let s = '';
  const r = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) s += a[r[i] % a.length];
  return s;
}

export function all(col) { return Object.values(state[col]).filter(r => !r.deleted); }
export function get(col, id) { const r = state[col][id]; return r && !r.deleted ? r : null; }
export function raw(col) { return state[col]; }

export function put(col, obj, { silent = false } = {}) {
  if (!obj.id) obj.id = uid();
  const prev = state[col][obj.id];
  const rec = { ...(prev || {}), ...obj, updatedAt: Math.max(Date.now(), (prev?.updatedAt || 0) + 1) };
  if (!rec.createdAt) rec.createdAt = Date.now();
  state[col][rec.id] = rec;
  persist();
  if (pusher) pusher(col, rec);
  if (!silent) emit();
  return rec;
}

export function putMany(col, list) { list.forEach(o => put(col, o, { silent: true })); emit(); }

export function remove(col, id) {
  if (!state[col][id]) return;
  put(col, { id, deleted: true });
}

export function applyRemote(col, rec) {
  if (!rec || !rec.id || !state[col]) return;
  const local = state[col][rec.id];
  if (local && (local.updatedAt || 0) > (rec.updatedAt || 0)) return;
  if (local && local.updatedAt === rec.updatedAt) return;
  state[col][rec.id] = rec;
  persist();
  emit();
}

export function settings() { return { ...DEFAULT_SETTINGS, ...state.settings.main }; }
export function setSettings(patch) { return put('settings', { ...settings(), ...patch, id: 'main' }); }

// ---- device-local preferences (not synced): who am I on this phone, sync config ----
export function local() {
  try { return JSON.parse(localStorage.getItem(LS_LOCAL)) || {}; } catch (e) { return {}; }
}
export function setLocal(patch) {
  const next = { ...local(), ...patch };
  try { localStorage.setItem(LS_LOCAL, JSON.stringify(next)); } catch (e) { /* ignore */ }
  emit();
  return next;
}

export function exportJson() { return JSON.stringify({ app: 'blitzeblank', version: 1, exportedAt: Date.now(), data: state }, null, 1); }
export function importJson(text) {
  const parsed = JSON.parse(text);
  const data = parsed.data || parsed;
  COLS.forEach(c => Object.values(data[c] || {}).forEach(rec => {
    state[c][rec.id] = { ...rec, updatedAt: Date.now() };
    if (pusher) pusher(c, state[c][rec.id]);
  }));
  persist();
  emit();
}
export function wipe() {
  COLS.forEach(c => Object.keys(state[c]).forEach(id => { if (!(c === 'settings')) remove(c, id); }));
  setSettings({ ...DEFAULT_SETTINGS, setupDone: false });
}
