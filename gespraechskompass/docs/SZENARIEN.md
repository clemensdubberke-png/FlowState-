# Szenarien schreiben

Alle Inhalte liegen in `data/scenarios.json`. Nach jeder Änderung:

```bash
node scripts/validate-scenarios.mjs     # oder: npm run validate
```

Der Git-Hook (`scripts/pre-commit`) führt das Skript vor jedem Commit automatisch aus.

## Aufbau

```jsonc
{
  "version": 1,
  "bausteine": {                       // Farben und Kurztexte, auch für den Werkzeugkasten
    "gespraechsoeffner": { "name": "Gesprächsöffner", "art": "zug", "farbe": "#2A9D8F", "kurz": "…" },
    "strohmann": { "name": "Strohmann", "art": "kunstgriff", "kunstgriffe": [1, 23, 24], "farbe": "#C8553D", "kurz": "…" },
    "kontern":   { "name": "Kontern", "art": "stolperfalle", "farbe": "#5F6B7A", "kurz": "…" }
  },
  "szenarien": [{
    "id": "onkel-ukraine",
    "titel": "Das Familienessen",
    "ort": "Sonntagsessen bei der Familie",
    "thema": "„Die Ukraine nimmt uns aus …“",
    "art": "dialog",                    // oder "pausentest"
    "icon": "essen",                    // essen | pause | kommentar | freund | leitung | chat
    "gegenueber": { "name": "Onkel Rainer", "rolle": "…", "typ": [1, 2], "beschreibung": "…" },
    "einleitung": "Szene, die vor dem ersten Satz gezeigt wird.",
    "startwerte": { "vertrauen": 55, "erkenntnis": 10, "anspannung": 55 },
    "balken": { "vertrauen": "Energie", "erkenntnis": "Klarheit" },   // optional, umbenennen
    "start": "k1",
    "fakten": [{ "id": "f_rente", "text": "…", "stand": "Haushalt 2026", "quelle_pruefen": true, "quelle": "…" }],
    "knoten": [
      {
        "id": "k1",
        "sagt": [                                      // Varianten, zufällig gewählt
          { "text": "…", "anspannung_bis": 59 },
          { "text": "…", "anspannung_ab": 60 }
        ],
        "erzaehler": false,                            // true = Erzähltext statt wörtlicher Rede
        "optionen": [{
          "text": "Wie bist du darauf gekommen?",
          "bausteine": ["gespraechsoeffner"],
          "bewertung": "gut",                          // gut | teils | ungünstig
          "effekt": { "vertrauen": 10, "erkenntnis": 5, "anspannung": -10 },
          "warum": "Ein Satz: warum das (nicht) funktioniert, mit Baustein.",
          "reaktion": [                                // direkte Reaktion, je nach Anspannung VOR der Antwort
            { "text": "…", "anspannung_bis": 59 },
            { "text": "…", "anspannung_ab": 60 }
          ],
          "weiter": "k2",
          "weiter_bei_anspannung": { "ab": 70, "ziel": "k_eskalation" },  // optional
          "fakten": ["f_rente"]                        // Pflicht, sobald Zahlen mit Einheit vorkommen
        }]
      },
      {
        "id": "ende_gut", "ende": true, "sterne": 3,
        "sagt": [{ "text": "Schlusssatz" }],
        "auswertung": { "titel": "…", "gut": "…", "anders": "…", "selbstcheck": "…" }
      }
    ]
  }]
}
```

## Realistische Nachwirkung (ab Version 1.1)

```jsonc
// Szenario-Ebene
"kipp_ende": "ende_streit",        // Pflicht bei Dialogen: hierhin kippt das Gespräch ab Kränkung 3,5
"nachwirkung": "Kränkung",         // Name in der Auswertung (Pausentest: "Verbissenheit")

// Option
"kraenkt": 2,                      // 0 nein, 1 leicht (belehren, abwiegeln), 2 schwer (Etikett, Spott, Publikum)
"repariert": true,                 // ehrliches Eingeständnis: senkt bestehende Kränkung zusätzlich um 1
"merkt": ["etikett"],              // das Gegenüber merkt sich etwas → spätere Rückbezüge
"nur_wenn": { "kraenkung_ab": 1 }, // Option erscheint nur in dieser Lage (z. B. Entschuldigung)
"falls": [{                        // gleiche Antwort, andere Wirkung je nach Lage (erster Treffer gilt)
  "wenn": { "vertrauen_bis": 44 },
  "effekt": { "vertrauen": -3, "erkenntnis": 3, "anspannung": 6 },
  "bewertung": "teils",
  "notiz": "Die Fakten waren richtig, aber sie sind abgeprallt …",   // erscheint in der Auswertung
  "reaktion": [ … ],               // optional: andere Reaktion
  "weiter": "…"                    // optional: anderes Ziel
}]

// Bedingungen (in nur_wenn, falls.wenn und in Varianten von sagt/reaktion)
{ "anspannung_ab", "anspannung_bis", "vertrauen_ab", "vertrauen_bis", "kraenkung_ab",
  "merker": ["…"], "ohne_merker": ["…"] }
```

- **Varianten mit Rückbezug** (z. B. `"merker": ["etikett"]`) haben Vorrang vor allgemeinen Varianten.
  Für jede Anspannung muss es trotzdem eine allgemeine Variante geben (Rückfall).
- **Wirkung:**
  - Solange Kränkung K besteht, wirken positive Effekte × 1/(1+0,6·K) und negative × (1+0,25·K).
  - Vertrauen wächst grundsätzlich × 0,7.
  - Die Kränkung sinkt um 0,5 je guter und 0,25 je teils guter Antwort.
- **Sterne:**
  - Der Endknoten legt sie fest.
  - Ab 2 Kränkungspunkten insgesamt gibt es höchstens 2 Sterne.
  - Liegt das Vertrauen am Ende unter 35, gibt es einen Stern weniger.
- **Im Spiel keine Bewertung:** `warum`, `notiz` und Nachwirkungen erscheinen nur in der
  chronologischen Auswertung am Ende.

## Ablauf im Spiel

1. Das Gegenüber sagt den `sagt`-Text des Startknotens (Variante passend zur Anspannung).
2. Du wählst eine von 3 bis 4 Optionen (Reihenfolge wird gemischt).
3. Deine Antwort erscheint, und die Balken ändern sich. Eine Bewertung gibt es erst in der Auswertung.
4. Das Gegenüber reagiert mit einer `reaktion`-Variante (gewählt nach der Anspannung **vor** deiner Antwort).
5. Hat der nächste Knoten einen `sagt`-Text, folgt er (gewählt nach der **neuen** Anspannung).
6. Bei einem Endknoten folgt die Auswertung mit dem chronologischen Gesprächsverlauf.

Ganz in Klammern gesetzte Texte, z. B. `(steht auf und geht)`, werden als Erzählung dargestellt.

## Was das Prüfskript kontrolliert

- Alle Pflichtfelder sind da, und es gibt keine unbekannten Felder (Tippfehler).
- Jede `weiter`- bzw. `ziel`-ID existiert, und jeder Knoten ist vom Start aus erreichbar.
- Keine Sackgassen: Jeder Nicht-Endknoten hat 3 bis 4 Optionen.
- Keine Schleifen, also erreicht jeder Pfad ein Ende. Längster Pfad höchstens 12 Schritte, bei Dialogen mindestens 8.
- Merker, die abgefragt werden, müssen irgendwo gesetzt werden. Eine kränkende Antwort kann nicht „gut“ sein.
- Es sind immer 3 bis 4 Optionen sichtbar (feste plus bedingte). Dialoge brauchen ein `kipp_ende`.
- Werte: Start 0 bis 100, Effekte −30 bis +30, Sterne 1 bis 3.
- Mindestens 2 Formulierungsvarianten je Aussage und Reaktion, und für jede Anspannung 0 bis 100 passt mindestens eine Variante.
- Zahlen mit Einheit (Mrd., %, Euro …) nur in Optionen mit `fakten`-Verweis. Jeder Fakt hat `stand` und `quelle_pruefen: true`.
- Jedes Szenario hat ein 3-Sterne-Ende. Im Pausentest führt eine Pausentest-Option direkt dorthin.
- Bausteinfarben sind eindeutig.

## Schreibregeln

- Realistisch und fair: Positionen so, wie echte Menschen sie vertreten, keine Karikaturen.
- Belohnt wird gutes Gesprächsverhalten, nicht Rechthaben.
- Keine identifizierenden Angaben zu echten Kindern oder Personen.
- Keine Ironie oder Absurd-Fragen gegen Kinder (6 bis 12).
- Zahlen nur, wenn sie prüfbar sind, immer mit `stand` und `quelle_pruefen: true`.
