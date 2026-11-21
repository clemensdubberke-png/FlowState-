// Generates the kids-mode voice clips with ElevenLabs and bundles them into haushalt/audio/.
//
//   ELEVEN_API_KEY=… VOICE_MONSTER=<voice id> VOICE_NARRATOR=<voice id> node haushalt-tools/generate-voice.mjs
//
// Only new or changed texts are generated (existing files are kept), so re-running is cheap.
// The voices end up in audio/manifest.json, which the app also uses for live requests.
import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..', 'haushalt');
const outDir = join(appDir, 'audio');
const rawDir = join(here, 'voice-raw'); // unpitched originals (not bundled) – re-pitching costs nothing
// Schmuddel a little higher (≈ +4 semitones), tempo unchanged
const PITCH = { monster: Number(process.env.PITCH_MONSTER || 1.26), narrator: Number(process.env.PITCH_NARRATOR || 1.26) }; // everything in the same higher voice
const { LINES } = await import(join(appDir, 'js', 'lines.js'));
const { TEMPLATES } = await import(join(appDir, 'js', 'templates.js'));
const { taskSpeech, speechKey, spokenText, ADULT_CATEGORIES } = await import(join(appDir, 'js', 'speech.js'));

const KEY = process.env.ELEVEN_API_KEY || 'set-by-proxy';
const VOICES = { monster: process.env.VOICE_MONSTER, narrator: process.env.VOICE_NARRATOR };
const MODELS = { monster: 'eleven_v3', narrator: 'eleven_multilingual_v2' };
const SETTINGS = {
  monster: { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: true },
  narrator: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
};
if (!VOICES.monster || !VOICES.narrator) { console.error('VOICE_MONSTER and VOICE_NARRATOR are required'); process.exit(1); }

// ---- what kids mode can say ----
const items = [];
for (const k of ['intro', 'kids', 'kidStep', 'kidTick', 'kidAllSteps', 'kidDone', 'tickle', 'tickleMany', ...Object.keys(LINES).filter(x => x.startsWith('scene_')), ...ADULT_CATEGORIES]) (LINES[k] || []).forEach(text => items.push({ voice: 'monster', text }));
const seen = new Set();
for (const list of Object.values(TEMPLATES)) {
  for (const [name, , , , kid] of list) {
    if (!kid) continue; // kid-suitable catalogue tasks only
    const text = taskSpeech(name, (kid.steps || []).map(([e, t]) => ({ e, text: t })));
    if (!seen.has(text)) { seen.add(text); items.push({ voice: 'narrator', text }); }
  }
}

mkdirSync(outDir, { recursive: true });
mkdirSync(rawDir, { recursive: true });
function pitch(src, dst, f) {
  if (f === 1) { writeFileSync(dst, readFileSync(src)); return; }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `asetrate=44100*${f},aresample=44100,atempo=${(1 / f).toFixed(5)}`, '-ac', '1', '-b:a', '64k', dst]);
}
const manifestPath = join(outDir, 'manifest.json');
const old = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { files: {} };
const files = {};
let chars = 0, made = 0;
for (const it of items) {
  const k = speechKey(it.voice, it.text);
  const file = `${k}.mp3`;
  files[k] = file;
  const raw = join(rawDir, file);
  const sameVoice = old.voices?.[it.voice] === VOICES[it.voice];
  if (!(sameVoice && existsSync(raw))) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICES[it.voice]}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: spokenText(it.voice, it.text), model_id: MODELS[it.voice], voice_settings: SETTINGS[it.voice] }),
    });
    if (!r.ok) { console.error(`✗ ${r.status} ${it.text}\n${await r.text()}`); process.exit(1); }
    writeFileSync(raw, Buffer.from(await r.arrayBuffer()));
    chars += it.text.length; made++;
    console.log(`✓ [${it.voice}] ${it.text}`);
  }
  if (!existsSync(join(outDir, file)) || old.pitch?.[it.voice] !== PITCH[it.voice]) pitch(raw, join(outDir, file), PITCH[it.voice]);
}
// remove clips that are no longer used
for (const d of [outDir, rawDir]) for (const f of readdirSync(d)) if (f.endsWith('.mp3') && !Object.values(files).includes(f)) unlinkSync(join(d, f));
writeFileSync(manifestPath, JSON.stringify({ voices: VOICES, models: MODELS, pitch: PITCH, files }, null, 1));
console.log(`\n${items.length} Clips im Manifest, ${made} neu erzeugt (${chars} Zeichen verbraucht).`);
