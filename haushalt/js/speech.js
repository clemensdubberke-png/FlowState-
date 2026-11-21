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
  // after a kid finished a task (instead of stars: the race against Schmuddel)
  done: [
    'Super gemacht! Damit seid ihr Schmuddel ein Stück davongerannt!',
    'Klasse! Jetzt muss sich Schmuddel ganz schön anstrengen!',
    'Toll! Ein Punkt mehr im Rennen gegen Schmuddel!',
  ],
};

/** FNV-1a hash → short hex id for "voice|text" */
export function speechKey(voice, text) {
  const s = `${voice}|${String(text).trim()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// ---- ElevenLabs v3 audio tags for Schmuddel (only spoken, never shown on screen) ----
import { LINES } from './lines.js';
const TAGS = {
  kids: ['[gasps] [scared]', '[frustrated] [annoyed]', '[sad] [whispers]', '[whispers] [mischievously]', '[mischievously] … [gasps] [nervous]', '[nervous] [giggles]', '[mischievously] [laughs]'],
  kidStep: ['[angry]', '[sighs] [pleading]', '[annoyed] [grumpy]', '[sad] [whispers]', '[angry] [growls]'],
  kidDone: ['[crying] [dramatic]', '[disgusted] [angry]', '[angry] [sniffles]', '[sad] [sniffles]'],
  scene_lamp: ['[excited] [laughs]', '[giggles]', '[cheerfully] [laughs]'],
  scene_bed: ['[excited] [laughs]', '[mischievously] [giggles]', '[excited] [shouting]'],
  scene_bath: ['[giggles]', '[cheerfully]', '[disgusted] [sneezes]'],
  scene_laundry: ['[proudly] [mischievously]', '[whispers] [giggles]', '[happily] [sighs]'],
  scene_broom: ['[excited] [laughs]', '[proudly]', '[mischievously] [laughs]'],
  scene_plant: ['[whispers]', '[nervous] [giggles]', '[whispers] [mischievously]'],
  scene_toybox: ['[laughs] [excited]', '[cheerfully] [laughs]', '[mischievously] [laughs]'],
  tickle: ['[giggles]', '[annoyed]', '[mischievously]', '[laughs] [mischievously]', '[sarcastic] … [panicked]', '[proudly]', '[mischievously] [laughs]', '[giggles] [laughs]', '[playfully] [laughs]', '[proudly]', '[cheerfully]'],
  tickleMany: ['[shouting] [angry]', '[sighs] [annoyed]', '[mischievously] [laughs]'],
};
const SPOKEN = new Map();
for (const [k, tags] of Object.entries(TAGS)) {
  (LINES[k] || []).forEach((text, i) => {
    const t = tags[i];
    if (!t) return;
    if (t.includes('…')) {
      // tag in the middle of the line: second tag goes after the "…" break
      const [a, b] = t.split('…').map(x => x.trim());
      const parts = text.split('…');
      SPOKEN.set(text, parts.length > 1 ? `${a} ${parts[0].trim()} … ${b} ${parts.slice(1).join('…').trim()}` : `${a} ${text}`);
    } else SPOKEN.set(text, `${t} ${text}`);
  });
}
/** text sent to ElevenLabs (with emotion tags for Schmuddel); the cache key stays the display text */
export function spokenText(voice, text) { return voice === 'monster' ? (SPOKEN.get(text) || text) : text; }
