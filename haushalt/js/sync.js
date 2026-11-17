// Cross-device sync via Firebase Firestore (free "Spark" plan is enough).
// Data lives under households/{householdCode}/{collection}/{docId}.
// Firestore's offline cache queues writes when a phone has no connection.
import * as store from './store.js';

const V = '10.12.2';
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

export function parseConfig(text) {
  // Accept a pasted JSON object or the JS snippet from the Firebase console.
  let t = String(text || '').trim();
  const m = t.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Keine Konfiguration gefunden');
  t = m[0]
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
    .replace(/'/g, '"')
    .replace(/,\s*}/g, '}');
  const cfg = JSON.parse(t);
  if (!cfg.apiKey || !cfg.projectId) throw new Error('apiKey oder projectId fehlt');
  return cfg;
}

export function inviteLink(cfg, code) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ c: cfg, h: code }))));
  const base = location.href.split('#')[0];
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
