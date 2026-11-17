import * as store from './store.js';
import * as L from './logic.js';
import { roomSvg, ROOM_TYPES, AREA_COLORS } from './art.js';
import { TEMPLATES, guessEmoji } from './templates.js';
import { esc, icons, sheet, toast, confirmSheet } from './ui.js';
import { go, back } from './router.js';
import { appbar, bindCommon } from './views-main.js';
import * as mascot from './mascot.js';

const ALL_TYPES = [...ROOM_TYPES.innen, ...ROOM_TYPES.aussen];
const typeName = t => (ALL_TYPES.find(x => x[0] === t) || [, 'Bereich'])[1];

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
    picked: null,
  };
  const tplNames = () => (TEMPLATES[st.type] || []).map(t => t[0]);

  function preview() {
    return `<div class="area-preview" style="--c:${st.color}">
      <div class="ap-top"><label><small>Name des Bereichs</small><input data-name value="${esc(st.name)}" maxlength="30"></label>
        <label class="ap-color"><small>Farbe</small><button data-color style="background:${st.color}" aria-label="Farbe wählen"></button></label></div>
      ${roomSvg(st.type, 'ap-art')}
    </div>`;
  }
  function wheel() {
    return `<div class="tabs"><button class="${st.tab === 'innen' ? 'on' : ''}" data-tab="innen">Innenräume</button><button class="${st.tab === 'aussen' ? 'on' : ''}" data-tab="aussen">Außenbereich</button></div>
      <div class="wheel">${ROOM_TYPES[st.tab].map(([k, n]) => `<button class="${k === st.type ? 'on' : ''}" data-type="${k}">${esc(n)}</button>`).join('')}</div>`;
  }
  function suggestions() {
    if (existing) return '';
    const names = tplNames();
    if (!st.picked) st.picked = new Set(names);
    return `<div class="suggest"><h2 class="sec">Vorgeschlagene Aufgaben (${st.picked.size}/${names.length})</h2>
      <div class="chips wrap">${names.map(n => `<button class="chip ${st.picked.has(n) ? 'on' : ''}" data-tpl="${esc(n)}">${esc(n)}</button>`).join('')}</div></div>`;
  }
  function body() {
    return `<div class="area-edit-card">${preview()}
        <div class="btn-row"><button class="btn grey" data-cancel>Abbrechen</button><button class="btn orange" data-save>${existing ? 'Speichern' : 'Erstellen'}</button></div>
        ${existing ? '<button class="btn link red" data-del>Bereich löschen</button>' : ''}
      </div>
      <div class="wheel-box">${wheel()}</div>
      ${suggestions()}`;
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
        box.querySelectorAll('[data-tab]').forEach(b => (b.onclick = () => { st.tab = b.dataset.tab; redraw(); }));
        box.querySelectorAll('[data-type]').forEach(b => (b.onclick = () => {
          st.type = b.dataset.type;
          if (!st.nameTouched || ALL_TYPES.some(x => x[1] === st.name)) { st.name = typeName(st.type); st.nameTouched = false; }
          st.picked = null;
          redraw();
          box.querySelector('.wheel .on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
        }));
        box.querySelectorAll('[data-tpl]').forEach(b => (b.onclick = () => {
          const n = b.dataset.tpl;
          st.picked.has(n) ? st.picked.delete(n) : st.picked.add(n);
          redraw();
        }));
        box.querySelector('[data-cancel]').onclick = () => back('/');
        box.querySelector('[data-save]').onclick = () => {
          const name = st.name.trim() || typeName(st.type);
          if (existing) {
            store.put('areas', { id: existing.id, name, type: st.type, color: st.color });
            toast('Gespeichert');
            go('/area/' + existing.id, { replace: true });
          } else {
            const area = L.createArea({ name, type: st.type, color: st.color, withTasks: false });
            L.addTemplateTasks(area, (TEMPLATES[st.type] || []).filter(t => st.picked.has(t[0])));
            go('/area/' + area.id, { replace: true });
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
  let cond = existing ? Math.min(2, Math.max(0, L.progress(existing))) : 0;

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
      ${t.anytime ? '' : `<h2 class="sec">Aktueller Zustand</h2>
      <div class="form-card"><input type="range" min="0" max="2" step="0.05" value="${cond}" data-cond class="cond-range">
        <div class="row-between small muted"><span>✨ Sauber</span><span>⏰ Fällig</span><span>🤢 Schmutzig</span></div></div>`}
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
        box.querySelectorAll('[data-step]').forEach(b => (b.onclick = () => { t.freqN = Math.min(99, Math.max(1, t.freqN + Number(b.dataset.step))); redraw(); }));
        box.querySelectorAll('[data-unit]').forEach(b => (b.onclick = () => { t.freqUnit = b.dataset.unit; redraw(); }));
        box.querySelectorAll('[data-effort]').forEach(b => (b.onclick = () => { t.effort = Number(b.dataset.effort); redraw(); }));
        const cr = box.querySelector('[data-cond]');
        if (cr) cr.oninput = () => { cond = Number(cr.value); };
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
          const iv = L.intervalDays(t);
          if (!t.anytime) t.lastDone = L.now() - cond * iv * L.DAY;
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
        store.put('tasks', { id: t.id, freqN: Math.max(1, Math.min(99, t.freqN + Number(b.dataset.d))) });
      }));
      root.querySelectorAll('[data-u]').forEach(b => (b.onclick = () => {
        const t = store.get('tasks', b.dataset.u);
        const i = unitOrder.indexOf(t.freqUnit) + Number(b.dataset.d);
        if (i >= 0 && i < 3) store.put('tasks', { id: t.id, freqUnit: unitOrder[i] });
      }));
      root.querySelectorAll('[data-edit]').forEach(b => (b.onclick = () => go('/task/' + b.dataset.edit)));
    },
  };
}
