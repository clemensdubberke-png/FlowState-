import * as store from './store.js';
import * as L from './logic.js';
import { roomSvg, splatSvg, monsterSvg, MONSTER_NAME } from './art.js';
import { esc, icons, sheet, toast, vibrate, confetti } from './ui.js';
import { go, back } from './router.js';
import * as mascot from './mascot.js';
import * as voice from './voice.js';
import { conditionPicker, bindConditionPickers } from './condition.js';

// ---------------- shared layout ----------------
export function appbar(title, { backTo = null, color = null, actions = '', big = false } = {}) {
  return `<header class="appbar ${big ? 'big' : ''}" ${color ? `style="--bar:${color}"` : ''}>
    ${backTo !== null ? `<button class="icon-btn" data-back="${esc(backTo)}" aria-label="Zurück">${icons.back}</button>` : ''}
    <h1>${esc(title)}</h1>
    <div class="appbar-actions">${actions}</div>
  </header>`;
}

export function bindCommon(root) {
  root.querySelectorAll('[data-back]').forEach(b => (b.onclick = () => back(b.dataset.back || '/')));
  root.querySelectorAll('[data-go]').forEach(b => (b.onclick = () => go(b.dataset.go)));
}

function personChip(id, small = false) {
  const p = store.get('persons', id);
  if (!p) return '';
  return `<span class="pchip ${small ? 'sm' : ''}" style="--pc:${L.personColor(p)}">${esc(p.emoji || '🙂')} ${esc(p.name)}</span>`;
}

// ---------------- race banner ----------------
export function raceBanner() {
  const s = store.settings();
  if (!s.race) return '';
  const r = L.race();
  const line = L.raceLine(r);
  const max = Math.max(r.goal, r.user, r.monster, 1);
  const leadText = r.lead < 0 ? `${MONSTER_NAME} führt: ${-r.lead} Pkt.` : r.lead > 0 ? `Ihr führt: ${r.lead} Pkt.` : 'Gleichstand';
  return `<section class="race-banner" data-race>
    <div class="race-mon">${monsterSvg(line.mood, 'monster', { tickle: true, say: '.race-line' })}</div>
    <div class="race-body">
      <button class="race-say" data-sayline aria-label="Schmuddel sprechen lassen">🔊</button>
      <div class="race-line">${s.comments ? esc(line.text) : `Rennen gegen ${MONSTER_NAME}`}</div>
      <div class="race-meta"><span>Rennen im ${esc(r.monthLabel)}</span><span>${esc(leadText)}</span></div>
      <div class="race-track">
        <div class="race-bar you" style="width:${Math.max(1.5, (r.user / max) * 100)}%"></div>
        <div class="race-bar mon" style="width:${Math.max(1.5, (r.monster / max) * 100)}%"></div>
        <div class="race-goal" title="Monatsziel"></div>
      </div>
    </div>
  </section>`;
}

export function raceSheet() {
  const r = L.race();
  const s = store.settings();
  const stats = L.fairStats();
  const hist = Object.entries(s.raceHistory || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  const res = Object.values(s.raceHistory || {}).map(L.raceResult);
  const wins = res.filter(x => x === 'win').length, draws = res.filter(x => x === 'draw').length;
  sheet(`<div class="race-sheet">
      <div class="race-sheet-mon">${monsterSvg(r.lead < 0 ? 'taunt' : 'sad', 'monster', { tickle: true })}</div>
      <h3>Rennen im ${esc(r.monthLabel)}</h3>
      <div class="race-score"><div><b>${r.user}</b><span>Ihr</span></div><div class="vs">:</div><div><b>${r.monster}</b><span>${MONSTER_NAME}</span></div></div>
      <p class="muted">Monatsziel: ${r.goal} Pkt. · Schwierigkeit: ${L.DIFFICULTY[s.difficulty].label}<br>
      ${MONSTER_NAME} bekommt Punkte auf zwei Wegen: <b>gleichmäßig</b> über den Monat – bis Monatsende ${Math.round(r.goal * L.DIFFICULTY[s.difficulty].f)} Pkt. (${L.DIFFICULTY[s.difficulty].label}), bisher ${r.base} – <b>und</b> für Aufgaben, die überfällig liegen bleiben (höchstens 1× pro Aufgabe und Monat, insgesamt max. ${r.missCap} Pkt.), bisher ${r.missed}. Altlasten, die schon beim Anlegen fällig waren, zählen für ihn erst, wenn ihr sie einmal erledigt habt. Gleicher Stand am Monatsende = Unentschieden.</p>
      ${s.multiPerson && stats.length ? `<h4>Punkte diesen Monat</h4><div class="pts-list">${stats.map(x => `<div class="pts-row">${personChip(x.person.id)}<b>${x.points}</b></div>`).join('')}</div>` : ''}
      <h4>${icons.trophy} Gewonnen: ${wins} · Unentschieden: ${draws}</h4>
      <div class="hist">${hist.length ? hist.map(([k, h]) => `<div class="hist-row ${L.raceResult(h)}"><span>${esc(L.monthName(k))}</span><span>${h.points} : ${h.monster}</span><span>${L.RESULT_ICON[L.raceResult(h)]}</span></div>`).join('') : '<p class="muted">Noch keine abgeschlossenen Monate.</p>'}</div>
      <div class="btn-row"><button class="btn grey" data-x="set">Einstellungen</button><button class="btn orange" data-x="ok">Weiter putzen</button></div>
    </div>`, (el, close) => {
    el.querySelector('[data-x=ok]').onclick = close;
    el.querySelector('[data-x=set]').onclick = () => { close(); go('/settings/monster'); };
  });
}

// ---------------- home: areas ----------------
export function homeView() {
  const areas = store.all('areas').sort((a, b) => (a.order || 0) - (b.order || 0));
  const s = store.settings();
  const tiles = areas.map(a => {
    const st = L.areaState(a.id);
    const splats = Array.from({ length: st.dirt }, (_, i) => `<span class="tile-splat s${i}">${splatSvg(i)}</span>`).join('');
    return `<button class="tile" style="--c:${a.color}" data-go="/area/${a.id}">
      <span class="tile-name">${esc(a.name)}</span>
      <span class="dot ${st.dot}"></span>
      ${roomSvg(a.art || a.type, 'tile-art')}
      ${splats}
    </button>`;
  }).join('');
  const vac = s.vacation ? `<div class="vac-banner" data-go="/settings/vacation">🏖️ Urlaubsmodus aktiv – Aufgaben sind pausiert</div>` : '';
  return {
    html: `${appbar('Bereiche', { big: true, actions: s.kidsMode ? `<button class="icon-btn kids-btn" data-kids aria-label="Kindermodus">${icons.kids}<span>Kinder</span></button>` : '' })}
      <main class="content home">
        ${vac}${areas.length ? raceBanner() : ''}
        ${areas.length ? '' : `<div class="home-empty"><span class="he-ic">👇</span><p><b>Noch ist alles leer.</b><br>Tippe auf das <b>+</b>, um deinen ersten Bereich anzulegen – zum Beispiel die Küche.</p></div>`}
        <div class="tiles">${tiles}<button class="tile add ${areas.length ? '' : 'pulse'}" data-go="/area-new" aria-label="Bereich hinzufügen">${icons.plus}</button></div>
      </main>
      ${bottomNav()}`,
    bind(root) {
      bindCommon(root);
      const kb = root.querySelector('[data-kids]');
      if (kb) kb.onclick = () => import('./views-kids.js').then(m => m.enterKids());
      const rb = root.querySelector('[data-race]');
      if (rb) {
        rb.onclick = raceSheet;
        rb.querySelector('[data-sayline]').onclick = e => { e.stopPropagation(); voice.say(rb.querySelector('.race-line').textContent, 'monster'); };
        // Schmuddel keeps chatting in the banner every ~18 s
        const key = L.raceLine().key;
        const lineEl = rb.querySelector('.race-line');
        const iv = setInterval(() => {
          if (!lineEl.isConnected) { clearInterval(iv); return; }
          if (document.hidden || !s.comments) return;
          const dirty = L.dirtiestArea();
          const r = Math.random();
          lineEl.textContent = dirty && r < 0.4 ? mascot.roomLine(dirty) : mascot.line(r < 0.8 ? key : 'tickle');
          lineEl.classList.remove('pop'); void lineEl.offsetWidth; lineEl.classList.add('pop');
          const mon = rb.querySelector('.monster');
          mon.classList.remove('a-wiggle'); void mon.getBoundingClientRect(); mon.classList.add('a-wiggle');
        }, 18000);
      }
    },
  };
}

export function bottomNav() {
  return `<nav class="bottom-nav">
    <button data-go="/timer" aria-label="Timer">${icons.timer}</button>
    <div class="mid"><button data-go="/todo" aria-label="Heute fällig">${icons.check}</button><i></i><button data-go="/list" aria-label="Alle Aufgaben">${icons.list}</button></div>
    <button data-go="/settings" aria-label="Einstellungen">${icons.gear}</button>
  </nav>`;
}

// ---------------- task rows ----------------
// tasks just completed: id -> { width, color } of the bar before, so it can slide back to the left
const justDone = new Map();
function bar(t) {
  const fill = L.barFill(t) * 100;
  const prev = justDone.get(t.id);
  const anim = prev ? ` anim-reset" style="--from:${prev.width}%;--from-c:${prev.color};width:${fill}%;background:${L.barColor(t)}` : `" style="width:${fill}%;background:${L.barColor(t)}`;
  return `<div class="cbar"><div class="cbar-fill${anim}"></div><i style="left:47%"></i><i style="left:59%"></i><i style="left:71%"></i></div>`;
}

export function taskRow(t, { showArea = false, quick = false } = {}) {
  const doneToday = L.todayCount(t) > 0;
  const dirt = L.dirtLevel(t);
  const resp = L.responsible(t);
  const area = showArea ? store.get('areas', t.areaId) : null;
  const under = [
    doneToday ? `<span class="done-ic">${icons.done}</span>` : '',
    !doneToday && dirt ? `<span class="row-splats">${Array.from({ length: dirt }, (_, i) => splatSvg(i + 1)).join('')}</span>` : '',
    resp ? personChip(resp, true) : '',
    area ? `<span class="area-tag" style="--c:${area.color}">${esc(area.name)}</span>` : '',
    t.kid?.enabled ? `<span class="kid-tag" title="Kinder können mitmachen">${esc(t.kid.emoji || '⭐')}</span>` : '',
    L.isSeasonal(t) ? `<span class="season-tag">🗓️ ${esc(L.monthsText(t))}</span>` : '',
    t.legacy && !t.anytime ? '<span class="season-tag" title="Altlast: zählt für Schmuddel erst, wenn sie einmal erledigt wurde">🕰️ Altlast</span>' : '',
  ].join('');
  const sleeping = !t.anytime && !L.activeAt(t);
  const right = t.anytime
    ? `<div class="anytime"><span class="count">${L.todayCount(t)}</span><small>Jederzeit</small></div>`
    : sleeping
      ? `<div class="cond sleep"><span class="zz">💤</span><small>${esc(L.dueText(t))}</small></div>`
      : `<div class="cond">${bar(t)}<small>${esc(L.dueText(t))}</small></div>`;
  return `<div class="task-row ${sleeping ? 'sleeping' : ''}" data-task="${t.id}">
    ${quick ? `<button class="quick-check" data-quick="${t.id}" aria-label="Erledigt">✓</button>` : ''}
    <div class="task-main"><div class="task-name">${esc(t.name)}</div><div class="task-under">${under}</div></div>
    ${right}
  </div>`;
}

// ---------------- complete flow ----------------
export function doComplete(t, personId) {
  const prev = t.lastDone;
  if (!t.anytime) {
    justDone.set(t.id, { width: L.barFill(t) * 100, color: L.barColor(t) });
    setTimeout(() => justDone.delete(t.id), 1500);
  }
  const before = { status: L.status(t), race: L.race() };
  const pts = L.completeTask(t, personId);
  vibrate(25);
  const comp = store.all('completions').filter(c => c.taskId === t.id).sort((a, b) => b.at - a.at)[0];
  const s = store.settings();
  const who = personId && s.multiPerson ? store.get('persons', personId)?.name + ': ' : '';
  toast(`${who}Erledigt! +${pts} Pkt.`, { action: 'Rückgängig', onAction: () => { L.undoCompletion(comp, prev); mascot.react('undo'); }, ms: 4000 });
  // pick the most fitting reaction
  const r = L.race();
  const anyDue = store.all('tasks').some(x => !x.anytime && L.isDue(x));
  let kind = 'done';
  if (s.race && r.user >= r.goal && before.race.user < r.goal) { kind = 'goal'; confetti(); }
  else if (s.race && before.race.lead <= 0 && r.lead > 0) kind = 'leadFlip';
  else if (!anyDue && !t.anytime && L.isDue({ ...t, lastDone: prev })) kind = 'allDone';
  else if (before.status === 'overdue' || before.status === 'bad') kind = 'doneOverdue';
  else if ((t.effort || 1) >= 3) kind = 'doneHard';
  else if (t.anytime) kind = 'doneAnytime';
  mascot.react(kind, { delay: 250 });
}

export function taskSheet(id) {
  const t = store.get('tasks', id);
  if (!t) return;
  const s = store.settings();
  const area = store.get('areas', t.areaId);
  const ps = L.persons();
  let chosen = L.suggestedPerson(t);
  const hist = store.all('completions').filter(c => c.taskId === t.id).sort((a, b) => b.at - a.at).slice(0, 5);
  const fmt = ts => new Date(ts).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const resp = L.responsible(t);
  sheet(`<div class="task-sheet">
      <div class="ts-head" style="--c:${area?.color || '#1677f2'}"><small>${esc(area?.name || '')}</small><h3>${t.kid?.enabled ? esc(t.kid.emoji) + ' ' : ''}${esc(t.name)}</h3>
        <div class="ts-meta">${esc(L.freqText(t))} · ${L.EFFORT_LABEL[t.effort || 1]} (${L.pointsFor(t)} Pkt.)${L.isSeasonal(t) ? ` · 🗓️ ${esc(L.monthsText(t))}` : ''}</div></div>
      ${t.anytime ? `<p class="muted">Heute ${L.todayCount(t)}× erledigt.</p>` : `<div class="ts-cond">${bar(t)}<span>${esc(L.dueText(t))}</span></div>`}
      ${resp ? `<p class="muted">Zuständig: ${personChip(resp)}</p>` : ''}
      ${t.notes ? `<p class="notes">${esc(t.notes)}</p>` : ''}
      ${s.multiPerson && ps.length ? `<div class="who"><span class="muted">Wer hat's gemacht?</span><div class="chips">${ps.map(p => `<button class="pchip sel ${p.id === chosen ? 'on' : ''}" data-p="${p.id}" style="--pc:${L.personColor(p)}">${esc(p.emoji || '🙂')} ${esc(p.name)}</button>`).join('')}</div></div>` : ''}
      <button class="btn orange big" data-x="done">✓ Erledigt</button>
      <div class="btn-grid">
        ${t.anytime ? '' : '<button class="btn light" data-x="later">Morgen erinnern</button><button class="btn light" data-x="cond">Zustand setzen</button>'}
        <button class="btn light" data-x="edit">Bearbeiten</button>
      </div>
      ${hist.length ? `<h4>Zuletzt erledigt</h4><div class="hist">${hist.map(c => `<div class="hist-row"><span>${fmt(c.at)}</span><span>${c.personId ? personChip(c.personId, true) : ''}</span><span>+${c.points}</span></div>`).join('')}</div>` : ''}
    </div>`, (el, close) => {
    el.querySelectorAll('[data-p]').forEach(b => (b.onclick = () => {
      chosen = b.dataset.p;
      el.querySelectorAll('[data-p]').forEach(x => x.classList.toggle('on', x === b));
    }));
    el.querySelector('[data-x=done]').onclick = () => { close(); doComplete(t, chosen); };
    el.querySelector('[data-x=edit]').onclick = () => { close(); go('/task/' + t.id); };
    const later = el.querySelector('[data-x=later]');
    if (later) later.onclick = () => { close(); L.postpone(t, 1); toast('Auf morgen verschoben'); mascot.react('postpone'); };
    const cond = el.querySelector('[data-x=cond]');
    if (cond) cond.onclick = () => { close(); conditionSheet(t); };
  });
}

function conditionSheet(t) {
  let sel = L.currentConditionKey(t);
  const draw = () => `<h3>Wie sieht „${esc(t.name)}“ gerade aus?</h3><p class="muted">Ändert nur den Zustand, zählt nicht als erledigt.</p>
    ${conditionPicker(t, sel, 'sheet')}
    <div class="btn-row"><button class="btn grey" data-x="no">Abbrechen</button><button class="btn orange" data-x="ok" ${sel ? '' : 'disabled'}>Übernehmen</button></div>`;
  sheet(`<div data-cs>${draw()}</div>`, (el, close) => {
    const box = el.querySelector('[data-cs]');
    const bind = () => {
      bindConditionPickers(box, (_, key) => { sel = key; box.innerHTML = draw(); bind(); });
      box.querySelector('[data-x=no]').onclick = close;
      box.querySelector('[data-x=ok]').onclick = () => { L.setConditionKey(t, sel); close(); if (sel === 'over' || sel === 'bad') mascot.react('dirty'); };
    };
    bind();
  });
}

function bindRows(root) {
  root.querySelectorAll('[data-task]').forEach(r => (r.onclick = e => {
    if (e.target.closest('[data-quick]')) return;
    taskSheet(r.dataset.task);
  }));
  root.querySelectorAll('[data-quick]').forEach(b => (b.onclick = () => {
    const t = store.get('tasks', b.dataset.quick);
    if (!t) return;
    const s = store.settings();
    if (s.multiPerson && L.persons().length > 1) taskSheet(t.id);
    else doComplete(t, L.suggestedPerson(t));
  }));
}

// ---------------- area view ----------------
export function areaView(id) {
  const a = store.get('areas', id);
  if (!a) return { html: appbar('Bereich', { backTo: '/' }) + '<main class="content"><p class="empty">Bereich nicht gefunden.</p></main>', bind: bindCommon };
  const s = store.settings();
  const tasks = L.sortTasks(L.tasksOfArea(id), s.sortArea);
  const done = tasks.filter(t => L.todayCount(t) > 0).length;
  const due = tasks.filter(t => L.isDue(t)).length;
  return {
    html: `${appbar(a.name, { backTo: '/', color: a.color, actions: `<button class="icon-btn" data-go="/area/${a.id}/catalog" aria-label="Aufgaben hinzufügen">${icons.plus}</button><button class="icon-btn" data-go="/area/${a.id}/edit" aria-label="Bereich bearbeiten">${icons.edit}</button>` })}
      <main class="content area-list" style="--c:${a.color}">
        ${tasks.length ? tasks.map(t => taskRow(t)).join('') : `<div class="empty area-empty">${roomSvg(a.art || a.type, 'empty-art')}<p>Noch keine Aufgaben in „${esc(a.name)}“.</p>
          <button class="btn orange big" data-go="/area/${a.id}/catalog">📋 Aus dem Aufgaben-Katalog wählen</button>
          <button class="btn light big" data-go="/area/${a.id}/new-task">✏️ Eigene Aufgabe erstellen</button></div>`}
        <div class="spacer"></div>
      </main>
      <footer class="area-foot" style="--c:${a.color}">
        <button class="icon-btn" data-top aria-label="Nach oben">${icons.up}</button>
        <span>${done} <i class="ok">${icons.done}</i></span>
        <span>${due} ${splatSvg(0, 'foot-splat')}</span>
        <button class="sort-btn" data-sort>${s.sortArea === 'name' ? 'A–Z' : 'Fällig'}</button>
      </footer>`,
    bind(root) {
      bindCommon(root);
      bindRows(root);
      mascot.roomJoke(a);
      root.querySelector('[data-top]').onclick = () => root.querySelector('.content').scrollTo({ top: 0, behavior: 'smooth' });
      root.querySelector('[data-sort]').onclick = () => store.setSettings({ sortArea: s.sortArea === 'name' ? 'due' : 'name' });
    },
  };
}

// ---------------- today / todo ----------------
export function todoView(filter = 'all') {
  const s = store.settings();
  const meId = L.me()?.id;
  let tasks = store.all('tasks').filter(t => !t.anytime);
  if (filter === 'mine' && meId) tasks = tasks.filter(t => !L.responsible(t) || L.responsible(t) === meId);
  const due = L.sortTasks(tasks.filter(t => L.isDue(t)));
  const soon = L.sortTasks(tasks.filter(t => L.activeAt(t) && !L.isDue(t) && L.daysUntilDue(t) <= 3));
  const doneToday = store.all('completions').filter(c => c.at >= L.startOfDay(Date.now())).sort((a, b) => b.at - a.at);
  const showFilter = s.multiPerson && s.responsibility && meId;
  return {
    html: `${appbar('Heute', { backTo: '/' })}
      <main class="content list-page">
        ${showFilter ? `<div class="seg"><button class="${filter === 'all' ? 'on' : ''}" data-go="/todo">Alle</button><button class="${filter === 'mine' ? 'on' : ''}" data-go="/todo/mine">Meine</button></div>` : ''}
        <h2 class="sec">Fällig (${due.length})</h2>
        <div class="card-list">${due.length ? due.map(t => taskRow(t, { showArea: true, quick: true })).join('') : `<div class="empty-ok">${monsterSvg('sad', 'mini-mon', { tickle: true })}<p>Alles erledigt! ${MONSTER_NAME} ist beleidigt.</p></div>`}</div>
        ${soon.length ? `<h2 class="sec">Bald fällig</h2><div class="card-list">${soon.map(t => taskRow(t, { showArea: true, quick: true })).join('')}</div>` : ''}
        ${doneToday.length ? `<h2 class="sec">Heute erledigt (${doneToday.length})</h2><div class="card-list done-list">${doneToday.map(c => `<div class="task-row slim"><span class="done-ic">${icons.done}</span><div class="task-main"><div class="task-name">${esc(c.taskName)}</div></div>${c.personId ? personChip(c.personId, true) : ''}<b class="pts">+${c.points}</b></div>`).join('')}</div>` : ''}
      </main>`,
    bind(root) { bindCommon(root); bindRows(root); },
  };
}

// ---------------- all tasks list ----------------
let listQuery = '';
export function listView() {
  const q = listQuery.toLowerCase();
  const tasks = L.sortTasks(store.all('tasks').filter(t => !q || t.name.toLowerCase().includes(q) || (store.get('areas', t.areaId)?.name || '').toLowerCase().includes(q)));
  return {
    html: `${appbar('Alle Aufgaben', { backTo: '/', actions: `<button class="icon-btn" data-go="/manager" aria-label="Aufgaben-Manager">${icons.edit}</button>` })}
      <main class="content list-page">
        <input class="search" type="search" placeholder="Suchen…" value="${esc(listQuery)}" data-search>
        <div class="card-list" data-results>${tasks.map(t => taskRow(t, { showArea: true })).join('') || '<p class="empty">Keine Aufgaben.</p>'}</div>
      </main>`,
    bind(root) {
      bindCommon(root); bindRows(root);
      const inp = root.querySelector('[data-search]');
      inp.oninput = () => {
        listQuery = inp.value;
        const q2 = listQuery.toLowerCase();
        const res = L.sortTasks(store.all('tasks').filter(t => !q2 || t.name.toLowerCase().includes(q2) || (store.get('areas', t.areaId)?.name || '').toLowerCase().includes(q2)));
        const box = root.querySelector('[data-results]');
        box.innerHTML = res.map(t => taskRow(t, { showArea: true })).join('') || '<p class="empty">Keine Treffer.</p>';
        bindRows(box);
      };
    },
  };
}
