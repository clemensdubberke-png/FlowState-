// Room illustrations (v2): flat, layered tonal artwork that works on every area colour.
// Palette classes (styled in app.css under .rm):
//   ra = white, rb = soft white, rc = faint white, rd = soft shade, re = dark tone of the area colour,
//   rl = fine detail line, rw / rw2 = white line, rt = faint grid line, ry = warm yellow, ro = orange,
//   rg = warm light glow, rs = rising steam/smoke (animated)
// All drawn by hand from SVG primitives for this app. viewBox 0 0 200 120, floor at y≈110.

const shadow = (cx, rx, y = 110) => `<ellipse class="rd" cx="${cx}" cy="${y}" rx="${rx}" ry="2.6"/>`;
const rug = (cx, rx, y = 109) => `<ellipse class="rc" cx="${cx}" cy="${y}" rx="${rx}" ry="5.5"/>`;

/** potted plant, pot bottom centre at (x, y) */
const plant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse class="rb" cx="-7" cy="-26" rx="3.6" ry="10" transform="rotate(-32 -7 -26)"/>
  <ellipse class="rb" cx="7" cy="-26" rx="3.6" ry="10" transform="rotate(32 7 -26)"/>
  <ellipse class="ra" cx="0" cy="-30" rx="3.8" ry="12"/>
  <ellipse class="ra" cx="-10" cy="-19" rx="3" ry="7.5" transform="rotate(-62 -10 -19)"/>
  <ellipse class="ra" cx="10" cy="-19" rx="3" ry="7.5" transform="rotate(62 10 -19)"/>
  <path class="rl" d="M0-18v-20M-1-19l-6-15M1-19l6-15"/>
  <path class="ra" d="M-7-14h14l-2 14h-10z"/><rect class="ra" x="-8.5" y="-17" width="17" height="4" rx="1.6"/>
  <path class="rd" d="M-7-13h14l-.4 2.6h-13.2z"/></g>`;

/** 4-point sparkle */
const sparkle = (cx, cy, r, cls = 'ry') => `<path class="${cls}" d="M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}z"/>`;
/** 5-point star */
function star(cx, cy, r, cls = 'ra') {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<path class="${cls}" stroke-linejoin="round" d="M${p.join('L')}z"/>`;
}
const steam = (x, y, h = 10) => [0, 1, 2].map(i => `<path class="rw2 rs" style="animation-delay:${i * 0.8}s" d="M${x + i * 6} ${y}c-3-${h * 0.3} 3-${h * 0.5} 0-${h}"/>`).join('');

export const ROOM_ART = {
  // ---------------------------------------------------------------- Wohnzimmer
  wohnzimmer: `
    ${rug(104, 76)}
    <rect class="ra" x="112" y="20" width="42" height="30" rx="2"/><rect class="re" x="116" y="24" width="34" height="22" rx="1"/>
    <path class="rb" d="M116 46l10-11 7 6 6-5 11 10z"/><circle class="ry" cx="142" cy="30" r="3.2"/>
    <rect class="ra" x="94" y="28" width="14" height="19" rx="1.5"/><rect class="re" x="96.5" y="30.5" width="9" height="14"/><circle class="rb" cx="101" cy="37.5" r="3"/>
    <path class="rg" d="M17 50h22l15 58H2z"/>
    <rect class="ra" x="26.8" y="49" width="2.4" height="58"/><ellipse class="ra" cx="28" cy="107.5" rx="9" ry="2.6"/>
    <path class="ra" d="M17 50h22l-4.5-17h-13z"/><path class="rd" d="M17 50h22l-.8-3H17.8z"/><ellipse class="ry" cx="28" cy="51" rx="5" ry="1.6"/>
    ${shadow(100, 60)}
    <rect class="ra" x="58" y="58" width="86" height="36" rx="11"/>
    <rect class="rl" x="63" y="63" width="36" height="24" rx="7"/><rect class="rl" x="103" y="63" width="36" height="24" rx="7"/>
    <rect class="ra" x="50" y="84" width="102" height="16" rx="6"/>
    <path class="rd" d="M50 95h102v1a5 5 0 0 1-5 5H55a5 5 0 0 1-5-5z"/><path class="rl" d="M101 87v8"/>
    <rect class="ry" x="64" y="72" width="18" height="15" rx="4" transform="rotate(-12 73 79)"/><path class="rd" d="M66 79l15-3" transform="rotate(-12 73 79)"/>
    <rect class="re" x="121" y="73" width="17" height="14" rx="4" transform="rotate(10 129 80)"/>
    <rect class="ra" x="42" y="72" width="18" height="30" rx="8"/><rect class="ra" x="142" y="72" width="18" height="30" rx="8"/>
    <rect class="rd" x="55" y="77" width="4" height="22" rx="2"/><rect class="rd" x="143" y="77" width="4" height="22" rx="2"/>
    <rect class="re" x="50" y="101" width="4" height="7" rx="1"/><rect class="re" x="148" y="101" width="4" height="7" rx="1"/>
    ${shadow(176, 12)}${plant(176, 109, 1.05)}`,

  // ---------------------------------------------------------------- Küche
  kueche: `
    <rect class="rc" x="40" y="44" width="132" height="24"/>
    <path class="rt" d="M40 52h132M40 60h132M52 44v24M64 44v24M76 44v24M88 44v24M100 44v24M112 44v24M124 44v24M136 44v24M148 44v24M160 44v24"/>
    <rect class="ra" x="112" y="16" width="60" height="25" rx="2"/><path class="rl" d="M142 18v21M115 19h24v18h-24zM145 19h24v18h-24z"/>
    <rect class="re" x="136" y="33" width="3" height="5" rx="1"/><rect class="re" x="145" y="33" width="3" height="5" rx="1"/><rect class="rd" x="112" y="39" width="60" height="2"/>
    <path class="ra" d="M70 24h20v8l10 10H60l10-10z"/><rect class="rd" x="60" y="40" width="40" height="2.4"/>
    <rect class="ra" x="40" y="72" width="132" height="36" rx="1"/>
    <rect class="re" x="36" y="66" width="140" height="6.5" rx="2"/>
    <rect class="rl" x="60" y="80" width="38" height="24" rx="2"/><rect class="re" x="64" y="86" width="30" height="14" rx="2"/>
    <path class="rc" d="M68 100l9-14h5l-9 14z"/><rect class="re" x="66" y="82" width="26" height="2" rx="1"/>
    <circle class="re" cx="64" cy="76.5" r="1.7"/><circle class="re" cx="72" cy="76.5" r="1.7"/><circle class="re" cx="86" cy="76.5" r="1.7"/><circle class="re" cx="94" cy="76.5" r="1.7"/>
    <rect class="rl" x="43" y="76" width="13" height="28" rx="1"/><circle class="re" cx="53" cy="90" r="1.3"/>
    <rect class="rl" x="103" y="76" width="32" height="28" rx="1"/><rect class="rl" x="139" y="76" width="30" height="28" rx="1"/>
    <rect class="re" x="129" y="80" width="2.4" height="7" rx="1"/><rect class="re" x="143" y="80" width="2.4" height="7" rx="1"/>
    <rect class="rd" x="40" y="104" width="132" height="4"/>
    <rect class="ra" x="62" y="55" width="5" height="3" rx="1"/><rect class="ra" x="89" y="55" width="5" height="3" rx="1"/>
    <rect class="ra" x="66" y="52" width="24" height="14" rx="3"/><rect class="rd" x="66" y="52" width="24" height="3"/>
    <path class="ra" d="M64 52q14-9 28 0z"/><circle class="re" cx="78" cy="46.5" r="1.8"/>
    ${steam(72, 42, 12)}
    <path class="ra" d="M110 66c0-9 4-14 10-14s10 5 10 14z"/><path class="ra" d="M128 60l7-6 1.6 1.8-6.4 6.6z"/>
    <path class="rw" d="M113.5 54c0-7 13-7 13 0"/><rect class="re" x="118" y="50" width="4" height="2.6" rx="1"/><path class="rd" d="M110.6 62h18.8l.4 4h-19.6z"/>
    <path class="rw" d="M148 55l-3-13M152 55v-14M156 55l3-12"/><ellipse class="ra" cx="144.6" cy="40" rx="2.6" ry="4" transform="rotate(-13 144.6 40)"/>
    <rect class="ra" x="150.4" y="35" width="3.4" height="7" rx="1"/><ellipse class="rl" cx="159.3" cy="40" rx="2.4" ry="4.5" transform="rotate(14 159.3 40)"/>
    <rect class="ra" x="145" y="53" width="14" height="13" rx="2.5"/><rect class="rd" x="145" y="62" width="14" height="2"/>
    <circle class="ry" cx="165" cy="60" r="3.6"/><circle class="ro" cx="171" cy="60.4" r="3.4"/><circle class="ry" cx="168" cy="57" r="3"/>
    <path class="ra" d="M160 61.5h16a8 4.5 0 0 1-16 0z"/>
    ${shadow(106, 70)}`,

  // ---------------------------------------------------------------- Esszimmer
  esszimmer: `
    ${rug(100, 82)}
    <path class="rw2" d="M100 0v19"/>
    <path class="rg" d="M88 31h24l16 34H72z"/>
    <path class="ra" d="M86 31c0-9 6-12.5 14-12.5S114 22 114 31z"/><rect class="rd" x="86" y="29.5" width="28" height="2"/><ellipse class="ry" cx="100" cy="32" rx="5" ry="2.6"/>
    <rect class="ra" x="28" y="46" width="5" height="62" rx="2"/><rect class="ra" x="28" y="54" width="20" height="3" rx="1.5"/><rect class="ra" x="28" y="62" width="20" height="3" rx="1.5"/>
    <rect class="ra" x="28" y="79" width="28" height="5" rx="2"/><rect class="rd" x="33" y="84" width="23" height="2"/><rect class="ra" x="50" y="84" width="4" height="24" rx="1.5"/>
    <rect class="ra" x="167" y="46" width="5" height="62" rx="2"/><rect class="ra" x="152" y="54" width="20" height="3" rx="1.5"/><rect class="ra" x="152" y="62" width="20" height="3" rx="1.5"/>
    <rect class="ra" x="144" y="79" width="28" height="5" rx="2"/><rect class="rd" x="144" y="84" width="23" height="2"/><rect class="ra" x="146" y="84" width="4" height="24" rx="1.5"/>
    ${shadow(100, 58)}
    <rect class="ra" x="57" y="76" width="5" height="32" rx="1.5"/><rect class="ra" x="138" y="76" width="5" height="32" rx="1.5"/>
    <rect class="ra" x="48" y="69" width="104" height="6" rx="2"/>
    <path class="rb" d="M54 75h92v8c-4.6 3-8.6-3-13.1 0s-8.6-3-13.1 0-8.6-3-13.1 0-8.6-3-13.1 0-8.6-3-13.1 0-8.6-3-13.1 0-8.6-3-13.4 0z"/>
    <rect class="ry" x="86" y="68" width="28" height="3" rx="1"/>
    <ellipse class="rb" cx="68" cy="68" rx="10" ry="2.6"/><ellipse class="ra" cx="68" cy="67.4" rx="6" ry="1.5"/>
    <ellipse class="rb" cx="132" cy="68" rx="10" ry="2.6"/><ellipse class="ra" cx="132" cy="67.4" rx="6" ry="1.5"/>
    <path class="rb" d="M80 58h6l-1 10h-4z"/><path class="rb" d="M114 58h6l-1 10h-4z"/>
    <path class="rw2" d="M98 56l-4-9M100 56v-11M102 56l5-8"/>
    <circle class="ry" cx="93" cy="45.5" r="3.4"/><circle class="ra" cx="100" cy="43" r="3.6"/><circle class="ro" cx="107.5" cy="46.5" r="3.2"/>
    <circle class="re" cx="93" cy="45.5" r="1"/><circle class="re" cx="100" cy="43" r="1.1"/><circle class="re" cx="107.5" cy="46.5" r="1"/>
    <path class="ra" d="M96 68c-4-6-3-11 1-13h6c4 2 5 7 1 13z"/>`,

  // ---------------------------------------------------------------- Schlafzimmer
  schlafzimmer: `
    ${rug(100, 80)}
    <rect class="ra" x="124" y="16" width="42" height="32" rx="3"/><rect class="re" x="127.5" y="19.5" width="35" height="25" rx="2"/>
    <path class="ry" d="M152 24.5a6.5 6.5 0 1 0 5 10.4 5.4 5.4 0 1 1-5-10.4z"/>
    <circle class="ra" cx="135" cy="25" r="1"/><circle class="ra" cx="140" cy="38" r=".9"/><circle class="ra" cx="132" cy="33" r=".7"/>
    <rect class="ra" x="143.8" y="19.5" width="2.4" height="25"/><rect class="ra" x="127.5" y="31" width="35" height="2.4"/>
    <rect class="rd" x="122" y="47" width="46" height="3" rx="1.5"/>
    <rect class="rb" x="46" y="44" width="106" height="52" rx="13"/>
    <rect class="rl" x="52" y="50" width="94" height="30" rx="9"/>
    <circle class="rd" cx="70" cy="58" r="1.3"/><circle class="rd" cx="88" cy="58" r="1.3"/><circle class="rd" cx="106" cy="58" r="1.3"/><circle class="rd" cx="124" cy="58" r="1.3"/>
    <rect class="ra" x="56" y="64" width="36" height="16" rx="7"/><rect class="ra" x="106" y="64" width="36" height="16" rx="7"/>
    <path class="rl" d="M60 72c8 2 20 2 28 0M110 72c8 2 20 2 28 0"/>
    ${shadow(99, 66)}
    <path class="ra" d="M40 80h118a6 6 0 0 1 6 6v16H34V86a6 6 0 0 1 6-6z"/>
    <path class="rd" d="M34 86h130v4H34z"/>
    <path class="rl" d="M52 95c6-3 12 3 18 0s12 3 18 0 12 3 18 0 12 3 18 0 12 3 18 0"/>
    ${star(72, 97, 2.4, 'ry')}${star(118, 97, 2.4, 'ry')}${star(146, 96, 2.2, 'ry')}
    <rect class="rd" x="34" y="102" width="130" height="5" rx="1"/>
    <rect class="re" x="38" y="107" width="4" height="4" rx="1"/><rect class="re" x="156" y="107" width="4" height="4" rx="1"/>
    <path class="rg" d="M10 66h24l6 20H4z"/>
    ${shadow(21, 12)}
    <rect class="ra" x="10" y="84" width="22" height="24" rx="2"/><rect class="rl" x="13" y="88" width="16" height="8" rx="1"/><rect class="rl" x="13" y="98" width="16" height="7" rx="1"/>
    <circle class="re" cx="21" cy="92" r="1.2"/><circle class="re" cx="21" cy="101.5" r="1.2"/>
    <path class="ra" d="M17 84v-6h8v6z"/><path class="ra" d="M12 78h18l-4-13H16z"/><ellipse class="ry" cx="21" cy="78.6" rx="6" ry="1.4"/>
    <ellipse class="ra" cx="172" cy="108.5" rx="7" ry="2.8"/><ellipse class="ra" cx="184" cy="109" rx="7" ry="2.8"/>
    <path class="re" d="M168 107.5a4 3 0 0 1 8 0zM180 108a4 3 0 0 1 8 0z"/>`,

  // ---------------------------------------------------------------- Badezimmer
  badezimmer: `
    <rect class="rc" x="16" y="30" width="104" height="44" rx="2"/>
    <path class="rt" d="M16 41h104M16 52h104M16 63h104M29 30v44M42 30v44M55 30v44M68 30v44M81 30v44M94 30v44M107 30v44"/>
    <rect class="re" x="128.6" y="34" width="3" height="4" rx="1"/>
    <rect class="ry" x="124" y="37" width="12" height="27" rx="2"/><rect class="rd" x="124" y="56" width="12" height="2.4"/><rect class="rd" x="124" y="60" width="12" height="1.4"/>
    ${shadow(72, 50)}
    <circle class="ra" cx="38" cy="66" r="6"/><circle class="ra" cx="48" cy="62" r="7.5"/><circle class="ra" cx="60" cy="65" r="6.4"/>
    <circle class="ra" cx="72" cy="62" r="7.4"/><circle class="ra" cx="98" cy="64" r="6.5"/><circle class="ra" cx="108" cy="67" r="5"/>
    <circle class="rb" cx="56" cy="51" r="3"/><circle class="rb" cx="66" cy="45" r="2.3"/><circle class="rb" cx="92" cy="49" r="2"/><circle class="rb" cx="44" cy="47" r="1.8"/>
    <ellipse class="ry" cx="85" cy="62" rx="8" ry="5.6"/><circle class="ry" cx="90" cy="54" r="4.4"/>
    <path class="ro" d="M94 53.6l4.6 1.2-4.4 1.8z"/><circle class="re" cx="91" cy="53" r=".9"/><path class="rd" d="M80 62q5 3 9-1"/>
    <rect class="ra" x="22" y="69" width="100" height="7" rx="3.5"/>
    <path class="ra" d="M26 76h92v4c0 14-10 22-24 22H50c-14 0-24-8-24-22z"/><path class="rd" d="M26 76h92v3H26z"/>
    <path class="re" d="M37 99l-4 9h6l3-8zM107 99l4 9h-6l-3-8z"/>
    <path class="ra" d="M114 69V56h-9v-3.4h12.4V69z"/><rect class="ra" x="110" y="57" width="7" height="2.6" rx="1"/>
    <rect class="ra" x="146" y="13" width="34" height="30" rx="13"/><rect class="rd" x="149.5" y="16.5" width="27" height="23" rx="10"/>
    <path class="rw" d="M156 23l-3.6 4.6M161 22l-7.6 10"/>
    <rect class="ra" x="170" y="48" width="3" height="9" rx="1"/><rect class="ra" x="163" y="48" width="10" height="3" rx="1.4"/>
    <path class="ra" d="M146 55h34c0 4.6-7 6.6-17 6.6s-17-2-17-6.6z"/>
    <rect class="ry" x="180" y="54" width="6" height="8" rx="1.6"/><path class="rw2" d="M181.6 54l-1.2-6M184.6 54l1-5.6"/>
    ${shadow(163, 26)}
    <rect class="ra" x="138" y="61.6" width="50" height="5" rx="2"/>
    <rect class="ra" x="140" y="66.6" width="46" height="41" rx="2"/>
    <rect class="rl" x="143" y="70" width="19" height="33" rx="1"/><rect class="rl" x="164" y="70" width="19" height="33" rx="1"/>
    <circle class="re" cx="158.6" cy="86" r="1.4"/><circle class="re" cx="167.4" cy="86" r="1.4"/><rect class="rd" x="140" y="104" width="46" height="3.6"/>`,

  // ---------------------------------------------------------------- Kinderzimmer
  kinderzimmer: `
    <path class="rw2" d="M14 22Q100 40 186 22"/>
    ${[[31.2, 25.2, 'ra'], [48.4, 27.8, 'ry'], [65.6, 29.6, 'rb'], [82.8, 30.6, 'ro'], [100, 31, 'ra'], [117.2, 30.6, 'ry'], [134.4, 29.6, 'rb'], [151.6, 27.8, 'ro'], [168.8, 25.2, 'ra']]
      .map(([x, y, c]) => `<path class="${c}" d="M${x - 5.4} ${y - 0.6}h10.8l-5.4 10z"/>`).join('')}
    ${star(118, 50, 4.5, 'ry')}${star(132, 60, 2.6, 'ra')}${sparkle(106, 60, 3, 'ra')}
    ${rug(90, 80)}
    ${shadow(60, 46)}
    <rect class="ra" x="14" y="58" width="11" height="50" rx="5"/><circle class="ra" cx="19.5" cy="57" r="5"/>
    <rect class="ra" x="96" y="70" width="10" height="38" rx="4.5"/><circle class="ra" cx="101" cy="69" r="4.5"/>
    <rect class="rb" x="22" y="81" width="78" height="11" rx="3"/>
    <rect class="ra" x="25" y="71" width="21" height="12" rx="5.5"/><path class="rl" d="M29 77c4 1.4 10 1.4 13 0"/>
    <path class="ra" d="M40 79h56a4 4 0 0 1 4 4v15H40z"/><path class="rd" d="M40 79h6v19h-6z"/>
    ${star(58, 87, 3, 're')}${star(76, 92, 2.6, 'ry')}${star(90, 86, 2.4, 're')}${star(66, 95, 2, 'ry')}
    <rect class="rd" x="20" y="98" width="80" height="5" rx="1"/><rect class="re" x="24" y="103" width="4" height="5" rx="1"/><rect class="re" x="92" y="103" width="4" height="5" rx="1"/>
    ${shadow(125, 16)}
    <rect class="ra" x="112" y="94" width="14" height="14" rx="1.6"/><path class="rl" d="M115.4 105l3.6-8.4 3.6 8.4M116.6 102.4h4.8"/>
    <rect class="ry" x="127" y="94" width="13" height="14" rx="1.6"/><circle class="re" cx="133.5" cy="101" r="3"/>
    <rect class="re" x="119" y="80" width="14" height="14" rx="1.6"/>${star(126, 87, 4, 'ra')}
    ${shadow(151, 15)}
    <ellipse class="ra" cx="140" cy="88" rx="3.6" ry="6.5" transform="rotate(30 140 88)"/><ellipse class="ra" cx="162" cy="88" rx="3.6" ry="6.5" transform="rotate(-30 162 88)"/>
    <ellipse class="ra" cx="151" cy="96" rx="13" ry="12"/><ellipse class="rd" cx="151" cy="98" rx="7" ry="7"/>
    <ellipse class="ra" cx="142" cy="107" rx="5.4" ry="3.6"/><ellipse class="ra" cx="160" cy="107" rx="5.4" ry="3.6"/>
    <ellipse class="rd" cx="142" cy="107.4" rx="2.6" ry="1.8"/><ellipse class="rd" cx="160" cy="107.4" rx="2.6" ry="1.8"/>
    <circle class="ra" cx="142" cy="68" r="4.4"/><circle class="ra" cx="160" cy="68" r="4.4"/>
    <circle class="rd" cx="142" cy="68" r="2.2"/><circle class="rd" cx="160" cy="68" r="2.2"/>
    <circle class="ra" cx="151" cy="76" r="10.5"/><ellipse class="rd" cx="151" cy="79.4" rx="4.6" ry="3.4"/>
    <ellipse class="re" cx="151" cy="77.6" rx="1.8" ry="1.3"/><circle class="re" cx="147" cy="74" r="1.3"/><circle class="re" cx="155" cy="74" r="1.3"/>
    <path class="ro" d="M146 85l5 2.6 5-2.6-1 4.6-4-1.6-4 1.6z"/>
    ${shadow(181, 9)}
    <circle class="ra" cx="181" cy="101" r="8.4"/><path class="ry" d="M173.4 98a8.4 8.4 0 0 1 15.2 0q-7.6 3-15.2 0z"/><path class="ro" d="M173 103.6q8 3 16 0a8.4 8.4 0 0 1-16 0z"/>`,

  // ---------------------------------------------------------------- Arbeitszimmer
  arbeitszimmer: `
    ${rug(100, 82)}
    <rect class="re" x="134" y="44" width="3" height="5" rx="1"/><rect class="re" x="174" y="44" width="3" height="5" rx="1"/>
    <rect class="ra" x="131" y="20" width="6" height="22" rx="1"/><rect class="ry" x="138" y="24" width="5" height="18" rx="1"/>
    <rect class="rb" x="144" y="22" width="7" height="20" rx="1"/><rect class="re" x="152" y="27" width="5" height="15" rx="1"/>
    <rect class="ra" x="160" y="25" width="5" height="17" rx="1" transform="rotate(14 162 42)"/>
    <rect class="rl" x="131" y="27" width="6" height="2"/><rect class="rl" x="144" y="28" width="7" height="2"/>
    ${plant(176, 42, 0.55)}
    <rect class="ra" x="128" y="42" width="56" height="3" rx="1"/>
    <path class="rg" d="M33 46l12-6 18 30H31z"/>
    <path class="rw" d="M42 68L48 52 38 41"/>
    <path class="ra" d="M29 41l12-7 4.4 6.4-12 7z"/><ellipse class="ry" cx="39" cy="44" rx="5" ry="1.6" transform="rotate(-30 39 44)"/>
    <circle class="ra" cx="48" cy="52" r="2"/><ellipse class="ra" cx="42" cy="69" rx="8" ry="2.2"/>
    <rect class="ra" x="86" y="62" width="4" height="8"/><path class="ra" d="M80 70h16l2 0.5H78z"/>
    <rect class="ra" x="62" y="34" width="52" height="32" rx="3"/><rect class="re" x="65" y="37" width="46" height="24" rx="1.5"/>
    <rect class="rb" x="69" y="41" width="20" height="3.4" rx="1"/><rect class="rc" x="69" y="47.4" width="30" height="2.2" rx="1"/><rect class="rc" x="69" y="52" width="24" height="2.2" rx="1"/>
    <path class="ry" d="M100 56v-6h3v6zM105 56v-10h3v10z"/><circle class="rd" cx="88" cy="63.5" r="1"/>
    <rect class="ra" x="96" y="66" width="22" height="4" rx="1"/><path class="rl" d="M99 68h16"/>
    <rect class="ra" x="120" y="61" width="8" height="9" rx="1.6"/><path class="rw" d="M128 63.4a2.6 2.6 0 0 1 0 4.4"/>
    ${steam(121, 57, 9)}
    ${shadow(98, 70)}
    <rect class="ra" x="30" y="70" width="128" height="5" rx="1.5"/><rect class="rd" x="30" y="75" width="128" height="2"/>
    <rect class="ra" x="34" y="77" width="4" height="31"/>
    <rect class="ra" x="118" y="77" width="36" height="31" rx="1"/>
    <rect class="rl" x="121" y="80" width="30" height="8" rx="1"/><rect class="rl" x="121" y="90" width="30" height="8" rx="1"/><rect class="rl" x="121" y="100" width="30" height="6" rx="1"/>
    <rect class="re" x="132" y="83" width="8" height="1.8" rx=".9"/><rect class="re" x="132" y="93" width="8" height="1.8" rx=".9"/>
    ${shadow(173, 13)}
    <rect class="ra" x="166" y="50" width="20" height="26" rx="6"/><rect class="rl" x="169.5" y="54" width="13" height="18" rx="4"/>
    <rect class="ra" x="174.5" y="75" width="3" height="5"/><rect class="ra" x="160" y="78" width="28" height="6" rx="3"/><rect class="rd" x="162" y="83" width="24" height="1.6"/>
    <rect class="ra" x="172.5" y="84" width="3" height="15"/><path class="rw" d="M162 104l12-5 12 5"/>
    <circle class="re" cx="162" cy="106" r="2.4"/><circle class="re" cx="174" cy="106" r="2.4"/><circle class="re" cx="186" cy="106" r="2.4"/>
    ${shadow(14, 10)}${plant(14, 109, 0.85)}`,

  // ---------------------------------------------------------------- Flur
  flur: `
    <rect class="ra" x="14" y="38" width="46" height="4" rx="2"/>
    <circle class="re" cx="22" cy="44" r="1.6"/><circle class="re" cx="37" cy="44" r="1.6"/><circle class="re" cx="52" cy="44" r="1.6"/>
    <path class="ra" d="M16 46h12l4 34H12z"/><path class="rl" d="M22 47v32M16 46l6 8 6-8"/><circle class="re" cx="25" cy="60" r=".9"/><circle class="re" cx="25" cy="68" r=".9"/>
    <path class="ry" d="M33 44h8l3 36h-4l-2-26-2 26h-4z"/><path class="rd" d="M33 49h8"/>
    <path class="rb" d="M45 54a7 6 0 0 1 14 0z"/><rect class="ra" x="43" y="53" width="18" height="2.6" rx="1.3"/>
    <path class="rw2" d="M49 46q3 4 6 0"/>
    ${shadow(30, 20)}
    <path class="ra" d="M14 108c0-4 3-6 6-6h3c2 0 3 2 6 3l2 3z"/><path class="re" d="M33 108v-8a3 3 0 0 1 6 0v3c3 1 6 2 6 5z"/>
    <rect class="ra" x="68" y="20" width="56" height="90" rx="2"/>
    <rect class="re" x="73" y="25" width="46" height="83" rx="1.5"/>
    <path class="rb" d="M80 50v-10a16 10 0 0 1 32 0v10z"/><path class="rd" d="M96 30v20M80 44h32"/>
    <rect class="rc" x="80" y="56" width="32" height="20" rx="1.5"/><rect class="rc" x="80" y="81" width="32" height="20" rx="1.5"/>
    <rect class="ry" x="108" y="65" width="7" height="2.6" rx="1.3"/><circle class="ry" cx="110" cy="66.3" r="2.4"/>
    <rect class="rb" x="66" y="108" width="60" height="4" rx="1.5"/>
    ${shadow(156, 26)}
    <ellipse class="ra" cx="156" cy="42" rx="15" ry="19"/><ellipse class="rd" cx="156" cy="42" rx="11.5" ry="15.4"/>
    <path class="rw" d="M150 34l-4 6M155 32l-8 12"/>
    <rect class="ra" x="134" y="74" width="44" height="34" rx="2"/><rect class="rl" x="137" y="78" width="38" height="10" rx="1"/><rect class="rl" x="137" y="91" width="38" height="13" rx="1"/>
    <rect class="re" x="152" y="81.6" width="8" height="2" rx="1"/><rect class="re" x="152" y="96" width="8" height="2" rx="1"/>
    <path class="rb" d="M138 74c0-4 4-6 8-6s8 2 8 6z"/><circle class="ry" cx="144" cy="68.4" r="1.6"/><path class="rw2" d="M145 69l3-3"/>
    ${plant(170, 74, 0.6)}
    <rect class="ra" x="184" y="88" width="11" height="20" rx="2"/><path class="rw" d="M187 88V62c0-3 4-3 4 0"/><path class="re" d="M186 88l3-24 3 24z"/>`,

  // ---------------------------------------------------------------- Wäschekammer
  waesche: `
    <path class="rw2" d="M96 22Q140 32 190 22"/>
    <path class="ra" d="M104 26h16l5 5-4 3.4-2-2V47h-14V32.4l-2 2-4-3.4z"/><path class="rl" d="M108 26q4 4 8 0"/>
    <rect class="re" x="110.6" y="23" width="2" height="5" rx=".8"/>
    <path class="ry" d="M132 27h7v11l5 3a2.6 2.6 0 0 1-2 4.4l-9-3.4z"/><rect class="re" x="134.6" y="24" width="2" height="5" rx=".8"/>
    <path class="rb" d="M146 27h18v22h-7l-2-13-2 13h-7z"/><rect class="re" x="148" y="24" width="2" height="5" rx=".8"/><rect class="re" x="160" y="24" width="2" height="5" rx=".8"/>
    <rect class="re" x="170" y="25.6" width="13" height="17" rx="1"/><rect class="rc" x="170" y="37" width="13" height="2"/><rect class="ra" x="175.5" y="22.6" width="2" height="5" rx=".8"/>
    ${shadow(60, 30)}
    <path class="ry" d="M64 46V36a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v10z"/><rect class="re" x="66.6" y="29" width="6.8" height="4.4" rx="1"/><rect class="ra" x="66" y="38" width="8" height="5" rx="1"/>
    <rect class="ra" x="34" y="46" width="46" height="62" rx="4"/><path class="rl" d="M34 58h46"/>
    <rect class="rl" x="38" y="49" width="12" height="6" rx="1"/><rect class="re" x="56" y="49.6" width="12" height="5" rx="1"/><circle class="re" cx="74" cy="52" r="2.6"/>
    <circle class="rd" cx="57" cy="84" r="16.4"/><circle class="ra" cx="57" cy="84" r="14"/><circle class="re" cx="57" cy="84" r="10.5"/>
    <path class="rb" d="M46.6 85c3-2 7-2 10.4 0s7 2 10.4 0A10.5 10.5 0 0 1 46.6 85z"/>
    <circle class="ra" cx="52" cy="89" r="1.6"/><circle class="ra" cx="58" cy="91" r="1.2"/><circle class="ra" cx="62" cy="88" r="1.4"/>
    <path class="rw" d="M50 78a9 9 0 0 1 6-3"/><rect class="rd" x="34" y="104" width="46" height="4" rx="1"/>
    ${shadow(111, 24)}
    <path class="ry" d="M92 80c1-8 9-10 14-6 4-6 14-5 16 1 4-2 9 0 9 5z"/><path class="ro" d="M99 80c2-5 7-6 10-3"/>
    <rect class="ra" x="86" y="78" width="50" height="5" rx="2.5"/>
    <path class="ra" d="M89 83h44l-4 25H93z"/>
    <path class="rl" d="M90 89h42M91 95h40M92 101h38M100 83v25M111 83v25M122 83v25"/>
    ${shadow(166, 22)}
    <path class="rw" d="M152 108l20-36M180 108l-20-36"/><path class="rw" d="M150 82h32M152 92h28"/>
    <path class="ra" d="M156 82h9v11h-9z"/><path class="ry" d="M167 82h9v14h-9z"/><path class="rb" d="M158 92h8v10h-8z"/>`,

  // ---------------------------------------------------------------- Gäste-WC
  wc: `
    <rect class="rc" x="20" y="64" width="160" height="44"/>
    <path class="rt" d="M20 64h160M36 64v44M52 64v44M68 64v44M84 64v44M100 64v44M116 64v44M132 64v44M148 64v44M164 64v44"/>
    ${plant(60, 37, 0.55)}
    <rect class="ra" x="47" y="40" width="34" height="27" rx="4"/><rect class="ra" x="45" y="37" width="38" height="5" rx="2"/>
    <rect class="re" x="70" y="35" width="8" height="3" rx="1"/><rect class="rd" x="47" y="58" width="34" height="2"/>
    ${shadow(65, 20)}
    <path class="ra" d="M48 72h34c0 14-6 20-14 20h-6c-8 0-14-6-14-20z"/><path class="ra" d="M57 90h16l2.4 18h-20.8z"/>
    <rect class="ra" x="43" y="66" width="44" height="6" rx="3"/><path class="rd" d="M48 72h34v2.4H48z"/>
    <rect class="re" x="93" y="66" width="12" height="3" rx="1.5"/><rect class="re" x="98" y="69" width="2" height="3"/>
    <path class="ra" d="M99 84h6v11l-1.5 1.4-1.5-1.4-1.5 1.4-1.5-1.4z"/><circle class="ra" cx="99" cy="78" r="6.4"/><circle class="rd" cx="99" cy="78" r="2.2"/>
    ${shadow(99, 8)}
    <rect class="ra" x="93" y="99" width="12" height="10" rx="2"/><ellipse class="ra" cx="99" cy="99" rx="6" ry="2"/><ellipse class="rd" cx="99" cy="99" rx="2" ry=".8"/><path class="rl" d="M93.6 104h10.8"/>
    <circle class="rw" cx="122" cy="50" r="5"/><rect class="ry" x="116" y="54" width="12" height="18" rx="2"/><rect class="rd" x="116" y="66" width="12" height="2"/>
    <rect class="ra" x="136" y="20" width="38" height="28" rx="4"/><rect class="rd" x="139.5" y="23.5" width="31" height="21" rx="2.4"/>
    <path class="rw" d="M146 28l-4 5M151 28l-7 9"/>
    ${shadow(155, 14)}
    <path class="ra" d="M147 74h16l2 34h-20z"/>
    <path class="ra" d="M132 62h46c0 8-8 12-23 12s-23-4-23-12z"/><rect class="ra" x="130" y="59" width="50" height="4.4" rx="2"/><path class="rd" d="M134 63.4h42l-1 3h-40z"/>
    <rect class="ra" x="153.4" y="49" width="3.2" height="10" rx="1"/><rect class="ra" x="153.4" y="49" width="8" height="2.8" rx="1.4"/>
    <rect class="ry" x="168" y="51" width="6.6" height="8" rx="1.6"/><path class="re" d="M170 51v-3h3"/>`,

  // ---------------------------------------------------------------- Keller
  keller: `
    <path class="rw2" d="M100 0v15"/><rect class="re" x="97" y="15" width="6" height="4" rx="1"/>
    <circle class="rg" cx="100" cy="25" r="17"/><circle class="ry" cx="100" cy="25" r="5"/>
    <rect class="ra" x="126" y="17" width="40" height="19" rx="2"/><rect class="re" x="129" y="20" width="34" height="13" rx="1"/>
    <rect class="ra" x="137" y="20" width="2" height="13"/><rect class="ra" x="145" y="20" width="2" height="13"/><rect class="ra" x="153" y="20" width="2" height="13"/>
    ${shadow(44, 34)}
    <rect class="rb" x="20" y="38" width="9" height="10" rx="2"/><rect class="ry" x="20" y="35.6" width="9" height="3" rx="1"/>
    <rect class="rb" x="31" y="40" width="8" height="8" rx="2"/><rect class="ro" x="31" y="37.6" width="8" height="3" rx="1"/>
    <path class="ra" d="M43 48v-8l2-3v-4h3v4l2 3v8z"/><rect class="re" x="53" y="37" width="15" height="11" rx="1"/><path class="rc" d="M53 41h15"/>
    <rect class="ra" x="20" y="58" width="23" height="14" rx="1"/><path class="rd" d="M29.6 58h4v14h-4z"/>
    <rect class="rb" x="47" y="61" width="13" height="11" rx="1"/><rect class="re" x="47" y="64" width="13" height="3"/><path class="rw2" d="M49 61q4.5-5 9 0"/>
    <rect class="ra" x="19" y="82" width="27" height="14" rx="1"/><path class="rl" d="M19 87h27M19 91.6h27"/>
    <rect class="ry" x="50" y="86" width="17" height="10" rx="1.4"/><path class="re" d="M54 86v-3h9v3h-2v-1.4h-5V86z"/>
    <rect class="ra" x="14" y="34" width="4" height="74" rx="1"/><rect class="ra" x="70" y="34" width="4" height="74" rx="1"/>
    <rect class="ra" x="14" y="48" width="60" height="3.2" rx="1"/><rect class="ra" x="14" y="72" width="60" height="3.2" rx="1"/><rect class="ra" x="14" y="96" width="60" height="3.2" rx="1"/>
    ${shadow(108, 24)}
    <rect class="ra" x="88" y="80" width="40" height="28" rx="1"/><rect class="rd" x="105.6" y="80" width="5" height="28"/>
    <path class="rl" d="M88 86h40"/><rect class="ry" x="92" y="92" width="10" height="7" rx="1"/>
    <g transform="rotate(-4 107 71)"><rect class="ra" x="94" y="62" width="28" height="18" rx="1"/><rect class="rd" x="105.6" y="62" width="4.4" height="18"/><path class="rl" d="M94 67h28"/></g>
    ${shadow(168, 26)}
    <path class="rb" d="M140 108h52V46h-11v10h-10v10h-10v10h-10v10h-10v10h-1z"/>
    <rect class="ra" x="181" y="46" width="11" height="2.6" rx="1"/><rect class="ra" x="171" y="56" width="11" height="2.6" rx="1"/><rect class="ra" x="161" y="66" width="11" height="2.6" rx="1"/><rect class="ra" x="151" y="76" width="11" height="2.6" rx="1"/><rect class="ra" x="141" y="86" width="11" height="2.6" rx="1"/><rect class="ra" x="139" y="96" width="3" height="2.6" rx="1"/>
    <path class="rw" d="M146 82L188 36M150 83v-8M170 61v-8M186 43v-8"/>`,

  // ---------------------------------------------------------------- Dachboden
  dachboden: `
    <path class="rc" d="M22 108L100 34l78 74z"/>
    <path class="rt" d="M100 34v74M60 108l40-38 40 38M44 108l56-52 56 52"/>
    <path class="rb" d="M4 108L100 16l96 92h-18L100 34 22 108z"/><path class="rd" d="M22 108L100 34l78 74h-4L100 38 26 108z"/>
    <circle class="ra" cx="100" cy="58" r="12.5"/><circle class="re" cx="100" cy="58" r="9.4"/>
    <rect class="ra" x="98.8" y="48.6" width="2.4" height="18.8"/><rect class="ra" x="90.6" y="56.8" width="18.8" height="2.4"/>
    <circle class="ry" cx="96" cy="53" r="1.8"/>
    <rect class="rc" x="22" y="105" width="156" height="4" rx="1"/>
    ${sparkle(46, 96, 2.6, 'ra')}
    ${shadow(74, 22)}
    <rect class="ra" x="54" y="86" width="40" height="22" rx="2"/>
    <path class="ra" d="M54 86v-5a8 8 0 0 1 8-8h24a8 8 0 0 1 8 8v5z"/><rect class="rd" x="54" y="86" width="40" height="2.4"/>
    <rect class="re" x="62" y="73.6" width="4" height="34.4"/><rect class="re" x="82" y="73.6" width="4" height="34.4"/>
    <rect class="ry" x="71" y="83" width="6" height="7.4" rx="1"/><circle class="re" cx="74" cy="86.6" r="1"/>
    ${shadow(132, 24)}
    <rect class="ra" x="114" y="86" width="36" height="22" rx="1"/><rect class="rd" x="129.6" y="86" width="5" height="22"/><path class="rl" d="M114 91h36"/>
    <rect class="rb" x="118" y="72" width="24" height="14" rx="1"/><rect class="re" x="118" y="76" width="24" height="2.4"/>
    ${sparkle(150, 70, 3, 'ra')}`,

  // ---------------------------------------------------------------- Grundriss
  allgemein: `
    <rect class="rc" x="24" y="20" width="152" height="88" rx="2"/>
    <rect class="rb" x="30" y="26" width="26" height="32" rx="2.4"/><rect class="ra" x="33" y="28.4" width="9" height="6" rx="2"/><rect class="ra" x="44" y="28.4" width="9" height="6" rx="2"/>
    <path class="rd" d="M30 38h26v3H30z"/><rect class="ra" x="60" y="28" width="7" height="7" rx="1"/>
    <rect class="rb" x="88" y="25" width="32" height="9" rx="1"/><circle class="rl" cx="95" cy="29.6" r="2.4"/><circle class="rl" cx="103" cy="29.6" r="2.4"/><rect class="re" x="110" y="27" width="7" height="5" rx="1"/>
    <rect class="rb" x="130" y="25" width="40" height="17" rx="7"/><rect class="ra" x="133" y="28" width="34" height="11" rx="5"/>
    <ellipse class="ra" cx="164" cy="56" rx="5" ry="6.4"/><rect class="ra" x="159" y="48" width="10" height="4" rx="1"/>
    <rect class="ra" x="130" y="50" width="16" height="8" rx="2"/><ellipse class="rd" cx="138" cy="54" rx="4.6" ry="2.4"/>
    <path class="rb" d="M30 78h8v22h30v-22h8v28H30z"/><rect class="ra" x="40" y="84" width="26" height="12" rx="2"/>
    <ellipse class="rc" cx="53" cy="90" rx="15" ry="10"/>
    <circle class="rb" cx="104" cy="74" r="4"/><circle class="rb" cx="104" cy="98" r="4"/><circle class="rb" cx="92" cy="86" r="4"/><circle class="rb" cx="116" cy="86" r="4"/>
    <circle class="ra" cx="104" cy="86" r="10"/><circle class="ry" cx="104" cy="86" r="3"/>
    <rect class="rb" x="136" y="92" width="34" height="12" rx="1.6"/><circle class="ra" cx="150" cy="84" r="4.4"/>${sparkle(164, 80, 4, 'ra')}
    <path class="rw" style="stroke-width:3.6" d="M24 20h152v88H24zM84 20v36M84 72v36M124 20v24M124 64v44M124 64h20M160 64h16M24 66h22M62 66h22"/>
    <path class="rw2" d="M84 56a16 16 0 0 1 16 16M124 44a20 20 0 0 1 20 20M46 66a16 16 0 0 1 16-16"/>`,

  // ---------------------------------------------------------------- Haus
  eigen_innen: `
    <ellipse class="rc" cx="100" cy="110" rx="86" ry="5"/>
    <circle class="rc rs" cx="137" cy="22" r="3.4"/><circle class="rc rs" style="animation-delay:1s" cx="141" cy="14" r="4.4"/>
    <rect class="ra" x="128" y="26" width="12" height="22" rx="1"/><rect class="rd" x="126" y="24" width="16" height="4" rx="1"/>
    <rect class="ra" x="50" y="58" width="100" height="50" rx="2"/><rect class="rd" x="50" y="58" width="100" height="4"/>
    <path class="re" d="M38 62L100 20l62 42z"/><path class="rw" d="M38 62L100 20l62 42"/>
    <circle class="ra" cx="100" cy="45" r="6.6"/><circle class="ry" cx="100" cy="45" r="4.4"/><path class="ra" d="M99.2 40.6h1.6v8.8h-1.6zM95.6 44.2h8.8v1.6h-8.8z"/>
    <rect class="ry" x="60" y="70" width="20" height="17" rx="2"/><rect class="ry" x="120" y="70" width="20" height="17" rx="2"/>
    <path class="rw" style="stroke-width:1.8" d="M70 70v17M60 78.5h20M130 70v17M120 78.5h20"/>
    <rect class="rd" x="58" y="87" width="24" height="3" rx="1"/><rect class="rd" x="118" y="87" width="24" height="3" rx="1"/>
    <path class="re" d="M90 108V88a10 10 0 0 1 20 0v20z"/><circle class="ry" cx="105" cy="98" r="1.6"/><path class="rc" d="M94 90a6 6 0 0 1 12 0z"/>
    <path class="rb" d="M90 108h20l8 6H82z"/>
    <circle class="rb" cx="50" cy="103" r="8"/><circle class="ra" cx="42" cy="106" r="6"/><circle class="rb" cx="152" cy="103" r="8"/><circle class="ra" cx="160" cy="106" r="6"/>
    <circle class="ry" cx="46" cy="100" r="1.6"/><circle class="ro" cx="155" cy="100" r="1.6"/><circle class="ry" cx="160" cy="104" r="1.4"/>`,

  // ---------------------------------------------------------------- Draußen
  eigen_aussen: `
    <circle class="rg" cx="160" cy="34" r="17"/><circle class="ry" cx="160" cy="34" r="10"/>
    <path class="rw2" d="M160 18v-4M160 54v-4M176 34h4M140 34h4M171 23l3-3M146 48l3-3M171 45l3 3"/>
    <path class="ra" d="M56 40a7 7 0 0 1 13-4 6 6 0 0 1 9 5h-22z"/><path class="rb" d="M100 30a5 5 0 0 1 9-3 4 4 0 0 1 6 3z"/>
    <path class="rw2" d="M118 46q3-3 5 0 2-3 5 0M128 40q2-2 3.6 0 1.6-2 3.6 0"/>
    <path class="rc" d="M10 108C26 76 76 64 120 84S184 70 192 108z"/>
    <path class="rb" d="M18 108C40 86 84 82 118 96S170 88 184 108z"/>
    ${shadow(50, 20, 106)}
    <rect class="rb" x="47" y="66" width="6" height="40" rx="2"/><path class="rb" d="M50 86l-8-6M50 80l7-5"/>
    <circle class="ra" cx="50" cy="56" r="15"/><circle class="ra" cx="38" cy="66" r="10"/><circle class="ra" cx="62" cy="66" r="10.5"/>
    <path class="rd" d="M30 70a10 10 0 0 0 16 4 15 15 0 0 0 8-2 10 10 0 0 0 17-4 10 10 0 0 1-17 7 15 15 0 0 1-8 1 10 10 0 0 1-16-6z"/>
    ${shadow(128, 22, 108)}
    <rect class="ra" x="110" y="80" width="38" height="3.4" rx="1.4"/><rect class="ra" x="110" y="86" width="38" height="3.4" rx="1.4"/>
    <rect class="ra" x="108" y="94" width="42" height="4" rx="1.6"/><rect class="rd" x="108" y="98" width="42" height="1.6"/>
    <rect class="re" x="113" y="83" width="3" height="25" rx="1"/><rect class="re" x="142" y="83" width="3" height="25" rx="1"/>
    <path class="rw2" d="M82 108v-6M86 108v-8M90 108v-5"/><circle class="ry" cx="86" cy="99" r="2.4"/><circle class="ra" cx="82" cy="101" r="2"/><circle class="ro" cx="90" cy="102" r="2"/>
    <path class="rw2" d="M170 108v-6M174 108v-9"/><circle class="ra" cx="174" cy="98" r="2.4"/><circle class="ry" cx="170" cy="101" r="2"/>`,

  // ---------------------------------------------------------------- Garten
  garten: `
    <circle class="rg" cx="168" cy="30" r="15"/><circle class="ry" cx="168" cy="30" r="9"/>
    <path class="rw2" d="M168 15v-3M168 48v-3M183 30h3M150 30h3M178 20l2-2M156 42l2-2M178 40l2 2M156 18l2 2"/>
    <rect class="rb" x="80" y="74" width="112" height="3.4"/><rect class="rb" x="80" y="94" width="112" height="3.4"/>
    ${[84, 96, 108, 120, 132, 144, 156, 168, 180].map(x => `<path class="ra" d="M${x} 106V68l4-5 4 5v38z"/>`).join('')}
    ${shadow(36, 22, 108)}
    <rect class="rb" x="31" y="58" width="8" height="50" rx="2.4"/><path class="rb" d="M35 82l-9-8M35 76l8-7"/>
    <circle class="ra" cx="35" cy="44" r="18"/><circle class="ra" cx="20" cy="56" r="11"/><circle class="ra" cx="50" cy="56" r="12"/>
    <path class="rd" d="M10 60a11 11 0 0 0 18 6 18 18 0 0 0 14 0 12 12 0 0 0 19-6 12 12 0 0 1-19 9 18 18 0 0 1-14 0 11 11 0 0 1-18-9z"/>
    <circle class="ro" cx="28" cy="42" r="2.6"/><circle class="ro" cx="44" cy="52" r="2.6"/><circle class="ro" cx="22" cy="58" r="2.4"/><circle class="ro" cx="40" cy="36" r="2.2"/>
    ${shadow(68, 12)}
    <path class="ra" d="M58 108l2-16h16l2 16z"/><path class="ra" d="M76 96l12-10 2 2-12 11z"/><rect class="ra" x="86" y="84" width="6" height="4" rx="1" transform="rotate(-40 89 86)"/>
    <path class="rw" d="M60 92c0-8 16-8 16 0"/><path class="rd" d="M59.4 98h17.4l.4 3H59z"/>
    <circle class="rb" cx="95" cy="92" r="1.2"/><circle class="rb" cx="98" cy="96" r="1.1"/><circle class="rb" cx="94" cy="98" r="1"/>
    ${shadow(126, 30)}
    <path class="rb" d="M104 96c-2-8 4-10 6-6 0-6 8-6 8 0 2-4 8-2 6 6zM130 96c-2-8 4-10 6-6 0-6 8-6 8 0 2-4 8-2 6 6z"/>
    <rect class="ra" x="100" y="96" width="54" height="12" rx="1.6"/><path class="rl" d="M100 102h54M118 96v12M136 96v12"/>
    <path class="rw2" d="M166 108v-12M174 108v-16M182 108v-11M190 108v-14"/>
    <circle class="ry" cx="166" cy="95" r="3.2"/><circle class="ra" cx="174" cy="91" r="3.4"/><circle class="ro" cx="182" cy="96" r="3"/><circle class="ry" cx="190" cy="93" r="3"/>
    <circle class="re" cx="166" cy="95" r="1"/><circle class="ry" cx="174" cy="91" r="1.2"/><circle class="re" cx="190" cy="93" r="1"/>
    <g transform="translate(8 0) scale(.92 1)"><path class="rb" d="M0 108q6-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0 5-5 10 0v6H0z"/></g>`,

  // ---------------------------------------------------------------- Balkon
  balkon: `
    <rect class="ra" x="20" y="18" width="42" height="92" rx="2"/><rect class="re" x="24.4" y="22.4" width="33" height="84" rx="1"/>
    <path class="rc" d="M30 60l18-24h4L34 60zM32 76l20-26h3L35 76z"/><rect class="ry" x="51" y="62" width="3" height="9" rx="1.4"/>
    <path class="rw2" d="M66 22Q129 42 192 22"/>
    ${[[76, 25], [92, 28.6], [108, 31], [124, 32], [140, 31.6], [156, 29.6], [172, 26.6], [186, 23.6]].map(([x, y]) => `<circle class="rg" cx="${x}" cy="${y + 4}" r="5"/><path class="re" d="M${x - 1} ${y}h2v2h-2z"/><ellipse class="ry" cx="${x}" cy="${y + 4}" rx="2.4" ry="3"/>`).join('')}
    ${plant(70, 70, 0.8)}
    <path class="rb" d="M84 62c-1-8 5-10 7-6 1-6 9-6 9 0 2-4 9-2 7 4 4-3 9 0 8 4z"/>
    <circle class="ry" cx="88" cy="58" r="3.4"/><circle class="ra" cx="97" cy="54" r="3.6"/><circle class="ro" cx="106" cy="57" r="3.2"/><circle class="ry" cx="114" cy="60" r="3"/>
    <circle class="re" cx="88" cy="58" r="1"/><circle class="ry" cx="97" cy="54" r="1.2"/><circle class="re" cx="106" cy="57" r="1"/>
    <rect class="re" x="80" y="62" width="40" height="10" rx="2"/><rect class="rc" x="80" y="62" width="40" height="2"/>
    <path class="rb" d="M136 62c-1-8 5-10 7-6 1-6 9-6 9 0 2-4 9-2 7 4 4-3 9 0 8 4z"/>
    <circle class="ra" cx="140" cy="58" r="3.4"/><circle class="ro" cx="149" cy="54" r="3.6"/><circle class="ry" cx="158" cy="57" r="3.2"/><circle class="ra" cx="166" cy="60" r="3"/>
    <circle class="ry" cx="140" cy="58" r="1"/><circle class="re" cx="149" cy="54" r="1.2"/><circle class="re" cx="158" cy="57" r="1"/>
    <rect class="re" x="132" y="62" width="40" height="10" rx="2"/><rect class="rc" x="132" y="62" width="40" height="2"/>
    <rect class="ra" x="6" y="72" width="188" height="5" rx="2.5"/><rect class="rd" x="6" y="77" width="188" height="1.6"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect class="ra" x="${12 + i * 11.6}" y="78" width="3" height="27" rx="1.2"/>`).join('')}
    <rect class="ra" x="6" y="104" width="188" height="5" rx="2"/>`,

  // ---------------------------------------------------------------- Terrasse
  terrasse: `
    <rect class="rb" x="6" y="100" width="188" height="10" rx="2"/>
    <path class="rl" d="M6 105h188M30 100v10M62 100v5M94 105v5M126 100v5M158 105v5"/>
    <rect class="ra" x="98.6" y="24" width="2.8" height="76" rx="1"/>
    <path class="ra" d="M54 42Q100 4 146 42z"/>
    <path class="ry" d="M100 23L54 42h15.4zM100 23l-15.4 19h15.4zM100 23l15.4 19h15.4z"/>
    <path class="ra" d="M54 42h92v3c-3.8 3-7.6 0-11.5 0s-7.6 3-11.5 0-7.6 3-11.5 0-7.6 3-11.5 0-7.6 3-11.5 0-7.6 3-11.5 0-7.6 3-11.5 0-7.6 3-11.5 0z"/>
    <circle class="re" cx="100" cy="21" r="2.4"/>
    ${shadow(100, 26, 100)}
    <rect class="ra" x="76" y="72" width="48" height="4" rx="2"/><rect class="rd" x="78" y="76" width="44" height="1.4"/>
    <path class="ra" d="M92 100l8-24 8 24h-3l-5-17-5 17z"/>
    <path class="rb" d="M84 72v-8h6l-1 8z"/><path class="ry" d="M84.6 66.6h4.8l-.4 4.8h-4z"/><path class="rb" d="M108 72v-8h6l-1 8z"/><path class="ry" d="M108.6 66.6h4.8l-.4 4.8h-4z"/>
    ${shadow(38, 24, 100)}
    <path class="ra" d="M16 100L10 66h6l7 26h32v8z"/><rect class="ry" x="22" y="85" width="34" height="6" rx="3"/><path class="ry" d="M13 70h5l5 20h-4z"/>
    <rect class="re" x="18" y="98" width="3" height="5" rx="1"/><rect class="re" x="52" y="98" width="3" height="5" rx="1"/>
    ${shadow(160, 24, 100)}
    <path class="ra" d="M182 100l6-34h-6l-7 26h-32v8z"/><rect class="ry" x="142" y="85" width="34" height="6" rx="3"/><path class="ry" d="M185 70h-5l-5 20h4z"/>
    <rect class="re" x="177" y="98" width="3" height="5" rx="1"/><rect class="re" x="143" y="98" width="3" height="5" rx="1"/>
    ${plant(192, 100, 0.7)}`,

  // ---------------------------------------------------------------- Garage
  garage: `
    <path class="rc" d="M38 108h124l18 6H20z"/>
    <path class="ra" d="M18 52L100 22l82 30v56H18z"/>
    <path class="re" d="M10 54L100 18l90 36-4 5-86-34-86 34z"/>
    <path class="rg" d="M88 46h24l10 12H78z"/><rect class="ra" x="96" y="40" width="8" height="3" rx="1"/><path class="ry" d="M97 43h6l-1 3h-4z"/>
    <rect class="re" x="36" y="56" width="128" height="52" rx="2"/>
    <rect class="rb" x="38" y="58" width="124" height="7.6" rx="1"/><rect class="rb" x="38" y="66.6" width="124" height="7.6" rx="1"/>
    <rect class="rd" x="38" y="74" width="124" height="2"/><rect class="re" x="94" y="71" width="12" height="2.4" rx="1"/>
    <path class="ra" d="M56 108V92c0-6 6-10 12-12l10-6h44l10 6c6 2 12 6 12 12v16z"/>
    <path class="rb" d="M82 78h36l6 6H76z"/>
    <ellipse class="ry" cx="68" cy="92" rx="7" ry="4"/><ellipse class="ry" cx="132" cy="92" rx="7" ry="4"/>
    <ellipse class="rg" cx="68" cy="92" rx="11" ry="7"/><ellipse class="rg" cx="132" cy="92" rx="11" ry="7"/>
    <path class="rl" d="M84 90h32M84 94h32"/><rect class="rd" x="56" y="100" width="88" height="4"/><rect class="rb" x="92" y="98.6" width="16" height="5" rx="1"/>
    <circle class="rb" cx="20" cy="102" r="8"/><circle class="ra" cx="12" cy="106" r="5.6"/><circle class="rb" cx="180" cy="102" r="8"/><circle class="ra" cx="188" cy="106" r="5.6"/>`,

  // ---------------------------------------------------------------- Auto
  auto: `
    <rect class="rc" x="6" y="104" width="188" height="6" rx="3"/>
    ${shadow(102, 76, 106)}
    <path class="ra" d="M28 96V86c0-5 3-8 8-9l20-4 16-16c3-3 6-4 10-4h36c4 0 7 1 10 4l14 16 16 3c5 1 8 4 8 9v11a3 3 0 0 1-3 3H31a3 3 0 0 1-3-3z"/>
    <path class="re" d="M76 71l12-12c1.5-1.5 3-2 5-2h12v14z"/><path class="re" d="M109 57h12c2 0 3.5.5 5 2l11 12h-28z"/>
    <path class="rc" d="M86 69l9-9h4l-9 9zM116 69l8-9h3l-8 9z"/>
    <path class="rl" d="M107 72v24M72 74h93"/><rect class="rd" x="94" y="77" width="8" height="2" rx="1"/><rect class="rd" x="128" y="77" width="8" height="2" rx="1"/>
    <path class="ry" d="M168 80h6c2 0 3 1.6 3 3.4v1.6h-9z"/><rect class="ro" x="28.6" y="82" width="4" height="6" rx="1.4"/>
    <rect class="rd" x="28" y="93" width="150" height="4"/>
    <circle class="re" cx="60" cy="97" r="12"/><circle class="ra" cx="60" cy="97" r="5.4"/><circle class="rd" cx="60" cy="97" r="2"/>
    <circle class="re" cx="146" cy="97" r="12"/><circle class="ra" cx="146" cy="97" r="5.4"/><circle class="rd" cx="146" cy="97" r="2"/>
    <circle class="ra" cx="88" cy="51" r="5"/><circle class="ra" cx="96" cy="47" r="6"/><circle class="ra" cx="104" cy="51" r="4.4"/><circle class="rb" cx="111" cy="46" r="2.6"/>
    <circle class="ra" cx="152" cy="73" r="4.6"/><circle class="ra" cx="160" cy="70" r="5"/><circle class="rb" cx="166" cy="64" r="2.4"/>
    <circle class="rb" cx="40" cy="72" r="3.4"/><circle class="rb" cx="34" cy="64" r="2.2"/><circle class="rb" cx="44" cy="62" r="1.6"/>
    <g transform="rotate(-18 128 40)"><rect class="ry" x="118" y="34" width="20" height="12" rx="3"/><circle class="ro" cx="123" cy="38" r="1"/><circle class="ro" cx="130" cy="41" r="1.1"/><circle class="ro" cx="134" cy="37.6" r=".9"/></g>
    ${sparkle(176, 56, 4.4, 'ra')}${sparkle(26, 50, 3.4, 'ry')}${sparkle(142, 30, 3, 'ra')}
    ${shadow(187, 9, 108)}
    <path class="ra" d="M180 92h15l-2 16h-11z"/><path class="rw" d="M181 92c0-7 13-7 13 0"/>
    <circle class="ra" cx="184" cy="90" r="3"/><circle class="ra" cx="190" cy="89" r="3.4"/><circle class="rb" cx="187" cy="85" r="2"/>`,
};
