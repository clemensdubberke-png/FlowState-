# FlowState — Web App

Komplette FlowState-App als reine Web-App. Läuft direkt im Chrome auf dem
Pixel 8 Pro und kann als PWA auf den Homescreen installiert werden.

## So benutzt du sie

### Variante A — direkt vom Handy öffnen (kein Server nötig)
1. Lade `index.html` aufs Phone (z.B. via Drive, Email, USB)
2. Öffne die Datei im Chrome → die App läuft sofort
3. Hinweis: PWA-Install und Service-Worker funktionieren nicht über
   `file://` — für vollen Offline-Modus brauchst du Variante B.

### Variante B — als PWA installieren (empfohlen)
Du brauchst einen kleinen HTTPS- (oder localhost-) Server. Drei Wege:

**1. GitHub Pages**
- Pushe das `web/`-Verzeichnis in einen Repo-Branch namens `gh-pages`
- Aktiviere Pages in den Repo-Settings → URL aufrufen → ⋮ → „Zum
  Startbildschirm hinzufügen"

**2. Netlify / Vercel / Cloudflare Pages (drag & drop)**
- Ziehe den `web/`-Ordner auf https://app.netlify.com/drop
- URL teilen / im Browser öffnen → installieren

**3. Lokal mit Python (zum Testen am Computer)**
```bash
cd web
python3 -m http.server 8080
```
Dann http://localhost:8080 aufrufen.

### Auf dem Pixel 8 Pro installieren
Wenn die App über HTTPS oder localhost läuft:
1. Chrome → ⋮ Menü → „App installieren" / „Zum Startbildschirm hinzufügen"
2. App startet jetzt im Vollbild ohne Browser-UI
3. Funktioniert offline (Service Worker cached alles)

## Features

Alle Kern-Features der Android-App:

- ✓ Timer mit Presets 10/15/25/45/60 Min
- ✓ Intention setzen
- ✓ Routinen (Fokus/Pause-Sequenzen) mit DnD-Reihenfolge & Swipe-Aktionen
- ✓ XP-System mit Streak-Multiplikator (1.0/1.2/1.4/1.6/2.0)
- ✓ Streak-Tracking + automatischer Streak-Schutz
- ✓ 6 Levels mit freischaltbaren Klanglandschaften
- ✓ Daily Quests (1–3 pro Tag, automatisch generiert)
- ✓ Flow-Score (wöchentlich)
- ✓ Trophäenschrank (10 Trophäen)
- ✓ Inventar mit Streak-Schutz
- ✓ Wöchentliches Momentum (Bar-Chart)
- ✓ Pfad zur Meisterschaft (Mastery-Path)
- ✓ Komplette deutsche UI, Dark-only Design (Lila/Violett)
- ✓ Klanglandschaften via Web Audio API (procedural — kein Asset-Download)
- ✓ Wake Lock API (Bildschirm bleibt an)
- ✓ Vibration API (haptisches Feedback)
- ✓ Wahrgewählte Klanglandschaft pausiert/duckt bei Pause-Schritt
- ✓ Voll offline-fähig (LocalStorage + Service Worker)

## Web-Limitierungen vs. Native

Funktionen, die im Browser technisch nicht gehen, sind in der Settings-UI
sichtbar aber als „im Browser nicht verfügbar" gekennzeichnet:
- App-Whitelist / Fokus-Schild (echtes Blockieren anderer Apps)
- System-DND/Medien-stummschaltung
- Floating-Timer als System-Overlay
- Wear-OS-Sync

Für diese benötigst du die native App im `app/` und `wear/` Ordner.

## Daten & Privacy

- 100% lokal — keine Server, kein Tracking
- Daten in `localStorage` unter dem Schlüssel `flowstate.v1`
- Reset über Einstellungen → Personalisierung → „Alle Daten zurücksetzen"
