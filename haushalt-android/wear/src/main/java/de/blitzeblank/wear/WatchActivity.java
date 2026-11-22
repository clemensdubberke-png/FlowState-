package de.blitzeblank.wear;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import com.google.android.gms.wearable.DataItem;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.Wearable;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.DateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/** Blitzeblank on the watch: cleaning timer + focus and due tasks, synced with the phone app. */
public class WatchActivity extends Activity {
    private static final int ORANGE = Color.parseColor("#ff9500");
    private static final int BLUE = Color.parseColor("#1677f2");
    private static final int CARD = Color.parseColor("#1b2a3b");
    private static final int MUTED = Color.parseColor("#9fb3c8");

    private final Handler ui = new Handler(Looper.getMainLooper());
    private ScrollView scroll;
    private LinearLayout col;
    private TimerRing ring;
    private LinearLayout controls, minutesRow, lists;
    private TextView primary, minutesText;
    private String lastListKey = "";
    private float density;
    private int screenW;

    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            updateRing();
            ui.postDelayed(this, 250);
        }
    };

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        density = getResources().getDisplayMetrics().density;
        screenW = getResources().getDisplayMetrics().widthPixels;

        scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.BLACK);
        scroll.setVerticalScrollBarEnabled(true);
        scroll.setFocusable(true);
        scroll.setFocusableInTouchMode(true);
        scroll.setOnGenericMotionListener((v, ev) -> {
            if (ev.getAction() == MotionEvent.ACTION_SCROLL && ev.isFromSource(InputDevice.SOURCE_ROTARY_ENCODER)) {
                float delta = -ev.getAxisValue(MotionEvent.AXIS_SCROLL)
                        * ViewConfiguration.get(this).getScaledVerticalScrollFactor();
                scroll.scrollBy(0, Math.round(delta));
                return true;
            }
            return false;
        });

        col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL);
        int side = (int) (screenW * 0.11f);
        col.setPadding(side, (int) (screenW * 0.07f), side, (int) (screenW * 0.25f));
        scroll.addView(col, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        ring = new TimerRing(this);
        int ringSize = (int) (screenW * 0.70f);
        LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(ringSize, ringSize);
        rp.gravity = Gravity.CENTER_HORIZONTAL;
        col.addView(ring, rp);
        ring.setOnClickListener(v -> toggle());

        minutesRow = new LinearLayout(this);
        minutesRow.setGravity(Gravity.CENTER);
        minutesRow.addView(roundButton("−", v -> addMinutes(-5)));
        minutesText = text("15 Min.", 16, Color.WHITE, true);
        minutesText.setPadding(dp(12), 0, dp(12), 0);
        minutesRow.addView(minutesText);
        minutesRow.addView(roundButton("+", v -> addMinutes(5)));
        col.addView(minutesRow, margins(new LinearLayout.LayoutParams(-2, -2), 6, 0));

        controls = new LinearLayout(this);
        controls.setGravity(Gravity.CENTER);
        primary = pill("Start", ORANGE);
        primary.setOnClickListener(v -> toggle());
        controls.addView(primary);
        TextView reset = roundButton("↺", v -> reset());
        reset.setTag("reset");
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-2, -2);
        lp.leftMargin = dp(8);
        controls.addView(reset, lp);
        col.addView(controls, margins(new LinearLayout.LayoutParams(-2, -2), 8, 0));

        lists = new LinearLayout(this);
        lists.setOrientation(LinearLayout.VERTICAL);
        col.addView(lists, new LinearLayout.LayoutParams(-1, -2));

        setContentView(scroll);

        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 3);
        }
        WatchAlarmReceiver.ensureChannel(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        WatchStore.listener = () -> ui.post(this::refresh);
        // catch up with the phone's latest state
        try {
            Uri uri = new Uri.Builder().scheme("wear").path(WatchStore.PATH_STATE).build();
            Wearable.getDataClient(this).getDataItems(uri).addOnSuccessListener(buf -> {
                String newest = null;
                long at = -1;
                for (DataItem item : buf) {
                    com.google.android.gms.wearable.DataMap m = DataMapItem.fromDataItem(item).getDataMap();
                    if (m.getLong("at", 0) > at) {
                        at = m.getLong("at", 0);
                        newest = m.getString("json");
                    }
                }
                buf.release();
                if (newest != null) WatchStore.applyPhoneState(getApplicationContext(), newest);
            });
        } catch (Throwable ignored) {
        }
        refresh();
        scroll.requestFocus();
        ui.post(tick);
    }

    @Override
    protected void onPause() {
        super.onPause();
        WatchStore.listener = null;
        ui.removeCallbacks(tick);
    }

    // ---------- actions ----------
    private void toggle() {
        scroll.performHapticFeedback(HapticFeedbackConstants.CONFIRM);
        JSONObject t = WatchStore.timer(this);
        try {
            if (WatchStore.running(t)) {
                t.put("pausedLeft", WatchStore.remaining(t));
                t.put("endAt", 0);
            } else {
                boolean fresh = !WatchStore.paused(t);
                t.put("endAt", System.currentTimeMillis() + WatchStore.remaining(t));
                t.put("pausedLeft", -1);
                if (fresh) t.put("startedAt", System.currentTimeMillis());
            }
        } catch (Exception ignored) {
        }
        WatchStore.change(this, t);
        refresh();
    }

    private void reset() {
        JSONObject t = WatchStore.timer(this);
        try {
            t.put("endAt", 0);
            t.put("pausedLeft", -1);
            t.put("startedAt", 0);
        } catch (Exception ignored) {
        }
        WatchStore.change(this, t);
        refresh();
    }

    private void addMinutes(int d) {
        JSONObject t = WatchStore.timer(this);
        int m = Math.max(5, Math.min(90, t.optInt("mins", 15) + d));
        try {
            t.put("mins", m);
        } catch (Exception ignored) {
        }
        WatchStore.change(this, t);
        refresh();
    }

    private void toggleFocus(String id) {
        JSONObject t = WatchStore.timer(this);
        JSONArray old = WatchStore.focusIds(this), next = new JSONArray();
        boolean had = false;
        for (int i = 0; i < old.length(); i++) {
            if (id.equals(old.optString(i))) had = true;
            else next.put(old.optString(i));
        }
        if (!had) next.put(id);
        try {
            t.put("focus", next);
        } catch (Exception ignored) {
        }
        WatchStore.change(this, t);
        scroll.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK);
        refresh();
    }

    // ---------- rendering ----------
    private void refresh() {
        JSONObject t = WatchStore.timer(this);
        boolean running = WatchStore.running(t), paused = WatchStore.paused(t);
        if (t.optLong("endAt", 0) > 0 && !running) {
            WatchStore.finishLocally(this);
            t = WatchStore.timer(this);
        }
        minutesRow.setVisibility(running || paused ? View.GONE : View.VISIBLE);
        minutesText.setText(t.optInt("mins", 15) + " Min.");
        primary.setText(running ? "Pause" : paused ? "Weiter" : "Start");
        ((GradientDrawable) primary.getBackground()).setColor(running ? Color.parseColor("#4a5b6e") : ORANGE);
        controls.findViewWithTag("reset").setVisibility(running || paused ? View.VISIBLE : View.GONE);
        renderLists(t);
        updateRing();
    }

    private void updateRing() {
        JSONObject t = WatchStore.timer(this);
        boolean running = WatchStore.running(t);
        if (t.optLong("endAt", 0) > 0 && !running) { refresh(); return; }
        long left = WatchStore.remaining(t);
        long total = t.optInt("mins", 15) * 60000L;
        long s = (left + 999) / 1000;
        ring.time = String.format(java.util.Locale.GERMANY, "%02d:%02d", s / 60, s % 60);
        ring.fraction = total > 0 ? 1f - (float) left / total : 0f;
        ring.label = running ? "Los, los, los!" : WatchStore.paused(t) ? "Pausiert" : "Bereit?";
        ring.invalidate();
    }

    private void renderLists(JSONObject t) {
        JSONObject st = WatchStore.state(this);
        JSONArray due = st != null ? st.optJSONArray("due") : null;
        JSONArray focusRows = st != null ? st.optJSONArray("focus") : null;
        JSONArray focusIds = WatchStore.focusIds(this);
        String key = (st != null ? st.toString() : "") + focusIds + (WatchStore.running(t) || WatchStore.paused(t));
        int done = 0;
        Set<String> fset = new HashSet<>();
        for (int i = 0; i < focusIds.length(); i++) fset.add(focusIds.optString(i));

        // focus rows: from the phone's focus list (has "done"), else from the due list
        JSONArray focus = new JSONArray();
        for (int i = 0; i < focusIds.length(); i++) {
            JSONObject r = find(focusRows, focusIds.optString(i));
            if (r == null) r = find(due, focusIds.optString(i));
            if (r != null) {
                focus.put(r);
                if (r.optBoolean("done")) done++;
            }
        }
        ring.extra = focus.length() > 0 ? "Fokus " + done + "/" + focus.length() : null;
        if (key.equals(lastListKey)) return;
        lastListKey = key;
        lists.removeAllViews();

        if (st == null) {
            lists.addView(note("Öffne Blitzeblank auf dem Handy, dann erscheinen hier deine fälligen Aufgaben."));
            return;
        }
        if (focus.length() > 0) {
            lists.addView(header("FOKUS  " + done + "/" + focus.length()));
            for (int i = 0; i < focus.length(); i++) lists.addView(taskRow(focus.optJSONObject(i), true));
        }
        int rest = 0;
        if (due != null) for (int i = 0; i < due.length(); i++) if (!fset.contains(due.optJSONObject(i).optString("id"))) rest++;
        lists.addView(header(rest > 0 ? "FÄLLIG (" + rest + ")" : "FÄLLIG"));
        if (rest == 0) {
            lists.addView(note(focus.length() > 0 ? "Sonst ist nichts fällig." : "Alles sauber! Schmuddel schmollt in der Ecke."));
        } else {
            lists.addView(note("Tippen = in den Fokus"));
            for (int i = 0; i < due.length(); i++) {
                JSONObject r = due.optJSONObject(i);
                if (!fset.contains(r.optString("id"))) lists.addView(taskRow(r, false));
            }
        }
        long at = WatchStore.prefs(this).getLong("stateAt", 0);
        if (at > 0) lists.addView(note("Stand: " + DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date(at))));
    }

    private static JSONObject find(JSONArray a, String id) {
        if (a == null) return null;
        for (int i = 0; i < a.length(); i++) {
            JSONObject o = a.optJSONObject(i);
            if (o != null && id.equals(o.optString("id"))) return o;
        }
        return null;
    }

    private View taskRow(JSONObject r, boolean inFocus) {
        boolean done = r.optBoolean("done");
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        row.setPadding(dp(12), dp(8), dp(12), dp(9));
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(dp(16));
        bg.setColor(inFocus ? Color.parseColor("#3a2a10") : CARD);
        if (inFocus) bg.setStroke(dp(2), ORANGE);
        row.setBackground(bg);

        TextView name = text((done ? "✓ " : "") + r.optString("name"), 15, done ? Color.parseColor("#7fd36b") : Color.WHITE, false);
        if (done) name.setPaintFlags(name.getPaintFlags() | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
        row.addView(name);
        String sub = r.optString("area");
        String when = done ? "Geschafft!" : r.optString("text");
        TextView meta = text(sub.isEmpty() ? when : sub + " · " + when, 12, MUTED, false);
        row.addView(meta);

        if (!done) {
            FrameLayout bar = new FrameLayout(this);
            GradientDrawable tr = new GradientDrawable();
            tr.setCornerRadius(dp(3));
            tr.setColor(Color.parseColor("#2c3e52"));
            bar.setBackground(tr);
            View fill = new View(this);
            GradientDrawable fd = new GradientDrawable();
            fd.setCornerRadius(dp(3));
            try {
                fd.setColor(Color.parseColor(r.optString("color", "#ff9500")));
            } catch (Exception e) {
                fd.setColor(ORANGE);
            }
            fill.setBackground(fd);
            bar.addView(fill, new FrameLayout.LayoutParams(0, dp(5)));
            row.addView(bar, margins(new LinearLayout.LayoutParams(-1, dp(5)), 5, 0));
            final double f = Math.max(0.06, Math.min(1, r.optDouble("fill", 0.6)));
            bar.post(() -> {
                fill.getLayoutParams().width = (int) (bar.getWidth() * f);
                fill.requestLayout();
            });
        }
        final String id = r.optString("id");
        if (!done) row.setOnClickListener(v -> toggleFocus(id));
        return withMargins(row, 3, 3);
    }

    // ---------- small view helpers ----------
    private int dp(float v) { return Math.round(v * density); }

    private TextView text(String s, float sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        return t;
    }

    private TextView header(String s) {
        TextView t = text(s, 13, ORANGE, true);
        t.setGravity(Gravity.CENTER);
        t.setLetterSpacing(0.08f);
        t.setPadding(0, dp(14), 0, dp(4));
        t.setLayoutParams(new LinearLayout.LayoutParams(-1, -2));
        return t;
    }

    private TextView note(String s) {
        TextView t = text(s, 12, MUTED, false);
        t.setGravity(Gravity.CENTER);
        t.setPadding(dp(4), dp(4), dp(4), dp(4));
        t.setLayoutParams(new LinearLayout.LayoutParams(-1, -2));
        return t;
    }

    private TextView pill(String s, int color) {
        TextView t = text(s, 16, Color.WHITE, true);
        t.setGravity(Gravity.CENTER);
        t.setPadding(dp(22), dp(10), dp(22), dp(10));
        t.setMinWidth(dp(96));
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(24));
        g.setColor(color);
        t.setBackground(g);
        return t;
    }

    private TextView roundButton(String s, View.OnClickListener l) {
        TextView t = text(s, 20, Color.WHITE, true);
        t.setGravity(Gravity.CENTER);
        GradientDrawable g = new GradientDrawable();
        g.setShape(GradientDrawable.OVAL);
        g.setColor(Color.parseColor("#2c3e52"));
        t.setBackground(g);
        t.setWidth(dp(42));
        t.setHeight(dp(42));
        t.setOnClickListener(l);
        return t;
    }

    private LinearLayout.LayoutParams margins(LinearLayout.LayoutParams p, int topDp, int bottomDp) {
        p.topMargin = dp(topDp);
        p.bottomMargin = dp(bottomDp);
        p.gravity = Gravity.CENTER_HORIZONTAL;
        return p;
    }

    private View withMargins(View v, int topDp, int bottomDp) {
        v.setLayoutParams(margins(new LinearLayout.LayoutParams(-1, -2), topDp, bottomDp));
        return v;
    }
}
