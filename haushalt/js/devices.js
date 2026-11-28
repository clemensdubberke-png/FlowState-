// Devices of the household: who owns which phone, which app version runs where,
// and the "new version available" prompt with one-tap install (Android app only).
import * as store from './store.js';
import * as L from './logic.js';
import { esc, sheet, toast, native } from './ui.js';

const RELEASES = 'https://github.com/clemensdubberke-png/FlowState-/releases';
const STALE = 60 * L.DAY; // devices not seen for 60 days are ignored

/** stable id of this installation (kept in localStorage, survives app updates) */
export function deviceId() {
  let id = store.local().deviceId;
  if (!id) { id = 'dev_' + store.uid(12); store.setLocal({ deviceId: id }); }
  return id;
}
export function versionName() { try { return native?.version?.() || ''; } catch (e) { return ''; } }
export function versionCode() {
  try {
    if (native?.versionCode) return Number(native.versionCode()) || 0;
    const m = /\.(\d+)$/.exec(versionName());
    return m ? Number(m[1]) : 0;
  } catch (e) { return 0; }
}
export function versionLabel() { return versionName() || 'Web-Version'; }
export const apkUrl = code => `${RELEASES}/download/blitzeblank-v1.0.${code}/Blitzeblank-1.0.${code}.apk`;

/** Writes/refreshes this device's record (owner, version, model) – synced to all phones. */
export function registerDevice() {
  const id = deviceId();
  const cur = store.get('devices', id);
  const rec = {
    id,
    ownerId: store.local().me || null,
    platform: native ? 'android' : 'web',
    model: (() => { try { return native?.deviceModel?.() || ''; } catch (e) { return ''; } })() || (native ? 'Android-Handy' : 'Browser'),
    version: versionName() || null,
    versionCode: versionCode(),
  };
  const changed = !cur || ['ownerId', 'platform', 'model', 'version', 'versionCode'].some(k => (cur[k] ?? null) !== (rec[k] ?? null));
  if (changed || !cur.lastSeen || Date.now() - cur.lastSeen > 12 * 3600000) store.put('devices', { ...rec, lastSeen: Date.now() });
}

export function householdDevices() {
  return store.all('devices').filter(d => Date.now() - (d.lastSeen || 0) < STALE)
    .sort((a, b) => (b.id === deviceId()) - (a.id === deviceId()) || (b.versionCode || 0) - (a.versionCode || 0));
}

/** The newest Android version some other phone of the household already runs (or null). */
export function newerInHousehold() {
  if (!native) return null;
  const mine = versionCode();
  if (!mine) return null;
  const best = householdDevices().filter(d => d.platform === 'android' && (d.versionCode || 0) > mine)
    .sort((a, b) => b.versionCode - a.versionCode)[0];
  return best || null;
}

// ---------------- install flow ----------------
let installSheet = null;
export function installUpdate(code, version) {
  if (!native?.installUpdate) { window.open(RELEASES, '_blank'); return; }
  const v = version || `1.0.${code}`;
  sheet(`<div class="upd-sheet"><h3>Version ${esc(v)} installieren</h3>
      <p data-upmsg>Lade herunter…</p>
      <div class="upd-bar"><div data-upbar style="width:0%"></div></div>
      <p class="muted small">Android fragt gleich, ob du das Update installieren möchtest – einfach „Installieren“ tippen. Deine Daten bleiben erhalten.</p>
      <div class="btn-row"><button class="btn light" data-upclose>Schließen</button></div></div>`, (el, close) => {
    installSheet = el;
    el.querySelector('[data-upclose]').onclick = () => { installSheet = null; close(); };
  });
  native.installUpdate(apkUrl(code));
}
// called by the Android app: state = permission | permission-missing | progress | install | error
window.__bbUpdate = (state, value) => {
  const el = installSheet;
  if (!el || !el.isConnected) { if (state === 'error') toast('Update fehlgeschlagen: ' + value); return; }
  const msg = el.querySelector('[data-upmsg]'), bar = el.querySelector('[data-upbar]');
  if (state === 'progress') { msg.textContent = `Lade herunter… ${value} %`; bar.style.width = value + '%'; }
  else if (state === 'permission') msg.innerHTML = 'Einmalig nötig: Erlaube in den gerade geöffneten Einstellungen <b>„Apps aus dieser Quelle zulassen“</b> und komm dann zurück – der Download startet automatisch.';
  else if (state === 'permission-missing') msg.innerHTML = 'Ohne die Erlaubnis <b>„Apps aus dieser Quelle zulassen“</b> kann Blitzeblank sich nicht selbst aktualisieren. Tippe nochmal auf „Jetzt installieren“, um es erneut zu versuchen.';
  else if (state === 'install') { msg.textContent = `Download fertig – die Installation von ${value} startet…`; bar.style.width = '100%'; }
  else if (state === 'error') msg.textContent = 'Das hat nicht geklappt: ' + value;
};

// ---------------- prompts on app start ----------------
let promptedFor = 0;
/** Shows "Neue Version verfügbar" once per app start and version. */
export function maybePromptUpdate() {
  const d = newerInHousehold();
  if (!d || promptedFor >= d.versionCode || document.querySelector('.sheet') || location.hash.startsWith('#/kids')) return;
  promptedFor = d.versionCode;
  const owner = d.ownerId ? store.get('persons', d.ownerId) : null;
  sheet(`<div class="upd-sheet"><div class="upd-ic">⬆️</div><h3>Eine neue Version ist verfügbar</h3>
      <p>${owner ? `Auf ${esc(owner.name)}s Handy` : 'Auf einem anderen Handy im Haushalt'} läuft schon <b>${esc(d.version)}</b> – du hast noch <b>${esc(versionLabel())}</b>.</p>
      <div class="btn-row"><button class="btn light" data-later>Später</button><button class="btn orange" data-now>Jetzt installieren</button></div></div>`, (el, close) => {
    el.querySelector('[data-later]').onclick = close;
    el.querySelector('[data-now]').onclick = () => { close(); setTimeout(() => installUpdate(d.versionCode, d.version), 250); };
  });
}

let askedOwner = false;
/** Asks once per app start who owns this phone (only in households with several adults). */
export function maybeAskOwner() {
  if (askedOwner || store.local().me || !store.settings().setupDone || document.querySelector('.sheet')) return;
  if (location.hash.startsWith('#/kids') || location.hash.startsWith('#/join')) return;
  const adults = L.persons().filter(p => !p.kid);
  if (adults.length < 2) return;
  askedOwner = true;
  const ps = L.persons();
  sheet(`<div class="owner-sheet"><h3>Wem gehört dieses Handy?</h3>
      <p class="muted">Dann wird beim Abhaken automatisch diese Person eingetragen – ohne jedes Mal zu fragen.</p>
      <div class="chips wrap">${ps.map(p => `<button class="pchip sel" data-own="${p.id}" style="--pc:${L.personColor(p)}">${esc(p.emoji || '🙂')} ${esc(p.name)}</button>`).join('')}</div>
      <div class="btn-row"><button class="btn light" data-later>Später</button></div></div>`, (el, close) => {
    el.querySelector('[data-later]').onclick = close;
    el.querySelectorAll('[data-own]').forEach(b => (b.onclick = () => {
      store.setLocal({ me: b.dataset.own });
      registerDevice();
      close();
      toast(`Gespeichert – dieses Handy gehört ${store.get('persons', b.dataset.own)?.name || ''}`);
    }));
  });
}

/** Checks GitHub for the latest published release (manual "Nach Updates suchen"). */
export async function latestRelease() {
  const r = await fetch('https://api.github.com/repos/clemensdubberke-png/FlowState-/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error('GitHub antwortet nicht (' + r.status + ')');
  const j = await r.json();
  const m = /blitzeblank-v1\.0\.(\d+)/.exec(j.tag_name || '');
  if (!m) throw new Error('Keine Version gefunden');
  return { code: Number(m[1]), version: `1.0.${m[1]}` };
}
