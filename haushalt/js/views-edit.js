import * as store from './store.js';
import * as L from './logic.js';
import { roomSvg, ROOM_TYPES, AREA_COLORS, CUSTOM_TYPES, ART_CHOICES } from './art.js';
import { TEMPLATES, guessEmoji } from './templates.js';
import { esc, icons, sheet, toast, confirmSheet } from './ui.js';
import { go, back } from './router.js';
import { appbar, bindCommon } from './views-main.js';
import * as mascot from './mascot.js';
import { conditionPicker, bindConditionPickers } from './condition.js';

const ALL_TYPES = [...ROOM_TYPES.innen, ...ROOM_TYPES.aussen];
const typeName = t => CUSTOM_TYPES.includes(t) ? '' : (ALL_TYPES.find(x => x[0] === t) || [, 'Bereich'])[1];

// ---------------- new / edit area ----------------
export function areaEditView(id) {
  const existing = id ? store.get('areas', id) : null;
  const usedColors = store.all('areas').map(a => a.color);
  const st = {
    name: existing?.name || 'Küche',
    type: existing?.type || 'kueche',
    color: existing?.color || AREA_COLORS.find(c => !usedColors.includes(c)) || AREA_COLORS[0],
    tab: ROOM_TYPES.aussen.some(x => x[0] === existing?.type) ? 'aussen' : 'innen',
    nameTouched: !!existing,
    art: existing?.art || null,
  };
  const tplNames = () => (TEMPLATES[st.type] || []).map(t => t[0]);

  function preview() {
    return `<div class="area-preview" style="--c:${st.color}">
      <div class="ap-top"><label><small>Name des Bereichs</small><input data-name value="${esc(st.name)}" maxlength="30" placeholder="${CUSTOM_TYPES.includes(st.type) ? (st.type === 'eigen_aussen' ? 'z. B. Gartenhaus' : 'z. B. Hobbyraum') : 'Name'}"></label>
        <label class="ap-color"><small>Farbe</small><button data-color style="background:${st.color}" aria-label="Farbe wählen"></button></label></div>
      <button class="ap-artbtn" data-art aria-label="Bild ändern">${roomSvg(st.art || st.type, 'ap-art')}<span>🖼️ Bild ändern</span></button>
    </div>`;
  }
  function wheel() {
    return `<div class="tabs"><button class="${st.tab === 'innen' ? 'on' : ''}" data-tab="innen">Innenräume</button><button class="${st.tab === 'aussen' ? 'on' : ''}" data-tab="aussen">Außenbereich</button></div>
      <div class="wheel">${ROOM_TYPES[st.tab].map(([k, n]) => `<button class="${k === st.type ? 'on' : ''}" data-type="${k}">${esc(n)}</button>`).join('')}</div>`;
  }
  function body() {
    return `<div class="area-edit-card">${preview()}
        <div class="btn-row"><button class="btn grey" data-cancel>Abbrechen</button><button class="btn orange" data-save>${existing ? 'Speichern' : 'Erstellen'}</button></div>
        ${existing ? '<button class="btn link red" data-del>Bereich löschen</button>' : ''}
      </div>
      <div class="wheel-box">${wheel()}</div>
      ${existing ? '' : '<p class="group-foot">Nach dem Erstellen wählt ihr Aufgaben aus dem Katalog oder legt eigene an.</p>'}`;
  }

  return {
    static: true,
    html: `${appbar(existing ? 'Bereich bearbeiten' : 'Neuer Bereich', { backTo: '/' })}<main class="content area-edit" data-body>${body()}</main>`,
    bind(root) {
      bindCommon(root);
      const box = root.querySelector('[data-body]');
      const rebind = () => {
        const inp = box.querySelector('[data-name]');
        inp.oninput = () => { st.name = inp.value; st.nameTouched = true; };
        box.querySelector('[data-color]').onclick = () => sheet(`<h3>Farbe</h3><div class="swatches">${AREA_COLORS.map(c => `<button style="background:${c}" data-c="${c}" class="${c === st.color ? 'on' : ''}"></button>`).join('')}</div>`,
          (el, close) => el.querySelectorAll('[data-c]').forEach(b => (b.onclick = () => { st.color = b.dataset.c; close(); redraw(); })));
        box.querySelector('[data-art]').onclick = () => sheet(`<h3>Bild wählen</h3><div class="art-grid">${ART_CHOICES.map(([k, n]) => `<button class="art-opt ${(st.art || st.type) === k ? 'on' : ''}" data-a="${k}" style="--c:${st.color}">${roomSvg(k, 'art-thumb')}<small>${esc(n)}</small></button>`).join('')}</div>`,
          (el, close) => el.querySelectorAll('[data-a]').forEach(b => (b.onclick = () => { st.art = b.dataset.a === st.type ? null : b.dataset.a; close(); redraw(); })));
        box.querySelectorAll('[data-tab]').forEach(b => (b.onclick = () => { st.tab = b.dataset.tab; redraw(); }));
        box.querySelectorAll('[data-type]').forEach(b => (b.onclick = () => {
          st.type = b.dataset.type;
          if (!st.nameTouched || ALL_TYPES.some(x => x[1] === st.name)) { st.name = typeName(st.type); st.nameTouched = false; }
          st.art = null;
          if (CUSTOM_TYPES.includes(st.type)) setTimeout(() => box.querySelector('[data-name]')?.focus(), 50);
          redraw();
          box.querySelector('.wheel .on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
        }));
        box.querySelector('[data-cancel]').onclick = () => back('/');
        box.querySelector('[data-save]').onclick = () => {
          const name = st.name.trim() || typeName(st.type);
          if (!name) { toast('Bitte gib dem Raum einen Namen'); box.querySelector('[data-name]').focus(); return; }
          if (existing) {
            store.put('areas', { id: existing.id, name, type: st.type, color: st.color, art: st.art });
            toast('Gespeichert');
            go('/area/' + existing.id, { replace: true });
          } else {
            const area = L.createArea({ name, type: st.type, color: st.color, art: st.art });
            go('/area/' + area.id + '/catalog', { replace: true });
            mascot.react('areaCreated', { delay: 400 });
          }
        };
        const del = box.querySelector('[data-del]');
        if (del) del.onclick = async () => {
          if (!(await confirmSheet('Bereich löschen?', `„${existing.name}“ und alle Aufgaben darin werden gelöscht.`, 'Löschen', { danger: true }))) return;
          L.tasksOfArea(existing.id).forEach(t => store.remove('tasks', t.id));
          store.remove('areas', existing.id);
          go('/', { replace: true });
        };
      };
      const redraw = () => {
        const sc = box.querySelector('.wheel')?.scrollTop;
        box.innerHTML = body(); rebind();
        if (sc) box.querySelector('.wheel').scrollTop = sc;
      };
      rebind();
    },
  };
}

// ---------------- new / edit task ----------------
const EMOJI_CHOICES = ['🧸', '🛏️', '🧺', '🧽', '🪶', '🌀', '🪴', '🗑️', '🍽️', '🍴', '👟', '🧦', '👕', '📚', '✏️', '🪟', '🧹', '🚗', '🐶', '🐱', '⭐', '🧩', '🎒', '🫧'];

export function taskEditView(id, areaId) {
  const existing = id ? store.get('tasks', id) : null;
  const area = store.get('areas', existing?.areaId || areaId);
  const s = store.settings();
  const t = existing ? JSON.parse(JSON.stringify(existing)) : {
    areaId: area?.id, name: '', anytime: false, freqN: 1, freqUnit: 'w', effort: 1, assignees: [], notes: '',
    kid: { enabled: false, emoji: '⭐', steps: [] },
  };
  t.kid = t.kid || { enabled: false, emoji: guessEmoji(t.name), steps: [] };
  t.assignees = t.assignees || [];
  let cond = existing ? L.currentConditionKey(existing) : null;
  let condChanged = false;

  const existingNames = new Set(L.tasksOfArea(area?.id).map(x => x.name));
  const sugg = existing ? [] : (TEMPLATES[area?.type] || []).filter(x => !existingNames.has(x[0]));

  function body() {
    const ps = L.persons();
    return `
      ${sugg.length ? `<div class="suggest"><h2 class="sec">Vorschläge</h2><div class="chips wrap">${sugg.map((x, i) => `<button class="chip" data-sugg="${i}">+ ${esc(x[0])}</button>`).join('')}</div></div>` : ''}
      <div class="form-card">
        <label class="field"><small>Aufgabe</small><input data-f="name" value="${esc(t.name)}" placeholder="z. B. Fenster putzen" maxlength="60"></label>
        <label class="field"><small>Bereich</small><select data-f="areaId">${store.all('areas').sort((a, b) => (a.order || 0) - (b.order || 0)).map(a => `<option value="${a.id}" ${a.id === t.areaId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
      </div>
      <h2 class="sec">Frequenz</h2>
      <div class="form-card">
        <div class="row-between"><span>Aufgabe für jederzeit</span><label class="switch"><input type="checkbox" data-f="anytime" ${t.anytime ? 'checked' : ''}><span></span></label></div>
        ${t.anytime ? '<p class="muted small">Jederzeit-Aufgaben haben keinen Rhythmus. Ihr zählt einfach, wie oft sie erledigt wurden (z. B. Geschirr spülen).</p>' : `
        <div class="freq">
          <span>Alle</span>
          <div class="stepper"><button data-step="-1">−</button><b>${t.freqN}</b><button data-step="1">+</button></div>
          <div class="seg small">${['d', 'w', 'm'].map(u => `<button class="${t.freqUnit === u ? 'on' : ''}" data-unit="${u}">${L.UNIT_LABEL[u][t.freqN === 1 ? 0 : 1]}</button>`).join('')}</div>
        </div>`}
      </div>
      <h2 class="sec">Aufwand</h2>
      <div class="seg">${[1, 2, 3].map(e => `<button class="${t.effort === e ? 'on' : ''}" data-effort="${e}">${L.EFFORT_LABEL[e]} · ${e} Pkt.</button>`).join('')}</div>
      ${t.anytime ? '' : `<h2 class="sec" data-cond-sec>Wie sieht es gerade aus?</h2>
      <div class="form-card cond-card ${!cond ? 'need' : ''}">${conditionPicker(t, cond, 'task')}
        <p class="muted small">Daraus und aus der Frequenz ergibt sich, ob die Aufgabe heute fällig ist, noch Zeit hat oder überfällig ist.</p></div>`}
      ${s.multiPerson && s.responsibility && ps.length ? `<h2 class="sec">Zuständig ${s.rotation ? '(Rotation: der Erste ist dran)' : ''}</h2>
        <div class="chips wrap">${ps.map(p => {
          const idx = t.assignees.indexOf(p.id);
          return `<button class="pchip sel ${idx > -1 ? 'on' : ''}" data-assign="${p.id}" style="--pc:${L.personColor(p)}">${idx > -1 && s.rotation ? `<b class="ord">${idx + 1}</b>` : ''}${esc(p.emoji || '🙂')} ${esc(p.name)}</button>`;
        }).join('')}</div>` : ''}
      <h2 class="sec">Notiz</h2>
      <div class="form-card"><textarea data-f="notes" rows="2" placeholder="z. B. Spezialreiniger unter der Spüle">${esc(t.notes || '')}</textarea></div>

      <h2 class="sec">👧 Für Kinder</h2>
      <div class="form-card kid-card">
        <div class="row-between"><span>Kinder können mitmachen</span><label class="switch"><input type="checkbox" data-kid="enabled" ${t.kid.enabled ? 'checked' : ''}><span></span></label></div>
        ${t.kid.enabled ? `
          <p class="muted small">Im Kindermodus wird die Aufgabe mit großem Bild und einzelnen Schritten angezeigt – und auf Wunsch vorgelesen.</p>
          <div class="emoji-pick"><span class="big-emoji">${esc(t.kid.emoji)}</span><div class="chips wrap">${EMOJI_CHOICES.map(e => `<button class="emo ${e === t.kid.emoji ? 'on' : ''}" data-emo="${e}">${e}</button>`).join('')}</div></div>
          <h4>Schritte</h4>
          <div class="steps-edit">${t.kid.steps.map((st, i) => `<div class="step-edit"><input class="se-emo" data-se="${i}" data-k="e" value="${esc(st.e)}" maxlength="4"><input data-se="${i}" data-k="text" value="${esc(st.text)}" placeholder="Was ist zu tun?"><button class="icon-btn" data-sdel="${i}" aria-label="Schritt löschen">${icons.trash}</button></div>`).join('')}</div>
          <button class="btn light" data-sadd>+ Schritt hinzufügen</button>` : ''}
      </div>
      <div class="btn-row sticky-actions"><button class="btn grey" data-cancel>Abbrechen</button><button class="btn orange" data-save>Speichern</button></div>
      ${existing ? '<button class="btn link red" data-del>Aufgabe löschen</button>' : ''}
      <div class="spacer"></div>`;
  }

  return {
    static: true,
    html: `${appbar(existing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe', { backTo: area ? '/area/' + area.id : '/', color: area?.color })}<main class="content task-edit" data-body>${body()}</main>`,
    bind(root) {
      bindCommon(root);
      const box = root.querySelector('[data-body]');
      const redraw = () => { const y = root.querySelector('.content').scrollTop; box.innerHTML = body(); rebind(); root.querySelector('.content').scrollTop = y; };
      const rebind = () => {
        box.querySelectorAll('[data-f]').forEach(el => {
          const f = el.dataset.f;
          el.oninput = el.onchange = () => {
            if (el.type === 'checkbox') { t[f] = el.checked; redraw(); return; }
            t[f] = el.value;
            if (f === 'name' && t.kid && !t.kid.enabled) t.kid.emoji = guessEmoji(t.name);
          };
        });
        box.querySelectorAll('[data-step]').forEach(b => (b.onclick = () => { t.freqN = Math.min(99, Math.max(1, t.freqN + Number(b.dataset.step))); t.customFreq = true; redraw(); }));
        box.querySelectorAll('[data-unit]').forEach(b => (b.onclick = () => { t.freqUnit = b.dataset.unit; t.customFreq = true; redraw(); }));
        box.querySelectorAll('[data-effort]').forEach(b => (b.onclick = () => { t.effort = Number(b.dataset.effort); redraw(); }));
        bindConditionPickers(box, (_, key) => { cond = key; condChanged = true; redraw(); });
        box.querySelectorAll('[data-assign]').forEach(b => (b.onclick = () => {
          const pid = b.dataset.assign, i = t.assignees.indexOf(pid);
          i > -1 ? t.assignees.splice(i, 1) : t.assignees.push(pid);
          redraw();
        }));
        box.querySelectorAll('[data-sugg]').forEach(b => (b.onclick = () => {
          const tpl = sugg[Number(b.dataset.sugg)];
          Object.assign(t, L.templateToTask(t.areaId, tpl));
          t.kid = t.kid || { enabled: false, emoji: guessEmoji(t.name), steps: [] };
          t.assignees = [];
          redraw();
        }));
        const kidEn = box.querySelector('[data-kid=enabled]');
        kidEn.onchange = () => { t.kid.enabled = kidEn.checked; if (t.kid.enabled && !t.kid.emoji) t.kid.emoji = guessEmoji(t.name); redraw(); };
        box.querySelectorAll('[data-emo]').forEach(b => (b.onclick = () => { t.kid.emoji = b.dataset.emo; redraw(); }));
        box.querySelectorAll('[data-se]').forEach(inp => (inp.oninput = () => { t.kid.steps[Number(inp.dataset.se)][inp.dataset.k] = inp.value; }));
        box.querySelectorAll('[data-sdel]').forEach(b => (b.onclick = () => { t.kid.steps.splice(Number(b.dataset.sdel), 1); redraw(); }));
        const sadd = box.querySelector('[data-sadd]');
        if (sadd) sadd.onclick = () => { t.kid.steps.push({ e: '⭐', text: '' }); redraw(); box.querySelector('.step-edit:last-child input:nth-child(2)')?.focus(); };
        box.querySelector('[data-cancel]').onclick = () => back(area ? '/area/' + area.id : '/');
        box.querySelector('[data-save]').onclick = () => {
          t.name = (t.name || '').trim();
          if (!t.name) { toast('Bitte einen Namen eingeben'); return; }
          t.kid.steps = t.kid.steps.filter(x => x.text.trim());
          if (!t.anytime && !cond) {
            toast('Bitte wähle, wie es gerade aussieht');
            box.querySelector('[data-cond-sec]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
          if (!t.anytime && (condChanged || !existing || !t.lastDone)) t.lastDone = L.lastDoneFor(t, cond);
          if (existing && (condChanged || existing.freqN !== t.freqN || existing.freqUnit !== t.freqUnit || existing.anytime !== t.anytime)) t.mSince = Date.now();
          const rec = store.put('tasks', t);
          toast(existing ? 'Gespeichert' : 'Aufgabe hinzugefügt');
          if (!existing) mascot.react('taskCreated', { delay: 400 });
          go('/area/' + rec.areaId, { replace: true });
        };
        const del = box.querySelector('[data-del]');
        if (del) del.onclick = async () => {
          if (!(await confirmSheet('Aufgabe löschen?', `„${existing.name}“ wird gelöscht.`, 'Löschen', { danger: true }))) return;
          store.remove('tasks', existing.id);
          go('/area/' + existing.areaId, { replace: true });
          mascot.react('taskDeleted', { delay: 400 });
        };
      };
      rebind();
    },
  };
}

// ---------------- task manager (bulk frequency editing) ----------------
let managerSort = 'freq';
export function managerView() {
  const areas = store.all('areas').sort((a, b) => (a.order || 0) - (b.order || 0));
  const unitOrder = ['d', 'w', 'm'];
  const sorts = { freq: 'Frequenz', name: 'Name', due: 'Fälligkeit' };
  const html = areas.map(a => {
    const tasks = L.sortTasks(L.tasksOfArea(a.id), managerSort);
    if (!tasks.length) return '';
    return `<h2 class="sec mgr-area" style="color:${a.color}">${esc(a.name)}</h2>
      <div class="mgr-card">${tasks.map(t => `<div class="mgr-row">
        <button class="mgr-name" data-edit="${t.id}">${esc(t.name)}</button>
        <div class="mgr-ctrl">${t.anytime ? '<span class="mgr-any">Aufgabe für jederzeit</span>' : `
          <div class="mgr-col"><b>${t.freqN}</b><div><button data-n="${t.id}" data-d="-1" ${t.freqN <= 1 ? 'disabled' : ''}>−</button><button data-n="${t.id}" data-d="1">+</button></div></div>
          <div class="mgr-col"><b>${L.UNIT_LABEL[t.freqUnit][t.freqN === 1 ? 0 : 1]}</b><div><button data-u="${t.id}" data-d="-1" ${t.freqUnit === 'd' ? 'disabled' : ''}>−</button><button data-u="${t.id}" data-d="1" ${t.freqUnit === 'm' ? 'disabled' : ''}>+</button></div></div>`}
        </div></div>`).join('')}</div>`;
  }).join('');
  return {
    html: `${appbar('Aufgaben-Manager', { backTo: '/settings' })}
      <main class="content manager">
        <div class="mgr-top"><select data-sort class="pill-select">${Object.entries(sorts).map(([k, v]) => `<option value="${k}" ${k === managerSort ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        ${html || '<p class="empty">Noch keine Aufgaben.</p>'}
        <div class="spacer"></div>
      </main>`,
    bind(root) {
      bindCommon(root);
      root.querySelector('[data-sort]').onchange = e => { managerSort = e.target.value; window.dispatchEvent(new Event('bb:render')); };
      root.querySelectorAll('[data-n]').forEach(b => (b.onclick = () => {
        const t = store.get('tasks', b.dataset.n);
        store.put('tasks', { id: t.id, freqN: Math.max(1, Math.min(99, t.freqN + Number(b.dataset.d))), customFreq: true, mSince: Date.now() });
      }));
      root.querySelectorAll('[data-u]').forEach(b => (b.onclick = () => {
        const t = store.get('tasks', b.dataset.u);
        const i = unitOrder.indexOf(t.freqUnit) + Number(b.dataset.d);
        if (i >= 0 && i < 3) store.put('tasks', { id: t.id, freqUnit: unitOrder[i], customFreq: true, mSince: Date.now() });
      }));
      root.querySelectorAll('[data-edit]').forEach(b => (b.onclick = () => go('/task/' + b.dataset.edit)));
    },
  };
}

// ---------------- task catalogue per area ----------------
const catState = {}; // areaId -> { tab, sel: Map(name -> {freqN, freqUnit}) }
export function catalogView(areaId) {
  const area = store.get('areas', areaId);
  if (!area) return { html: appbar('Katalog', { backTo: '/' }) + '<main class="content"><p class="empty">Bereich nicht gefunden.</p></main>', bind: bindCommon };
  const st = catState[areaId] || (catState[areaId] = { tab: (TEMPLATES[area.type] || []).length ? 'fit' : 'more', sel: new Map() });
  const level = L.intensity();
  const have = new Set(L.tasksOfArea(areaId).map(t => t.name.toLowerCase()));
  const own = TEMPLATES[area.type] || [];
  const ownNames = new Set(own.map(t => t[0]));
  // "Weitere": every other catalogue task once, grouped by room type
  const otherGroups = ALL_TYPES.filter(([k]) => k !== area.type).map(([k, n]) => [n, (TEMPLATES[k] || []).filter(t => !ownNames.has(t[0]))]);
  const seen = new Set();
  otherGroups.forEach(g => { g[1] = g[1].filter(t => (seen.has(t[0]) ? false : (seen.add(t[0]), true))); });
  const findTpl = name => own.find(t => t[0] === name) || otherGroups.flatMap(g => g[1]).find(t => t[0] === name);

  const item = tpl => {
    const [name] = tpl;
    const exists = have.has(name.toLowerCase());
    const on = st.sel.has(name);
    const base = L.tplDays(tpl);
    const f = on ? st.sel.get(name) : (base ? L.scaledFreq(base, level) : null);
    const kid = tpl[4];
    const freq = !base ? '<span class="cat-any">Jederzeit</span>'
      : `<div class="cat-freq ${on ? '' : 'dim'}">
          <button data-n="${esc(name)}" data-d="-1" ${!on || f.freqN <= 1 ? 'disabled' : ''}>−</button><b>${f.freqN}</b><button data-n="${esc(name)}" data-d="1" ${!on ? 'disabled' : ''}>+</button>
          <button class="unit" data-u="${esc(name)}" ${!on ? 'disabled' : ''}>${L.UNIT_LABEL[f.freqUnit][f.freqN === 1 ? 0 : 1]}</button></div>`;
    return `<div class="cat-row ${on ? 'on' : ''} ${exists ? 'have' : ''}">
      <button class="cat-check" data-pick="${esc(name)}" ${exists ? 'disabled' : ''} aria-label="${esc(name)} auswählen">${exists ? '✓' : on ? '✓' : ''}</button>
      <div class="cat-main" data-pick="${esc(name)}"><span class="cat-name">${esc(name)}</span>
        <small>${exists ? 'Schon vorhanden' : `${L.EFFORT_LABEL[tpl[3]]}${kid ? ` · ${kid === true ? '👧 Kinder' : esc(kid.e) + ' Kinder'}` : ''}`}</small></div>
      ${exists ? '' : freq}
    </div>`;
  };
  const selectable = st.tab === 'fit' ? own : otherGroups.flatMap(g => g[1]);
  const count = st.sel.size;
  if (st.step === 'cond' && count) return conditionStep(area, st, findTpl, level);
  st.step = 'pick';
  return {
    html: `${appbar(area.name, { backTo: '/area/' + areaId, color: area.color })}
      <main class="content catalog" style="--c:${area.color}">
        <div class="cat-head"><div><b>Aufgaben-Katalog</b><small>Frequenzen für <a href="#/settings/intensity">„${esc(L.INTENSITY[level].label)}“</a> – antippen zum Auswählen, dann mit − / + anpassen.</small></div></div>
        <button class="btn light own-btn" data-go="/area/${areaId}/new-task">✏️ Eigene Aufgabe erstellen</button>
        <div class="seg cat-tabs">${own.length ? `<button class="${st.tab === 'fit' ? 'on' : ''}" data-tab="fit">Passend (${own.length})</button>` : ''}<button class="${st.tab === 'more' ? 'on' : ''}" data-tab="more">${own.length ? 'Weitere Aufgaben' : 'Alle Aufgaben aus dem Katalog'}</button></div>
        <div class="row-between cat-tools"><button class="link-btn" data-all>Alle auswählen</button>${count ? '<button class="link-btn" data-none>Auswahl leeren</button>' : ''}</div>
        ${st.tab === 'fit'
          ? (own.length ? `<div class="cat-list">${own.map(item).join('')}</div>` : '<p class="empty">Für diesen Bereich gibt es keine Vorschläge. Schaut unter „Weitere Aufgaben“ oder legt eigene an.</p>')
          : otherGroups.filter(g => g[1].length).map(([n, list]) => `<h2 class="sec">${esc(n)}</h2><div class="cat-list">${list.map(item).join('')}</div>`).join('')}
        <div class="spacer"></div>
      </main>
      <footer class="cat-foot"><button class="btn orange big" data-next ${count ? '' : 'disabled'}>${count ? `Weiter: Zustand festlegen (${count})` : 'Aufgaben auswählen'}</button></footer>`,
    bind(root) {
      bindCommon(root);
      const rerender = () => window.dispatchEvent(new Event('bb:render'));
      root.querySelectorAll('[data-tab]').forEach(b => (b.onclick = () => { st.tab = b.dataset.tab; rerender(); root.querySelector('.content').scrollTop = 0; }));
      root.querySelectorAll('[data-pick]').forEach(b => (b.onclick = () => {
        const name = b.dataset.pick;
        if (have.has(name.toLowerCase())) return;
        if (st.sel.has(name)) st.sel.delete(name);
        else { const tpl = findTpl(name); const base = L.tplDays(tpl); st.sel.set(name, base ? L.scaledFreq(base, level) : null); }
        rerender();
      }));
      root.querySelectorAll('[data-n]').forEach(b => (b.onclick = () => {
        const f = st.sel.get(b.dataset.n); if (!f) return;
        f.freqN = Math.max(1, Math.min(99, f.freqN + Number(b.dataset.d))); rerender();
      }));
      root.querySelectorAll('[data-u]').forEach(b => (b.onclick = () => {
        const f = st.sel.get(b.dataset.u); if (!f) return;
        const order = ['d', 'w', 'm']; f.freqUnit = order[(order.indexOf(f.freqUnit) + 1) % 3]; rerender();
      }));
      root.querySelector('[data-all]').onclick = () => {
        selectable.forEach(tpl => { if (!have.has(tpl[0].toLowerCase()) && !st.sel.has(tpl[0])) { const base = L.tplDays(tpl); st.sel.set(tpl[0], base ? L.scaledFreq(base, level) : null); } });
        rerender();
      };
      const none = root.querySelector('[data-none]');
      if (none) none.onclick = () => { st.sel.clear(); rerender(); };
      root.querySelector('[data-next]').onclick = () => { st.step = 'cond'; rerender(); root.querySelector('.content').scrollTop = 0; };
    },
  };
}

// step 2: "Wie sieht es gerade aus?" for every selected task
function conditionStep(area, st, findTpl, level) {
  st.cond = st.cond || new Map();
  const items = [...st.sel.entries()].map(([name, f]) => {
    const tpl = findTpl(name);
    const t = { ...L.templateToTask(area.id, tpl, 0, level), ...(f || {}) };
    return { name, t };
  });
  const need = items.filter(x => !x.t.anytime);
  const missing = need.filter(x => !st.cond.get(x.name)).length;
  return {
    html: `${appbar(area.name, { backTo: '/area/' + area.id, color: area.color })}
      <main class="content catalog" style="--c:${area.color}">
        <div class="cat-head"><div><b>Wie sieht es gerade aus?</b><small>Gebt für jede Aufgabe den aktuellen Zustand an. Zusammen mit der Frequenz ergibt sich daraus, ob sie heute fällig ist, noch Zeit hat oder überfällig ist.</small></div></div>
        ${need.length > 1 ? `<div class="cond-all"><span>Für alle setzen:</span><div class="chips">${L.CONDITIONS.map(c => `<button class="chip" data-allc="${c.key}" title="${esc(c.label)}">${c.emoji} ${esc(c.label)}</button>`).join('')}</div></div>` : ''}
        <div class="cond-list">${items.map(({ name, t }) => `<div class="cond-item ${t.anytime || st.cond.get(name) ? '' : 'need'}">
            <div class="ci-head"><b>${esc(name)}</b><small>${esc(L.freqText(t))}</small></div>
            ${conditionPicker(t, st.cond.get(name), name)}
          </div>`).join('')}</div>
        <button class="btn link" data-backpick>← Auswahl ändern</button>
        <div class="spacer"></div>
      </main>
      <footer class="cat-foot"><button class="btn orange big" data-add ${missing ? 'disabled' : ''}>${missing ? `Noch ${missing} ${missing > 1 ? 'Zustände' : 'Zustand'} wählen` : `${items.length} Aufgabe${items.length > 1 ? 'n' : ''} hinzufügen`}</button></footer>`,
    bind(root) {
      bindCommon(root);
      const rerender = () => window.dispatchEvent(new Event('bb:render'));
      bindConditionPickers(root, (name, key) => { st.cond.set(name, key); rerender(); });
      root.querySelectorAll('[data-allc]').forEach(b => (b.onclick = () => { need.forEach(x => st.cond.set(x.name, b.dataset.allc)); rerender(); }));
      root.querySelector('[data-backpick]').onclick = () => { st.step = 'pick'; rerender(); };
      root.querySelector('[data-add]').onclick = () => {
        const list = items.map(x => findTpl(x.name)).filter(Boolean);
        const overrides = {}; st.sel.forEach((f, n) => { if (f) overrides[n] = f; });
        const conds = Object.fromEntries(st.cond);
        const n = L.addTemplateTasks(area, list, overrides, conds);
        delete catState[area.id];
        toast(`${n} Aufgabe${n > 1 ? 'n' : ''} hinzugefügt`);
        go('/area/' + area.id, { replace: true });
        if (n >= 3) mascot.react('catalogAdd', { delay: 500 });
      };
    },
  };
}
