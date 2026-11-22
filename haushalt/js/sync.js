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
let problem = null; // { title, hint } – explains the last error in plain words
const statusListeners = new Set();

function setStatus(t) { statusText = t; statusListeners.forEach(fn => fn(t)); }
export function syncStatus() { return statusText; }
/** Details for the last sync error (or null): what is wrong and what to do in the Firebase console. */
export function syncProblem() { return problem; }

const AUTH_HINTS = {
  'auth/admin-restricted-operation': 'In der Firebase-Konsole ist die anonyme Anmeldung nicht aktiviert.',
  'auth/operation-not-allowed': 'In der Firebase-Konsole ist die anonyme Anmeldung nicht aktiviert.',
  'auth/configuration-not-found': 'Authentication ist im Firebase-Projekt noch nicht eingerichtet.',
  'auth/unauthorized-domain': 'Diese App-Adresse ist in Firebase nicht als Domain freigegeben.',
  'auth/network-request-failed': 'Keine Internetverbindung zur Anmeldung.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Der apiKey in der Konfiguration ist ungültig.',
  'auth/invalid-api-key': 'Der apiKey in der Konfiguration ist ungültig.',
};
function explain(code, authErr) {
  if (code === 'permission-denied') {
    if (authErr) {
      return {
        title: 'Zugriff verweigert – die Anmeldung bei Firebase hat nicht geklappt',
        hint: `${AUTH_HINTS[authErr] || `Fehlercode: ${authErr}.`} Öffne console.firebase.google.com → dein Projekt → <b>Build → Authentication</b> → „Los geht's“ → Reiter <b>Anmeldemethode</b> → <b>Anonym</b> aktivieren und speichern. Danach hier „Erneut verbinden“ tippen.`,
        rules: true,
      };
    }
    return {
      title: 'Zugriff verweigert – die Firestore-Regeln fehlen',
      hint: 'Die Datenbank im Produktionsmodus sperrt erst einmal alles. Öffne console.firebase.google.com → dein Projekt → <b>Build → Firestore Database</b> → Reiter <b>Regeln</b>, ersetze den Inhalt durch die Regeln unten und tippe auf <b>Veröffentlichen</b>. Danach hier „Erneut verbinden“ tippen (auf beiden Handys).',
      rules: true,
    };
  }
  if (code === 'unavailable' || code === 'timeout') return { title: 'Firebase ist gerade nicht erreichbar', hint: 'Prüfe die Internetverbindung. Änderungen werden nachgeholt, sobald die Verbindung steht.' };
  if (code === 'not-found' || /database.*does not exist|NOT_FOUND/i.test(code)) return { title: 'Keine Firestore-Datenbank gefunden', hint: 'In der Firebase-Konsole unter <b>Build → Firestore Database</b> → „Datenbank erstellen“ anlegen.', rules: true };
  return { title: 'Synchronisation fehlgeschlagen', hint: `Fehlercode: ${code}` };
}
export const RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /households/{h}/{col}/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}`;
export function onStatus(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); }
export function isActive() { return !!db; }

const esc0 = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
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
  problem = null;
  setStatus('Verbinde…');
  let authErr = null;
  try {
    const appMod = await import(`${BASE}/firebase-app.js`);
    fs = await import(`${BASE}/firebase-firestore.js`);
    const name = 'bb-' + loc.sync.household.slice(0, 6);
    const app = appMod.getApps().find(a => a.name === name) || appMod.initializeApp(loc.sync.config, name);
    try {
      const authMod = await import(`${BASE}/firebase-auth.js`);
      // initializeAuth without the popup/redirect helper – getAuth() loads an iframe that is not needed in the app
      let auth;
      try {
        auth = authMod.initializeAuth(app, { persistence: [authMod.indexedDBLocalPersistence, authMod.browserLocalPersistence, authMod.inMemoryPersistence] });
      } catch (e) {
        auth = authMod.getAuth(app);
      }
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
    } catch (e) {
      authErr = (e.code || e.message || 'unbekannt').toLowerCase();
      console.warn('Anonyme Anmeldung fehlgeschlagen:', authErr);
    }
    try {
      db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
    } catch (e) {
      db = fs.getFirestore(app);
    }
    household = loc.sync.household;
    store.setPusher((col, rec) => {
      if (!db) return;
      fs.setDoc(fs.doc(db, 'households', household, col, rec.id), clean(rec)).catch(err => fail(err.code || err.message));
    });
    let ready = 0, settled = false, resolveFirst;
    const first$ = new Promise(r => (resolveFirst = r));
    const fail = code => {
      problem = explain(code, authErr);
      setStatus('Fehler: ' + (code === 'permission-denied' ? 'Zugriff verweigert' : code));
      if (!settled) { settled = true; resolveFirst(false); }
    };
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
          if (ready === store.COLS.length) {
            problem = null;
            setStatus('Synchronisiert');
            if (!settled) { settled = true; resolveFirst(true); }
          }
        } else if (!problem) {
          setStatus(snap.metadata.fromCache ? 'Offline – wird nachgeholt' : 'Synchronisiert');
        }
      }, err => fail(err.code || err.message));
      unsubs.push(u);
    }
    // wait for the first answer from the server (or an error) so the caller can tell the truth
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      if (!problem) { problem = explain('timeout'); setStatus('Offline – wird nachgeholt'); }
      resolveFirst(false);
    }, 15000);
    const ok = await first$;
    clearTimeout(timer);
    return ok;
  } catch (e) {
    console.error(e);
    problem = { title: 'Firebase konnte nicht gestartet werden', hint: esc0(e.message) + ' – Konfiguration prüfen oder Internetverbindung herstellen.' };
    setStatus('Fehler: ' + e.message);
    db = null;
    return false;
  }
}
