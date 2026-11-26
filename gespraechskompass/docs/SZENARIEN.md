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

## Ablauf im Spiel

1. Das Gegenüber sagt den `sagt`-Text des Startknotens (Variante passend zur Anspannung).
2. Du wählst eine von 3 bis 4 Optionen (Reihenfolge wird gemischt).
3. Es erscheinen deine Antwort, die Rückmeldung (`warum` und Bausteine) und die Balken ändern sich.
4. Das Gegenüber reagiert mit einer `reaktion`-Variante (gewählt nach der Anspannung **vor** deiner Antwort).
5. Hat der nächste Knoten einen `sagt`-Text, folgt er (gewählt nach der **neuen** Anspannung).
6. Bei einem Endknoten folgt die Auswertung. Die Sterne kommen vom Endknoten, minus 1, wenn der erste Balken unter 35 liegt.

Ganz in Klammern gesetzte Texte, z. B. `(steht auf und geht)`, werden als Erzählung dargestellt.

## Was das Prüfskript kontrolliert

- Alle Pflichtfelder sind da, und es gibt keine unbekannten Felder (Tippfehler).
- Jede `weiter`- bzw. `ziel`-ID existiert, und jeder Knoten ist vom Start aus erreichbar.
- Keine Sackgassen: Jeder Nicht-Endknoten hat 3 bis 4 Optionen.
- Keine Schleifen, also erreicht jeder Pfad ein Ende. Längster Pfad höchstens 12 Schritte, bei Dialogen ein Hinweis unter 6.
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
