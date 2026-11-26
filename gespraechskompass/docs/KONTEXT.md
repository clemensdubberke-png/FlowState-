# Gesprächskompass – Kontext

Diese Datei hält fest, worum es in diesem Projekt geht, damit künftige Sitzungen
direkt anknüpfen können. Neue Entscheidungen bitte unten unter „Entscheidungen“ ergänzen.

## Hintergrund

Ich (Clemens, Pädagoge im Hort) will lernen, in politischen und persönlichen Debatten gelassen und wirksam zu reagieren, vor allem wenn mein Gegenüber Falschinformationen aus Social Media übernommen hat. Ausgangspunkt war die Behauptung „Die Ukraine nimmt uns aus, dafür wird an der Rente gespart“. Faktenlage (Stand Haushalt 2026, vor Verwendung prüfen): Ukraine-Hilfe etwa 11,5 Mrd. Euro, Bundeszuschuss zur Rente etwa 127,8 Mrd. Euro; ein belegter Zusammenhang „Rente wird für die Ukraine gekürzt“ wurde von Faktencheckern nicht gefunden; wahr ist, dass die Hilfe hoch ist und man über Prioritäten streiten darf.

Mein Diskussions-Coach (Skill „schopenhauer-diskussionscoach“) hat diese Bausteine:
- Pausentest: „Ändert sich etwas Wichtiges, wenn der andere mich zu 100 % versteht?“ Nein: nicken, „Interessanter Blickwinkel“, Energie sparen.
- Typen (nur Arbeitshypothese, keine Schublade): 1 selbstsicher, aber oberflächlich informiert; 2 emotional gebunden (Angst, Gruppengefühl, jeder Fakt wirkt wie ein Angriff); 3 Machtgefälle (Chef, Leitung); Mischformen möglich.
- Züge: Gesprächsöffner („Wie bist du zu dem Schluss gekommen?“, zuhören, „Ich kenne dazu einen anderen Punkt, darf ich ihn zeigen?“); bei Typ 2 erst Gefühl ansprechen („Das klingt, als machst du dir Sorgen. Was beunruhigt dich konkret?“), Fakten später; bei Typ 1 die sachliche Absurd-Frage (Behauptung ernst nehmen, als Frage formulieren, was daraus folgen müsste, die Person zieht den Schluss selbst, Ausweg lassen; die Folgerung muss wirklich folgen); bei Typ 3 das Trojanische Pferd (kleiner befristeter Test mit vorher vereinbartem Maßstab).
- Street Epistemology: Behauptung wiederholen, Begriffe klären, Sicherheit 0 bis 100 erfragen, Weg dorthin erfragen, Quelle prüfen („Woran würdest du merken, dass sie falsch liegt?“), bedanken.
- Fakt-Sandwich: Fakt zuerst, Mythos kurz, warum er trügt, Fakt wiederholen plus Alternativerklärung.
- Wahren Kern zugeben, Gegenbeispiel bei „die alle“.
- Ausstieg: „Ich glaube, wir drehen uns im Kreis. Lassen wir es für heute dabei.“ Keine letzte Spitze.
- Selbstcheck: Was müsste ich hören, damit ich meine Meinung ändere? Hat er einen Punkt?
- Warnliste Manipulation (Kunstgriffe aus Schopenhauers Eristischer Dialektik): Strohmann/Erweiterung (1, 23, 24), Wortspiel (2), Verallgemeinern (3, 11, 19), Zirkel (6, 22), Fragenflut (7, 9), Wütend machen (8, 27), Siegbehauptung (14), Ad hominem (16, 38), Ablenken (18, 29), Publikum (28), Autorität ohne Quelle (30), Etikett (32), „nur Theorie“ (33), Gefühl statt Gründe (35), Wortschwall (36), ein schwacher Beleg widerlegt alles (37).
- Regeln: ehrlich statt gefällig; Techniken sind zum Entschärfen und Verstehen da, nicht zum Bloßstellen; keine Ironie oder Absurd-Fragen gegen Kinder (6 bis 12); keine identifizierenden Angaben zu echten Kindern oder Personen im Spiel.

## Entscheidungen

### 2026-11-26 – Version 1 (Dialog-Duell)
- **Technik:** Native Android-App in **Kotlin + Jetpack Compose (Material 3)** statt der
  ursprünglich geplanten Web-App mit Capacitor. Grund: Clemens wünschte ausdrücklich den
  Aufbau, der für eine vollständige, grafisch ansprechende Android-App am besten passt.
  Vorteile: flüssige Animationen, native Zurück-Taste, Splash-API, Statusleiste, kein WebView.
- **Ablage:** eigener Ordner `gespraechskompass/` im Repo `FlowState-` (eigenständiges
  Gradle-Projekt, kann jederzeit in ein eigenes Repo umziehen).
- **Paketname:** `de.clemens.gespraechskompass`, minSdk 26, targetSdk 35.
- **Inhalte bleiben Daten:** `data/scenarios.json` ist die einzige Quelle. Gradle bindet
  den Ordner `data/` direkt als Android-Assets ein, es gibt keine Kopie im Code.
- **Prüfung:** `node scripts/validate-scenarios.mjs` (keine Abhängigkeiten). Der Git-Hook
  `scripts/pre-commit` ruft das Skript vor jedem Commit auf (Installation siehe README).
  Zusätzlich lädt ein JVM-Unit-Test die JSON mit den echten Kotlin-Modellen.
- **Spielwerte:** Vertrauen und Erkenntnis sichtbar (0–100), Anspannung versteckt (0–100).
  Die Anspannung *vor* einer Antwort bestimmt, welche Reaktionsvariante das Gegenüber
  zeigt. Optional kann eine Option je nach Anspannung zu einem anderen Knoten führen.
- **Sterne:** Jeder Endknoten legt 1–3 Sterne fest (Autorenurteil). Liegt der erste Balken
  (Vertrauen, im Pausentest „Energie“) am Ende unter 35, gibt es einen Stern weniger
  (mindestens 1). Im Pausentest bringt Aussteigen 3 Sterne.
- **Balken umbenennbar:** Ein Szenario kann die Balken umbenennen (`balken`). Der Pausentest
  nutzt „Energie“ und „Klarheit“, weil es dort nicht ums Gegenüber geht.
- **Signatur:** `signing/debug.keystore` ist ein fester, *öffentlicher* Debug-Schlüssel
  (Passwort „android“). So sind lokale und GitHub-Builds gleich signiert, und jede neue
  Debug-APK installiert sich über die alte. Der Release-Schlüssel liegt nie im Repo
  (siehe `docs/RELEASE.md`).
- **Build:** lokal mit JDK 21 und Android SDK 35. Zusätzlich baut der Workflow
  `.github/workflows/gespraechskompass-apk.yml` bei jedem Push die APK als Artefakt.
- **Begriff Bürgergeld:** Im Szenario „Die alle“ spricht der Kollege umgangssprachlich vom
  „Bürgergeld“. Das Bürgergeld wird bzw. wurde zur „Neuen Grundsicherung“ umgebaut,
  deshalb den Begriff und die Fakten vor Verwendung prüfen.
- **Bewertung je Option:** `gut`, `teils` oder `ungünstig`. Sie steuert die Farbe der
  Rückmeldung und die Auswertung („Was gut lief“, „Beim nächsten Mal“).
- **Antwortreihenfolge** wird pro Knoten gemischt, damit man nicht nach Position lernt.
- **Fortschritt** (beste Sterne je Szenario, zuletzt gespielt) lokal per Jetpack DataStore.
- **Zahlen** in Texten nur mit Verweis auf einen Eintrag in `fakten` (mit `stand` und
  `quelle_pruefen: true`). Das Prüfskript erzwingt das.
- **Schriften:** Lexend (Überschriften) und Source Sans 3 (Text), OFL-lizenziert, lokal in
  `res/font`. Lizenztexte in `licenses/`.
- **Spielmodi** sind eigene Module unter `modes/` und melden sich in `ModeRegistry` an.
  Geplant: Trick-Detektiv, Pausentest-Blitz, Nachbesprechung, Satz-Werkstatt,
  optional KI-Gegenüber (online, nicht in v1).
- **Nicht in v1:** KI-Modus, Online-Funktionen, Konten, Werbung, Tracking, Play Store.
  Die App fordert keine Internet-Berechtigung an.

### 2026-11-26 – Version 1.1 (realistischere Dialoge)
Wunsch von Clemens: Fehler sollen realistisch nachwirken. Wer mit etwas Kränkendem startet,
soll das Gespräch nicht mit dem nächsten guten Zug sofort retten können. Die Dialoge sollen so
klingen, wie Menschen in solchen Lagen wirklich argumentieren. Recherche: `docs/RECHERCHE.md`.

Seine Entscheidungen:
- **Strenge „Mittel“:**
  - Eine versteckte **Kränkung** (Pausentest: „Verbissenheit“) entsteht durch kränkende Antworten: `kraenkt` 1 = leicht, 2 = schwer.
  - Solange sie besteht, wirken gute Züge gedämpft (Faktor 1/(1+0,6·K)), und Fehler wiegen schwerer (1+0,25·K).
  - Sie klingt langsam ab: −0,5 je guter, −0,25 je teils guter Antwort, −1 zusätzlich bei einem ehrlichen Eingeständnis (`repariert`).
  - Ab einer Kränkung von 3,5 kippt das Gespräch zum `kipp_ende`.
  - Ab 2 Kränkungspunkten insgesamt (eine schwere oder zwei leichte) gibt es höchstens 2 Sterne. Ein einzelner kleiner Ausrutscher ist verzeihlich.
- **Asymmetrie:** Vertrauen wächst grundsätzlich langsamer (×0,7), als es verloren geht.
- **Keine Bewertung im Gespräch:**
  - Während des Spiels gibt es nur Reaktionen, weder „Warum“-Karten noch Baustein-Farben noch +/−-Zahlen. Die Balken bewegen sich weiter wie ein Stimmungsbarometer.
  - Die Auswertung fasst das Gespräch chronologisch zusammen: was das Gegenüber gesagt hat, deine Antwort, die Bewertung mit Begründung, wo eine Kränkung ausgelöst wurde oder nachgewirkt hat, ein Eingeständnis, das Kippen und eine stärkere Alternative.
- **Ton:** alltagsnah. Rau nur, wo es zur Figur passt (Kommentarspalte), ohne Hetze gegen Gruppen.
- **Länge:** Dialoge haben 8 bis 12 Schritte (Prüfskript: längster Pfad ≥ 8), der Pausentest bleibt kurz.

Neue Datenfelder: `kraenkt`, `repariert`, `merkt` (das Gegenüber merkt sich etwas), `nur_wenn`
(Option erscheint nur in bestimmter Lage, z. B. Entschuldigung nach einer Kränkung), `falls`
(dieselbe Antwort wirkt je nach Lage anders, z. B. Fakten prallen bei Vertrauen < 45 ab),
Bedingungen in Varianten (`merker`, `vertrauen_ab/bis`, `kraenkung_ab`) für Rückbezüge auf
frühere Fehler, `kipp_ende` und `nachwirkung` je Szenario. Details in `docs/SZENARIEN.md`.

Fakten aktualisiert: Bürgergeld heißt seit 1.7.2026 „Grundsicherungsgeld“. Beim Verbrenner-Aus
ist eine Lockerung auf −90 % vorgeschlagen, aber noch nicht beschlossen.
