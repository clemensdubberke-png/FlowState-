package de.blitzeblank.wear;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Timer + task state on the watch.
 * The phone sends /bb/state (timer, alarm mode, focus and due tasks), the watch sends /bb/timer.
 * Every timer change carries a version "v" (time of the change) – the newer one wins on both sides.
 */
final class WatchStore {
    private WatchStore() {}

    static final String PATH_STATE = "/bb/state";
    static final String PATH_TIMER = "/bb/timer";

    /** Called on the main thread when anything changed (set by the open activity). */
    static Runnable listener;

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("bb_watch", Context.MODE_PRIVATE); }

    static JSONObject timer(Context c) {
        try {
            return new JSONObject(prefs(c).getString("timer", "{\"mins\":15,\"endAt\":0,\"pausedLeft\":-1,\"focus\":[],\"startedAt\":0,\"v\":0}"));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    static JSONObject state(Context c) {
        try {
            String s = prefs(c).getString("state", null);
            return s == null ? null : new JSONObject(s);
        } catch (Exception e) {
            return null;
        }
    }

    static String mode(Context c) {
        JSONObject s = state(c);
        return s != null ? s.optString("mode", "both") : "both";
    }

    static long remaining(JSONObject t) {
        long endAt = t.optLong("endAt", 0);
        if (endAt > 0) return Math.max(0, endAt - System.currentTimeMillis());
        long p = t.optLong("pausedLeft", -1);
        if (p >= 0) return p;
        return t.optInt("mins", 15) * 60000L;
    }

    static boolean running(JSONObject t) { return t.optLong("endAt", 0) > System.currentTimeMillis(); }
    static boolean paused(JSONObject t) { return !running(t) && t.optLong("pausedLeft", -1) >= 0; }

    /** Local change on the watch: save, arm/disarm the alarm and tell the phone. */
    static void change(Context c, JSONObject t) {
        try {
            t.put("v", System.currentTimeMillis());
        } catch (Exception ignored) {
        }
        save(c, t);
        armAlarm(c, t);
        try {
            PutDataMapRequest r = PutDataMapRequest.create(PATH_TIMER);
            r.getDataMap().putString("json", t.toString());
            r.getDataMap().putLong("at", System.currentTimeMillis());
            Wearable.getDataClient(c).putDataItem(r.asPutDataRequest().setUrgent());
        } catch (Throwable ignored) {
        }
    }

    static void save(Context c, JSONObject t) {
        prefs(c).edit().putString("timer", t.toString()).apply();
    }

    /** New state from the phone. */
    static void applyPhoneState(Context c, String json) {
        try {
            JSONObject s = new JSONObject(json);
            prefs(c).edit().putString("state", json).putLong("stateAt", System.currentTimeMillis()).apply();
            JSONObject pt = s.optJSONObject("timer");
            JSONObject mine = timer(c);
            if (pt != null && pt.optLong("v", 0) > mine.optLong("v", 0)) {
                save(c, pt);
                armAlarm(c, pt);
            } else if (running(mine)) {
                armAlarm(c, mine); // the alarm mode may have changed
            }
        } catch (Exception ignored) {
        }
        Runnable l = listener;
        if (l != null) l.run();
    }

    /** Timer ran out (seen by the activity): back to idle without telling the phone, it notices itself. */
    static void finishLocally(Context c) {
        JSONObject t = timer(c);
        try {
            t.put("endAt", 0);
            t.put("pausedLeft", -1);
        } catch (Exception ignored) {
        }
        save(c, t);
    }

    static JSONArray focusIds(Context c) {
        JSONArray a = timer(c).optJSONArray("focus");
        return a != null ? a : new JSONArray();
    }

    // ---------- alarm ----------
    private static PendingIntent alarmIntent(Context c) {
        Intent i = new Intent(c, WatchAlarmReceiver.class);
        return PendingIntent.getBroadcast(c, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void armAlarm(Context c, JSONObject t) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = alarmIntent(c);
        am.cancel(pi);
        long endAt = t.optLong("endAt", 0);
        if (endAt <= System.currentTimeMillis()) return;
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endAt, pi);
            } else {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endAt, pi);
            }
        } catch (SecurityException e) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endAt, pi);
        }
    }
}
