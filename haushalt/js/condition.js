// "Wie sieht es gerade aus?" – picker for the current condition of a task.
import * as L from './logic.js';
import { esc } from './ui.js';

/** t: task-like object (needs freqN/freqUnit/anytime); id: key used in data attributes */
export function conditionPicker(t, selected, id = 'x') {
  if (t.anytime) return '<p class="muted small cp-any">Jederzeit-Aufgabe – kein Zustand nötig.</p>';
  return `<div class="cond-pick">${L.CONDITIONS.map(c => `<button type="button" class="cp cp-${c.key} ${selected === c.key ? 'on' : ''}" data-cp-id="${esc(id)}" data-cp-key="${c.key}"><span>${c.emoji}</span><small>${esc(c.label)}</small></button>`).join('')}</div>
    <div class="cp-preview ${selected ? 'set' : ''}">${selected ? `→ ${esc(L.conditionPreview(t, selected))}` : 'Bitte wählen: Wie sieht es gerade aus?'}</div>`;
}

/** wires all pickers inside root; onPick(id, key) */
export function bindConditionPickers(root, onPick) {
  root.querySelectorAll('[data-cp-key]').forEach(b => (b.onclick = e => {
    e.stopPropagation();
    onPick(b.dataset.cpId, b.dataset.cpKey);
  }));
}
