// Kids-mode voice: ElevenLabs audio.
// 1. Pre-generated clips bundled in audio/ (offline, no cost) – see haushalt-tools/generate-voice.mjs
// 2. Otherwise live ElevenLabs request with the key stored on this phone (cached afterwards)
// 3. Otherwise the phone's own text-to-speech
import * as store from './store.js';
import { speak as deviceSpeak, native } from './ui.js';
import { speechKey, spokenText } from './speech.js';

const API = 'https://api.elevenlabs.io/v1/text-to-speech/';
// Schmuddel: v3 (understands emotion tags like [laughs]); narrator: multilingual v2
const MODELS = { monster: 'eleven_v3', narrator: 'eleven_multilingual_v2' };
const SETTINGS = {
  monster: { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: true, speed: 0.8 },
  narrator: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 0.8 },
};

let manifestP = null;
function manifest() {
  if (!manifestP) manifestP = fetch('audio/manifest.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}));
  return manifestP;
}
export async function bundledInfo() { const m = await manifest(); return { count: Object.keys(m.files || {}).length, voices: m.voices || {} }; }

// The ElevenLabs key is shared by the whole household (synced settings);
// "use ElevenLabs" and the voice ids stay per phone.
export function config() {
  const loc = { enabled: true, monsterVoice: '', narratorVoice: '', ...(store.local().eleven || {}) };
  return { ...loc, key: store.settings().elevenKey || loc.key || '' };
}
export function setConfig(patch) {
  const { key, ...rest } = patch;
  if (key !== undefined) store.setSettings({ elevenKey: key });
  const loc = { ...(store.local().eleven || {}), ...rest };
  delete loc.key;
  store.setLocal({ eleven: loc });
}
/** one-time: a key that was stored only on this phone becomes the household key */
export function migrateKey() {
  const loc = store.local().eleven || {};
  if (loc.key && !store.settings().elevenKey) store.setSettings({ elevenKey: loc.key });
  if (loc.key) { const { key, ...rest } = loc; store.setLocal({ eleven: rest }); }
}

async function voiceId(voice) {
  const c = config();
  const own = voice === 'monster' ? c.monsterVoice : c.narratorVoice;
  if (own) return own;
  return (await manifest()).voices?.[voice] || '';
}

let current = null;
export function stop() {
  try { if (current) { current.pause(); current = null; } } catch (e) { /* ignore */ }
  try { if (native) native.stopSpeaking(); else if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
}
// bundled clips are pitched already; live clips are raised at playback (≈ +4 semitones)
const LIVE_PITCH = 1.26;
function play(src, live = false) {
  return new Promise(res => {
    const a = new Audio(src);
    if (live) { a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = LIVE_PITCH; }
    current = a;
    a.onended = a.onerror = () => res(true);
    a.play().catch(() => res(false));
  });
}

// ---- live ElevenLabs request (native bridge in the APK avoids browser CORS limits) ----
const pending = new Map();
window.__bbTts = (id, b64) => { const p = pending.get(id); if (p) { pending.delete(id); p(b64 || ''); } };
function b64ToBlob(b64) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: 'audio/mpeg' });
}
async function fetchTts(text, voice, id, key) {
  const body = JSON.stringify({ text: spokenText(voice, text), model_id: MODELS[voice] || MODELS.narrator, voice_settings: SETTINGS[voice] || SETTINGS.narrator });
  if (native && native.ttsFetch) {
    const reqId = Math.random().toString(36).slice(2);
    const b64 = await new Promise(res => { pending.set(reqId, res); native.ttsFetch(reqId, key, id, body); setTimeout(() => window.__bbTts(reqId, ''), 20000); });
    return b64 ? b64ToBlob(b64) : null;
  }
  const r = await fetch(`${API}${encodeURIComponent(id)}?output_format=mp3_44100_64`, {
    method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body,
  });
  return r.ok ? r.blob() : null;
}
async function cached(k) {
  try { const c = await caches.open('bb-voice'); const r = await c.match(`/voice-cache/${k}.mp3`); return r ? r.blob() : null; } catch (e) { return null; }
}
async function store_(k, blob) {
  try { const c = await caches.open('bb-voice'); await c.put(`/voice-cache/${k}.mp3`, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })); } catch (e) { /* ignore */ }
}

/** Is this text available in Schmuddel's voice (bundled or cached)? */
export async function hasVoice(text, voice = 'narrator') {
  const k = speechKey(voice, text);
  const m = await manifest();
  return !!(m.files?.[k] || await cached(k));
}

/** Fetch and cache a text in Schmuddel's voice without playing it (needs the key in the app).
 *  Returns 'ready' | 'nokey' | 'error'. */
export async function prefetch(text, voice = 'narrator') {
  if (!text) return 'error';
  if (await hasVoice(text, voice)) return 'ready';
  const c = config();
  const id = await voiceId(voice);
  if (!c.key || !id) return 'nokey';
  try {
    const blob = await fetchTts(text, voice, id, c.key);
    if (!blob) return 'error';
    await store_(speechKey(voice, text), blob);
    return 'ready';
  } catch (e) { return 'error'; }
}

/** Speak a text in kids mode. voice: 'monster' (Schmuddel) | 'narrator' */
export async function say(text, voice = 'narrator') {
  if (!text) return;
  stop();
  const c = config();
  const k = speechKey(voice, text);
  if (c.enabled) {
    const m = await manifest();
    const file = m.files?.[k];
    if (file && await play(`audio/${file}`)) return;
    const hit = await cached(k);
    if (hit && await play(URL.createObjectURL(hit), true)) return;
    const id = await voiceId(voice);
    if (c.key && id) {
      try {
        const blob = await fetchTts(text, voice, id, c.key);
        if (blob) { store_(k, blob); if (await play(URL.createObjectURL(blob), true)) return; }
      } catch (e) { /* fall back */ }
    }
  }
  deviceSpeak(text);
  // phone voice: resolve after roughly the time it takes to speak
  await new Promise(r => setTimeout(r, Math.min(9000, 600 + text.length * 65)));
}
