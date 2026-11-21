// Texts spoken in kids mode. Shared by the app and by the voice-generation script
// (haushalt-tools/generate-voice.mjs), so pre-generated audio matches exactly.

export function taskSpeech(name, steps) {
  const s = (steps || []).filter(x => x && x.text && x.text.trim());
  if (!s.length) return `${name}. Los geht's!`;
  const end = t => (/[.!?]$/.test(t) ? t : t + '.');
  return `${name}. ` + s.map((x, i) => `Schritt ${i + 1}: ${end(x.text.trim())}`).join(' ');
}

export const FIXED = {
  prima: 'Prima!',
  allDone: 'Super! Alles geschafft!',
  stars: n => `Super gemacht! Du bekommst ${n === 1 ? 'einen Stern' : n === 2 ? 'zwei Sterne' : 'drei Sterne'}.`,
};

/** FNV-1a hash → short hex id for "voice|text" */
export function speechKey(voice, text) {
  const s = `${voice}|${String(text).trim()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
