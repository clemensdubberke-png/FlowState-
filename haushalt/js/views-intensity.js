// Cleaning-intensity slider with a live-reacting Schmuddel (used on first start and in settings).
import * as store from './store.js';
import * as L from './logic.js';
import { monsterSvg, splatSvg, MONSTER_NAME } from './art.js';
import { esc, toast, vibrate, confirmSheet } from './ui.js';
import { appbar, bindCommon } from './views-main.js';

const SAYS = [
  ['JAAA! Sehr locker! Ich zieh sofort ein und bring meine ganze Familie mit!', 'Party! Endlich ein Zuhause, das mich versteht!'],
  ['Locker? Sympathisch! Wir zwei werden uns prima verstehen.', 'Hehe, locker gefällt mir. Mehr Zeit für Krümel!'],
  ['Normal, hm? Na gut. Meine Krümel krieg ich trotzdem.', 'Normal ist okay. Ich bin ja auch ganz normal… schleimig.'],
  ['Ordentlich?! Oh nein… muss das wirklich sein?', 'Ordentlich… mir wird ganz anders. Hilfe!'],
  ['INTENSIV?! Ich pack schon mal meine Koffer… schnief.', 'Intensiv?! Das überlebe ich nicht! Ich bin doch so empfindlich!'],
];
const EXAMPLES = [['Boden wischen', 7], ['Bettwäsche wechseln', 14], ['Fenster putzen', 90]];

function freqLabel(days, level) {
  const f = L.scaledFreq(days, level);
  return L.freqText({ ...f, anytime: false });
}

/** html of the widget; call bindIntensity(root, onChange) afterwards */
export function intensityWidget(level) {
  const dirt = 4 - level;
  return `<div class="intensity" data-intensity style="--lvl:${level}">
    <div class="int-stage lvl-${level}" data-stage>
      ${Array.from({ length: 4 }, (_, i) => `<span class="int-splat s${i} ${i < dirt ? 'on' : ''}">${splatSvg(i)}</span>`).join('')}
      <div class="int-mon" data-mon>${monsterSvg(L.INTENSITY[level].mood, 'monster')}</div>
    </div>
    <div class="int-bubble" data-say><b>${MONSTER_NAME}</b><span>${esc(SAYS[level][0])}</span></div>
    <div class="int-label"><b data-lab>${esc(L.INTENSITY[level].label)}</b><small data-hint>${esc(L.INTENSITY[level].hint)}</small></div>
    <input type="range" class="int-range" min="0" max="4" step="1" value="${level}" data-range aria-label="Putz-Intensität">
    <div class="int-scale"><span>Sehr locker</span><span>Locker</span><span>Normal</span><span>Ordentlich</span><span>Intensiv</span></div>
    <div class="int-ex" data-ex>${examples(level)}</div>
  </div>`;
}
function examples(level) {
  return `<small>So oft zum Beispiel:</small>` + EXAMPLES.map(([n, d]) => `<div><span>${esc(n)}</span><b>${esc(freqLabel(d, level))}</b></div>`).join('');
}

export function bindIntensity(root, onChange) {
  const box = root.querySelector('[data-intensity]');
  const range = box.querySelector('[data-range]');
  let cur = Number(range.value);
  const update = (lvl, talk = true) => {
    const stage = box.querySelector('[data-stage]');
    stage.className = `int-stage lvl-${lvl}`;
    box.style.setProperty('--lvl', lvl);
    box.querySelectorAll('.int-splat').forEach((s, i) => s.classList.toggle('on', i < 4 - lvl));
    box.querySelector('[data-mon]').innerHTML = monsterSvg(L.INTENSITY[lvl].mood, 'monster');
    box.querySelector('[data-lab]').textContent = L.INTENSITY[lvl].label;
    box.querySelector('[data-hint]').textContent = L.INTENSITY[lvl].hint;
    box.querySelector('[data-ex]').innerHTML = examples(lvl);
    if (talk) {
      const say = box.querySelector('[data-say] span');
      say.textContent = SAYS[lvl][Math.floor(Math.random() * SAYS[lvl].length)];
      const b = box.querySelector('[data-say]');
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
      stage.classList.remove('kick'); void stage.offsetWidth; stage.classList.add('kick');
      vibrate(15);
    }
    onChange && onChange(lvl);
  };
  range.oninput = () => { const v = Number(range.value); if (v !== cur) { cur = v; update(v); } };
  box.querySelector('[data-mon]').onclick = () => update(cur);
}

// ---------------- settings screen ----------------
export function intensityView() {
  const level = L.intensity();
  let chosen = level;
  return {
    static: true,
    html: `${appbar('Putz-Intensität', { backTo: '/settings' })}
      <main class="content settings">
        <p class="group-foot">Wie gründlich wollt ihr putzen? Danach richten sich die vorgeschlagenen Frequenzen aus dem Aufgaben-Katalog.</p>
        ${intensityWidget(level)}
        <div class="btn-row"><button class="btn orange big" data-save>Speichern</button></div>
        <p class="group-foot small">Beim Speichern könnt ihr wählen, ob die vorhandenen Katalog-Aufgaben angepasst werden. Frequenzen, die ihr selbst geändert habt, bleiben immer erhalten.</p>
      </main>`,
    bind(root) {
      bindCommon(root);
      bindIntensity(root, l => (chosen = l));
      root.querySelector('[data-save]').onclick = async () => {
        store.setSettings({ intensity: chosen });
        const affected = store.all('tasks').filter(t => t.tplDays && !t.customFreq && !t.anytime).length;
        if (chosen !== level && affected && await confirmSheet('Vorhandene Aufgaben anpassen?', `${affected} Aufgaben aus dem Katalog bekommen die Frequenzen für „${L.INTENSITY[chosen].label}“. Selbst angepasste Frequenzen bleiben unverändert.`, 'Anpassen')) {
          L.applyIntensity(chosen);
          toast(`${affected} Aufgaben angepasst`);
        } else toast('Gespeichert');
      };
    },
  };
}
