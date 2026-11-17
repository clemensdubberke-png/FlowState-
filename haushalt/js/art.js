// Original illustrations: white line-art rooms + the original monster "Schmuddel".
// All artwork is hand-built from simple SVG primitives for this app.

const S = 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';

const rooms = {
  kueche: `
    <path d="M44 24h34l6 12H38z"/><path d="M58 14v10M64 14v10"/><path d="M48 30h26"/>
    <rect x="34" y="62" width="44" height="46" rx="2"/><path d="M34 74h44"/>
    <circle cx="42" cy="68" r="2.4"/><circle cx="50" cy="68" r="2.4"/><circle cx="58" cy="68" r="2.4"/><circle cx="66" cy="68" r="2.4"/>
    <rect x="40" y="80" width="32" height="20" rx="2"/><path d="M44 84l8 10M54 84l10 12"/>
    <path d="M44 62v-6h18v6"/><path d="M40 56h26"/><path d="M50 56c0-6 6-6 6 0"/>
    <rect x="78" y="62" width="40" height="46"/><path d="M98 62v46M92 80v6M104 80v6"/>
    <path d="M110 62v-8a5 5 0 0 1 10 0"/><path d="M120 54v3"/>
    <path d="M82 62v-10h8v10"/><path d="M84 46c0-6 4-8 4-8M86 52c2-4 6-5 6-5"/>
    <path d="M148 40h26M150 40v-8h6v8M160 40v-12h8v12"/>`,
  wohnzimmer: `
    <path d="M30 40h40M34 40v-10h4v10M44 40v-6h10v6"/><path d="M38 48h40"/><path d="M50 48v-6h10v6"/><path d="M42 40v8M74 40v8"/>
    <rect x="96" y="30" width="28" height="18" rx="1"/><path d="M100 44l8-8 6 6 6-4"/>
    <path d="M70 96V82a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v14"/>
    <path d="M62 84a6 6 0 0 1 12 0v18h72V84a6 6 0 0 1 12 0v20H62z"/>
    <path d="M110 76v26"/><rect x="80" y="84" width="12" height="9" rx="2"/><rect x="126" y="84" width="12" height="9" rx="2"/>
    <path d="M72 104v5M148 104v5"/>
    <path d="M24 92h24M28 92v16M44 92v16"/><path d="M32 92v-6c-4-4-6-10-2-14M36 86c0-6 4-10 8-12M34 86c-2-6-8-6-10-6"/>`,
  esszimmer: `
    <path d="M100 14v14"/><path d="M84 40l16-12 16 12z"/>
    <path d="M56 70h88"/><path d="M64 70v34M136 70v34"/><path d="M60 76h80"/>
    <path d="M38 58v46M38 82h16v22M54 82v-6"/><path d="M162 58v46M162 82h-16v22M146 82v-6"/>
    <path d="M86 70v-8h8v8M104 70v-12h4v12M116 66c0-6 8-6 8 0v4"/>`,
  schlafzimmer: `
    <path d="M60 104V72a4 4 0 0 1 4-4h76a4 4 0 0 1 4 4v32"/>
    <path d="M54 104h96v-18H54z"/><path d="M54 104v6M150 104v6"/>
    <rect x="70" y="72" width="22" height="10" rx="4"/><rect x="112" y="72" width="22" height="10" rx="4"/>
    <path d="M58 86c14 6 30 0 46 4s30 0 44-4"/>
    <path d="M80 58l4 6 4-6M120 54l3 4 3-4"/><path d="M100 30l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/>
    <rect x="22" y="84" width="22" height="22"/><path d="M22 95h22M31 90h4M31 101h4"/>
    <path d="M28 84v-8h10v8"/><path d="M26 76l6-12h2l6 12z"/>
    <rect x="80" y="26" width="16" height="10"/><rect x="104" y="20" width="14" height="10"/>`,
  badezimmer: `
    <path d="M30 22h46"/><path d="M34 22v56"/><path d="M34 22c4 10 0 22 4 34s0 18 2 22"/><path d="M42 22c4 10-2 22 2 34s-2 18 0 22"/>
    <path d="M28 78h70"/><path d="M30 78c0 18 10 24 30 24h12c18 0 24-8 24-24"/><path d="M40 102l-4 8M86 102l4 8"/>
    <path d="M76 30v8l8 4"/><path d="M84 42c-2 4-4 4-6 0"/>
    <path d="M60 60h16v6H60z"/><path d="M64 60v-4h8v4"/>
    <circle cx="146" cy="44" r="14"/><path d="M140 40l8-6M142 48l10-8"/>
    <path d="M128 70h36v6h-36z"/><path d="M132 76h28v34h-28z"/><path d="M146 76v34M142 90v4M150 90v4"/>
    <path d="M146 70v-6h4M136 70v-6"/>`,
  kinderzimmer: `
    <path d="M66 40a12 12 0 1 0 10 18 10 10 0 1 1-10-18z"/>
    <path d="M40 30l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/>
    <rect x="110" y="34" width="18" height="12" rx="1"/><rect x="124" y="48" width="16" height="10" rx="1"/>
    <path d="M30 108V78M30 92h96M126 108V78"/><path d="M30 84h96M42 84v8M54 84v8M66 84v8M78 84v8M90 84v8M102 84v8M114 84v8"/>
    <path d="M36 92c10-6 20 2 30-2s22-4 34 0"/><rect x="38" y="80" width="18" height="10" rx="4"/>
    <path d="M140 104h30v-10h-10l-6-8h-14z"/><circle cx="146" cy="106" r="4"/><circle cx="164" cy="106" r="4"/><path d="M148 92h8"/>`,
  arbeitszimmer: `
    <path d="M40 72h96"/><path d="M44 72v38M132 72v38"/><rect x="44" y="80" width="26" height="30"/><path d="M44 92h26M44 102h26"/>
    <rect x="80" y="44" width="34" height="22" rx="2"/><path d="M97 66v6M90 72h14"/><path d="M84 48h12v8H84z"/>
    <path d="M60 72V64M54 64h12l-6-12z"/><path d="M60 52l-8-8h-4"/>
    <rect x="146" y="30" width="18" height="24"/><path d="M150 36h10M150 42h10M150 48h6"/>
    <path d="M152 74h20v8h-20z"/><path d="M158 82v14M150 96h16M150 96v12M166 96v12M158 96v12"/>
    <path d="M170 62v12"/>`,
  flur: `
    <rect x="66" y="16" width="56" height="94"/><rect x="72" y="22" width="44" height="84"/>
    <rect x="80" y="30" width="28" height="30"/><rect x="80" y="68" width="28" height="30"/>
    <circle cx="94" cy="44" r="2"/><path d="M76 64h8"/>
    <path d="M38 52v6M34 58h8M38 58v4"/><path d="M38 66c-4 0-4 4 0 4"/>
    <rect x="140" y="38" width="8" height="8"/><rect x="154" y="44" width="16" height="12" rx="1"/><rect x="142" y="60" width="10" height="10"/>
    <path d="M124 110c10-2 30 0 40 0"/>`,
  waesche: `
    <path d="M60 22h22M64 22v-6h6v6M74 22v-10h4v10"/><path d="M90 28h18v-8h-18z"/>
    <rect x="40" y="56" width="40" height="52" rx="2"/><path d="M40 66h40"/><circle cx="60" cy="88" r="13"/><circle cx="60" cy="88" r="8"/><path d="M66 61h8"/>
    <rect x="84" y="56" width="40" height="52" rx="2"/><path d="M84 66h40"/><path d="M110 61h8"/><rect x="92" y="46" width="14" height="10"/>
    <path d="M150 36a4 4 0 1 1 4 4v4l-16 10h32l-16-10"/><path d="M142 54h24v14h-24z"/>
    <path d="M136 90h40l-4 18h-32z"/><path d="M130 52c4 10-2 20 2 28"/>`,
  wc: `
    <rect x="44" y="40" width="26" height="22" rx="3"/><path d="M42 62h30c0 18-6 26-16 26h-6c-6 0-8-10-8-26z"/>
    <path d="M50 88v20h16V88"/><path d="M52 46h10"/>
    <circle cx="130" cy="40" r="12"/><path d="M114 64h32v6h-32z"/><path d="M118 70h24v38h-24z"/><path d="M130 64v-6h4"/>
    <path d="M92 70h8v20h-8z"/><path d="M90 66h12"/>`,
  keller: `
    <path d="M28 108V24M28 48h70M28 76h70M28 104h70M98 24v84"/>
    <rect x="34" y="34" width="18" height="14"/><rect x="58" y="38" width="12" height="10"/><path d="M76 48V34h6v14M84 48V38h6v10"/>
    <rect x="36" y="60" width="26" height="16"/><path d="M36 66h26"/><rect x="68" y="62" width="22" height="14"/>
    <rect x="120" y="76" width="34" height="28"/><path d="M120 86h34M137 76v10"/><rect x="128" y="56" width="22" height="20"/><path d="M128 64h22"/>
    <path d="M164 104V64l14 40"/>`,
  dachboden: `
    <path d="M20 104L100 24l80 80"/><path d="M40 104L100 44l60 60"/>
    <circle cx="100" cy="66" r="9"/><path d="M91 66h18M100 57v18"/>
    <rect x="56" y="86" width="24" height="18"/><path d="M56 92h24"/><rect x="120" y="80" width="22" height="24"/><path d="M120 88h22"/>
    <path d="M86 104v-10h12v10"/>`,
  allgemein: `
    <rect x="22" y="18" width="156" height="92"/>
    <path d="M70 18v40H22M70 70v40M110 18v30M110 62v48M140 62h38M110 62h16M70 58h20"/>
    <rect x="30" y="26" width="16" height="10"/><circle cx="58" cy="32" r="5"/><rect x="28" y="78" width="30" height="20" rx="3"/>
    <rect x="80" y="76" width="22" height="14" rx="2"/><path d="M84 90v6M98 90v6"/>
    <rect x="120" y="24" width="26" height="18" rx="2"/><path d="M120 30h26"/><rect x="150" y="26" width="20" height="26"/>
    <rect x="124" y="76" width="18" height="24" rx="4"/><circle cx="160" cy="88" r="7"/>
    <path d="M80 30h20M80 40h20"/>`,
  garage: `
    <path d="M24 46l76-28 76 28v64H24z"/><path d="M40 110V58h120v52"/><path d="M40 70h120M40 82h120M40 94h120"/>
    <path d="M66 110v-8a6 6 0 0 1 6-6h56a6 6 0 0 1 6 6v8"/>`,
  garten: `
    <circle cx="56" cy="44" r="22"/><path d="M56 66v42M56 84l-10-8M56 78l10-8"/>
    <path d="M100 108v-56l-6-8h12l-6 8M120 108v-56l-6-8h12l-6 8M140 108v-56l-6-8h12l-6 8M160 108v-56l-6-8h12l-6 8"/>
    <path d="M94 66h72M94 92h72"/>
    <circle cx="30" cy="96" r="4"/><path d="M30 100v8M26 96h-4M34 96h4M30 92v-4"/>
    <path d="M80 108c0-8 4-12 4-12s4 4 4 12"/><path d="M164 30a8 8 0 1 0 0 0.1"/><path d="M150 24l-4-4M178 24l4-4M164 14v-4"/>`,
  balkon: `
    <path d="M20 70h160M20 108h160M20 70v38M180 70v38"/>
    <path d="M36 70v38M52 70v38M68 70v38M84 70v38M100 70v38M116 70v38M132 70v38M148 70v38M164 70v38"/>
    <path d="M40 70V58h18v12"/><path d="M44 58c-4-12 4-18 6-22M50 58c2-10 10-12 12-14M48 58c-2-8-10-10-12-10"/>
    <path d="M120 70V42M120 42h22v14"/><path d="M118 56h28"/>
    <path d="M80 30h40v10H80z"/><path d="M86 40v10M114 40v10"/>`,
  terrasse: `
    <path d="M100 20v74"/><path d="M60 40c10-20 70-20 80 0z"/><path d="M80 40c4-10 36-10 40 0"/>
    <path d="M70 76h60M76 76v32M124 76v32"/>
    <path d="M40 64v44M40 86h18v22M58 86v-4"/><path d="M160 64v44M160 86h-18v22M142 86v-4"/>
    <path d="M20 110h160"/>`,
  auto: `
    <path d="M30 88V76l14-4 18-20h56l22 20 26 6v10z"/><path d="M68 56l-12 16h40V56zM104 56v16h30l-16-16z"/>
    <circle cx="62" cy="92" r="11"/><circle cx="62" cy="92" r="4"/><circle cx="138" cy="92" r="11"/><circle cx="138" cy="92" r="4"/>
    <path d="M30 88h20M74 88h52M150 88h16"/><path d="M98 76h8"/>
    <path d="M20 108h160"/>`,
};

export const ROOM_TYPES = {
  innen: [
    ['kueche', 'Küche'], ['wohnzimmer', 'Wohnzimmer'], ['esszimmer', 'Esszimmer'], ['schlafzimmer', 'Schlafzimmer'],
    ['badezimmer', 'Badezimmer'], ['kinderzimmer', 'Kinderzimmer'], ['arbeitszimmer', 'Arbeitszimmer'], ['flur', 'Flur'],
    ['waesche', 'Wäschekammer'], ['wc', 'Gäste-WC'], ['keller', 'Keller'], ['dachboden', 'Dachboden'], ['allgemein', 'Allgemein'],
  ],
  aussen: [
    ['garten', 'Garten'], ['balkon', 'Balkon'], ['terrasse', 'Terrasse'], ['garage', 'Garage'], ['auto', 'Auto'],
  ],
};

export const AREA_COLORS = [
  '#4cc392', '#3eaef7', '#6d7fd6', '#5bc2c2', '#1fa46c', '#2a8fc9', '#3aa5a0', '#8fa6ea',
  '#3480dc', '#f29a3a', '#e9667b', '#b07ad9', '#8a9a5b', '#e0b33a', '#5f6b7a', '#d9735a',
];

export function roomSvg(type, cls = '') {
  const body = rooms[type] || rooms.allgemein;
  return `<svg class="${cls}" viewBox="0 0 200 120" aria-hidden="true"><g ${S}>${body}</g></svg>`;
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
// moods: 'taunt' (arms up, grinning), 'wave', 'sad', 'angry', 'shock'
export function monsterSvg(mood = 'taunt', cls = 'monster') {
  const body = '#8fb84a', dark = '#6e9234', light = '#b6d877';
  let arms, mouth, brows, eyesExtra = '';
  switch (mood) {
    case 'sad':
      arms = `<path d="M34 92c-10 6-14 14-12 20" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <path d="M126 92c10 6 14 14 12 20" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      mouth = `<path d="M62 104c10-10 26-10 36 0" stroke="#3b2a3e" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      brows = `<path d="M46 50l18 8M114 50l-18 8" stroke="#3b2a3e" stroke-width="4" stroke-linecap="round"/>`;
      eyesExtra = `<path d="M54 80c-2 6 2 8 3 4" fill="#7cc7ff"/>`;
      break;
    case 'shock':
      arms = `<path d="M32 86c-12-6-16-16-12-24" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <path d="M128 86c12-6 16-16 12-24" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      mouth = `<ellipse cx="80" cy="102" rx="10" ry="12" fill="#3b2a3e"/><ellipse cx="80" cy="106" rx="6" ry="5" fill="#e0607a"/>`;
      brows = `<path d="M48 46q10-8 20 0M92 46q10-8 20 0" stroke="#3b2a3e" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      break;
    case 'wave':
      arms = `<path d="M128 84c14-8 18-22 14-34" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <g fill="${dark}"><circle cx="142" cy="46" r="8"/><path d="M136 40l-2-8M142 38v-9M148 40l3-7" stroke="${dark}" stroke-width="4" stroke-linecap="round"/></g>
              <path d="M32 92c-10 4-14 10-12 18" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      mouth = `<path d="M56 94q24 26 48 0z" fill="#3b2a3e"/><path d="M66 94h8v7h-8z" fill="#fff"/><path d="M70 110q10 6 20-2" fill="#e0607a"/>`;
      brows = `<path d="M48 52l18 4M112 52l-18 4" stroke="#3b2a3e" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case 'angry':
      arms = `<path d="M32 86c-12-2-18-8-18-18" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="14" cy="64" r="8" fill="${dark}"/>
              <path d="M128 86c12-2 18-8 18-18" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="146" cy="64" r="8" fill="${dark}"/>`;
      mouth = `<path d="M58 104h44" stroke="#3b2a3e" stroke-width="5" stroke-linecap="round"/><path d="M66 100l4 4 4-4 4 4 4-4 4 4 4-4" stroke="#fff" stroke-width="2" fill="none"/>`;
      brows = `<path d="M46 46l22 12M114 46l-22 12" stroke="#3b2a3e" stroke-width="5" stroke-linecap="round"/>`;
      break;
    default: // taunt
      arms = `<path d="M32 84c-12-6-16-20-12-32" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <g fill="${dark}"><circle cx="20" cy="48" r="9"/></g>
              <path d="M128 84c12-6 16-20 12-32" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>
              <g fill="${dark}"><circle cx="140" cy="48" r="9"/></g>`;
      mouth = `<path d="M50 92q30 34 60 0z" fill="#3b2a3e"/><path d="M60 92h9v8h-9zM92 92h8v6h-8z" fill="#fff"/><path d="M68 112q12 8 26-2" fill="#e0607a"/>`;
      brows = `<path d="M46 50l22 8M114 50l-22 8" stroke="#3b2a3e" stroke-width="4.5" stroke-linecap="round"/>`;
  }
  return `<svg class="${cls}" viewBox="0 0 160 160" aria-hidden="true">
    <ellipse cx="80" cy="150" rx="50" ry="6" fill="rgba(0,0,0,.12)"/>
    <g class="mon-fly"><circle cx="128" cy="18" r="3.5" fill="#3b2a3e"/><ellipse cx="125" cy="13" rx="4" ry="2.5" fill="rgba(255,255,255,.85)"/><ellipse cx="132" cy="13" rx="4" ry="2.5" fill="rgba(255,255,255,.85)"/>
      <path d="M118 26q-6 6 0 10t-4 10" stroke="rgba(59,42,62,.45)" stroke-width="1.5" fill="none" stroke-dasharray="2 3"/></g>
    ${arms}
    <path d="M80 18c-30 0-48 26-50 56-2 26 2 46 4 56 2 8 8 8 10 2 2 8 10 10 14 2 4 8 12 8 16 0 4 8 12 8 16 0 4 8 12 6 14-2 2 6 8 6 10-2 2-10 6-30 4-56-2-30-20-56-38-56z" fill="${body}"/>
    <path d="M80 18c-6 0-10 6-6 10 4 4 10-2 6-10z" fill="${body}"/>
    <path d="M58 30c-10 8-16 22-16 34" stroke="${light}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
    <circle cx="112" cy="116" r="5" fill="${dark}"/><circle cx="46" cy="118" r="4" fill="${dark}"/><circle cx="104" cy="40" r="3.5" fill="${dark}"/><circle cx="38" cy="96" r="3" fill="${dark}"/>
    <path d="M44 130c-2 8-2 14 0 16" stroke="${body}" stroke-width="6" stroke-linecap="round"/>
    <path d="M118 128c2 8 1 12-1 14" stroke="${body}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="70" r="15" fill="#fff"/><circle cx="102" cy="70" r="12" fill="#fff"/>
    <circle cx="63" cy="72" r="6.5" fill="#3b2a3e"/><circle cx="99" cy="72" r="5.5" fill="#3b2a3e"/>
    <circle cx="65" cy="69" r="2" fill="#fff"/><circle cx="101" cy="69" r="1.8" fill="#fff"/>
    ${brows}${eyesExtra}${mouth}
  </svg>`;
}

export const MONSTER_NAME = 'Schmuddel';

// App icon (also used to render PNG icons)
export function appIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="110" fill="#1677f2"/>
  <g transform="translate(96 92) scale(2)">${monsterSvg('wave', '').replace(/<svg[^>]*>|<\/svg>/g, '')}</g></svg>`;
}
