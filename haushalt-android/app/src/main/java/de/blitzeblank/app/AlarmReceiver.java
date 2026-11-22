package de.blitzeblank.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AlarmReceiver extends BroadcastReceiver {
    static final String CHANNEL = "blitzeblank_timer";
    /** Silent channel for the timer: sound/vibration are played by Alarmer according to the chosen mode. */
    static final String CHANNEL_TIMER = "blitzeblank_timer_alarm";

    @Override
    public void onReceive(Context context, Intent intent) {
        String mode = intent.getStringExtra("mode");
        if (mode == null) {
            show(context, intent.getStringExtra("title"), intent.getStringExtra("body"));
            return;
        }
        showTimer(context, intent.getStringExtra("title"), intent.getStringExtra("body"));
        final PendingResult pr = goAsync();
        Alarmer.fire(context.getApplicationContext(), mode, 8000, pr::finish);
    }

    static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = ctx.getSystemService(NotificationManager.class);
            if (nm == null) return;
            if (nm.getNotificationChannel(CHANNEL) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "Putz-Timer & Erinnerungen", NotificationManager.IMPORTANCE_HIGH);
                ch.enableVibration(true);
                nm.createNotificationChannel(ch);
            }
            if (nm.getNotificationChannel(CHANNEL_TIMER) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL_TIMER, "Putz-Timer klingelt", NotificationManager.IMPORTANCE_HIGH);
                ch.setSound(null, null);
                ch.enableVibration(false);
                nm.createNotificationChannel(ch);
            }
        }
    }

    private static PendingIntent openApp(Context ctx) {
        Intent open = new Intent(ctx, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void show(Context ctx, String title, String body) {
        ensureChannel(ctx);
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        b.setSmallIcon(R.drawable.ic_notify)
                .setContentTitle(title == null || title.isEmpty() ? "Blitzeblank" : title)
                .setContentText(body == null ? "" : body)
                .setAutoCancel(true)
                .setContentIntent(openApp(ctx));
        if (Build.VERSION.SDK_INT < 26) b.setDefaults(Notification.DEFAULT_ALL).setPriority(Notification.PRIORITY_HIGH);
        try {
            nm.notify(1001, b.build());
        } catch (SecurityException ignored) {
            // notifications not permitted
        }
    }

    static void showTimer(Context ctx, String title, String body) {
        ensureChannel(ctx);
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL_TIMER) : new Notification.Builder(ctx);
        b.setSmallIcon(R.drawable.ic_notify)
                .setContentTitle(title == null || title.isEmpty() ? "Putz-Timer: Zeit um! ⏰" : title)
                .setContentText(body == null ? "" : body)
                .setStyle(new Notification.BigTextStyle().bigText(body == null ? "" : body))
                .setCategory(Notification.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(openApp(ctx));
        try {
            nm.notify(1002, b.build());
        } catch (SecurityException ignored) {
        }
    }

    static PendingIntent timerIntent(Context ctx, String title, String body, String mode) {
        Intent i = new Intent(ctx, AlarmReceiver.class);
        i.putExtra("title", title);
        i.putExtra("body", body);
        if (mode != null) i.putExtra("mode", mode);
        return PendingIntent.getBroadcast(ctx, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void schedule(Context ctx, long at, String title, String body, String mode) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = timerIntent(ctx, title, body, mode);
        if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        } else {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    static void cancel(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(timerIntent(ctx, "", "", null));
    }
}
