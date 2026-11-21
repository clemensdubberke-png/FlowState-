// Kindermodus: big pictures, step-by-step checklists, read-aloud, the race against Schmuddel and animated scenes.
import * as store from './store.js';
import * as L from './logic.js';
import { monsterSvg, MONSTER_NAME } from './art.js';
import { esc, icons, sheet, toast, confetti, speak, vibrate } from './ui.js';
import { go } from './router.js';
import { guessEmoji } from './templates.js';
import * as mascot from './mascot.js';
import * as voice from './voice.js';
import { taskSpeech } from './speech.js';
import { sceneSvg, sceneFor, randomScene } from './scenes.js';

const GROUP_KID = '_kids';

function kidList() {
  const kids = L.persons().filter(p => p.kid);
  return kids.length ? kids : [{ id: GROUP_KID, name: 'Kinder', emoji: '🧒', color: '#ff9500' }];
}
/** kid-friendly race card: you vs Schmuddel this month */
function raceCard() {
  if (!store.settings().race) return '';
  const r = L.race();
  const max = Math.max(r.user, r.monster, 1);
  const msg = r.lead > 0 ? `Ihr führt mit ${r.lead}! Weiter so! 🏃` : r.lead < 0 ? `Schmuddel führt mit ${-r.lead}. Holt ihn ein! 💨` : 'Gleichstand! Wer schafft die nächste Aufgabe? 🤝';
  return `<section class="kid-race">
    <div class="kr-row"><span class="kr-name">🦸 Ihr</span><div class="kr-bar you"><div style="width:${(r.user / max) * 100}%"></div></div><b>${r.user}</b></div>
    <div class="kr-row"><span class="kr-name">🟢 Schmuddel</span><div class="kr-bar mon"><div style="width:${(r.monster / max) * 100}%"></div></div><b>${r.monster}</b></div>
    <p>${msg}</p></section>`;
}
const pick = list => list[Math.floor(Math.random() * list.length)];
function kidTasks(kidId) {
  return store.all('tasks').filter(t => t.kid?.enabled && L.activeAt(t)).filter(t => {
    const resp = L.responsible(t);
    return !resp || resp === kidId || !store.get('persons', resp)?.kid;
  });
}
function rank(t) { return t.anytime ? 1 : L.isDue(t) ? 0 : L.daysUntilDue(t) <= 1 ? 1 : 2; }

export function enterKids() {
  sessionStorage.setItem('bb.kids', '1');
  go('/kids');
}

let gateOpen = false;
export function exitGate() {
  if (gateOpen) return;
  gateOpen = true;
  const a = 2 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
  sheet(`<h3>Nur für Erwachsene 🔒</h3><p class="muted">Wie viel ist ${a} × ${b}?</p>
    <input class="gate" inputmode="numeric" data-ans autocomplete="off">
    <div class="btn-row"><button class="btn grey" data-x="no">Abbrechen</button><button class="btn orange" data-x="ok">Verlassen</button></div>`,
  (el, close) => {
    const inp = el.querySelector('[data-ans]');
    setTimeout(() => inp.focus(), 250);
    const done = () => { gateOpen = false; close(); };
    const ok = () => {
      if (Number(String(inp.value).trim()) === a * b) {
        sessionStorage.removeItem('bb.kids');
        done();
        go('/', { replace: true });
        window.dispatchEvent(new Event('bb:render'));
      } else { inp.value = ''; inp.placeholder = 'Leider falsch – nochmal'; vibrate(80); }
    };
    el.querySelector('[data-x=ok]').onclick = ok;
    inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
    inp.oninput = () => { if (Number(inp.value) === a * b) ok(); };
    el.querySelector('[data-x=no]').onclick = done;
    el.parentElement.querySelector('.sheet-bg').addEventListener('click', () => (gateOpen = false));
  });
}

export function kidsView(kidId) {
  const kids = kidList();
  if (!kidId && kids.length === 1) kidId = kids[0].id;
  const header = `<header class="kids-bar"><button class="exit-btn" data-exit aria-label="Kindermodus verlassen">🔒 Eltern</button><h1>Putz-Helden</h1>${kidId && kids.length > 1 ? '<button class="icon-btn" data-go="/kids" aria-label="Kind wechseln">👥</button>' : '<span></span>'}</header>`;

  if (!kidId) {
    return {
      html: `${header}<main class="content kids"><div class="kid-pick-title">${monsterSvg('shock', 'kid-mon', { tickle: true })}<h2>Wer hilft heute mit?</h2></div>
        <div class="kid-pick">${kids.map(k => `<button class="kid-card" data-go="/kids/${k.id}" style="--pc:${L.personColor(k)}"><span class="kid-emo">${esc(k.emoji)}</span><b>${esc(k.name)}</b></button>`).join('')}</div></main>`,
      bind: bindKids,
    };
  }
  const kid = kids.find(k => k.id === kidId) || kids[0];
  const tasks = kidTasks(kid.id).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  let scene = randomScene();
  return {
    html: `${header}
      <main class="content kids">
        <section class="kid-hero" style="--pc:${L.personColor(kid)}">
          <div class="kid-hero-top"><span class="kid-emo">${esc(kid.emoji)}</span><div><b>Hallo ${esc(kid.name)}!</b><span>Hilf mit, Schmuddel im Rennen zu schlagen!</span></div></div>
        </section>
        ${raceCard()}
        <div class="kid-stage" data-stage>${sceneSvg(scene)}<div class="bubble" data-sbubble>${esc(mascot.line('scene_' + scene))}</div></div>
        <div class="kid-tasks">${tasks.map(t => {
          const due = rank(t) === 0;
          const done = L.todayCount(t) > 0;
          return `<button class="kid-task ${due ? 'due' : ''} ${done ? 'done' : ''}" data-kt="${t.id}">
            <span class="kt-emo">${esc(t.kid.emoji || guessEmoji(t.name))}</span>
            <b>${esc(t.name)}</b>
            <span class="kt-area">${esc(store.get('areas', t.areaId)?.name || '')}</span>
            <small>${done ? '✅ Heute geschafft!' : due ? '🔥 Jetzt dran!' : t.anytime ? 'Hilf mit!' : 'Bald wieder dran'}</small>
          </button>`;
        }).join('') || `<p class="empty">Gerade gibt es keine Kinder-Aufgaben. Frag Mama oder Papa! 🙂</p>`}</div>
        <button class="btn light big kids-exit" data-exit>🔒 Zurück zum Hauptmenü (für Eltern)</button>
      </main>`,
    bind(root) {
      bindKids(root);
      root.querySelectorAll('[data-kt]').forEach(b => (b.onclick = () => kidTaskSheet(b.dataset.kt, kid)));
      const stage = root.querySelector('[data-stage]');
      const show = (key, speakIt) => {
        scene = key;
        const text = mascot.line('scene_' + key);
        stage.querySelector('svg').outerHTML = sceneSvg(key);
        const b = stage.querySelector('[data-sbubble]');
        b.textContent = text; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        if (speakIt) voice.say(text, 'monster');
      };
      // tap: next scene with a voiced line; otherwise a new scene every 20 s (silent)
      stage.onclick = () => show(randomScene(scene), true);
      const iv = setInterval(() => { if (!stage.isConnected) { clearInterval(iv); return; } if (!document.hidden && !document.querySelector('.sheet-wrap')) show(randomScene(scene), false); }, 20000);
    },
  };
}

function bindKids(root) {
  root.querySelectorAll('[data-go]').forEach(b => (b.onclick = () => go(b.dataset.go)));
  root.querySelectorAll('[data-exit]').forEach(ex => (ex.onclick = exitGate));
}

function kidTaskSheet(id, kid) {
  const t = store.get('tasks', id);
  if (!t) return;
  const steps = (t.kid.steps && t.kid.steps.length) ? t.kid.steps : [{ e: t.kid.emoji || '⭐', text: t.name }];
  const checked = new Set();
  const readAll = () => voice.say(taskSpeech(t.name, t.kid.steps), 'narrator');
  const sc = sceneFor(t);
  const scLine = mascot.line('scene_' + sc);
  const draw = () => `<div class="kid-sheet">
      <div class="ks-scene">${sceneSvg(sc, 'scene small')}<div class="bubble">${esc(scLine)}</div></div>
      <div class="ks-head"><span class="kt-emo big">${esc(t.kid.emoji || '⭐')}</span><h3>${esc(t.name)}</h3><button class="icon-btn speak" data-read aria-label="Vorlesen">${icons.speaker}</button></div>
      <div class="ks-steps">${steps.map((s, i) => `<button class="ks-step ${checked.has(i) ? 'on' : ''}" data-s="${i}"><span class="ks-num">${checked.has(i) ? '✔' : i + 1}</span><span class="ks-emo">${esc(s.e || '⭐')}</span><span class="ks-text">${esc(s.text)}</span></button>`).join('')}</div>
      <div class="ks-progress"><div style="width:${(checked.size / steps.length) * 100}%"></div></div>
      <button class="btn orange big kid-done" data-done ${checked.size < steps.length ? 'disabled' : ''}>${checked.size < steps.length ? `Noch ${steps.length - checked.size} Schritt${steps.length - checked.size > 1 ? 'e' : ''}` : 'Fertig! 🏁 Punkt gegen Schmuddel'}</button>
    </div>`;
  sheet(`<div data-k>${draw()}</div>`, (el, close) => {
    const box = el.querySelector('[data-k]');
    const bind = () => {
      box.querySelector('[data-read]').onclick = readAll;
      box.querySelectorAll('[data-s]').forEach(b => (b.onclick = () => {
        const i = Number(b.dataset.s);
        if (checked.has(i)) checked.delete(i); else { checked.add(i); vibrate(20); if (checked.size === steps.length) mascot.react('kidAllSteps', { force: true }); else mascot.react(Math.random() < 0.5 ? 'kidStep' : 'kidTick', { force: true }); }
        box.innerHTML = draw(); bind();
      }));
      box.querySelector('[data-done]').onclick = () => {
        const personId = kid.id === '_kids' ? null : kid.id;
        L.completeTask(t, personId, { kid: true });
        close();
        confetti(90);
        const monLine = mascot.line('kidDone');
        voice.say(monLine, 'monster');
        celebrate(kid, monLine);
      };
    };
    bind();
  }, { cls: 'kid' });
  // Schmuddel's scene line first, then the task is read aloud
  setTimeout(() => voice.say(scLine, 'monster').then(() => { if (document.querySelector('.sheet.kid')) readAll(); }), 350);
}

function celebrate(kid, monLine) {
  const r = L.race();
  sheet(`<div class="celebrate">${monsterSvg('sad', 'kid-mon big a-melt-loop', { tickle: true })}
      <h2>Geschafft, ${esc(kid.name)}! 🏁</h2>
      <p class="cel-line">Ein Punkt mehr im Rennen gegen Schmuddel!</p>
      ${store.settings().race ? `<div class="cel-score"><span>Ihr <b>${r.user}</b></span><span>:</span><span><b>${r.monster}</b> Schmuddel</span></div>` : ''}
      <p>${esc(MONSTER_NAME)}: „${esc(monLine)}“</p>
      <button class="btn orange big" data-ok>Weiter</button></div>`, (el, close) => { el.querySelector('[data-ok]').onclick = close; }, { cls: 'kid' });
}
