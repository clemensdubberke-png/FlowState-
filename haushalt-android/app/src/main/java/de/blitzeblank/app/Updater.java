package de.blitzeblank.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Downloads a newer Blitzeblank APK (GitHub release of this app) and opens Android's installer.
 * Progress is reported to the web app via callback(state, value):
 *   permission · progress (0..100) · install · error (message)
 */
final class Updater {
    interface Callback { void report(String state, String value); }

    private final Activity activity;
    private final Callback cb;
    private String pendingUrl;
    private volatile boolean running;

    Updater(Activity activity, Callback cb) {
        this.activity = activity;
        this.cb = cb;
    }

    /** Only our own GitHub releases may be installed. */
    static boolean allowed(String url) {
        return url != null && url.startsWith("https://github.com/clemensdubberke-png/FlowState-/releases/download/blitzeblank-v");
    }

    void start(String url) {
        if (!allowed(url)) { cb.report("error", "Ungültige Download-Adresse"); return; }
        if (running) return;
        if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
            // Android asks once: "Apps aus dieser Quelle zulassen" – afterwards we continue in onResume()
            pendingUrl = url;
            cb.report("permission", "");
            try {
                activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName())));
            } catch (Exception e) {
                cb.report("error", "Einstellungen konnten nicht geöffnet werden");
            }
            return;
        }
        download(url);
    }

    /** Called from MainActivity.onResume(): continue after the user granted the install permission. */
    void resume() {
        if (pendingUrl == null) return;
        if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
            cb.report("permission-missing", "");
            return;
        }
        String url = pendingUrl;
        pendingUrl = null;
        download(url);
    }

    private void download(String url) {
        running = true;
        new Thread(() -> {
            File dir = new File(activity.getCacheDir(), "updates");
            //noinspection ResultOfMethodCallIgnored
            dir.mkdirs();
            File out = new File(dir, "Blitzeblank-update.apk");
            HttpURLConnection con = null;
            try {
                String current = url;
                // follow redirects (GitHub → objects.githubusercontent.com) manually, https only
                for (int hop = 0; hop < 6; hop++) {
                    con = (HttpURLConnection) new URL(current).openConnection();
                    con.setInstanceFollowRedirects(false);
                    con.setConnectTimeout(15000);
                    con.setReadTimeout(30000);
                    int code = con.getResponseCode();
                    if (code >= 300 && code < 400) {
                        String loc = con.getHeaderField("Location");
                        con.disconnect();
                        if (loc == null || !loc.startsWith("https://")) throw new Exception("Weiterleitung ungültig");
                        current = loc;
                        continue;
                    }
                    if (code != 200) throw new Exception("Download fehlgeschlagen (HTTP " + code + ")");
                    break;
                }
                long total = con.getContentLengthLong();
                long done = 0;
                int lastPct = -1;
                try (InputStream in = con.getInputStream(); OutputStream os = new FileOutputStream(out)) {
                    byte[] buf = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        os.write(buf, 0, n);
                        done += n;
                        if (total > 0) {
                            int pct = (int) (done * 100 / total);
                            if (pct != lastPct) { lastPct = pct; cb.report("progress", String.valueOf(pct)); }
                        }
                    }
                }
                // sanity check: must be Blitzeblank and newer than what is installed
                PackageInfo pi = activity.getPackageManager().getPackageArchiveInfo(out.getAbsolutePath(), 0);
                if (pi == null || !activity.getPackageName().equals(pi.packageName)) throw new Exception("Die Datei ist keine Blitzeblank-App");
                PackageInfo mine = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0);
                long newCode = Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode;
                long myCode = Build.VERSION.SDK_INT >= 28 ? mine.getLongVersionCode() : mine.versionCode;
                if (newCode <= myCode) throw new Exception("Diese Version ist schon installiert");
                cb.report("install", pi.versionName);
                activity.runOnUiThread(() -> openInstaller(out));
            } catch (Exception e) {
                cb.report("error", e.getMessage() == null ? "Unbekannter Fehler" : e.getMessage());
            } finally {
                if (con != null) con.disconnect();
                running = false;
            }
        }).start();
    }

    private void openInstaller(File apk) {
        try {
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".files", apk);
            Intent i = new Intent(Intent.ACTION_VIEW)
                    .setDataAndType(uri, "application/vnd.android.package-archive")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(i);
        } catch (Exception e) {
            cb.report("error", "Installation konnte nicht gestartet werden");
        }
    }
}
