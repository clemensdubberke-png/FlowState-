package de.blitzeblank.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataItem;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.wearable.WearableListenerService;

import org.json.JSONObject;

/**
 * Phone side of the watch sync (Wearable Data Layer, runs over the Bluetooth link to the watch).
 * Phone writes /bb/state (timer + due tasks), the watch writes /bb/timer (timer changes made on the watch).
 */
public class WearSync extends WearableListenerService {
    static final String PATH_STATE = "/bb/state";
    static final String PATH_TIMER = "/bb/timer";
    static final String TITLE = "Putz-Timer: Zeit um! ⏰";

    static SharedPreferences prefs(Context ctx) { return ctx.getSharedPreferences("bb_wear", Context.MODE_PRIVATE); }

    /** Sends the current state to the watch. */
    static void push(Context ctx, String json) {
        try {
            try {
                String mode = new JSONObject(json).optString("mode", "");
                if (!mode.isEmpty()) prefs(ctx).edit().putString("mode", mode).apply();
            } catch (Exception ignored) {
            }
            PutDataMapRequest r = PutDataMapRequest.create(PATH_STATE);
            r.getDataMap().putString("json", json);
            r.getDataMap().putLong("at", System.currentTimeMillis());
            Wearable.getDataClient(ctx).putDataItem(r.asPutDataRequest().setUrgent());
        } catch (Throwable ignored) {
            // no Google Play services / no watch
        }
    }

    @Override
    public void onDataChanged(DataEventBuffer events) {
        for (DataEvent e : events) {
            if (e.getType() != DataEvent.TYPE_CHANGED) continue;
            DataItem item = e.getDataItem();
            if (!PATH_TIMER.equals(item.getUri().getPath())) continue;
            String json = DataMapItem.fromDataItem(item).getDataMap().getString("json");
            if (json != null) handleWatchTimer(this, json);
        }
    }

    /** A timer change from the watch: keep it for the web app and arm/disarm the phone alarm. */
    static void handleWatchTimer(Context ctx, String json) {
        try {
            JSONObject t = new JSONObject(json);
            long v = t.optLong("v", 0);
            SharedPreferences p = prefs(ctx);
            if (v <= p.getLong("watchV", 0)) return;
            p.edit().putLong("watchV", v).putString("watchTimer", json).apply();
            long endAt = t.optLong("endAt", 0);
            if (endAt > System.currentTimeMillis()) {
                AlarmReceiver.schedule(ctx, endAt, TITLE, "Gestartet auf der Uhr. Schmuddel zittert schon.", p.getString("mode", "both"));
            } else {
                AlarmReceiver.cancel(ctx);
            }
            MainActivity.deliverWatchTimer(json);
        } catch (Exception ignored) {
        }
    }
}
