// Original illustrations: white line-art rooms + the original monster "Schmuddel".
// All artwork is hand-built from simple SVG primitives for this app.
import { ROOM_ART } from './rooms-art.js';


export const ROOM_TYPES = {
  innen: [
    ['eigen_innen', '＋ Eigener Innenraum'],
    ['kueche', 'Küche'], ['wohnzimmer', 'Wohnzimmer'], ['esszimmer', 'Esszimmer'], ['schlafzimmer', 'Schlafzimmer'],
    ['badezimmer', 'Badezimmer'], ['kinderzimmer', 'Kinderzimmer'], ['arbeitszimmer', 'Arbeitszimmer'], ['flur', 'Flur'],
    ['waesche', 'Wäschekammer'], ['wc', 'Gäste-WC'], ['keller', 'Keller'], ['dachboden', 'Dachboden'], ['allgemein', 'Allgemein'],
  ],
  aussen: [
    ['eigen_aussen', '＋ Eigener Außenbereich'],
    ['garten', 'Garten'], ['balkon', 'Balkon'], ['terrasse', 'Terrasse'], ['garage', 'Garage'], ['auto', 'Auto'],
  ],
};

export const CUSTOM_TYPES = ['eigen_innen', 'eigen_aussen'];
/** all illustrations to choose from: [key, label] */
export const ART_CHOICES = [
  ['eigen_innen', 'Haus'], ['kueche', 'Küche'], ['wohnzimmer', 'Wohnzimmer'], ['esszimmer', 'Esszimmer'], ['schlafzimmer', 'Schlafzimmer'],
  ['badezimmer', 'Bad'], ['kinderzimmer', 'Kinderzimmer'], ['arbeitszimmer', 'Arbeitszimmer'], ['flur', 'Flur'], ['waesche', 'Wäsche'],
  ['wc', 'WC'], ['keller', 'Keller'], ['dachboden', 'Dachboden'], ['allgemein', 'Grundriss'],
  ['eigen_aussen', 'Draußen'], ['garten', 'Garten'], ['balkon', 'Balkon'], ['terrasse', 'Terrasse'], ['garage', 'Garage'], ['auto', 'Auto'],
];

export const AREA_COLORS = [
  '#4cc392', '#3eaef7', '#6d7fd6', '#5bc2c2', '#1fa46c', '#2a8fc9', '#3aa5a0', '#8fa6ea',
  '#3480dc', '#f29a3a', '#e9667b', '#b07ad9', '#8a9a5b', '#e0b33a', '#5f6b7a', '#d9735a',
];

export function roomSvg(type, cls = '') {
  const body = ROOM_ART[type] || ROOM_ART.allgemein;
  return `<svg class="rm ${cls}" viewBox="0 0 200 120" aria-hidden="true">${body}</svg>`;
}

// Dirt splat shapes for tiles and task rows
const SPLATS = [
  'M12 2c3 0 3 5 6 5s5-3 7 0-2 5 0 8 4 5 1 7-5-1-7 1-2 6-6 6-3-5-6-5-6 3-8 0 2-5 0-8-5-4-2-7 5 0 7-2 2-5 6-5z',
  'M10 1c4-1 4 4 8 4 3 0 7-2 8 2s-3 5-2 8 5 6 1 8-5-3-8-1-3 6-7 5-2-6-5-7-7 1-7-3 4-4 3-7-5-6-1-8 5 2 6 0 0-5 4-6z',
  'M13 0c2 3 0 6 3 8s6-2 8 1-2 5-1 8 4 6 0 7-5-2-8 0-1 6-5 6-2-5-5-6-7 1-7-3 5-3 4-6-6-5-3-8 6 0 8-2-1-6 2-6z',
];
export function splatSvg(i = 0, cls = 'splat') {
  return `<svg class="${cls}" viewBox="0 0 26 26" aria-hidden="true"><path d="${SPLATS[i % SPLATS.length]}" fill="currentColor"/></svg>`;
}

// ---------- The monster: "Schmuddel", an original grumpy slime blob ----------
// Built from named groups so CSS can animate it (breathing, blinking, looking around,
// dripping, arm moves per mood). moods: taunt | wave | sad | angry | shock | happy
// opts.tickle → tapping it makes Schmuddel react; opts.say → CSS selector of a bubble to talk into
export function monsterSvg(mood = 'taunt', cls = 'monster', opts = {}) {
  const body = '#8fb84a', dark = '#6e9234', light = '#b6d877', ink = '#3b2a3e';
  const arm = (d, side) => `<g class="m-arm m-arm-${side}" style="transform-origin:${side === 'l' ? '34px 88px' : '126px 88px'}"><path d="${d}" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  const fist = (x, y) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${dark}"/></g>`;
  let arms, mouth, brows, extra = '';
  switch (mood) {
    case 'sad':
      arms = arm('M34 92c-10 6-14 14-12 20', 'l') + '</g>' + arm('M126 92c10 6 14 14 12 20', 'r') + '</g>';
      mouth = `<path d="M62 106c10-10 26-10 36 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      brows = `<path d="M46 50l18 8M114 50l-18 8" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
      extra = `<path class="m-tear" d="M54 80c-3 6 1 9 3 5z" fill="#7cc7ff"/>`;
      break;
    case 'shock':
      arms = arm('M32 86c-12-6-16-16-12-24', 'l') + '</g>' + arm('M128 86c12-6 16-16 12-24', 'r') + '</g>';
      mouth = `<ellipse class="m-mouth-o" cx="80" cy="102" rx="10" ry="12" fill="${ink}"/><ellipse cx="80" cy="107" rx="6" ry="4.5" fill="#e0607a"/>`;
      brows = `<path d="M48 44q10-8 20 0M92 44q10-8 20 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      extra = `<path class="m-sweat" d="M118 46c-4 6 0 10 3 6z" fill="#7cc7ff"/>`;
      break;
    case 'wave':
      arms = arm('M128 84c14-8 18-22 14-34', 'r') + `<g fill="${dark}"><circle cx="142" cy="46" r="8"/><path d="M136 40l-2-8M142 38v-9M148 40l3-7" stroke="${dark}" stroke-width="4" stroke-linecap="round"/></g></g>`
        + arm('M32 92c-10 4-14 10-12 18', 'l') + '</g>';
      mouth = `<path d="M56 94q24 26 48 0z" fill="${ink}"/><path d="M66 94h8v7h-8z" fill="#fff"/><path d="M70 110q10 6 20-2" fill="#e0607a"/>`;
      brows = `<path d="M48 52l18 4M112 52l-18 4" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case 'happy':
      arms = arm('M32 86c-12-6-16-16-12-26', 'l') + fist(20, 58) + arm('M128 86c12-6 16-16 12-26', 'r') + fist(140, 58);
      mouth = `<path d="M52 92q28 32 56 0z" fill="${ink}"/><path d="M60 92h10v8H60zM90 92h10v7H90z" fill="#fff"/><path d="M68 112q12 8 24-2" fill="#e0607a"/>`;
      brows = `<path d="M48 50q10-6 20 0M92 50q10-6 20 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      extra = `<g class="m-blush" fill="#f29bb0" opacity=".7"><ellipse cx="44" cy="88" rx="7" ry="4"/><ellipse cx="116" cy="88" rx="7" ry="4"/></g>`;
      break;
    case 'angry':
      arms = arm('M32 86c-12-2-18-8-18-18', 'l') + fist(14, 64) + arm('M128 86c12-2 18-8 18-18', 'r') + fist(146, 64);
      mouth = `<path d="M58 104h44" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M66 100l4 4 4-4 4 4 4-4 4 4 4-4" stroke="#fff" stroke-width="2" fill="none"/>`;
      brows = `<path d="M46 46l22 12M114 46l-22 12" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`;
      extra = `<g class="m-steam" stroke="#c8d1d6" stroke-width="4" stroke-linecap="round" fill="none"><path d="M40 26q-4-6 0-12"/><path d="M120 26q4-6 0-12"/></g>`;
      break;
    default: // taunt
      arms = arm('M32 84c-12-6-16-20-12-32', 'l') + fist(20, 48) + arm('M128 84c12-6 16-20 12-32', 'r') + fist(140, 48);
      mouth = `<path d="M50 92q30 34 60 0z" fill="${ink}"/><path d="M60 92h9v8h-9zM92 92h8v6h-8z" fill="#fff"/><path class="m-tongue" d="M68 112q12 8 26-2" fill="#e0607a"/>`;
      brows = `<path d="M46 50l22 8M114 50l-22 8" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`;
  }
  const tickle = opts.tickle ? ` data-tickle="1"${opts.say ? ` data-say="${opts.say}"` : ''}` : '';
  return `<svg class="${cls} mon mood-${mood}" viewBox="0 0 160 160" aria-hidden="true"${tickle}>
    <ellipse class="m-shadow" cx="80" cy="150" rx="50" ry="6" fill="rgba(0,0,0,.12)" style="transform-origin:80px 150px"/>
    <g class="m-fly"><circle cx="128" cy="18" r="3.5" fill="${ink}"/><ellipse class="m-wing" cx="125" cy="13" rx="4" ry="2.5" fill="rgba(255,255,255,.85)" style="transform-origin:127px 15px"/><ellipse class="m-wing" cx="132" cy="13" rx="4" ry="2.5" fill="rgba(255,255,255,.85)" style="transform-origin:129px 15px"/></g>
    <g class="m-all" style="transform-origin:80px 148px">
      ${arms}
      <g class="m-body" style="transform-origin:80px 148px">
        <path d="M80 18c-30 0-48 26-50 56-2 26 2 46 4 56 2 8 8 8 10 2 2 8 10 10 14 2 4 8 12 8 16 0 4 8 12 8 16 0 4 8 12 6 14-2 2 6 8 6 10-2 2-10 6-30 4-56-2-30-20-56-38-56z" fill="${body}"/>
        <path class="m-curl" d="M80 18c-6 0-10 6-6 10 4 4 10-2 6-10z" fill="${body}" style="transform-origin:78px 24px"/>
        <path d="M58 30c-10 8-16 22-16 34" stroke="${light}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
        <circle cx="112" cy="116" r="5" fill="${dark}"/><circle cx="46" cy="118" r="4" fill="${dark}"/><circle cx="104" cy="40" r="3.5" fill="${dark}"/><circle cx="38" cy="96" r="3" fill="${dark}"/>
        <path class="m-drip m-drip1" d="M44 130c-2 8-2 14 0 16" stroke="${body}" stroke-width="6" stroke-linecap="round" style="transform-origin:44px 130px"/>
        <path class="m-drip m-drip2" d="M118 128c2 8 1 12-1 14" stroke="${body}" stroke-width="5" stroke-linecap="round" style="transform-origin:118px 128px"/>
        <circle class="m-drop" cx="44" cy="148" r="3" fill="${body}"/>
        <g class="m-eyes" style="transform-origin:80px 70px">
          <circle cx="60" cy="70" r="15" fill="#fff"/><circle cx="102" cy="70" r="12" fill="#fff"/>
          <g class="m-pupils"><circle cx="63" cy="72" r="6.5" fill="${ink}"/><circle cx="99" cy="72" r="5.5" fill="${ink}"/>
          <circle cx="65" cy="69" r="2" fill="#fff"/><circle cx="101" cy="69" r="1.8" fill="#fff"/></g>
        </g>
        <g class="m-brows">${brows}</g>
        <g class="m-mouth" style="transform-origin:80px 100px">${mouth}</g>
        ${extra}
      </g>
    </g>
  </svg>`;
}

export const MONSTER_NAME = 'Schmuddel';

// App icon (also used to render PNG icons)
export function appIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="110" fill="#1677f2"/>
  <g transform="translate(96 92) scale(2)">${monsterSvg('wave', '').replace(/<svg[^>]*>|<\/svg>/g, '')}</g></svg>`;
}
