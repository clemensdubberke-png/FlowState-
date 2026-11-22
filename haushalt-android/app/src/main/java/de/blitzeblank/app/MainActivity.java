package de.blitzeblank.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/www/index.html";
    private static final int FILE_REQUEST = 41;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private static java.lang.ref.WeakReference<MainActivity> current = new java.lang.ref.WeakReference<>(null);

    /** Hands a timer change from the watch to the web app (if it is open). */
    static void deliverWatchTimer(String json) {
        MainActivity a = current.get();
        if (a == null || a.web == null) return;
        final String js = "window.__bbWatchTimer && window.__bbWatchTimer(" + org.json.JSONObject.quote(json) + ")";
        a.runOnUiThread(() -> a.web.evaluateJavascript(js, null));
    }

    @Override
    protected void onResume() {
        super.onResume();
        current = new java.lang.ref.WeakReference<>(this);
        String pending = WearSync.prefs(this).getString("watchTimer", null);
        if (pending != null) deliverWatchTimer(pending);
        try {
            Uri uri = new Uri.Builder().scheme("wear").path(WearSync.PATH_TIMER).build();
            com.google.android.gms.wearable.Wearable.getDataClient(this).getDataItems(uri).addOnSuccessListener(buf -> {
                for (com.google.android.gms.wearable.DataItem item : buf) {
                    String json = com.google.android.gms.wearable.DataMapItem.fromDataItem(item).getDataMap().getString("json");
                    if (json != null) WearSync.handleWatchTimer(this, json);
                }
                buf.release();
            });
        } catch (Throwable ignored) {
        }
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setBarColor("#1677f2");

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#dbf1f5"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (HOST.equals(uri.getHost())) return false;
                openExternal(uri);
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Datei wählen"), FILE_REQUEST);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        current = new java.lang.ref.WeakReference<>(this);
        web.addJavascriptInterface(new Bridge(), "BlitzeblankAndroid");

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int r = tts.setLanguage(Locale.GERMANY);
                ttsReady = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
                if (!ttsReady) ttsReady = tts.setLanguage(Locale.GERMAN) >= 0;
                tts.setSpeechRate(0.95f);
                tts.setPitch(1.6f);
            }
        });

        AlarmReceiver.ensureChannel(this);

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(startUrlFor(getIntent()));
        }
    }

    /** blitzeblank://join/<payload> opens the join screen of the web app. */
    private String startUrlFor(Intent intent) {
        Uri data = intent != null ? intent.getData() : null;
        if (data != null && "blitzeblank".equals(data.getScheme())) {
            String path = data.getHost() != null ? data.getHost() + (data.getPath() != null ? data.getPath() : "") : "";
            if (path.startsWith("join/")) return START_URL + "#/" + path;
        }
        return START_URL;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String url = startUrlFor(intent);
        if (!url.equals(START_URL)) web.loadUrl(url);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.bbBack && window.bbBack()) || false", value -> {
            if (!"true".equals(value)) {
                if (web.canGoBack()) web.goBack();
                else MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_REQUEST && fileCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) result = new Uri[]{data.getData()};
            fileCallback.onReceiveValue(result);
            fileCallback = null;
        }
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }

    private void openExternal(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Kein Programm zum Öffnen gefunden", Toast.LENGTH_SHORT).show();
        }
    }

    private void setBarColor(String hex) {
        try {
            int c = Color.parseColor(hex);
            Window w = getWindow();
            w.setStatusBarColor(c);
            w.setNavigationBarColor(c);
            // light icons on our coloured bars
            View decor = w.getDecorView();
            decor.setSystemUiVisibility(decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        } catch (Exception ignored) {
        }
    }

    private void askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 7);
        }
    }

    /** Methods callable from JavaScript as window.BlitzeblankAndroid.* */
    class Bridge {
        @JavascriptInterface
        public boolean speak(String text) {
            if (tts == null || !ttsReady) return false;
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "bb");
            return true;
        }

        @JavascriptInterface
        public void stopSpeaking() {
            if (tts != null) tts.stop();
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null || !v.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(Math.max(10, ms), VibrationEffect.DEFAULT_AMPLITUDE));
            else v.vibrate(ms);
        }

        @JavascriptInterface
        public void share(String title, String text) {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.putExtra(Intent.EXTRA_TEXT, text);
            runOnUiThread(() -> startActivity(Intent.createChooser(send, title)));
        }

        /** Saves a text file to Downloads and returns a short description of where it went. */
        @JavascriptInterface
        public String saveFile(String name, String content) {
            byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    cv.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) throw new IllegalStateException("insert failed");
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                        if (os == null) throw new IllegalStateException("no stream");
                        os.write(bytes);
                    }
                    return "Downloads/" + name;
                } else {
                    File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    File f = new File(dir, name);
                    try (FileOutputStream os = new FileOutputStream(f)) {
                        os.write(bytes);
                    }
                    return f.getAbsolutePath();
                }
            } catch (Exception e) {
                return "";
            }
        }

        @JavascriptInterface
        public void notify(String title, String body) {
            askNotificationPermission();
            AlarmReceiver.show(MainActivity.this, title, body);
        }

        /** Timer alarm that also fires when the app is in the background (old signature). */
        @JavascriptInterface
        public void scheduleAlarm(double atMillis, String title, String body) {
            scheduleTimer(atMillis, title, body, WearSync.prefs(MainActivity.this).getString("mode", "both"));
        }

        /** Timer alarm with signal mode "sound", "vibrate" or "both". */
        @JavascriptInterface
        public void scheduleTimer(double atMillis, String title, String body, String mode) {
            askNotificationPermission();
            WearSync.prefs(MainActivity.this).edit().putString("mode", mode).apply();
            AlarmReceiver.schedule(MainActivity.this, (long) atMillis, title, body, mode);
        }

        @JavascriptInterface
        public void cancelAlarm() {
            AlarmReceiver.cancel(MainActivity.this);
        }

        /** Short sample of the chosen signal. */
        @JavascriptInterface
        public void previewAlarm(String mode) {
            runOnUiThread(() -> Alarmer.fire(getApplicationContext(), mode, 1500, null));
        }

        /** Sends timer + due tasks to the watch app. */
        @JavascriptInterface
        public void wearSync(String json) {
            WearSync.push(getApplicationContext(), json);
        }

        /** Last timer change made on the watch (JSON) or "". */
        @JavascriptInterface
        public String watchTimer() {
            return WearSync.prefs(MainActivity.this).getString("watchTimer", "");
        }

        /** ElevenLabs text-to-speech without browser CORS limits; answers via window.__bbTts(id, base64). */
        @JavascriptInterface
        public void ttsFetch(String reqId, String apiKey, String voiceId, String jsonBody) {
            new Thread(() -> {
                String b64 = "";
                java.net.HttpURLConnection con = null;
                try {
                    java.net.URL url = new java.net.URL("https://api.elevenlabs.io/v1/text-to-speech/"
                            + java.net.URLEncoder.encode(voiceId, "UTF-8") + "?output_format=mp3_44100_64");
                    con = (java.net.HttpURLConnection) url.openConnection();
                    con.setRequestMethod("POST");
                    con.setConnectTimeout(10000);
                    con.setReadTimeout(20000);
                    con.setDoOutput(true);
                    con.setRequestProperty("xi-api-key", apiKey);
                    con.setRequestProperty("Content-Type", "application/json");
                    con.setRequestProperty("Accept", "audio/mpeg");
                    try (OutputStream os = con.getOutputStream()) { os.write(jsonBody.getBytes(StandardCharsets.UTF_8)); }
                    if (con.getResponseCode() == 200) {
                        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
                        try (java.io.InputStream in = con.getInputStream()) {
                            byte[] buf = new byte[8192]; int n;
                            while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
                        }
                        b64 = android.util.Base64.encodeToString(bos.toByteArray(), android.util.Base64.NO_WRAP);
                    }
                } catch (Exception ignored) {
                } finally {
                    if (con != null) con.disconnect();
                }
                final String js = "window.__bbTts && window.__bbTts('" + reqId.replaceAll("[^A-Za-z0-9]", "") + "','" + b64 + "')";
                runOnUiThread(() -> web.evaluateJavascript(js, null));
            }).start();
        }

        @JavascriptInterface
        public void setBarColor(String color) {
            runOnUiThread(() -> MainActivity.this.setBarColor(color));
        }

        @JavascriptInterface
        public String version() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "";
            }
        }
    }
}
