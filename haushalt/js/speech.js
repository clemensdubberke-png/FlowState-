// Texts spoken in kids mode. Shared by the app and by the voice-generation script
// (haushalt-tools/generate-voice.mjs), so pre-generated audio matches exactly.

export function taskSpeech(name, steps) {
  const s = (steps || []).filter(x => x && x.text && x.text.trim());
  if (!s.length) return `${name}. Los geht's!`;
  const end = t => (/[.!?]$/.test(t) ? t : t + '.');
  return `${name}. ` + s.map((x, i) => `Schritt ${i + 1}: ${end(x.text.trim())}`).join(' ');
}


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
  kids: ['[gasps] [scared]', '[frustrated] [annoyed]', '[whining]', '[whispers] [mischievously]', '[mischievously] … [gasps] [panicked]', '[giggles]', '[mischievously] … [screams]'],
  kidStep: ['[angry]', '[whining]', '[annoyed] [grumpy]', '[sad] [whispers]', '[angry] [growls]', '[angry] [disgusted]', '[mischievously] [sighs]', '[sad] [sniffles]', '[pleading] [whining]'],
  done_bed: ['[whining] [shocked]', '[annoyed] [sighs]', '[crying] [disgusted]'],
  done_bath: ['[sad] [whining]', '[shocked] [embarrassed]', '[angry] [dramatic]'],
  done_laundry: ['[whining] [shocked]', '[angry] [dramatic]', '[disgusted] [sneezes]'],
  done_broom: ['[shocked] [whining]', '[angry] [shouting]', '[sad] [sighs]'],
  done_plant: ['[whining] [annoyed]', '[annoyed] [grumpy]', '[sad] [dramatic]'],
  done_toybox: ['[whining] [sad]', '[crying] [dramatic]', '[panicked] [sighs]'],
  done_lamp: ['[shivers] [whining]', '[disgusted] [annoyed]', '[shocked] [screams]'],
  kidCheat: ['[suspicious] [laughs]', '[mischievously] [sighs]', '[suspicious] [giggles]', '[mischievously] [laughs]'],
  kidLead: ['[shocked] [angry]', '[whining] [sad]', '[excited] [sad]', '[panting] [whining]'],
  kidBehind: ['[excited] [laughs]', '[mischievously] [laughs]', '[nervous] [giggles]', '[proudly] [giggles]'],
  kidTied: ['[nervous] [excited]', '[nervous] [giggles]', '[confused] [laughs]'],
  kidAllClear: ['[shocked] [dramatic]', '[sad] [whining]', '[whispers] [mischievously]', '[angry] [laughs]'],
  kidJoke: ['[proudly] [laughs]', '[giggles]', '[laughs] [mischievously]', '[laughs]', '[giggles] [laughs]', '[giggles] [embarrassed]', '[sad] [giggles]', '[proudly] [laughs]', '[proudly] [laughs]', '[panicked] [dramatic]', '[giggles] [laughs]', '[giggles] [mischievously]'],
  kidDone: ['[crying] [dramatic]', '[disgusted] [angry] … [hiccups]', '[angry] [disgusted]', '[sad] [sniffles]', '[shocked] [angry]', '[shocked] [disgusted]', '[whining] [sighs]', '[whining] [sad]', '[angry] [whining]', '[mischievously] [laughs]', '[angry] [laughs]', '[sarcastic] [giggles]', '[angry] [giggles]', '[confused] [giggles]', '[grumpy] [sighs]', '[shocked] [screams]'],
  kidTick: ['[annoyed] [whining]', '[growls] [grumpy]', '[whining] [sad]', '[angry] … [frustrated]', '[disgusted] [dramatic]', '[giggles] [annoyed]', '[angry] [shouting]', '[booing] [angry]', '[disgusted] [giggles]', '[mischievously] [annoyed]', '[whining] [annoyed]'],
  kidAllSteps: ['[shocked] … [dramatic]', '[gasps] [disgusted]', '[sarcastic] [grumpy]', '[shocked] [dramatic]', '[crying] [dramatic]', '[disgusted] [dramatic]'],
  intro: ['[excited] [mischievously]', '[happily] [dreamy]', '[mischievously] [evil laugh]', '[surprised] … [laughs] [mocking]', '[proudly] [mischievously]'],
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
// whole categories (adult pop-ups): one emotion per category
const CATEGORY_TAGS = {
  done: '[annoyed]', doneOverdue: '[angry] [dramatic]', doneHard: '[shocked]', doneAnytime: '[bored] [sighs]',
  allDone: '[sad] [dramatic]', goal: '[crying]', leadFlip: '[angry] [shouting]', undo: '[laughs] [excited]',
  postpone: '[mischievously] [laughs]', dirty: '[excited] [laughs]', vacationOn: '[excited]', vacationOff: '[cheerfully]',
  timerStart: '[mischievously]', timerDone: '[mischievously] [laughs]', areaCreated: '[excited] [laughs]',
  taskCreated: '[sarcastic]', taskDeleted: '[laughs]', greetMorning: '[cheerfully] [mischievously]', greetDay: '[cheerfully]',
  greetEvening: '[mischievously]', greetNight: '[whispers]', greetAway: '[mischievously] [laughs]', areaHint: '[cheerfully]',
  catalogAdd: '[shocked]', cheat: '[suspicious] [laughs]',
  // race-banner lines (Home screen)
  start: '[mischievously] [laughs]', aheadBig: '[proudly] [mischievously]', aheadSmall: '[mischievously] [giggles]',
  tied: '[annoyed] [nervous]', behindSmall: '[angry] [whining]', behindBig: '[crying] [dramatic]',
};
// everything Schmuddel can say in kids mode (shared by the voice generator and the audit)
export const KID_CATEGORIES = ['intro', 'kids', 'kidStep', 'kidTick', 'kidAllSteps', 'kidDone', 'kidCheat', 'kidLead', 'kidBehind', 'kidTied', 'kidAllClear', 'kidJoke', 'tickle', 'tickleMany',
  ...Object.keys(LINES).filter(k => k.startsWith('scene_') || k.startsWith('done_'))];
export const ADULT_CATEGORIES = [...Object.keys(CATEGORY_TAGS), ...Object.keys(LINES).filter(k => k.startsWith('dirtyRoom_') || k.startsWith('doneTask_'))];
const SPOKEN = new Map();
for (const [k, tag] of Object.entries(CATEGORY_TAGS)) (LINES[k] || []).forEach(text => SPOKEN.set(text, `${tag} ${text}`));
for (const k of Object.keys(LINES).filter(x => x.startsWith('dirtyRoom_'))) (LINES[k] || []).forEach(text => SPOKEN.set(text, `[excited] [mischievously] ${text}`));
for (const k of Object.keys(LINES).filter(x => x.startsWith('doneTask_'))) (LINES[k] || []).forEach(text => SPOKEN.set(text, `[annoyed] [dramatic] ${text}`));
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
