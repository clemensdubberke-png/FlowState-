# Blitzeblank – Putzplan für die ganze Familie

Eine installierbare Web-App (PWA) für Android, iPhone und PC. Sie läuft komplett im Browser und braucht keinen App-Store.

## Funktionen

| Bereich | Was die App kann |
|---|---|
| **Erster Start** | Die App startet leer. Ihr wählt per Schieberegler die Putz-Intensität (Sehr locker → Intensiv), und Schmuddel reagiert live darauf. Danach legt ihr Bereiche an. |
| **Aufgaben-Katalog** | Pro Bereich wählt ihr passende Aufgaben aus dem Katalog (oder aus allen anderen Räumen) oder legt eigene an. Die vorgeschlagene Frequenz richtet sich nach der Intensität und lässt sich vor dem Hinzufügen und jederzeit danach anpassen. Ändert ihr die Intensität später, werden nur Frequenzen angepasst, die ihr nicht selbst geändert habt. |
| **Bereiche** | Raum-Kacheln mit Illustration, Farbe und Ampel-Punkt (rot / orange / gelb / grün). Je schmutziger ein Raum, desto mehr Flecken sind auf der Kachel. 13 Innenräume und 5 Außenbereiche als Vorlage. |
| **Aufgaben** | Zustandsbalken pro Aufgabe („Heute fällig“, „Fällig in 6 Tg.“, „Überfällig seit 2 Tg.“), Rhythmus in Tagen, Wochen oder Monaten, „Jederzeit“-Aufgaben mit Zähler, Aufwand (Leicht / Mittel / Schwer), Notizen, Zustand manuell setzen, „Morgen erinnern“, Verlauf. Über 130 vorgeschlagene Aufgaben. |
| **Aufgaben-Manager** | Alle Rhythmen auf einen Blick mit +/−, sortiert nach Frequenz, Name oder Fälligkeit. |
| **Heute** | Alle fälligen Aufgaben aus allen Räumen mit Schnell-Abhaken, „Bald fällig“, „Heute erledigt“ und einem Filter „Meine“. |
| **Putz-Timer** | 5–45 Minuten Countdown mit den gerade fälligen Aufgaben, Ton, Vibration und Benachrichtigung. |
| **Personen** | Mehrere Personen, „Dieses Gerät gehört …“, **FairShare** (Soll- und Ist-Verteilung, schlägt automatisch vor, wer dran ist), **Zuständigkeit** mit **Rotation**. |
| **Schmuddel** | Monatliches Rennen gegen das Schmutz-Monster: Schwierigkeit Leicht / Normal / Schwer, Monatsziel automatisch oder fest, freche Kommentare, Pokal-Historie. |
| **Kindermodus** | Große Bild-Karten, Schritt-für-Schritt-Listen (z. B. *Kinderzimmer aufräumen*: Spielzeug in die Kisten → Bücher ins Regal → …), Vorlesen per Lautsprecher-Knopf, Sterne, Belohnungsziele, Konfetti. Verlassen nur mit einer Rechenaufgabe. |
| **Urlaubsmodus** | Friert alle Zustände ein und verschiebt beim Beenden alles um die Urlaubsdauer. |
| **Statistik** | Punkte pro Woche, Verteilung nach Personen und Bereichen, häufigste Aufgaben. |
| **Synchronisation** | Mehrere Handys teilen einen Haushalt (Firebase). Neue Geräte verbindet ihr per Einladungslink. Funktioniert auch offline. |
| **Daten** | Export und Import als JSON, Zurücksetzen. |

## Starten

**Lokal testen:**

```bash
cd haushalt
python3 -m http.server 8080
# → http://localhost:8080
```

**Online (GitHub Pages):** Der Workflow `.github/workflows/pages.yml` veröffentlicht die App unter
`https://<github-name>.github.io/<repo>/haushalt/`. So aktivierst du es:

1. Auf GitHub: *Settings → Pages → Source: GitHub Actions*.
2. Den Branch nach `main` mergen (oder den Workflow manuell starten).

**Aufs Handy holen:** Die Seite in Chrome öffnen → Menü ⋮ → *Zum Startbildschirm hinzufügen*. Danach verhält sie sich wie eine normale App.

## Zwei Handys verbinden (einmalig, ca. 5 Minuten)

1. In der App: *Einstellungen → Synchronisation*. Dort steht eine Schritt-für-Schritt-Anleitung für ein kostenloses Firebase-Projekt (Firestore + anonyme Anmeldung).
2. Den `firebaseConfig`-Block einfügen und auf *Haushalt erstellen & verbinden* tippen.
3. Den angezeigten **Einladungslink** an das zweite Handy schicken und dort öffnen. Danach seht ihr auf beiden Geräten denselben Stand.
4. Auf jedem Handy unter *Dieses Gerät gehört* die eigene Person wählen.

Die Daten liegen unter `households/<zufälliger Code>/…`. Jede Aufgabe, jede Erledigung und jede Person ist ein eigenes Dokument. Gleichzeitige Änderungen auf zwei Handys überschreiben sich deshalb nicht gegenseitig.

## Technik

- Reines HTML, CSS und JavaScript (ES-Module), kein Build-Schritt.
- `js/store.js`: lokale Daten (localStorage), pro Dokument „last write wins“.
- `js/sync.js`: Firestore-Echtzeit-Sync mit Offline-Cache.
- `js/logic.js`: Fälligkeit, Zustand, Punkte, Rennen, FairShare, Rotation, Urlaub.
- `js/templates.js`: Aufgaben-Vorlagen, Kinder-Schritte und Monster-Sprüche.
- `js/art.js`: alle Illustrationen und das Monster als SVG (eigene Zeichnungen).
- `sw.js`: HTML, JS und CSS laden network-first, damit Updates sofort ankommen. Bilder kommen cache-first.

## Android-APK und Updates

Jede Änderung an `haushalt/` oder `haushalt-android/` baut per GitHub Actions eine neue APK. Ist der feste Signatur-Schlüssel hinterlegt, wird sie als Release veröffentlicht und installiert sich als Update über die alte Version. Die Daten bleiben dabei erhalten.

Der Schlüssel liegt als Repository-Secret in GitHub (*Settings → Secrets and variables → Actions*):

| Secret | Inhalt |
|---|---|
| `BLITZEBLANK_KEYSTORE_BASE64` | Keystore-Datei (`blitzeblank-release.jks`), Base64-kodiert |
| `BLITZEBLANK_KEYSTORE_PASSWORD` | Passwort des Keystores |

**Wichtig:** Bewahrt die Keystore-Datei und das Passwort gut auf (z. B. im Passwort-Manager). Geht der Schlüssel verloren, lassen sich keine Updates mehr über die installierte App spielen. Ohne Secrets wird bei jedem Build ein neuer, temporärer Schlüssel verwendet. Dann muss die alte App vor dem Installieren deinstalliert werden.
