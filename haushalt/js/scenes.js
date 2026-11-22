// Animated little scenes with Schmuddel for kids mode (all original artwork).
// Objects are drawn in Schmuddel's style: round, soft colours, gradients, highlights, soft shadows.
// Each scene: an SVG stage (300 × 210) + voiced lines LINES['scene_' + key].
// Motion lives in css/app.css (".s2-…" rules): many in-between poses, squash & stretch, follow-through.
import { monsterSvg } from './art.js';

const OL = 'stroke="#5b4334" stroke-opacity=".45" stroke-width="1.8" stroke-linejoin="round"';
const ARM = '#6e9234';

// a Schmuddel inside a scene; extra class "noarms" hides his own arms so the scene can draw posed ones
function mon(mood, x, y, size, extra = '') {
  return monsterSvg(mood, `scene-mon ${extra}`).replace('<svg class=', `<svg x="${x}" y="${y}" width="${size}" height="${size}" class=`);
}
const arm = (d, w = 4.4) => `<path d="${d}" stroke="${ARM}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
const fist = (x, y, r = 5.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ARM}"/>`;
const shadow = (cx, cy, rx, cls = '') => `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${rx}" ry="5.5" fill="rgba(60,40,20,.13)"/>`;

export const SCENES = {
  // ---------------------------------------------------------------- lamp
  lamp: {
    label: 'schaukelt an der Lampe',
    svg: u => `
      <defs>
        <linearGradient id="lsh${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd970"/><stop offset="1" stop-color="#f0873a"/></linearGradient>
        <radialGradient id="lbu${u}"><stop offset="0" stop-color="#fffef4"/><stop offset=".6" stop-color="#fff2a6"/><stop offset="1" stop-color="#ffcf55"/></radialGradient>
        <radialGradient id="lgl${u}"><stop offset="0" stop-color="#fff6b4" stop-opacity=".95"/><stop offset="1" stop-color="#fff6b4" stop-opacity="0"/></radialGradient>
        <linearGradient id="lco${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a0" stop-opacity=".8"/><stop offset="1" stop-color="#fff1a0" stop-opacity="0"/></linearGradient>
      </defs>
      ${shadow(150, 204, 46, 's2-lamp-shadow')}
      <rect x="130" y="0" width="40" height="8" rx="4" fill="#dcc6a2" ${OL}/>
      <g class="s2-lamp-swing">
        <path class="s2-lamp-cone" d="M118 100 L62 210 H238 L182 100 Z" fill="url(#lco${u})"/>
        <path d="M150 7 C151.5 26 148.5 44 150 60" stroke="#5b4334" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <rect x="142" y="55" width="16" height="11" rx="3.5" fill="#8d6e58" ${OL}/>
        <path d="M144 60 H156" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
        <circle class="s2-lamp-glow" cx="150" cy="100" r="34" fill="url(#lgl${u})"/>
        <path d="M106 98 Q108 65 150 61 Q192 65 194 98 Z" fill="url(#lsh${u})" ${OL}/>
        <path d="M118 89 Q121 72 145 67" stroke="#fff" stroke-opacity=".6" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <g fill="#fff" opacity=".38"><circle cx="132" cy="85" r="3.2"/><circle cx="151" cy="77" r="3.2"/><circle cx="170" cy="85" r="3.2"/><circle cx="141" cy="93" r="2.4"/><circle cx="161" cy="93" r="2.4"/></g>
        <ellipse cx="150" cy="98" rx="44" ry="7.5" fill="#e3773a" ${OL}/>
        <circle cx="150" cy="101" r="9.5" fill="url(#lbu${u})"/>
        <g class="s2-lamp-rider">
          ${mon('happy', 107, 95, 86, 'noarms')}
          ${arm('M125 142 C113 130 115 113 124 102')}${arm('M175 142 C187 130 185 113 176 102')}
          ${fist(124, 101)}${fist(176, 101)}
        </g>
        <g fill="#cdbf9f"><circle class="s2-lamp-dust d1" cx="134" cy="104" r="2"/><circle class="s2-lamp-dust d2" cx="166" cy="105" r="1.6"/><circle class="s2-lamp-dust d3" cx="150" cy="106" r="1.8"/></g>
      </g>`,
  },

  // ---------------------------------------------------------------- bed
  bed: {
    label: 'hüpft auf dem Bett',
    svg: u => `
      <defs>
        <linearGradient id="bw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3a46b"/><stop offset="1" stop-color="#a9683a"/></linearGradient>
        <linearGradient id="bm${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#e6ddcc"/></linearGradient>
        <linearGradient id="bb${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9dcdff"/><stop offset="1" stop-color="#4b86e0"/></linearGradient>
        <linearGradient id="bp${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e6f1"/></linearGradient>
      </defs>
      ${shadow(152, 202, 122)}
      <path d="M34 198 V92 Q34 70 57 70 Q80 70 80 92 V198 Z" fill="url(#bw${u})" ${OL}/>
      <rect x="43" y="94" width="28" height="58" rx="9" fill="#b97541" opacity=".55"/>
      <path d="M42 100 Q42 82 56 80" stroke="#fff" stroke-opacity=".35" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <circle cx="57" cy="68" r="7.5" fill="#efb57c" ${OL}/>
      <path d="M240 198 V126 Q240 110 255 110 Q270 110 270 126 V198 Z" fill="url(#bw${u})" ${OL}/>
      <circle cx="255" cy="108" r="6.5" fill="#efb57c" ${OL}/>
      <rect x="70" y="160" width="178" height="20" rx="7" fill="#b9773f" ${OL}/>
      <path d="M80 166 H238" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>
      <path d="M84 180 v14 M232 180 v14" stroke="#8a552d" stroke-width="6" stroke-linecap="round"/>
      <g class="s2-bed-matt">
        <rect x="74" y="133" width="172" height="29" rx="11" fill="url(#bm${u})" ${OL}/>
        <path d="M86 147 H234" stroke="#cbbfa8" stroke-width="1.6" stroke-dasharray="4 4"/>
        <path d="M116 129 Q170 119 248 129 L250 177 Q238 186 225 177 Q211 187 197 177 Q183 187 169 177 Q154 186 141 177 Q127 186 114 175 Z" fill="url(#bb${u})" ${OL}/>
        <g fill="#fff" opacity=".35"><circle cx="134" cy="142" r="4"/><circle cx="160" cy="136" r="4"/><circle cx="188" cy="141" r="4"/><circle cx="216" cy="137" r="4"/><circle cx="146" cy="160" r="4"/><circle cx="176" cy="158" r="4"/><circle cx="206" cy="160" r="4"/><circle cx="234" cy="156" r="4"/></g>
        <path d="M124 134 Q170 126 240 134" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>
      <g class="s2-bed-pillow">
        <path d="M80 133 Q77 112 101 111 Q125 109 127 128 Q129 141 105 141 Q82 143 80 133 Z" fill="url(#bp${u})" ${OL}/>
        <path d="M90 120 Q100 115 114 116" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M104 112 v28" stroke="#d7dbe8" stroke-width="1.5" stroke-dasharray="3 3"/>
      </g>
      <g class="s2-bed-jump">${mon('happy', 119, 51, 92)}</g>
      <g class="s2-feather f1"><path transform="translate(214 64)" d="M0 0 Q6 -9 15 -3 Q8 4 0 0 Z M2 -1 L14 -3" fill="#fff" ${OL}/></g>
      <g class="s2-feather f2"><path transform="translate(92 58)" d="M0 0 Q6 -9 15 -3 Q8 4 0 0 Z M2 -1 L14 -3" fill="#fff" ${OL}/></g>
      <g class="s2-feather f3"><path transform="translate(176 40)" d="M0 0 Q6 -9 15 -3 Q8 4 0 0 Z M2 -1 L14 -3" fill="#fff" ${OL}/></g>`,
  },

  // ---------------------------------------------------------------- bath
  bath: {
    label: 'badet im Schaum',
    svg: u => `
      <defs>
        <linearGradient id="tt${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6e7f4"/></linearGradient>
        <linearGradient id="tw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe7ff"/><stop offset="1" stop-color="#83c9f1"/></linearGradient>
        <linearGradient id="tg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#cf952a"/></linearGradient>
        <linearGradient id="tc${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef3f6"/><stop offset="1" stop-color="#97a6b0"/></linearGradient>
        <linearGradient id="td${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe76b"/><stop offset="1" stop-color="#f6b400"/></linearGradient>
      </defs>
      ${shadow(150, 203, 112)}
      <path d="M248 106 V68 Q248 52 232 52 Q216 52 216 66" stroke="url(#tc${u})" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="257" cy="80" r="6" fill="#ef5a6a" ${OL}/><circle cx="257" cy="80" r="2" fill="#fff" opacity=".7"/>
      <g class="s2-bath-drip"><path d="M216 72 q-3.5 6 0 9 q3.5 -3 0 -9z" fill="#8fd0f5"/></g>
      <ellipse cx="150" cy="112" rx="114" ry="14" fill="url(#tw${u})"/>
      <g class="s2-bath-bob">${mon('happy', 102, 30, 96)}</g>
      <path d="M36 112 H264 Q266 176 214 187 H86 Q34 176 36 112 Z" fill="url(#tt${u})" ${OL}/>
      <path d="M54 128 Q58 168 96 177" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
      <rect x="28" y="104" width="244" height="14" rx="7" fill="#ffffff" ${OL}/>
      <path d="M40 108 H120" stroke="#e3eef6" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M72 185 Q66 199 56 200 H80 Q76 193 80 185 Z" fill="url(#tg${u})" ${OL}/>
      <path d="M228 185 Q234 199 244 200 H220 Q224 193 220 185 Z" fill="url(#tg${u})" ${OL}/>
      <g class="s2-foam" fill="#fff" stroke="#bfdcef" stroke-width="1.5">
        <circle class="fo f1" cx="58" cy="102" r="13"/><circle class="fo f2" cx="80" cy="96" r="16"/><circle class="fo f3" cx="104" cy="101" r="13"/>
        <circle class="fo f4" cx="126" cy="106" r="10"/><circle class="fo f5" cx="174" cy="106" r="10"/><circle class="fo f6" cx="196" cy="101" r="13"/>
        <circle class="fo f7" cx="240" cy="99" r="14"/><circle class="fo f2" cx="150" cy="109" r="8"/>
      </g>
      <g class="s2-duck"><g transform="translate(200 76)">
        <path d="M0 16 Q2 3 17 5 Q21 -8 30 -2 Q37 4 29 10 Q36 17 27 23 H7 Q-2 23 0 16 Z" fill="url(#td${u})" ${OL}/>
        <path d="M8 14 Q14 10 20 15" stroke="#e8a300" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M33 2 L42 4 L33 7 Z" fill="#ff8a00" ${OL}/><circle cx="28" cy="0" r="1.8" fill="#3b2a3e"/>
        <path d="M22 -2 Q25 -5 28 -4" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8"/>
      </g></g>
      <g fill="rgba(255,255,255,.85)" stroke="#9fd0ec" stroke-width="1.3">
        <circle class="s2-bub b1" cx="94" cy="92" r="5"/><circle class="s2-bub b2" cx="130" cy="96" r="3.5"/><circle class="s2-bub b3" cx="186" cy="92" r="4.5"/>
        <circle class="s2-bub b4" cx="66" cy="88" r="3"/><circle class="s2-bub b5" cx="214" cy="90" r="3.5"/>
      </g>
      <g fill="#8fd0f5">
        <path class="s2-splash s1" style="--dx:-34" d="M146 98 q-3 6 0 8 q3 -2 0 -8z"/><path class="s2-splash s2" style="--dx:-14" d="M148 96 q-3 6 0 8 q3 -2 0 -8z"/>
        <path class="s2-splash s3" style="--dx:16" d="M152 96 q-3 6 0 8 q3 -2 0 -8z"/><path class="s2-splash s4" style="--dx:36" d="M154 98 q-3 6 0 8 q3 -2 0 -8z"/>
      </g>`,
  },

  // ---------------------------------------------------------------- laundry basket
  laundry: {
    label: 'versteckt sich im Wäschekorb',
    svg: u => {
      let weave = '';
      for (let i = 0; i < 6; i++) for (let j = 0; j < 9; j++) weave += `<rect x="${66 + j * 20 + (i % 2) * 10}" y="${120 + i * 13}" width="12" height="7.5" rx="3" fill="rgba(110,64,26,.22)"/>`;
      return `
      <defs>
        <linearGradient id="ww${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ebbf7f"/><stop offset="1" stop-color="#bd8645"/></linearGradient>
        <clipPath id="wcl${u}"><path d="M64 110 H236 L222 196 H78 Z"/></clipPath>
        <clipPath id="wpk${u}"><rect x="0" y="0" width="300" height="196"/></clipPath>
      </defs>
      ${shadow(150, 202, 92)}
      <g class="s2-sock-fly"><g transform="translate(140 104)"><path d="M0 0 L2 -16 Q3 -22 10 -22 Q17 -22 17 -16 L17 -8 Q27 -9 29 -3 Q30 3 22 3 L2 3 Q-1 3 0 0 Z" fill="#ffd23f" ${OL}/><path d="M2 -14 H17 M1 -7 H17" stroke="#ff6b6b" stroke-width="3"/></g></g>
      <ellipse cx="150" cy="110" rx="84" ry="12" fill="#8a5d2e"/>
      <path d="M82 112 Q84 90 99 88 Q113 86 117 103 L119 112 Z" fill="#ff9ab5" ${OL}/>
      <path d="M88 100 H112" stroke="#fff" stroke-opacity=".6" stroke-width="2.5"/>
      <g clip-path="url(#wpk${u})"><g class="s2-peek">
        ${mon('taunt', 105, 26, 90)}
        <g transform="rotate(-14 152 30)">
          <path d="M136 44 L138 26 Q139 17 150 17 Q161 17 162 26 L162 34 Q175 33 179 40 Q181 48 170 48 L138 48 Q134 48 136 44 Z" fill="#ff7b7b" ${OL}/>
          <path d="M138 29 H162 M137 37 H162" stroke="#fff" stroke-width="3.2"/><circle cx="150" cy="15" r="4" fill="#fff" ${OL}/>
        </g>
      </g></g>
      <g class="s2-basket">
        <path d="M64 110 H236 L222 196 H78 Z" fill="url(#ww${u})" ${OL}/>
        <g clip-path="url(#wcl${u})">${weave}<path d="M70 118 Q72 160 84 190" stroke="#fff" stroke-opacity=".3" stroke-width="5" fill="none" stroke-linecap="round"/></g>
        <ellipse cx="90" cy="130" rx="9" ry="4.5" fill="#6b4422"/><ellipse cx="210" cy="130" rx="9" ry="4.5" fill="#6b4422"/>
        <rect x="56" y="103" width="188" height="15" rx="7.5" fill="#dba664" ${OL}/>
        <path d="M66 108 H160" stroke="#fff" stroke-opacity=".4" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M94 108 Q89 128 96 142 Q101 148 108 143 Q103 128 106 110 Z" fill="#7ad37a" ${OL}/>
        <path d="M93 120 L104 119 M94 131 L104 130" stroke="#fff" stroke-width="2.5"/>
        <path d="M196 105 Q216 109 219 133 Q212 140 203 135 Q201 118 190 111 Z" fill="#6fa8ff" ${OL}/>
        <path d="M206 116 Q210 124 210 132" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>
      </g>`;
    },
  },

  // ---------------------------------------------------------------- broom
  broom: {
    label: 'reitet auf dem Besen',
    svg: u => {
      let straws = '';
      for (let k = 0; k < 8; k++) straws += `<path d="M94 ${125 + k * 2.6} L${30 + (k % 2) * 3} ${100 + k * 9}" stroke="#c98d2d" stroke-opacity=".55" stroke-width="1.4"/>`;
      return `
      <defs>
        <linearGradient id="rw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d79a5e"/><stop offset="1" stop-color="#9c5f31"/></linearGradient>
        <linearGradient id="rs${u}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#e2a540"/></linearGradient>
      </defs>
      ${shadow(160, 203, 90, 's2-broom-shadow')}
      <g stroke="#e3d2ad" stroke-width="3" stroke-linecap="round">
        <path class="s2-speed v1" d="M14 96 H42"/><path class="s2-speed v2" d="M6 122 H30"/><path class="s2-speed v3" d="M16 162 H46"/>
      </g>
      <g fill="#e6dccb"><circle class="s2-puff p1" cx="34" cy="140" r="9"/><circle class="s2-puff p2" cx="30" cy="124" r="7"/><circle class="s2-puff p3" cx="36" cy="156" r="6"/></g>
      <g class="s2-broom">
        <g class="s2-bristle">
          <path d="M96 121 L30 97 Q18 132 30 172 L96 146 Z" fill="url(#rs${u})" ${OL}/>
          ${straws}
          <path d="M92 126 L40 106" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" stroke-linecap="round"/>
        </g>
        <path d="M90 119 L106 117 L108 147 L92 149 Z" fill="#e2574c" ${OL}/>
        <path d="M95 118 L97 148" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
        <g class="s2-rider">
          ${mon('happy', 128, 48, 84, 'noarms')}
          ${arm('M146 94 C151 112 182 124 210 120')}${arm('M194 94 C206 100 216 108 224 118')}
        </g>
        <path d="M102 134 L270 112" stroke="url(#rw${u})" stroke-width="9" stroke-linecap="round"/>
        <path d="M112 130 L262 111" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="271" cy="112" r="6.5" fill="#a86a3d" ${OL}/>
        ${fist(211, 119.5)}${fist(225, 117.6)}
      </g>
      <g fill="#a8794a"><circle class="s2-crumb c1" cx="60" cy="150" r="2.4"/><circle class="s2-crumb c2" cx="52" cy="132" r="2"/><circle class="s2-crumb c3" cx="64" cy="166" r="1.8"/></g>`;
    },
  },

  // ---------------------------------------------------------------- plant
  plant: {
    label: 'versteckt sich hinter der Pflanze',
    svg: u => {
      const leaf = (x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
          <path d="M0 0 C-4 -16 -27 -28 -31 -46 C-33 -61 -18 -71 0 -64 C18 -71 33 -61 31 -46 C27 -28 4 -16 0 0 Z" fill="url(#pl${u})" ${OL}/>
          <path d="M0 -2 L0 -60 M0 -20 L-18 -30 M0 -34 L-22 -46 M0 -20 L18 -30 M0 -34 L22 -46" stroke="#b8ecb2" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M-22 -52 Q-16 -62 -6 -62" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        </g>`;
      const stem = d => `<path d="${d}" stroke="#3f8f3f" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
      return `
      <defs>
        <linearGradient id="pl${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fd06a"/><stop offset="1" stop-color="#2f8f3a"/></linearGradient>
        <linearGradient id="pp${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ec9a6c"/><stop offset="1" stop-color="#c4643c"/></linearGradient>
        <linearGradient id="pc${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fdcd3"/><stop offset="1" stop-color="#3fb0a6"/></linearGradient>
      </defs>
      ${shadow(150, 203, 70)}
      <g class="s2-hide">${mon('taunt', 106, 40, 88)}</g>
      <g class="s2-leaf l1">${stem('M150 134 Q132 120 118 100')}${leaf(118, 100, -42, 1.1)}</g>
      <g class="s2-leaf l2">${stem('M150 134 Q142 110 138 82')}${leaf(138, 82, -12, 1.15)}</g>
      <g class="s2-leaf l3">${stem('M150 134 Q160 108 164 78')}${leaf(164, 78, 14, 1.1)}</g>
      <g class="s2-leaf l4">${stem('M150 134 Q170 122 186 100')}${leaf(186, 100, 44, 1.05)}</g>
      <g class="s2-leaf l5">${stem('M150 134 Q150 122 150 108')}${leaf(150, 110, 0, .72)}</g>
      <ellipse cx="150" cy="198" rx="50" ry="6.5" fill="#b3542f" ${OL}/>
      <path d="M110 142 H190 L182 196 H118 Z" fill="url(#pp${u})" ${OL}/>
      <path d="M120 150 Q122 176 128 190" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M158 164 c0 -4 6 -6 7 -1 c1 -5 7 -3 7 1 c0 5 -7 9 -7 9 s-7 -4 -7 -9z" fill="#fff" opacity=".55"/>
      <rect x="104" y="130" width="92" height="16" rx="6" fill="#e48a5c" ${OL}/>
      <ellipse cx="150" cy="131" rx="40" ry="5" fill="#6b4a2f"/>
      <g class="s2-can">
        <path d="M232 30 h44 a6 6 0 0 1 6 6 v24 a8 8 0 0 1 -8 8 h-40 a8 8 0 0 1 -8 -8 v-24 a6 6 0 0 1 6 -6z" fill="url(#pc${u})" ${OL}/>
        <path d="M282 38 q14 2 12 16 q-2 8 -12 8" stroke="#3fb0a6" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M232 52 L206 40" stroke="#3fb0a6" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="203" cy="39" rx="4" ry="7" transform="rotate(-25 203 39)" fill="#5ec7c0" ${OL}/>
        <path d="M238 36 h30" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g fill="#6cc6f0"><path class="s2-drop d1" d="M200 46 q-3 6 0 8 q3 -2 0 -8z"/><path class="s2-drop d2" d="M196 48 q-3 6 0 8 q3 -2 0 -8z"/><path class="s2-drop d3" d="M204 49 q-3 6 0 8 q3 -2 0 -8z"/></g>`;
    },
  },

  // ---------------------------------------------------------------- toy box (jack-in-the-box)
  toybox: {
    label: 'springt aus der Spielzeugkiste',
    svg: u => `
      <defs>
        <linearGradient id="xw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc47e"/><stop offset="1" stop-color="#ee8d3c"/></linearGradient>
        <linearGradient id="xs${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9eef2"/><stop offset="1" stop-color="#9aa7b0"/></linearGradient>
        <clipPath id="xcl${u}"><rect x="0" y="0" width="300" height="188"/></clipPath>
      </defs>
      ${shadow(152, 203, 100)}
      <g class="s2-ball"><g transform="translate(36 184)">
        <circle r="15" fill="#ff6b6b" ${OL}/><path d="M-15 0 A15 15 0 0 0 15 0 Z" fill="#fff"/><path d="M-6 -15 Q4 0 -6 15" stroke="#4b8fe8" stroke-width="4" fill="none"/>
        <circle r="15" fill="none" ${OL}/><path d="M-8 -9 Q-4 -12 0 -12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </g></g>
      <rect x="238" y="172" width="28" height="26" rx="4" fill="#7cc6ff" ${OL}/><text x="252" y="191" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="16" fill="#fff">A</text>
      <g class="s2-block"><rect x="244" y="146" width="26" height="26" rx="4" fill="#ff8fb1" ${OL}/><text x="257" y="165" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="#fff">B</text></g>
      <g class="s2-lidb"><path d="M62 118 H238 V108 Q238 95 225 95 H75 Q62 95 62 108 Z" fill="#e88a3c" ${OL}/>
        <path d="M66 107 H234" stroke="#d47a32" stroke-width="2"/>
        <path d="M76 101 H150" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
        <g fill="#b7c1c8" ${OL}><rect x="62" y="104" width="14" height="14" rx="3"/><rect x="224" y="104" width="14" height="14" rx="3"/></g></g>
      <rect x="70" y="110" width="160" height="16" fill="#6e4220"/>
      <g clip-path="url(#xcl${u})">
        <g class="s2-spring"><path d="M150 188 L134 179 L166 170 L134 161 L166 152 L134 143 L166 134 L134 125 L166 116 L134 107 L166 99 L150 92" stroke="url(#xs${u})" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g>
        <g class="s2-jack">${mon('happy', 107, 10, 86)}</g>
      </g>
      <g class="s2-box">
        <rect x="66" y="118" width="168" height="78" rx="6" fill="url(#xw${u})" ${OL}/>
        <path d="M70 144 H230 M70 170 H230" stroke="#d47a32" stroke-width="2.2"/>
        <path d="M74 124 Q74 160 80 188" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round" fill="none"/>
        <g fill="#b7c1c8" ${OL}><rect x="66" y="118" width="14" height="14" rx="3"/><rect x="220" y="118" width="14" height="14" rx="3"/><rect x="66" y="182" width="14" height="14" rx="3"/><rect x="220" y="182" width="14" height="14" rx="3"/></g>
        <path d="M112 146 l5 10 11 1.5 -8 7.5 2 11 -10 -5.5 -10 5.5 2 -11 -8 -7.5 11 -1.5z" fill="#fff36b" ${OL}/>
        <path d="M186 150 a12 12 0 1 0 10 18 a9 9 0 1 1 -10 -18z" fill="#fff" opacity=".85"/>
        <rect x="143" y="117" width="14" height="12" rx="3" fill="#b7c1c8" ${OL}/><circle cx="150" cy="124" r="2" fill="#5b4334"/>
      </g>
      </g>
      <g class="s2-lid"><path d="M62 118 H238 V108 Q238 95 225 95 H75 Q62 95 62 108 Z" fill="url(#xw${u})" ${OL}/>
        <path d="M66 107 H234" stroke="#d47a32" stroke-width="2"/>
        <path d="M76 101 H150" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
        <g fill="#b7c1c8" ${OL}><rect x="62" y="104" width="14" height="14" rx="3"/><rect x="224" y="104" width="14" height="14" rx="3"/></g></g>`,
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
/** scene key only if the task clearly matches one (else null) */
export function matchScene(task) {
  const text = task ? `${task.name}` : '';
  for (const [re, key] of RULES) if (re.test(text)) return key;
  return null;
}
/** scene that fits a task (or a random one) */
export function sceneFor(task) {
  return matchScene(task) || KEYS[Math.floor(Math.random() * KEYS.length)];
}
export function randomScene(except) {
  const list = KEYS.filter(k => k !== except);
  return list[Math.floor(Math.random() * list.length)];
}
let seq = 0;
export function sceneSvg(key, cls = 'scene') {
  const s = SCENES[key] || SCENES.lamp;
  const u = `s${++seq}`; // unique ids for gradients / clip paths (several scenes can be on screen)
  return `<svg class="${cls} scene2 s2-${key}" viewBox="0 0 300 210" aria-label="Schmuddel ${s.label}">${s.svg(u)}</svg>`;
}
