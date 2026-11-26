# Signierte Release-APK (für später)

Die Debug-APK reicht zum Installieren auf dem eigenen Handy. Eine **signierte Release-APK**
ist kleiner, schneller und lässt sich dauerhaft updaten. Wichtig: **Schlüssel und Passwörter
kommen nie ins Repo.** `.gitignore` schließt `*.jks`, `*.keystore` und `keystore.properties` aus.

> Hinweis: Debug- und Release-APK sind unterschiedlich signiert. Beim ersten Wechsel von Debug
> auf Release musst du die Debug-App einmal deinstallieren (der Fortschritt geht dabei verloren).
> Danach installieren sich Release-Updates über die alte Version, solange du **denselben
> Schlüssel** benutzt und `gk.versionCode` erhöhst.

## 1. Schlüssel einmalig erzeugen (lokal, mit JDK)

```bash
keytool -genkeypair -v \
  -keystore ~/gespraechskompass-release.jks \
  -alias gespraechskompass \
  -keyalg RSA -keysize 4096 -validity 10000
```

Bewahre die `.jks`-Datei und die Passwörter sicher auf (z. B. im Passwortmanager plus Backup).
**Wer den Schlüssel verliert, kann keine Updates mehr über die installierte App spielen.**

## 2a. Lokal bauen

Datei `gespraechskompass/keystore.properties` anlegen (wird nicht eingecheckt):

```properties
storeFile=/home/DEINNAME/gespraechskompass-release.jks
storePassword=…
keyAlias=gespraechskompass
keyPassword=…
```

Dann:

```bash
cd gespraechskompass
./gradlew assembleRelease
# → app/build/outputs/apk/release/gespraechskompass-<version>-release.apk
```

## 2b. Über GitHub Actions bauen

Unter *Repository → Settings → Secrets and variables → Actions* vier Secrets anlegen:

| Secret | Inhalt |
| --- | --- |
| `GK_KEYSTORE_BASE64` | `base64 -w0 gespraechskompass-release.jks` |
| `GK_KEYSTORE_PASSWORD` | Store-Passwort |
| `GK_KEY_ALIAS` | `gespraechskompass` |
| `GK_KEY_PASSWORD` | Key-Passwort |

Der Workflow `.github/workflows/gespraechskompass-apk.yml` baut dann zusätzlich eine signierte
Release-APK und legt sie als Artefakt ab. Ohne Secrets baut er nur die Debug-APK.

## Version erhöhen

In `gespraechskompass/gradle.properties`:

```properties
gk.versionCode=2      # muss bei JEDEM Update größer werden
gk.versionName=1.1.0  # sichtbare Versionsnummer
```
