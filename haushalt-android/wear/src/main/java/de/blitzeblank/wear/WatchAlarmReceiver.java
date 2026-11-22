package de.blitzeblank.wear;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import org.json.JSONArray;
import org.json.JSONObject;

/** Timer is up: notification + sound and/or vibration as chosen in the app. */
public class WatchAlarmReceiver extends BroadcastReceiver {
    static final String CHANNEL = "blitzeblank_watch_timer";

    @Override
    public void onReceive(Context context, Intent intent) {
        Context c = context.getApplicationContext();
        WatchStore.finishLocally(c);
        notifyDone(c);
        Runnable l = WatchStore.listener;
        if (l != null) l.run();
        final PendingResult pr = goAsync();
        Alarmer.fire(c, WatchStore.mode(c), 8000, pr::finish);
    }

    static void ensureChannel(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(CHANNEL) != null) return;
        NotificationChannel ch = new NotificationChannel(CHANNEL, "Putz-Timer", NotificationManager.IMPORTANCE_HIGH);
        ch.setSound(null, null);
        ch.enableVibration(false);
        nm.createNotificationChannel(ch);
    }

    private static void notifyDone(Context c) {
        ensureChannel(c);
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        String body = "Schmuddel ist beeindruckt. Ein bisschen.";
        JSONObject s = WatchStore.state(c);
        if (s != null) {
            JSONArray f = s.optJSONArray("focus");
            if (f != null && f.length() > 0) {
                int done = 0;
                for (int i = 0; i < f.length(); i++) if (f.optJSONObject(i) != null && f.optJSONObject(i).optBoolean("done")) done++;
                body = "Fokus: " + done + " von " + f.length() + " geschafft";
            }
        }
        Intent open = new Intent(c, WatchActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification n = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setContentTitle("Zeit um! ⏰")
                .setContentText(body)
                .setCategory(Notification.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(pi)
                .build();
        try {
            nm.notify(2001, n);
        } catch (SecurityException ignored) {
        }
    }
}
