// Kindermodus: big pictures, step-by-step checklists, read-aloud, the race against Schmuddel and animated scenes.
import * as store from './store.js';
import * as L from './logic.js';
import { monsterSvg, splatSvg, MONSTER_NAME } from './art.js';
import { esc, icons, sheet, toast, confetti, speak, vibrate } from './ui.js';
import { go } from './router.js';
import { guessEmoji } from './templates.js';
import * as mascot from './mascot.js';
import * as voice from './voice.js';
import { taskSpeech } from './speech.js';
import { sceneSvg, sceneFor, matchScene, randomScene } from './scenes.js';
import { MONSTER_LINES } from './templates.js';

const GROUP_KID = '_kids';

function kidList() {
  const kids = L.persons().filter(p => p.kid);
  return kids.length ? kids : [{ id: GROUP_KID, name: 'Kinder', emoji: '🧒', color: '#ff9500' }];
}
/** kid-friendly race card: you vs Schmuddel this month */
function raceCard() {
  if (!store.settings().race) return '';
  const r = L.kidsRace();
  const max = Math.max(r.user, r.monster, 1);
  const msg = r.lead > 0 ? `Ihr führt mit ${r.lead}! Weiter so! 🏃` : r.lead < 0 ? `Schmuddel führt mit ${-r.lead}. Holt ihn ein! 💨` : 'Gleichstand! Wer schafft die nächste Aufgabe? 🤝';
  return `<section class="kid-race">
    <div class="kr-row"><span class="kr-name">🦸 Ihr</span><div class="kr-bar you"><div style="width:${(r.user / max) * 100}%"></div></div><b>${r.user}</b></div>
    <div class="kr-row"><span class="kr-name">🟢 Schmuddel</span><div class="kr-bar mon"><div style="width:${(r.monster / max) * 100}%"></div></div><b>${r.monster}</b></div>
    ${contrib()}
    <p>${msg}</p></section>`;
}
function contrib() {
  const kids = L.persons().filter(p => p.kid);
  if (kids.length < 2) return '';
  const by = L.kidsContribution();
  return `<div class="kr-team">${kids.map(k => `<span style="--pc:${L.personColor(k)}">${esc(k.emoji)} ${esc(k.name)} <b>${by[k.id] || 0}</b></span>`).join('<i>+</i>')}<span class="kr-sum">= zusammen gegen Schmuddel</span></div>`;
}
const pick = list => list[Math.floor(Math.random() * list.length)];
function kidTasks(kidId) {
  return store.all('tasks').filter(t => t.kid?.enabled && L.activeAt(t) && (kidId === GROUP_KID || L.kidTaskFor(t, kidId)));
}
/** who finished this task today (for shared tasks) */
function doneTodayBy(t) {
  const sod = L.startOfDay(Date.now());
  const c = store.all('completions').filter(x => x.taskId === t.id && x.at >= sod).sort((a, b) => b.at - a.at)[0];
  return c ? store.get('persons', c.personId) : null;
}
// ---- the scene on the kids home screen: stays until the app is reopened or a task is finished ----
let kidScene = null; // lives as long as the app runs (reopening the app starts fresh)
/** prefer a scene that fits a task that is due right now; otherwise any other scene */
function pickKidScene(kidId, except) {
  const fitting = [...new Set(kidTasks(kidId).filter(t => !t.anytime && L.isDue(t)).map(matchScene).filter(Boolean))];
  const choices = fitting.filter(k => k !== except);
  if (choices.length) return choices[Math.floor(Math.random() * choices.length)];
  if (fitting.length) return fitting[0];
  return randomScene(except);
}
function rank(t) { return t.anytime ? 1 : L.isDue(t) ? 0 : L.daysUntilDue(t) <= 1 ? 1 : 2; }

// ---------------- Schmuddel introduces himself (first visit in kids mode) ----------------
const INTRO_STEPS = [
  { mood: 'wave', anim: 'in-pop' },
  { mood: 'happy', anim: 'in-dance' },
  { mood: 'taunt', anim: 'in-stomp', splats: true },
  { mood: 'shock', anim: 'in-jump' },
  { mood: 'angry', anim: 'in-stomp', race: true },
];
export function showIntro() {
  const root = document.getElementById('overlay-root');
  const lines = MONSTER_LINES.intro;
  const wrap = document.createElement('div');
  wrap.className = 'intro';
  wrap.innerHTML = `<div class="intro-stage">
      <div class="intro-cloud">${Array.from({ length: 7 }, (_, i) => `<i class="c${i}"></i>`).join('')}</div>
      <div class="intro-splats">${Array.from({ length: 6 }, (_, i) => `<span class="s${i}">${splatSvg(i)}</span>`).join('')}</div>
      <div class="intro-mon" data-imon>${monsterSvg('wave', 'monster')}</div>
    </div>
    <div class="intro-bubble" data-ibub><b>${MONSTER_NAME}</b><span></span></div>
    <div class="intro-dots">${lines.map((_, i) => `<i data-dot="${i}"></i>`).join('')}</div>
    <div class="intro-actions"><button class="btn light" data-iskip>Überspringen</button><button class="btn orange big" data-igo hidden>Wir schaffen das! 💪</button></div>`;
  root.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  let stopped = false;
  const finish = () => {
    stopped = true;
    voice.stop();
    store.setLocal({ kidsIntroSeen: true });
    wrap.classList.remove('open');
    setTimeout(() => wrap.remove(), 300);
  };
  wrap.querySelector('[data-iskip]').onclick = finish;
  wrap.querySelector('[data-igo]').onclick = finish;
  (async () => {
    await new Promise(r => setTimeout(r, 900)); // dust cloud, then Schmuddel pops out
    for (let i = 0; i < lines.length && !stopped; i++) {
      const st = INTRO_STEPS[i] || INTRO_STEPS[0];
      const mon = wrap.querySelector('[data-imon]');
      mon.innerHTML = monsterSvg(st.mood, 'monster');
      mon.className = 'intro-mon ' + st.anim;
      if (st.splats) wrap.classList.add('dirty');
      if (st.race) wrap.classList.add('race');
      const bub = wrap.querySelector('[data-ibub]');
      bub.querySelector('span').textContent = lines[i];
      bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
      wrap.querySelectorAll('[data-dot]').forEach(d => d.classList.toggle('on', Number(d.dataset.dot) <= i));
      await voice.say(lines[i], 'monster');
      await new Promise(r => setTimeout(r, 350));
    }
    if (!stopped) { wrap.querySelector('[data-igo]').hidden = false; wrap.querySelector('[data-iskip]').hidden = true; }
  })();
}

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
  const header = `<header class="kids-bar"><button class="exit-btn" data-exit aria-label="Kindermodus verlassen">🔒 Eltern</button><h1>Putz-Helden</h1>${kidId && kids.length > 1 ? '<button class="exit-btn switch-kid" data-go="/kids" aria-label="Kind wechseln">👥 Wechseln</button>' : '<span></span>'}</header>`;

  if (!kidId) {
    return {
      html: `${header}<main class="content kids"><div class="kid-pick-title">${monsterSvg('shock', 'kid-mon', { tickle: true })}<h2>Wer hilft heute mit?</h2></div>
        <div class="kid-pick">${kids.map(k => `<button class="kid-card" data-go="/kids/${k.id}" style="--pc:${L.personColor(k)}"><span class="kid-emo">${esc(k.emoji)}</span><b>${esc(k.name)}</b></button>`).join('')}</div></main>`,
      bind: bindKids,
    };
  }
  const kid = kids.find(k => k.id === kidId) || kids[0];
  const mine = kidTasks(kid.id);
  // only what is due now ("Jederzeit"-tasks have no due date and stay available)
  const tasks = mine.filter(t => t.anytime || L.isDue(t)).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  // finished today (no longer due): shown as a small line so kids see what was done, and by whom
  const doneList = mine.filter(t => !t.anytime && !L.isDue(t) && L.todayCount(t) > 0).map(t => {
    const by = doneTodayBy(t);
    return `${esc(t.kid.emoji || guessEmoji(t.name))} ${esc(t.name)}${by ? ` · ${esc(by.name)}` : ''}`;
  });
  if (!kidScene) kidScene = pickKidScene(kid.id);
  const scene = kidScene;
  return {
    html: `${header}
      <main class="content kids">
        <section class="kid-hero" style="--pc:${L.personColor(kid)}">
          <div class="kid-hero-top"><span class="kid-emo">${esc(kid.emoji)}</span><div><b>Hallo ${esc(kid.name)}!</b><span>Hilf mit, Schmuddel im Rennen zu schlagen!</span></div></div>
        </section>
        ${raceCard()}
        ${tasks.length
          ? `<div class="kid-stage" data-stage>${sceneSvg(scene)}<div class="bubble" data-sbubble>${esc(mascot.line('scene_' + scene))}</div></div>`
          : `<div class="kid-sulk"><div class="sulk-corner">${monsterSvg('sad', 'kid-mon sulk-mon', { tickle: true, say: '.kid-sulk p span' })}<i class="sulk-cloud">💢</i></div>
              <p><b>Alles sauber!</b><br><span>Schmuddel schmollt in der Ecke. 😤</span></p></div>`}
        <div class="kid-tasks">${tasks.map(t => {
          const due = rank(t) === 0;
          const done = L.todayCount(t) > 0;
          return `<button class="kid-task ${due ? 'due' : ''} ${done ? 'done' : ''}" data-kt="${t.id}">
            <span class="kt-emo">${esc(t.kid.emoji || guessEmoji(t.name))}</span>
            <b>${esc(t.name)}</b>
            <span class="kt-area">${esc(store.get('areas', t.areaId)?.name || '')}</span>
            <small>${done ? `✅ Heute geschafft${(() => { const by = doneTodayBy(t); return by && by.id !== kid.id ? ` von ${esc(by.name)}` : ''; })()}!` : due ? '🔥 Jetzt dran!' : t.anytime ? 'Hilf mit!' : 'Bald wieder dran'}</small>
          </button>`;
        }).join('') || (mine.length ? '' : `<p class="empty">Gerade gibt es keine Kinder-Aufgaben. Frag Mama oder Papa! 🙂</p>`)}</div>
        ${doneList.length ? `<div class="kid-donetoday"><b>✅ Heute geschafft</b><ul>${doneList.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}
        <button class="btn light big kids-exit" data-exit>🔒 Zurück zum Hauptmenü (für Eltern)</button>
      </main>`,
    bind(root) {
      bindKids(root);
      if (!store.local().kidsIntroSeen && !document.querySelector('.intro')) showIntro();
      if (!window.__bbKidsPrefetched) {
        window.__bbKidsPrefetched = true;
        (async () => { for (const t of kidTasks(kid.id)) await voice.prefetch(taskSpeech(t.name, t.kid.steps), 'narrator'); })();
      }
      root.querySelectorAll('[data-kt]').forEach(b => (b.onclick = () => kidTaskSheet(b.dataset.kt, kid)));
      const stage = root.querySelector('[data-stage]');
      if (stage)       // tap: the scene stays, Schmuddel just says another line of it
      stage.onclick = () => {
        const text = mascot.line('scene_' + scene);
        const b = stage.querySelector('[data-sbubble]');
        b.textContent = text; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        voice.say(text, 'monster');
      };
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
        const cheat = L.wouldCheat(t);
        L.completeTask(t, personId, { kid: true });
        kidScene = pickKidScene(kid.id, kidScene);
        close();
        if (cheat) {
          const monLine = mascot.line('kidCheat');
          voice.say(monLine, 'monster');
          celebrate(kid, monLine, null, true);
          return;
        }
        confetti(90);
        const { main: monLine, joke } = pickDoneLines(t, kid);
        voice.say(monLine, 'monster').then(() => (joke ? voice.say(joke, 'monster') : null));
        celebrate(kid, monLine, joke);
      };
    };
    bind();
  }, { cls: 'kid' });
  // Schmuddel's scene line first, then the task is read aloud
  setTimeout(() => voice.say(scLine, 'monster').then(() => { if (document.querySelector('.sheet.kid')) readAll(); }), 350);
}

/** What Schmuddel says after a finished task: a mix of general, task-specific, race-aware and
 *  all-clear lines, often followed by a silly joke. */
function pickDoneLines(t, kid) {
  const r = L.kidsRace();
  const dueLeft = kidTasks(kid.id).some(x => !x.anytime && L.isDue(x));
  const sc = matchScene(t);
  const roll = Math.random();
  let main;
  if (!dueLeft && roll < 0.7) main = mascot.line('kidAllClear');
  else if (sc && roll < 0.4) main = mascot.line('done_' + sc);
  else if (roll < 0.6) main = mascot.line(r.lead > 0 ? 'kidLead' : r.lead < 0 ? 'kidBehind' : 'kidTied');
  else main = mascot.line('kidDone');
  const joke = Math.random() < 0.6 ? mascot.line('kidJoke') : null;
  return { main, joke };
}

function celebrate(kid, monLine, joke, cheat = false) {
  const r = L.kidsRace();
  sheet(`<div class="celebrate">${monsterSvg(cheat ? 'taunt' : 'sad', `kid-mon big ${cheat ? '' : 'a-melt-loop'}`, { tickle: true })}
      <h2>${cheat ? `Erwischt, ${esc(kid.name)}! 🕵️` : `Geschafft, ${esc(kid.name)}! 🏁`}</h2>
      <p class="cel-line">${cheat ? 'Zu oft hintereinander abgehakt – diesmal gibt es keinen Punkt.' : 'Ein Punkt mehr im Rennen gegen Schmuddel!'}</p>
      ${store.settings().race ? `<div class="cel-score"><span>Ihr <b>${r.user}</b></span><span>:</span><span><b>${r.monster}</b> Schmuddel</span></div>` : ''}
      <p>${esc(MONSTER_NAME)}: „${esc(monLine)}“</p>
      ${joke ? `<p class="cel-joke">😜 „${esc(joke)}“</p>` : ''}
      <button class="btn orange big" data-ok>Weiter</button></div>`, (el, close) => { el.querySelector('[data-ok]').onclick = close; }, { cls: 'kid' });
}
