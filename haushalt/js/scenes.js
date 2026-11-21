// Animated little scenes with Schmuddel for kids mode (all original artwork).
// Each scene: an SVG stage + a matching set of voiced lines (LINES['scene_' + key]).
import { monsterSvg } from './art.js';

const W = '#fff';
const LINE = 'stroke="#8a6a3b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"';

// place a small Schmuddel inside a scene
function mon(mood, x, y, size, cls = '') {
  return monsterSvg(mood, `scene-mon ${cls}`).replace('<svg class=', `<svg x="${x}" y="${y}" width="${size}" height="${size}" class=`);
}

export const SCENES = {
  lamp: {
    label: 'schaukelt an der Lampe',
    svg: () => `
      <path d="M0 4h200" ${LINE}/>
      <g class="sc-swing">
        <path d="M100 4v34" ${LINE}/>
        <path d="M82 52l8-14h20l8 14z" fill="#ffd36b" stroke="#8a6a3b" stroke-width="3" stroke-linejoin="round"/>
        <path class="sc-glow" d="M84 54l-22 50h76l-22-50z" fill="#fff3b0" opacity=".55"/>
        ${mon('happy', 72, 44, 56)}
      </g>
      <path d="M20 132h160" ${LINE}/>`,
  },
  bed: {
    label: 'hüpft auf dem Bett',
    svg: () => `
      <rect x="40" y="96" width="120" height="22" rx="6" fill="#9ec5ff" stroke="#8a6a3b" stroke-width="3"/>
      <path d="M40 96V74M160 96V82M44 118v10M156 118v10" ${LINE}/>
      <rect x="46" y="84" width="30" height="12" rx="5" fill="${W}" stroke="#8a6a3b" stroke-width="3"/>
      <g class="sc-bounce">${mon('happy', 74, 30, 64)}</g>
      <g class="sc-feather"><path d="M150 50q6-8 12 0q-6 4-12 0z" fill="${W}" stroke="#8a6a3b" stroke-width="2"/></g>
      <g class="sc-feather f2"><path d="M40 40q6-8 12 0q-6 4-12 0z" fill="${W}" stroke="#8a6a3b" stroke-width="2"/></g>`,
  },
  bath: {
    label: 'badet im Schaum',
    svg: () => `
      <g class="sc-bob">${mon('happy', 66, 42, 64)}</g>
      <path d="M30 92h140v8c0 18-14 28-34 28H64c-20 0-34-10-34-28z" fill="${W}" stroke="#8a6a3b" stroke-width="3"/>
      <path d="M50 128l-6 8M150 128l6 8" ${LINE}/>
      <g fill="#dff3ff" stroke="#9cc9e6" stroke-width="2">
        <circle cx="44" cy="90" r="9"/><circle cx="60" cy="86" r="11"/><circle cx="142" cy="88" r="10"/><circle cx="158" cy="91" r="8"/>
        <circle class="sc-bubble" cx="70" cy="76" r="5"/><circle class="sc-bubble b2" cx="132" cy="72" r="4"/><circle class="sc-bubble b3" cx="104" cy="70" r="3"/>
      </g>
      <g class="sc-duck"><ellipse cx="150" cy="84" rx="12" ry="8" fill="#ffd23f" stroke="#8a6a3b" stroke-width="2"/><circle cx="158" cy="74" r="6" fill="#ffd23f" stroke="#8a6a3b" stroke-width="2"/><path d="M163 74l6 1-6 2z" fill="#ff8a00"/><circle cx="159" cy="72" r="1.2" fill="#3b2a3e"/></g>`,
  },
  laundry: {
    label: 'versteckt sich im Wäschekorb',
    svg: () => `
      <g class="sc-peek">${mon('taunt', 70, 24, 60)}
        <path d="M86 30q14-16 28 0l-4 8q-10-8-20 0z" fill="#ff7aa2" stroke="#8a6a3b" stroke-width="2"/><circle cx="100" cy="20" r="4" fill="${W}" stroke="#8a6a3b" stroke-width="2"/></g>
      <path d="M52 78h96l-10 50H62z" fill="#e9c78f" stroke="#8a6a3b" stroke-width="3" stroke-linejoin="round"/>
      <path d="M60 92h80M64 106h72M68 118h64" stroke="#c9a46b" stroke-width="3"/>
      <path d="M58 80q10-10 22-2M120 78q12-8 22 2" stroke="#7cc6ff" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  },
  broom: {
    label: 'reitet auf dem Besen',
    svg: () => `
      <g class="sc-ride">
        <path d="M30 112l120-14" stroke="#a0703c" stroke-width="5" stroke-linecap="round"/>
        <path d="M150 98l26-10 4 22-26 4z" fill="#e8c35c" stroke="#8a6a3b" stroke-width="2.5"/>
        ${mon('happy', 64, 52, 58)}
      </g>
      <g class="sc-dust"><circle cx="24" cy="118" r="5" fill="#cfc6b8"/><circle cx="12" cy="112" r="4" fill="#ddd5c9"/><circle cx="16" cy="124" r="3" fill="#ddd5c9"/></g>
      <path d="M10 132h180" ${LINE}/>`,
  },
  plant: {
    label: 'versteckt sich hinter der Pflanze',
    svg: () => `
      <g class="sc-hide">${mon('taunt', 92, 40, 58)}</g>
      <path d="M60 100h44l-6 30H66z" fill="#d9825b" stroke="#8a6a3b" stroke-width="3" stroke-linejoin="round"/>
      <g class="sc-leaves" fill="#5fbf5f" stroke="#2f7a3a" stroke-width="2.5">
        <path d="M82 100c-20-10-30-30-24-50 14 8 24 26 24 50z"/><path d="M82 100c4-26 18-44 36-48-2 20-16 40-36 48z"/><path d="M82 100c-6-30 0-54 6-64 8 16 6 44-6 64z"/>
      </g>
      <g class="sc-drop"><path d="M150 60c-4 8-4 12 0 12s4-4 0-12z" fill="#7cc6ff"/></g>
      <path d="M140 50h22l10-10" ${LINE}/><rect x="134" y="46" width="20" height="14" rx="3" fill="#7cc6ff" stroke="#8a6a3b" stroke-width="2.5"/>`,
  },
  toybox: {
    label: 'springt aus der Spielzeugkiste',
    svg: () => `
      <g class="sc-jack">
        <path d="M100 96c-10-4 10-8 0-12s10-8 0-12 10-8 0-12" stroke="#8a6a3b" stroke-width="3" fill="none"/>
        ${mon('happy', 72, 4, 56)}
      </g>
      <g class="sc-lid"><path d="M56 96l-6-14 96-10 4 14z" fill="#ff9f43" stroke="#8a6a3b" stroke-width="3" stroke-linejoin="round"/></g>
      <rect x="56" y="96" width="88" height="34" rx="4" fill="#ffb86b" stroke="#8a6a3b" stroke-width="3"/>
      <circle cx="100" cy="113" r="6" fill="#ffd23f" stroke="#8a6a3b" stroke-width="2"/>
      <rect x="20" y="116" width="16" height="14" rx="2" fill="#7cc6ff" stroke="#8a6a3b" stroke-width="2"/><rect x="162" y="112" width="14" height="18" rx="2" fill="#ff7aa2" stroke="#8a6a3b" stroke-width="2"/>`,
  },
};

const RULES = [
  [/bett|kuschel/i, 'bed'],
  [/bad|wanne|dusch|waschbecken|toilette|spiegel|handt|wc/i, 'bath'],
  [/wäsche|socke|kleidung|garderobe|schuh/i, 'laundry'],
  [/fegen|saug|boden|laub|schnee|fußmatte|müll/i, 'broom'],
  [/pflanz|gieß|blume|garten|unkraut/i, 'plant'],
  [/spielzeug|kinderzimmer|aufräum|schreibtisch|lego/i, 'toybox'],
  [/staub|lampe|fenster/i, 'lamp'],
];
const KEYS = Object.keys(SCENES);
/** scene that fits a task (or a random one) */
export function sceneFor(task) {
  const text = task ? `${task.name}` : '';
  for (const [re, key] of RULES) if (re.test(text)) return key;
  return KEYS[Math.floor(Math.random() * KEYS.length)];
}
export function randomScene(except) {
  const list = KEYS.filter(k => k !== except);
  return list[Math.floor(Math.random() * list.length)];
}
export function sceneSvg(key, cls = 'scene') {
  const s = SCENES[key] || SCENES.lamp;
  return `<svg class="${cls} scene-${key}" viewBox="0 0 200 140" aria-label="Schmuddel ${s.label}">${s.svg()}</svg>`;
}
