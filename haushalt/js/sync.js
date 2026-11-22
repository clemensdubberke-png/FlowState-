// Cross-device sync via Firebase Firestore (free "Spark" plan is enough).
// Data lives under households/{householdCode}/{collection}/{docId}.
// Firestore's offline cache queues writes when a phone has no connection.
import * as store from './store.js';

const V = '10.12.2';
// public web version (GitHub Pages) – used for invite links created inside the Android app
export const PUBLIC_URL = 'https://clemensdubberke-png.github.io/FlowState-/haushalt/';
const BASE = `https://www.gstatic.com/firebasejs/${V}`;

let fs = null, db = null, household = null;
let unsubs = [];
let statusText = 'Nicht verbunden';
const statusListeners = new Set();

function setStatus(t) { statusText = t; statusListeners.forEach(fn => fn(t)); }
export function syncStatus() { return statusText; }
export function onStatus(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); }
export function isActive() { return !!db; }

function clean(obj) { return JSON.parse(JSON.stringify(obj)); }

export function newHouseholdCode() { return store.uid(20); }

/** Reads one quoted JS string starting at src[i] (', " or `); returns [value, indexAfter]. */
function readString(src, i) {
  const q = src[i];
  let j = i + 1, val = '';
  while (j < src.length && src[j] !== q) {
    if (src[j] === '\\' && j + 1 < src.length) {
      const e = src[j + 1];
      if (e === 'u' && /^[0-9a-fA-F]{4}$/.test(src.slice(j + 2, j + 6))) { val += String.fromCharCode(parseInt(src.slice(j + 2, j + 6), 16)); j += 6; continue; }
      val += { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f' }[e] ?? e;
      j += 2;
      continue;
    }
    val += src[j++];
  }
  if (j >= src.length) throw new Error('Anführungszeichen nicht geschlossen');
  return [val, j + 1];
}

/** Index after the {...} block that starts at src[start], respecting strings and comments; -1 if unbalanced. */
function blockEnd(src, start) {
  let depth = 0;
  for (let i = start; i < src.length;) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') { try { i = readString(src, i)[1]; } catch (e) { return -1; } continue; }
    if (ch === '/' && src[i + 1] === '/') { const n = src.indexOf('\n', i); i = n === -1 ? src.length : n; continue; }
    if (ch === '/' && src[i + 1] === '*') { const n = src.indexOf('*/', i + 2); i = n === -1 ? src.length : n + 2; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i + 1;
    i++;
  }
  return -1;
}

/** Converts a JS object literal (unquoted keys, single quotes, comments, trailing commas) into JSON text. */
function jsObjectToJson(src) {
  let out = '', i = 0, pendingComma = false;
  const flushComma = next => { if (pendingComma && next !== '}' && next !== ']') out += ','; pendingComma = false; };
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { out += ch; i++; continue; }
    if (ch === '/' && src[i + 1] === '/') { const n = src.indexOf('\n', i); i = n === -1 ? src.length : n; continue; }
    if (ch === '/' && src[i + 1] === '*') { const n = src.indexOf('*/', i + 2); i = n === -1 ? src.length : n + 2; continue; }
    if (ch === ',') { pendingComma = true; i++; continue; }
    flushComma(ch);
    if (ch === '"' || ch === "'" || ch === '`') {
      const [val, next] = readString(src, i);
      out += JSON.stringify(val);
      i = next;
      continue;
    }
    const id = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
    if (id) {
      let k = i + id[0].length;
      while (k < src.length && /\s/.test(src[k])) k++;
      out += src[k] === ':' ? JSON.stringify(id[0]) : id[0];
      i += id[0].length;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function parseConfig(text) {
  // Accepts a pasted JSON object, the "const firebaseConfig = {...}" block or the whole snippet
  // from the Firebase console (incl. import lines and comments).
  const src = String(text || '').replace(/[\u201C\u201D\u201E]/g, '"').replace(/[\u2018\u2019]/g, "'").trim();
  const starts = [];
  const named = /firebaseConfig\s*=\s*\{/.exec(src);
  if (named) starts.push(named.index + named[0].length - 1);
  for (let i = src.indexOf('{'); i !== -1; i = src.indexOf('{', i + 1)) if (!starts.includes(i)) starts.push(i);
  if (!starts.length) throw new Error('Keine Konfiguration gefunden – bitte den Block „const firebaseConfig = { … }“ einfügen');
  let lastErr = null;
  for (const st of starts) {
    const end = blockEnd(src, st);
    if (end === -1) continue;
    try {
      const cfg = JSON.parse(jsObjectToJson(src.slice(st, end)));
      if (cfg && typeof cfg === 'object' && cfg.apiKey && cfg.projectId) return cfg;
      lastErr = lastErr || new Error('apiKey oder projectId fehlt');
    } catch (e) {
      lastErr = lastErr || e;
    }
  }
  throw lastErr || new Error('Konfiguration unvollständig – fehlt eine schließende Klammer „}“?');
}

export function inviteLink(cfg, code) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ c: cfg, h: code }))));
  const base = location.hostname === 'appassets.androidplatform.net' ? PUBLIC_URL : location.href.split('#')[0];
  return `${base}#/join/${payload}`;
}
export function decodeInvite(payload) {
  const obj = JSON.parse(decodeURIComponent(escape(atob(payload))));
  if (!obj.c || !obj.h) throw new Error('Ungültige Einladung');
  return obj;
}

export async function stop() {
  unsubs.forEach(u => u()); unsubs = [];
  db = null; store.setPusher(null);
  setStatus('Nicht verbunden');
}

export async function start() {
  const loc = store.local();
  if (!loc.sync || !loc.sync.config || !loc.sync.household) { setStatus('Nicht verbunden'); return false; }
  await stop();
  setStatus('Verbinde…');
  try {
    const appMod = await import(`${BASE}/firebase-app.js`);
    fs = await import(`${BASE}/firebase-firestore.js`);
    const name = 'bb-' + loc.sync.household.slice(0, 6);
    const app = appMod.getApps().find(a => a.name === name) || appMod.initializeApp(loc.sync.config, name);
    try {
      const authMod = await import(`${BASE}/firebase-auth.js`);
      await authMod.signInAnonymously(authMod.getAuth(app));
    } catch (e) { console.warn('Anonyme Anmeldung nicht möglich (optional):', e.message); }
    try {
      db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
    } catch (e) {
      db = fs.getFirestore(app);
    }
    household = loc.sync.household;
    store.setPusher((col, rec) => {
      if (!db) return;
      fs.setDoc(fs.doc(db, 'households', household, col, rec.id), clean(rec)).catch(err => setStatus('Fehler: ' + err.code));
    });
    let ready = 0;
    for (const col of store.COLS) {
      let first = true;
      const u = fs.onSnapshot(fs.collection(db, 'households', household, col), snap => {
        const remoteIds = new Set();
        snap.docChanges().forEach(ch => { if (ch.type !== 'removed') store.applyRemote(col, ch.doc.data()); });
        if (first) {
          first = false;
          snap.docs.forEach(d => remoteIds.add(d.id));
          // upload local records that the household does not know yet (or newer local ones)
          const remote = {}; snap.docs.forEach(d => (remote[d.id] = d.data()));
          Object.values(store.raw(col)).forEach(rec => {
            const r = remote[rec.id];
            if (!r || (rec.updatedAt || 0) > (r.updatedAt || 0)) {
              fs.setDoc(fs.doc(db, 'households', household, col, rec.id), clean(rec)).catch(() => {});
            }
          });
          ready++;
          if (ready === store.COLS.length) setStatus('Synchronisiert');
        } else {
          setStatus(snap.metadata.fromCache ? 'Offline – wird nachgeholt' : 'Synchronisiert');
        }
      }, err => setStatus('Fehler: ' + (err.code || err.message)));
      unsubs.push(u);
    }
    return true;
  } catch (e) {
    console.error(e);
    setStatus('Fehler: ' + e.message);
    db = null;
    return false;
  }
}
