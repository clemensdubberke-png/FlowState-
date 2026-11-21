import * as store from './store.js';
import * as L from './logic.js';
import * as sync from './sync.js';
import { monsterSvg, MONSTER_NAME } from './art.js';
import { esc, icons, sheet, toast, confirmSheet, infoSheet, toggle, native } from './ui.js';
import { go } from './router.js';
import * as mascot from './mascot.js';
import * as voice from './voice.js';
import { appbar, bindCommon } from './views-main.js';

const INFO = {
  multi: 'Wenn euer Haushalt aus mehreren Mitgliedern besteht, haltet ihr mit „Personen“ fest, wer welche Aufgabe erledigt hat. Beim Abhaken wählt ihr die Person aus.',
  fair: 'FairShare zeigt, wie die Hausarbeit verteilt ist. Ihr legt fest, welchen Anteil jede Person übernehmen soll (z. B. 50 / 50 oder 60 / 40). Beim Abhaken schlägt die App automatisch die Person vor, die am weitesten unter ihrem Anteil liegt.',
  resp: 'Mit „Zuständigkeit“ teilt ihr Personen fest für bestimmte Aufgaben ein. Wer zuständig ist, steht direkt an der Aufgabe und in der Heute-Liste unter „Meine“.',
  rot: 'Rotation: Sind mehrere Personen für eine Aufgabe zuständig, wechselt die Zuständigkeit nach jedem Erledigen automatisch zur nächsten Person.',
  race: `Jeden Monat tretet ihr gegen ${MONSTER_NAME} an. Ihr sammelt Punkte, indem ihr Aufgaben erledigt (Leicht 1 · Mittel 2 · Schwer 3). ${MONSTER_NAME} bewegt sich langsam, aber stetig – und bekommt dieselben Punkte für jede Aufgabe, die überfällig liegen bleibt. Wer am Monatsende vorne liegt, gewinnt; bei gleichem Stand ist es unentschieden.`,
  comments: `${MONSTER_NAME} kommentiert euren Fortschritt mit frechen Sprüchen.`,
  vacation: 'Im Urlaubsmodus wird nichts schmutziger: Alle Zustände werden eingefroren. Beim Beenden werden alle Aufgaben um die Urlaubsdauer verschoben.',
  kids: 'Der Kindermodus zeigt Kindern ihre Aufgaben mit großen Bildern, einzelnen Schritten zum Abhaken und Vorlesefunktion. Jede erledigte Aufgabe zählt im Rennen gegen Schmuddel – Schmuddel turnt dabei in kleinen Szenen herum.',
};

function group(title, rows, foot = '') {
  return `<h2 class="sec">${esc(title)}</h2><div class="group">${rows.join('')}</div>${foot ? `<p class="group-foot">${foot}</p>` : ''}`;
}
function row(label, right = '', { info = '', go: path = '', cls = '' } = {}) {
  return `<div class="grow ${path ? 'link' : ''} ${cls}" ${path ? `data-go="${path}"` : ''}>
    <span class="glabel">${label}${info ? ` <button class="info-btn" data-info="${info}" aria-label="Info">${icons.info}</button>` : ''}</span>
    <span class="gright">${right}${path ? '<span class="chev">›</span>' : ''}</span></div>`;
}
function bindSettings(root) {
  bindCommon(root);
  root.querySelectorAll('[data-info]').forEach(b => (b.onclick = e => {
    e.stopPropagation();
    const k = b.dataset.info;
    const titles = { multi: 'Mehrere Personen', fair: 'FairShare', resp: 'Zuständigkeit', rot: 'Rotation', race: 'Monatliches Rennen', comments: `Kommentare von ${MONSTER_NAME}`, vacation: 'Urlaubsmodus', kids: 'Kindermodus' };
    infoSheet(titles[k] || 'Info', INFO[k] || '');
  }));
}

// ---------------- settings root ----------------
export function settingsView() {
  const s = store.settings();
  const me = L.me();
  return {
    html: `${appbar('Einstellungen', { backTo: '/' })}
      <main class="content settings">
        ${group('Haushalt', [
          row('Personen', s.multiPerson ? `${L.persons().length} Personen` : 'Aus', { go: '/settings/persons' }),
          row('Dieses Gerät gehört', me ? `${esc(me.emoji || '')} ${esc(me.name)}` : 'Niemand', { go: '/settings/me' }),
          row('Synchronisation', esc(sync.syncStatus()), { go: '/settings/sync' }),
        ])}
        ${group('Aufgaben', [
          row('Putz-Intensität', esc(L.INTENSITY[L.intensity()].label), { go: '/settings/intensity' }),
          row('Aufgaben-Manager', '', { go: '/manager' }),
          row('Statistik', '', { go: '/stats' }),
          row('Urlaubsmodus', s.vacation ? 'Aktiv' : 'Aus', { go: '/settings/vacation', info: 'vacation' }),
        ])}
        ${group('Motivation', [
          row(MONSTER_NAME, s.race ? 'Rennen aktiv' : 'Aus', { go: '/settings/monster' }),
          row('Kindermodus', s.kidsMode ? 'An' : 'Aus', { go: '/settings/kids', info: 'kids' }),
        ])}
        ${group('Daten', [
          row('Daten exportieren', '', { cls: 'act', go: '' }).replace('class="grow', 'data-act="export" class="grow'),
          row('Daten importieren', '<input type="file" accept="application/json" data-import hidden>').replace('class="grow', 'data-act="import" class="grow'),
          row('<span class="red-text">Alles zurücksetzen</span>', '').replace('class="grow', 'data-act="reset" class="grow'),
        ], 'Blitzeblank speichert alles auf diesem Gerät. Mit der Synchronisation teilt ihr den Haushalt zwischen mehreren Handys.')}
        <div class="about">${monsterSvg('wave', 'about-mon', { tickle: true })}<p><b>Blitzeblank</b> · Version 1.0<br><span class="muted">Ein Putzplan für die ganze Familie.</span></p></div>
      </main>`,
    bind(root) {
      bindSettings(root);
      root.querySelector('[data-act=export]').onclick = () => {
        const fname = `blitzeblank-backup-${new Date().toISOString().slice(0, 10)}.json`;
        if (native) { const where = native.saveFile(fname, store.exportJson()); toast(where ? 'Gespeichert in ' + where : 'Speichern fehlgeschlagen'); return; }
        const blob = new Blob([store.exportJson()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `blitzeblank-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      };
      const file = root.querySelector('[data-import]');
      root.querySelector('[data-act=import]').onclick = () => file.click();
      file.onchange = async () => {
        const f = file.files[0];
        if (!f) return;
        try { store.importJson(await f.text()); toast('Daten importiert'); } catch (e) { toast('Import fehlgeschlagen: ' + e.message); }
      };
      root.querySelector('[data-act=reset]').onclick = async () => {
        if (!(await confirmSheet('Alles zurücksetzen?', 'Alle Bereiche, Aufgaben, Personen und der Verlauf werden gelöscht – auch auf synchronisierten Geräten.', 'Zurücksetzen', { danger: true }))) return;
        store.wipe();
        go('/', { replace: true });
      };
    },
  };
}

// ---------------- persons ----------------
export function personsView() {
  const s = store.settings();
  const ps = L.persons();
  return {
    html: `${appbar('Personen', { backTo: '/settings' })}
      <main class="content settings">
        ${group('Mehrere Personen', [row('Aktivieren', toggle('multiPerson', s.multiPerson), { info: 'multi' })],
          'Wenn euer Haushalt aus mehreren Mitgliedern besteht, haltet ihr mit „Personen“ fest, wer welche Aufgaben übernimmt und erledigt.')}
        ${s.multiPerson ? `
          <h2 class="sec">Mitglieder</h2>
          <div class="group">${ps.map(p => `<div class="grow link" data-person="${p.id}"><span class="glabel"><span class="avatar" style="--pc:${L.personColor(p)}">${esc(p.emoji || '🙂')}</span> ${esc(p.name)} ${p.kid ? '<span class="badge">Kind</span>' : ''}</span><span class="gright"><span class="chev">›</span></span></div>`).join('')}
            <div class="grow link" data-person="new"><span class="glabel">${icons.plus} Person hinzufügen</span></div></div>
          ${group('FairShare', [
            row('Aktivieren', toggle('fairshare', s.fairshare), { info: 'fair' }),
            row('Konfigurieren', '', { go: '/settings/fairshare' }),
          ])}
          ${group('Zuständigkeit', [
            row('Aktivieren', toggle('responsibility', s.responsibility), { info: 'resp' }),
            row('Rotation', toggle('rotation', s.rotation), { info: 'rot' }),
            row('Konfigurieren', '', { go: '/settings/responsibility' }),
          ], 'Nutzt die Funktion „Zuständigkeit“, um Personen für bestimmte Aufgaben einzuteilen.')}` : ''}
      </main>`,
    bind(root) {
      bindSettings(root);
      root.querySelectorAll('[data-toggle]').forEach(i => (i.onchange = () => {
        store.setSettings({ [i.dataset.toggle]: i.checked });
        if (i.dataset.toggle === 'multiPerson' && i.checked && !L.persons().length) personSheet(null);
      }));
      root.querySelectorAll('[data-person]').forEach(r => (r.onclick = () => personSheet(r.dataset.person === 'new' ? null : r.dataset.person)));
    },
  };
}

function personSheet(id) {
  const p = id ? store.get('persons', id) : null;
  const ps = L.persons();
  const st = { name: p?.name || '', emoji: p?.emoji || L.PERSON_EMOJI[ps.length % L.PERSON_EMOJI.length], color: p?.color || L.PERSON_COLORS[ps.length % L.PERSON_COLORS.length], kid: !!p?.kid };
  const draw = () => `<h3>${p ? 'Person bearbeiten' : 'Neue Person'}</h3>
    <label class="field"><small>Name</small><input data-n value="${esc(st.name)}" maxlength="20" placeholder="Name"></label>
    <div class="chips wrap emo-row">${L.PERSON_EMOJI.map(e => `<button class="emo ${e === st.emoji ? 'on' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
    <div class="swatches small">${L.PERSON_COLORS.map(c => `<button style="background:${c}" data-c="${c}" class="${c === st.color ? 'on' : ''}"></button>`).join('')}</div>
    <div class="row-between"><span>Ist ein Kind (erscheint im Kindermodus)</span><label class="switch"><input type="checkbox" data-kid ${st.kid ? 'checked' : ''}><span></span></label></div>
    <div class="btn-row">${p ? '<button class="btn grey" data-del>Löschen</button>' : '<button class="btn grey" data-cancel>Abbrechen</button>'}<button class="btn orange" data-save>Speichern</button></div>`;
  sheet(`<div data-ps>${draw()}</div>`, (el, close) => {
    const box = el.querySelector('[data-ps]');
    const bind = () => {
      const n = box.querySelector('[data-n]'); n.oninput = () => (st.name = n.value);
      box.querySelectorAll('[data-e]').forEach(b => (b.onclick = () => { st.emoji = b.dataset.e; box.innerHTML = draw(); bind(); }));
      box.querySelectorAll('[data-c]').forEach(b => (b.onclick = () => { st.color = b.dataset.c; box.innerHTML = draw(); bind(); }));
      box.querySelector('[data-kid]').onchange = e => (st.kid = e.target.checked);
      box.querySelector('[data-save]').onclick = () => {
        if (!st.name.trim()) { toast('Bitte einen Namen eingeben'); return; }
        const rec = store.put('persons', { ...(p || { order: ps.length }), name: st.name.trim(), emoji: st.emoji, color: st.color, kid: st.kid });
        if (!store.local().me && !st.kid) store.setLocal({ me: rec.id });
        close();
      };
      const c = box.querySelector('[data-cancel]'); if (c) c.onclick = close;
      const d = box.querySelector('[data-del]');
      if (d) d.onclick = async () => {
        close();
        if (await confirmSheet('Person löschen?', `${p.name} wird entfernt. Erledigte Aufgaben bleiben in der Statistik.`, 'Löschen', { danger: true })) store.remove('persons', p.id);
      };
    };
    bind();
    setTimeout(() => box.querySelector('[data-n]').focus(), 250);
  });
}

export function meView() {
  const ps = L.persons();
  const meId = store.local().me;
  return {
    html: `${appbar('Dieses Gerät gehört', { backTo: '/settings' })}
      <main class="content settings">
        <p class="group-foot">Wählt aus, wem dieses Handy gehört. Diese Person wird beim Abhaken vorausgewählt und sieht unter „Heute → Meine“ ihre Aufgaben. Die Einstellung gilt nur für dieses Gerät.</p>
        <div class="group">${ps.length ? ps.map(p => `<div class="grow link" data-me="${p.id}"><span class="glabel"><span class="avatar" style="--pc:${L.personColor(p)}">${esc(p.emoji || '🙂')}</span> ${esc(p.name)}</span><span class="gright">${p.id === meId ? '✓' : ''}</span></div>`).join('') : `<div class="grow link" data-go="/settings/persons"><span class="glabel">Zuerst Personen anlegen</span><span class="gright"><span class="chev">›</span></span></div>`}</div>
      </main>`,
    bind(root) {
      bindSettings(root);
      root.querySelectorAll('[data-me]').forEach(r => (r.onclick = () => { store.setLocal({ me: r.dataset.me }); toast('Gespeichert'); }));
    },
  };
}

// ---------------- fairshare ----------------
export function fairshareView() {
  const ps = L.persons().filter(p => !p.kid);
  const s = store.settings();
  const stats = L.fairStats();
  const targets = { ...(s.fairTargets || {}) };
  ps.forEach(p => { if (targets[p.id] == null) targets[p.id] = Math.round(100 / ps.length); });
  return {
    static: true,
    html: `${appbar('FairShare', { backTo: '/settings/persons' })}
      <main class="content settings">
        <h2 class="sec">Soll-Verteilung</h2>
        <div class="group pad">${ps.map(p => `<div class="fs-row"><span class="avatar" style="--pc:${L.personColor(p)}">${esc(p.emoji)}</span><span class="fs-name">${esc(p.name)}</span>
          <input type="range" min="0" max="100" step="5" value="${targets[p.id]}" data-t="${p.id}"><b data-v="${p.id}">${targets[p.id]} %</b></div>`).join('') || '<p class="muted">Legt zuerst mindestens zwei erwachsene Personen an.</p>'}
          <p class="muted small" data-sum></p></div>
        <h2 class="sec">Ist-Verteilung im ${esc(L.race().monthLabel)}</h2>
        <div class="group pad">${stats.map(x => `<div class="fs-stat"><span>${esc(x.person.emoji)} ${esc(x.person.name)}</span>
          <div class="fs-bar"><div style="width:${x.share}%;background:${L.personColor(x.person)}"></div><i style="left:${x.target}%"></i></div><b>${Math.round(x.share)} %</b></div>`).join('')}
          <p class="muted small">Der Strich zeigt den Soll-Anteil. Grundlage sind die Punkte dieses Monats.</p></div>
        <div class="btn-row"><button class="btn orange" data-save>Speichern</button></div>
      </main>`,
    bind(root) {
      bindSettings(root);
      const sum = () => {
        const total = ps.reduce((a, p) => a + Number(targets[p.id]), 0);
        const el = root.querySelector('[data-sum]');
        if (el) el.textContent = total === 100 ? 'Summe: 100 % ✓' : `Summe: ${total} % – wird beim Speichern auf 100 % umgerechnet.`;
      };
      root.querySelectorAll('[data-t]').forEach(r => (r.oninput = () => { targets[r.dataset.t] = Number(r.value); root.querySelector(`[data-v="${r.dataset.t}"]`).textContent = r.value + ' %'; sum(); }));
      sum();
      root.querySelector('[data-save]').onclick = () => {
        const total = ps.reduce((a, p) => a + Number(targets[p.id]), 0) || 1;
        const norm = {}; ps.forEach(p => (norm[p.id] = Math.round((targets[p.id] / total) * 100)));
        store.setSettings({ fairTargets: norm, fairshare: true });
        toast('FairShare gespeichert');
      };
    },
  };
}

// ---------------- responsibility config ----------------
export function responsibilityView() {
  const ps = L.persons();
  const areas = store.all('areas').sort((a, b) => (a.order || 0) - (b.order || 0));
  const s = store.settings();
  return {
    html: `${appbar('Zuständigkeit', { backTo: '/settings/persons' })}
      <main class="content settings">
        <p class="group-foot">Tippt auf die Personen, die für eine Aufgabe zuständig sind. ${s.rotation ? 'Bei mehreren Personen wechselt die Zuständigkeit nach jedem Erledigen (Rotation). Die Zahl zeigt die Reihenfolge.' : ''}</p>
        ${areas.map(a => {
          const tasks = L.sortTasks(L.tasksOfArea(a.id), 'name');
          if (!tasks.length) return '';
          return `<h2 class="sec" style="color:${a.color}">${esc(a.name)}</h2><div class="group">${tasks.map(t => `<div class="resp-row"><span>${esc(t.name)}</span><div class="chips">${ps.map(p => {
            const i = (t.assignees || []).indexOf(p.id);
            return `<button class="pchip sel sm ${i > -1 ? 'on' : ''}" style="--pc:${L.personColor(p)}" data-t="${t.id}" data-p="${p.id}">${i > -1 && s.rotation && t.assignees.length > 1 ? `<b class="ord">${i + 1}</b>` : ''}${esc(p.emoji)}</button>`;
          }).join('')}</div></div>`).join('')}</div>`;
        }).join('')}
      </main>`,
    bind(root) {
      bindSettings(root);
      if (!s.responsibility) store.setSettings({ responsibility: true });
      root.querySelectorAll('[data-t]').forEach(b => (b.onclick = () => {
        const t = store.get('tasks', b.dataset.t);
        const a = [...(t.assignees || [])];
        const i = a.indexOf(b.dataset.p);
        i > -1 ? a.splice(i, 1) : a.push(b.dataset.p);
        store.put('tasks', { id: t.id, assignees: a });
      }));
    },
  };
}

// ---------------- monster settings ----------------
export function monsterView() {
  const s = store.settings();
  const r = L.race();
  const demoDay = 5;
  return {
    html: `${appbar(MONSTER_NAME, { backTo: '/settings' })}
      <main class="content settings">
        ${group('Monatliches Rennen', [
          row('Aktivieren', toggle('race', s.race), { info: 'race' }),
          `<div class="grow link" data-diff><span class="glabel">Schwierigkeitsstufe</span><span class="gright"><b>${L.DIFFICULTY[s.difficulty].label}</b></span></div>`,
          `<div class="grow link" data-goal><span class="glabel">Monatsziel</span><span class="gright"><b>${r.goal} Pkt.</b>${s.goalAuto ? ' <small>(auto)</small>' : ''}</span></div>`,
        ])}
        <h2 class="sec">Demo (Monatliches Rennen)</h2>
        <div class="demo-card">
          <p>Ihr erzielt Punkte, indem ihr Aufgaben erledigt.<br>${MONSTER_NAME} bewegt sich langsam, aber stetig (unterer Balken) – und bekommt Extra-Punkte für jede Aufgabe, die überfällig liegen bleibt.</p>
          <div class="race-meta"><span>Tag ${demoDay}</span><span>${MONSTER_NAME} führt: 1 Pkt.</span></div>
          <div class="race-track demo"><div class="race-bar you"></div><div class="race-bar mon"></div></div>
        </div>
        ${group(`Kommentare von ${MONSTER_NAME}`, [row('Aktivieren', toggle('comments', s.comments), { info: 'comments' }),
          row('🔊 Schmuddel spricht', `<label class="switch"><input type="checkbox" data-advoice ${mascot.adultVoice() ? 'checked' : ''}><span></span></label>`)],
          'Schmuddel sagt seine Sprüche mit seiner Stimme. Gilt nur für dieses Handy. Im Kindermodus spricht er immer.')}
        <div class="mon-show">${monsterSvg('wave', 'mon-big', { tickle: true, say: '[data-monsay]' })}<p class="mon-say" data-monsay>Tipp mich an!</p>
          <div class="chips center mood-demo">${[['taunt', '😈 Frech'], ['happy', '😄 Freut sich'], ['shock', '😱 Schock'], ['angry', '😠 Wütend'], ['sad', '😢 Traurig'], ['wave', '👋 Winkt']].map(([m, l]) => `<button class="chip" data-mood="${m}">${l}</button>`).join('')}</div>
          <button class="btn light" data-sample>Zufälligen Spruch zeigen</button></div>
      </main>`,
    bind(root) {
      bindSettings(root);
      root.querySelector('[data-advoice]').onchange = e => { store.setLocal({ adultVoice: e.target.checked }); if (e.target.checked) mascot.react('tickle', { force: true }); };
      root.querySelectorAll('[data-mood]').forEach(b => (b.onclick = () => {
        const box = root.querySelector('.mon-show svg');
        box.outerHTML = monsterSvg(b.dataset.mood, 'mon-big', { tickle: true, say: '[data-monsay]' });
      }));
      root.querySelector('[data-sample]').onclick = () => {
        const kinds = ['aheadBig', 'behindBig', 'done', 'doneOverdue', 'postpone', 'tickle', 'undo', 'timerStart', 'greetAway'];
        mascot.react(kinds[Math.floor(Math.random() * kinds.length)], { force: true });
      };
      root.querySelectorAll('[data-toggle]').forEach(i => (i.onchange = () => store.setSettings(i.dataset.toggle === 'race' && i.checked && !s.race ? { race: true, raceStart: Date.now() } : { [i.dataset.toggle]: i.checked })));
      root.querySelector('[data-diff]').onclick = () => sheet(`<h3>Schwierigkeitsstufe</h3><div class="opt-list">${Object.entries(L.DIFFICULTY).map(([k, v]) => `<button class="opt ${k === s.difficulty ? 'on' : ''}" data-d="${k}">${v.label} <small>– ${MONSTER_NAME} schafft ${Math.round(v.f * 100)} % des Monatsziels</small></button>`).join('')}</div>`,
        (el, close) => el.querySelectorAll('[data-d]').forEach(b => (b.onclick = () => { store.setSettings({ difficulty: b.dataset.d }); close(); })));
      root.querySelector('[data-goal]').onclick = () => sheet(`<h3>Monatsziel</h3>
        <div class="row-between"><span>Automatisch berechnen</span><label class="switch"><input type="checkbox" data-auto ${s.goalAuto ? 'checked' : ''}><span></span></label></div>
        <p class="muted small">Automatisch: aus euren Aufgaben und deren Rhythmus berechnet (aktuell ${L.autoGoal()} Pkt.).</p>
        <div class="stepper big"><button data-g="-4">−</button><b data-gv>${s.goal}</b><button data-g="4">+</button></div>
        <div class="btn-row"><button class="btn orange" data-ok>Fertig</button></div>`, (el, close) => {
        let g = s.goalAuto ? L.autoGoal() : s.goal;
        el.querySelector('[data-gv]').textContent = g;
        el.querySelectorAll('[data-g]').forEach(b => (b.onclick = () => { g = Math.max(4, g + Number(b.dataset.g)); el.querySelector('[data-gv]').textContent = g; el.querySelector('[data-auto]').checked = false; }));
        el.querySelector('[data-ok]').onclick = () => { const auto = el.querySelector('[data-auto]').checked; store.setSettings({ goalAuto: auto, goal: g }); close(); };
      });
    },
  };
}

// ---------------- vacation ----------------
export function vacationView() {
  const s = store.settings();
  const since = s.vacation?.since;
  return {
    html: `${appbar('Urlaubsmodus', { backTo: '/settings' })}
      <main class="content settings">
        ${group('Urlaubsmodus', [row('Aktivieren', toggle('vacation', !!since), { info: 'vacation' })],
          since ? `Aktiv seit ${new Date(since).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}. Nichts wird schmutziger, bis ihr zurück seid.` : 'Fahrt ihr weg? Dann friert der Urlaubsmodus alle Zustände ein. Nach dem Urlaub geht es genau dort weiter, wo ihr aufgehört habt.')}
        <div class="mon-show">${monsterSvg(since ? 'sad' : 'wave', 'mon-big')}<p class="muted center">${since ? `${MONSTER_NAME} langweilt sich ohne euch.` : ''}</p></div>
      </main>`,
    bind(root) {
      bindSettings(root);
      root.querySelector('[data-toggle]').onchange = e => { e.target.checked ? L.startVacation() : L.endVacation(); toast(e.target.checked ? 'Schönen Urlaub! 🏖️' : 'Willkommen zurück!'); mascot.react(e.target.checked ? 'vacationOn' : 'vacationOff', { delay: 300 }); };
    },
  };
}

// ---------------- kids settings ----------------
export function kidsSettingsView() {
  const s = store.settings();
  const kids = L.persons().filter(p => p.kid);
  return {
    static: true,
    html: `${appbar('Kindermodus', { backTo: '/settings' })}
      <main class="content settings">
        ${group('Kindermodus', [row('Aktivieren', toggle('kidsMode', s.kidsMode), { info: 'kids' }), row('Kindermodus öffnen', '').replace('class="grow', 'data-kidsopen class="grow link')],
          'Kinder sehen nur Aufgaben, die als „Kinder können mitmachen“ markiert sind – mit Bild, Schritt-für-Schritt-Liste und Vorlesen. Zum Verlassen muss eine kleine Rechenaufgabe gelöst werden.')}
        <h2 class="sec">Kinder</h2>
        <div class="group pad">${kids.length ? kids.map(k => `<div class="row-between"><span><span class="avatar" style="--pc:${L.personColor(k)}">${esc(k.emoji)}</span> ${esc(k.name)}</span></div>`).join('') : '<p class="muted">Legt unter Personen ein Kind an (Schalter „Ist ein Kind“). Ohne Kinder-Profile gibt es ein gemeinsames Kinder-Profil.</p>'}
          <p class="muted small">Es gibt keine Sterne: Jede erledigte Kinder-Aufgabe ist ein Punkt im Rennen gegen Schmuddel.</p></div>
        <h2 class="sec">🔊 Stimme (ElevenLabs)</h2>
        <div class="group pad voice-box">
          <div class="row-between"><span>ElevenLabs-Stimme verwenden</span><label class="switch"><input type="checkbox" data-von ${voice.config().enabled ? 'checked' : ''}><span></span></label></div>
          <p class="small" data-vinfo>Lade Sprachdateien…</p>
          <label class="field"><small>API-Schlüssel für eigene Aufgaben (nur auf diesem Handy gespeichert)</small><input type="password" data-vkey value="${esc(voice.config().key)}" placeholder="optional – sk_…" autocomplete="off"></label>
          <details><summary class="small">Stimmen ändern (Voice-IDs)</summary>
            <label class="field"><small>Schmuddel</small><input data-vmon value="${esc(voice.config().monsterVoice)}" placeholder="Standard aus der App"></label>
            <label class="field"><small>Erzähler (Aufgaben & Schritte)</small><input data-vnar value="${esc(voice.config().narratorVoice)}" placeholder="Standard aus der App"></label>
          </details>
          <div class="btn-row"><button class="btn light" data-vtest="monster">▶ Schmuddel</button><button class="btn light" data-vtest="narrator">▶ Erzähler</button></div>
          <p class="muted small">Sprüche von Schmuddel und die Aufgaben aus dem Katalog sind als Sprachdateien in der App (offline, kostenlos). Für selbst geschriebene Aufgaben holt die App die Stimme mit dem Schlüssel live von ElevenLabs und merkt sie sich. Ohne Schlüssel spricht die Stimme des Handys.</p>
        </div>
        <h2 class="sec">Aufgaben für Kinder</h2>
        <div class="group">${store.all('tasks').filter(t => t.kid?.enabled).map(t => `<div class="grow link" data-go="/task/${t.id}"><span class="glabel">${esc(t.kid.emoji)} ${esc(t.name)}</span><span class="gright"><small>${t.kid.steps?.length || 0} Schritte</small><span class="chev">›</span></span></div>`).join('') || '<div class="grow"><span class="glabel muted">Noch keine. Aktiviert „Für Kinder“ in einer Aufgabe.</span></div>'}</div>
      </main>`,
    bind(root) {
      bindSettings(root);
      root.querySelector('[data-toggle]').onchange = e => store.setSettings({ kidsMode: e.target.checked });
      root.querySelector('[data-kidsopen]').onclick = () => import('./views-kids.js').then(m => m.enterKids());
      voice.bundledInfo().then(i => {
        const el = root.querySelector('[data-vinfo]');
        if (el) el.textContent = i.count ? `✅ ${i.count} Sprachdateien in der App.` : 'Noch keine Sprachdateien in der App – es spricht die Stimme des Handys (oder ElevenLabs live, wenn ein Schlüssel hinterlegt ist).';
      });
      root.querySelector('[data-von]').onchange = e => voice.setConfig({ enabled: e.target.checked });
      root.querySelector('[data-vkey]').onchange = e => { voice.setConfig({ key: e.target.value.trim() }); toast('Schlüssel gespeichert (nur auf diesem Handy)'); };
      root.querySelector('[data-vmon]').onchange = e => voice.setConfig({ monsterVoice: e.target.value.trim() });
      root.querySelector('[data-vnar]').onchange = e => voice.setConfig({ narratorVoice: e.target.value.trim() });
      root.querySelectorAll('[data-vtest]').forEach(b => (b.onclick = () => voice.say(b.dataset.vtest === 'monster' ? mascot.line('kids') : 'Kinderzimmer aufräumen. Schritt 1: Spielzeug in die Kisten legen.', b.dataset.vtest)));
    },
  };
}

// ---------------- sync ----------------
export function syncView() {
  const loc = store.local();
  const cfg = loc.sync?.config;
  const code = loc.sync?.household;
  const link = cfg && code ? sync.inviteLink(cfg, code) : '';
  return {
    static: true,
    html: `${appbar('Synchronisation', { backTo: '/settings' })}
      <main class="content settings">
        <div class="group pad"><div class="row-between"><b>Status</b><span data-status class="sync-status">${esc(sync.syncStatus())}</span></div></div>
        ${cfg ? `
          <h2 class="sec">Weiteres Handy verbinden</h2>
          <div class="group pad">
            <p class="small">Öffnet diesen Link auf dem Handy eurer Partnerin / eures Partners. Danach teilt ihr denselben Haushalt – Änderungen erscheinen sofort auf beiden Geräten.</p>
            <textarea readonly rows="3" class="mono" data-link>${esc(link)}</textarea>
            <div class="btn-row"><button class="btn light" data-copy>Link kopieren</button>${navigator.share || native ? '<button class="btn orange" data-share>Teilen…</button>' : ''}</div>
            <p class="muted small">Haushalts-Code: <code>${esc(code)}</code><br>Den Link nur an Personen geben, die mitputzen sollen 😉</p>
          </div>
          <div class="btn-row"><button class="btn grey" data-off>Synchronisation trennen</button></div>` : `
          <p class="group-foot">Damit du und deine Partnerin / dein Partner auf euren eigenen Handys denselben Putzplan seht, braucht die App einen kleinen, kostenlosen Online-Speicher (Google Firebase). Das musst du nur <b>einmal</b> einrichten – danach verbindest du jedes weitere Handy mit einem Link.</p>
          <details class="howto"><summary>Anleitung (ca. 5 Minuten)</summary><ol>
            <li>Öffne <b>console.firebase.google.com</b> und melde dich mit einem Google-Konto an.</li>
            <li>„Projekt hinzufügen“ → Name z. B. <i>blitzeblank</i> → Google Analytics kannst du ausschalten.</li>
            <li>Links <b>Build → Firestore Database</b> → „Datenbank erstellen“ → Standort <i>europe-west3 (Frankfurt)</i> → Produktionsmodus.</li>
            <li>Unter <b>Build → Authentication</b> → „Los geht's“ → Anbieter <b>Anonym</b> aktivieren.</li>
            <li>In Firestore → Reiter <b>Regeln</b> diese Regeln einfügen und veröffentlichen:<pre>rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /households/{h}/{col}/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}</pre></li>
            <li>Zahnrad ⚙ → <b>Projekteinstellungen</b> → unten „App hinzufügen“ → Web (&lt;/&gt;) → Name egal → Registrieren.</li>
            <li>Den angezeigten Block <code>const firebaseConfig = { … }</code> kopieren und unten einfügen.</li>
          </ol></details>
          <h2 class="sec">Firebase-Konfiguration</h2>
          <div class="group pad"><textarea rows="7" class="mono" data-cfg placeholder='const firebaseConfig = {&#10;  apiKey: "…",&#10;  authDomain: "…",&#10;  projectId: "…",&#10;  …&#10;};'></textarea>
            <div class="btn-row"><button class="btn orange" data-connect>Haushalt erstellen & verbinden</button></div></div>
          <h2 class="sec">Einladung erhalten?</h2>
          <div class="group pad"><p class="small">Füge hier den Einladungslink ein, den du bekommen hast:</p>
            <textarea rows="3" class="mono" data-inv placeholder="https://…#/join/…"></textarea>
            <div class="btn-row"><button class="btn orange" data-joinlink>Haushalt beitreten</button></div></div>`}
      </main>`,
    bind(root) {
      bindSettings(root);
      const stEl = root.querySelector('[data-status]');
      const off = sync.onStatus(t => { if (stEl.isConnected) stEl.textContent = t; else off(); });
      const connect = root.querySelector('[data-connect]');
      if (connect) connect.onclick = async () => {
        let cfg2;
        try { cfg2 = sync.parseConfig(root.querySelector('[data-cfg]').value); } catch (e) { toast('Konfiguration ungültig: ' + e.message); return; }
        store.setLocal({ sync: { config: cfg2, household: sync.newHouseholdCode() } });
        const ok = await sync.start();
        toast(ok ? 'Verbunden! Jetzt das zweite Handy einladen.' : 'Verbindung fehlgeschlagen – Konfiguration prüfen.');
        window.dispatchEvent(new Event('bb:render'));
      };
      const jl = root.querySelector('[data-joinlink]');
      if (jl) jl.onclick = () => {
        const m = root.querySelector('[data-inv]').value.trim().match(/join\/([A-Za-z0-9+/=_%-]+)/);
        if (!m) { toast('Das sieht nicht nach einem Einladungslink aus'); return; }
        go('/join/' + m[1]);
      };
      const copy = root.querySelector('[data-copy]');
      if (copy) copy.onclick = async () => {
        try { await navigator.clipboard.writeText(link); toast('Link kopiert'); } catch (e) { root.querySelector('[data-link]').select(); document.execCommand('copy'); toast('Link kopiert'); }
      };
      const share = root.querySelector('[data-share]');
      if (share) share.onclick = () => native ? native.share('Blitzeblank – unser Haushalt', 'Tritt unserem Putzplan bei! Link in der Blitzeblank-App unter Einstellungen → Synchronisation → „Einladungslink einfügen“ einfügen (oder antippen):\n' + link) : navigator.share({ title: 'Blitzeblank – unser Haushalt', text: 'Tritt unserem Putzplan bei:', url: link }).catch(() => {});
      const offBtn = root.querySelector('[data-off]');
      if (offBtn) offBtn.onclick = async () => {
        if (!(await confirmSheet('Synchronisation trennen?', 'Die Daten bleiben auf diesem Gerät, werden aber nicht mehr geteilt.', 'Trennen'))) return;
        await sync.stop();
        store.setLocal({ sync: null });
        window.dispatchEvent(new Event('bb:render'));
      };
    },
  };
}

export function joinView(payload) {
  let inv = null, err = '';
  try { inv = sync.decodeInvite(payload); } catch (e) { err = e.message; }
  const hasData = store.all('areas').length > 0;
  return {
    static: true,
    html: `${appbar('Haushalt beitreten', { backTo: '/' })}
      <main class="content settings">
        <div class="mon-show">${monsterSvg('shock', 'mon-big')}</div>
        ${err ? `<p class="group-foot">Dieser Einladungslink ist ungültig (${esc(err)}).</p>` : `
          <p class="group-foot">Du wurdest zu einem gemeinsamen Haushalt eingeladen. Danach seht ihr auf allen Handys dieselben Bereiche und Aufgaben.</p>
          ${hasData ? '<p class="group-foot"><b>Hinweis:</b> Auf diesem Gerät gibt es schon Daten. Sie werden in den gemeinsamen Haushalt übernommen.</p>' : ''}
          <div class="btn-row"><button class="btn orange" data-join>Beitreten</button></div>`}
      </main>`,
    bind(root) {
      bindSettings(root);
      const j = root.querySelector('[data-join]');
      if (j) j.onclick = async () => {
        store.setLocal({ sync: { config: inv.c, household: inv.h } });
        store.setSettings({ setupDone: true });
        const ok = await sync.start();
        toast(ok ? 'Willkommen im Haushalt! 🎉' : 'Verbindung fehlgeschlagen');
        go(L.persons().length ? '/settings/me' : '/', { replace: true });
      };
    },
  };
}

// ---------------- stats ----------------
export function statsView() {
  const comps = store.all('completions');
  const now = Date.now();
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const end = L.startOfDay(now) + L.DAY - i * 7 * L.DAY;
    const start = end - 7 * L.DAY;
    const pts = comps.filter(c => c.at >= start && c.at < end).reduce((a, c) => a + (c.points || 0), 0);
    weeks.push({ label: new Date(start).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }), pts });
  }
  const maxW = Math.max(1, ...weeks.map(w => w.pts));
  const month = L.monthCompletions();
  const byArea = {};
  month.forEach(c => (byArea[c.areaId] = (byArea[c.areaId] || 0) + (c.points || 0)));
  const areaRows = Object.entries(byArea).map(([id, pts]) => ({ a: store.get('areas', id), pts })).filter(x => x.a).sort((a, b) => b.pts - a.pts);
  const maxA = Math.max(1, ...areaRows.map(x => x.pts));
  const s = store.settings();
  const fs = L.fairStats();
  const top = {};
  month.forEach(c => (top[c.taskName] = (top[c.taskName] || 0) + 1));
  const topTasks = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return {
    html: `${appbar('Statistik', { backTo: '/settings' })}
      <main class="content settings">
        <div class="stat-tiles"><div><b>${month.length}</b><span>Erledigt im ${esc(L.race().monthLabel)}</span></div><div><b>${month.reduce((a, c) => a + (c.points || 0), 0)}</b><span>Punkte</span></div><div><b>${Object.values(s.raceHistory || {}).filter(h => L.raceResult(h) === 'win').length}</b><span>🏆 Monate</span></div></div>
        <h2 class="sec">Punkte pro Woche</h2>
        <div class="group pad"><div class="wchart">${weeks.map(w => `<div class="wcol"><div class="wbar" style="height:${(w.pts / maxW) * 100}%"><span>${w.pts || ''}</span></div><small>${w.label}</small></div>`).join('')}</div></div>
        ${s.multiPerson && fs.length ? `<h2 class="sec">Wer hat wie viel gemacht?</h2><div class="group pad">${fs.map(x => `<div class="fs-stat"><span>${esc(x.person.emoji)} ${esc(x.person.name)}</span><div class="fs-bar"><div style="width:${x.share}%;background:${L.personColor(x.person)}"></div>${s.fairshare ? `<i style="left:${x.target}%"></i>` : ''}</div><b>${x.points}</b></div>`).join('')}</div>` : ''}
        <h2 class="sec">Bereiche diesen Monat</h2>
        <div class="group pad">${areaRows.map(x => `<div class="fs-stat"><span>${esc(x.a.name)}</span><div class="fs-bar"><div style="width:${(x.pts / maxA) * 100}%;background:${x.a.color}"></div></div><b>${x.pts}</b></div>`).join('') || '<p class="muted">Noch nichts erledigt.</p>'}</div>
        ${topTasks.length ? `<h2 class="sec">Häufigste Aufgaben</h2><div class="group">${topTasks.map(([n, c]) => `<div class="grow"><span class="glabel">${esc(n)}</span><span class="gright">${c}×</span></div>`).join('')}</div>` : ''}
      </main>`,
    bind: bindSettings,
  };
}
