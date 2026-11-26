#!/usr/bin/env node
// Prüft data/scenarios.json auf Struktur, Erreichbarkeit, Sackgassen, Schleifen und Wertebereiche.
// Aufruf: node scripts/validate-scenarios.mjs [pfad/zur/scenarios.json]
// Keine Abhängigkeiten, läuft mit Node 18+.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(process.argv[2] ?? resolve(here, "../data/scenarios.json"));

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`✗ ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`! ${where}: ${msg}`);

// ---- Regeln -------------------------------------------------------------
const WERT_MIN = 0, WERT_MAX = 100;
const EFFEKT_MAX = 30;                 // |effekt| pro Antwort
const OPTIONEN_MIN = 3, OPTIONEN_MAX = 4;
const MAX_SCHRITTE = 12;               // längster Pfad
const MIN_LAENGSTER_PFAD_DIALOG = 6;   // „etwa 6 bis 10 Schritte“
const BEWERTUNGEN = ["gut", "teils", "ungünstig"];
const BAUSTEIN_ARTEN = ["zug", "kunstgriff", "stolperfalle"];
const SZENARIO_ARTEN = ["dialog", "pausentest"];
const ICONS = ["essen", "pause", "kommentar", "freund", "leitung", "chat"];
// Zahlen mit Einheit gelten als prüfpflichtige Fakten.
const ZAHL_MIT_EINHEIT = /\d[\d.,]*\s*(Mrd|Milliarde|Million|Mio|Prozent|%|Euro|€)/i;

const ERLAUBT = {
  root: ["version", "bausteine", "szenarien"],
  baustein: ["name", "art", "farbe", "kurz", "kunstgriffe"],
  szenario: ["id", "titel", "ort", "thema", "art", "icon", "gegenueber", "einleitung", "startwerte", "balken", "start", "fakten", "knoten"],
  gegenueber: ["name", "rolle", "typ", "beschreibung"],
  werte: ["vertrauen", "erkenntnis", "anspannung"],
  balken: ["vertrauen", "erkenntnis"],
  fakt: ["id", "text", "stand", "quelle_pruefen", "quelle"],
  knoten: ["id", "sagt", "erzaehler", "optionen", "ende", "sterne", "auswertung"],
  variante: ["text", "anspannung_ab", "anspannung_bis"],
  option: ["text", "bausteine", "bewertung", "effekt", "warum", "reaktion", "weiter", "weiter_bei_anspannung", "fakten"],
  bedingt: ["ab", "ziel"],
  auswertung: ["titel", "gut", "anders", "selbstcheck"],
};

function keys(where, obj, art) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) { err(where, `muss ein Objekt sein`); return false; }
  for (const k of Object.keys(obj)) if (!ERLAUBT[art].includes(k)) err(where, `unbekanntes Feld „${k}“ (Tippfehler?)`);
  return true;
}
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isInt = (v) => Number.isInteger(v);
function needStr(where, obj, k) { if (!isStr(obj[k])) err(where, `„${k}“ fehlt oder ist leer`); }
function inRange(where, v, lo, hi, name) {
  if (!isInt(v)) err(where, `${name} muss eine ganze Zahl sein`);
  else if (v < lo || v > hi) err(where, `${name} = ${v} liegt außerhalb ${lo}…${hi}`);
}

// Varianten: Text vorhanden, Bereiche gültig, und für JEDE Anspannung 0..100 gibt es mind. eine Variante.
function checkVarianten(where, list, { minAnzahl = 2, abdeckung = true } = {}) {
  if (!Array.isArray(list) || list.length === 0) { err(where, `keine Varianten`); return; }
  if (list.length < minAnzahl) err(where, `nur ${list.length} Variante(n), mindestens ${minAnzahl} nötig (damit es nicht auswendig wirkt)`);
  list.forEach((v, i) => {
    const w = `${where}[${i}]`;
    if (!keys(w, v, "variante")) return;
    needStr(w, v, "text");
    if (ZAHL_MIT_EINHEIT.test(v.text ?? "")) err(w, `Zahl mit Einheit in Gegenüber-Text. Zahlen nur in Optionen mit „fakten“-Verweis`);
    if (v.anspannung_ab !== undefined) inRange(w, v.anspannung_ab, 0, 100, "anspannung_ab");
    if (v.anspannung_bis !== undefined) inRange(w, v.anspannung_bis, 0, 100, "anspannung_bis");
    if ((v.anspannung_ab ?? 0) > (v.anspannung_bis ?? 100)) err(w, `anspannung_ab > anspannung_bis`);
  });
  if (abdeckung) {
    const luecken = [];
    for (let a = 0; a <= 100; a++) {
      if (!list.some((v) => (v.anspannung_ab ?? 0) <= a && a <= (v.anspannung_bis ?? 100))) luecken.push(a);
    }
    if (luecken.length) err(where, `keine Variante für Anspannung ${luecken[0]}${luecken.length > 1 ? `…${luecken.at(-1)}` : ""}`);
  }
}

// ---- Laden ----------------------------------------------------------------
let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`✗ ${file} kann nicht gelesen werden: ${e.message}`);
  process.exit(1);
}

keys("root", data, "root");
if (!isInt(data.version)) err("root", "version fehlt");

// ---- Bausteine ------------------------------------------------------------
const bausteine = data.bausteine ?? {};
for (const [id, b] of Object.entries(bausteine)) {
  const w = `baustein ${id}`;
  if (!/^[a-z][a-z0-9_]*$/.test(id)) err(w, "ID nur aus a-z, 0-9 und _");
  if (!keys(w, b, "baustein")) continue;
  needStr(w, b, "name"); needStr(w, b, "kurz");
  if (!BAUSTEIN_ARTEN.includes(b.art)) err(w, `art muss eine von ${BAUSTEIN_ARTEN.join(", ")} sein`);
  if (!/^#[0-9A-Fa-f]{6}$/.test(b.farbe ?? "")) err(w, `farbe muss #RRGGBB sein`);
  if (b.art === "kunstgriff" && !(Array.isArray(b.kunstgriffe) && b.kunstgriffe.length)) err(w, "Kunstgriff ohne Nummern");
}
const farben = Object.values(bausteine).map((b) => b.farbe?.toUpperCase());
const doppelt = farben.filter((f, i) => farben.indexOf(f) !== i);
if (doppelt.length) err("bausteine", `Farben doppelt vergeben: ${[...new Set(doppelt)].join(", ")}`);

// ---- Szenarien --------------------------------------------------------------
const szenarien = Array.isArray(data.szenarien) ? data.szenarien : [];
if (!szenarien.length) err("root", "keine Szenarien");
const szIds = new Set();
const benutzteBausteine = new Set();
const report = [];

for (const s of szenarien) {
  const sw = `szenario ${s?.id ?? "?"}`;
  if (!keys(sw, s, "szenario")) continue;
  for (const k of ["id", "titel", "ort", "thema", "einleitung", "start"]) needStr(sw, s, k);
  if (szIds.has(s.id)) err(sw, "ID doppelt");
  szIds.add(s.id);
  if (!SZENARIO_ARTEN.includes(s.art)) err(sw, `art muss ${SZENARIO_ARTEN.join(" oder ")} sein`);
  if (s.icon !== undefined && !ICONS.includes(s.icon)) err(sw, `icon unbekannt (${ICONS.join(", ")})`);

  if (keys(`${sw}.gegenueber`, s.gegenueber, "gegenueber")) {
    needStr(`${sw}.gegenueber`, s.gegenueber, "name");
    needStr(`${sw}.gegenueber`, s.gegenueber, "rolle");
    const typ = s.gegenueber.typ;
    if (!Array.isArray(typ) || typ.some((t) => ![1, 2, 3].includes(t))) err(`${sw}.gegenueber`, "typ muss eine Liste aus 1, 2, 3 sein (leer = unbekannt)");
  }
  if (keys(`${sw}.startwerte`, s.startwerte, "werte")) {
    for (const k of ERLAUBT.werte) inRange(`${sw}.startwerte`, s.startwerte[k], WERT_MIN, WERT_MAX, k);
  }
  if (s.balken !== undefined && keys(`${sw}.balken`, s.balken, "balken")) {
    for (const k of ERLAUBT.balken) if (s.balken[k] !== undefined) needStr(`${sw}.balken`, s.balken, k);
  }

  // Fakten: Stand und Prüfvermerk sind Pflicht.
  const faktIds = new Set();
  for (const f of s.fakten ?? []) {
    const fw = `${sw}.fakt ${f?.id ?? "?"}`;
    if (!keys(fw, f, "fakt")) continue;
    needStr(fw, f, "id"); needStr(fw, f, "text"); needStr(fw, f, "stand");
    if (f.quelle_pruefen !== true) err(fw, "quelle_pruefen: true fehlt");
    if (faktIds.has(f.id)) err(fw, "ID doppelt");
    faktIds.add(f.id);
  }
  const benutzteFakten = new Set();

  // Knoten
  const knoten = new Map();
  for (const k of s.knoten ?? []) {
    if (knoten.has(k?.id)) err(`${sw}.${k.id}`, "Knoten-ID doppelt");
    knoten.set(k?.id, k);
  }
  if (!knoten.has(s.start)) err(sw, `Startknoten „${s.start}“ existiert nicht`);

  const kanten = new Map(); // id -> [ziel-ids]
  for (const k of knoten.values()) {
    const kw = `${sw}.${k?.id ?? "?"}`;
    if (!keys(kw, k, "knoten")) continue;
    if (!isStr(k.id)) err(kw, "id fehlt");

    if (k.ende) {
      if (k.optionen && k.optionen.length) err(kw, "Endknoten darf keine Optionen haben");
      inRange(kw, k.sterne, 1, 3, "sterne");
      if (k.sagt !== undefined) checkVarianten(`${kw}.sagt`, k.sagt, { minAnzahl: 1 });
      if (keys(`${kw}.auswertung`, k.auswertung, "auswertung")) {
        for (const f of ERLAUBT.auswertung) needStr(`${kw}.auswertung`, k.auswertung, f);
      }
      kanten.set(k.id, []);
      continue;
    }

    if (k.sterne !== undefined || k.auswertung !== undefined) err(kw, "sterne/auswertung nur bei Endknoten");
    // Startknoten braucht Text; sonst ist „sagt“ optional (Reaktion der Option reicht).
    if (k.id === s.start || k.sagt !== undefined) checkVarianten(`${kw}.sagt`, k.sagt);

    const opts = Array.isArray(k.optionen) ? k.optionen : [];
    if (opts.length === 0) err(kw, "Sackgasse: kein Ende und keine Optionen");
    else if (opts.length < OPTIONEN_MIN || opts.length > OPTIONEN_MAX) err(kw, `${opts.length} Optionen, erlaubt sind ${OPTIONEN_MIN} bis ${OPTIONEN_MAX}`);
    if (opts.length && !opts.some((o) => o.bewertung === "gut")) warn(kw, "keine Option mit Bewertung „gut“");

    const ziele = [];
    opts.forEach((o, i) => {
      const ow = `${kw}.optionen[${i}]`;
      if (!keys(ow, o, "option")) return;
      needStr(ow, o, "text"); needStr(ow, o, "warum");
      if (!BEWERTUNGEN.includes(o.bewertung)) err(ow, `bewertung muss ${BEWERTUNGEN.join(" | ")} sein`);
      if (!Array.isArray(o.bausteine) || o.bausteine.length === 0) err(ow, "mindestens ein Baustein nötig");
      for (const b of o.bausteine ?? []) {
        if (!bausteine[b]) err(ow, `unbekannter Baustein „${b}“`);
        benutzteBausteine.add(b);
      }
      if (keys(`${ow}.effekt`, o.effekt, "werte")) {
        for (const kk of ERLAUBT.werte) inRange(`${ow}.effekt`, o.effekt[kk], -EFFEKT_MAX, EFFEKT_MAX, kk);
      }
      checkVarianten(`${ow}.reaktion`, o.reaktion);

      for (const f of o.fakten ?? []) {
        if (!faktIds.has(f)) err(ow, `Fakt „${f}“ existiert nicht`);
        benutzteFakten.add(f);
      }
      if ((ZAHL_MIT_EINHEIT.test(o.text ?? "") || ZAHL_MIT_EINHEIT.test(o.warum ?? "")) && !(o.fakten ?? []).length) {
        err(ow, "Zahl mit Einheit ohne „fakten“-Verweis (stand + quelle_pruefen nötig)");
      }

      if (!isStr(o.weiter)) err(ow, "weiter fehlt");
      else if (!knoten.has(o.weiter)) err(ow, `weiter → „${o.weiter}“ existiert nicht`);
      else ziele.push(o.weiter);
      if (o.weiter_bei_anspannung !== undefined) {
        const b = o.weiter_bei_anspannung;
        if (keys(`${ow}.weiter_bei_anspannung`, b, "bedingt")) {
          inRange(`${ow}.weiter_bei_anspannung`, b.ab, 0, 100, "ab");
          if (!knoten.has(b.ziel)) err(ow, `weiter_bei_anspannung → „${b.ziel}“ existiert nicht`);
          else ziele.push(b.ziel);
        }
      }
    });
    kanten.set(k.id, ziele);
  }

  for (const f of faktIds) if (!benutzteFakten.has(f)) warn(sw, `Fakt „${f}“ wird nirgends verwendet`);

  // Erreichbarkeit
  const erreichbar = new Set();
  const stapel = knoten.has(s.start) ? [s.start] : [];
  while (stapel.length) {
    const id = stapel.pop();
    if (erreichbar.has(id)) continue;
    erreichbar.add(id);
    for (const z of kanten.get(id) ?? []) stapel.push(z);
  }
  for (const id of knoten.keys()) if (!erreichbar.has(id)) err(`${sw}.${id}`, "Knoten ist vom Start aus nicht erreichbar");

  // Schleifen: Jeder Pfad muss ein Ende erreichen → Graph muss kreisfrei sein.
  const farbe = new Map(); // 0 weiß, 1 grau, 2 schwarz
  let zyklus = null;
  const dfs = (id, pfad) => {
    farbe.set(id, 1);
    for (const z of kanten.get(id) ?? []) {
      if (zyklus) return;
      if (farbe.get(z) === 1) { zyklus = [...pfad, id, z]; return; }
      if (!farbe.get(z)) dfs(z, [...pfad, id]);
    }
    farbe.set(id, 2);
  };
  if (knoten.has(s.start)) dfs(s.start, []);
  if (zyklus) err(sw, `Schleife gefunden: ${zyklus.slice(zyklus.indexOf(zyklus.at(-1))).join(" → ")} (ein Pfad würde nie enden)`);

  // Pfadstatistik (nur wenn kreisfrei)
  if (!zyklus && knoten.has(s.start) && errors.length === 0) {
    const memo = new Map();
    const stat = (id) => {
      if (memo.has(id)) return memo.get(id);
      const k = knoten.get(id);
      let r;
      if (k.ende) r = { pfade: 1, min: 0, max: 0, enden: new Set([id]) };
      else {
        r = { pfade: 0, min: Infinity, max: 0, enden: new Set() };
        for (const z of new Set(kanten.get(id))) {
          const c = stat(z);
          r.pfade += c.pfade; r.min = Math.min(r.min, c.min + 1); r.max = Math.max(r.max, c.max + 1);
          c.enden.forEach((e) => r.enden.add(e));
        }
      }
      memo.set(id, r);
      return r;
    };
    const st = stat(s.start);
    if (st.max > MAX_SCHRITTE) err(sw, `längster Pfad hat ${st.max} Schritte (max. ${MAX_SCHRITTE})`);
    if (s.art === "dialog" && st.max < MIN_LAENGSTER_PFAD_DIALOG) warn(sw, `längster Pfad nur ${st.max} Schritte (Ziel: etwa 6 bis 10)`);
    const endKnoten = [...knoten.values()].filter((k) => k.ende);
    if (!endKnoten.some((k) => k.sterne === 3)) err(sw, "kein Ende mit 3 Sternen");
    if (s.art === "pausentest") {
      const ok = endKnoten.some((k) => k.sterne === 3) &&
        [...knoten.values()].some((k) => (k.optionen ?? []).some((o) => (o.bausteine ?? []).includes("pausentest") && knoten.get(o.weiter)?.sterne === 3));
      if (!ok) err(sw, "Pausentest: Es muss eine Option mit Baustein „pausentest“ direkt zu einem 3-Sterne-Ende führen");
    }
    report.push(`  ✓ ${s.id.padEnd(22)} ${String(knoten.size).padStart(2)} Knoten · ${String(st.pfade).padStart(4)} Pfade · ${st.min}–${st.max} Schritte · ${st.enden.size} Enden`);
  }
}

for (const id of Object.keys(bausteine)) {
  if (!benutzteBausteine.has(id) && bausteine[id].art !== "kunstgriff") warn(`baustein ${id}`, "wird in keinem Szenario verwendet");
}

// ---- Ausgabe ----------------------------------------------------------------
console.log(`Prüfe ${file}`);
if (report.length) console.log(report.join("\n"));
if (warnings.length) console.log("\nHinweise:\n" + warnings.join("\n"));
if (errors.length) {
  console.error(`\n${errors.length} Fehler:\n` + errors.join("\n"));
  process.exit(1);
}
console.log(`\nAlles grün: ${szenarien.length} Szenarien, ${Object.keys(bausteine).length} Bausteine.`);
