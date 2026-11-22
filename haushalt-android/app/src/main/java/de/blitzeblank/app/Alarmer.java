package de.blitzeblank.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

/** Rings and/or vibrates for the timer. mode: "sound", "vibrate" or "both". */
final class Alarmer {
    private Alarmer() {}

    static final long[] PATTERN = {0, 500, 250, 500, 250, 500, 700, 500, 250, 500, 250, 500, 700, 500, 250, 500, 250, 500};
    static final long[] SHORT = {0, 300, 150, 300};

    static boolean sound(String mode) { return !"vibrate".equals(mode); }
    static boolean vibe(String mode) { return !"sound".equals(mode); }

    /** Plays the signal for about durationMs and calls done afterwards (may be null). */
    static void fire(Context ctx, String mode, long durationMs, Runnable done) {
        boolean preview = durationMs < 3000;
        if (vibe(mode)) vibrate(ctx, preview ? SHORT : PATTERN);
        Runnable stop = null;
        if (sound(mode)) stop = ring(ctx);
        final Runnable stopper = stop;
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (stopper != null) stopper.run();
            if (done != null) done.run();
        }, durationMs);
    }

    private static void vibrate(Context ctx, long[] pattern) {
        try {
            Vibrator v;
            if (Build.VERSION.SDK_INT >= 31) {
                VibratorManager vm = (VibratorManager) ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                v = vm != null ? vm.getDefaultVibrator() : null;
            } else {
                v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            }
            if (v == null || !v.hasVibrator()) return;
            AudioAttributes aa = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build();
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(pattern, -1), aa);
            else v.vibrate(pattern, -1, aa);
        } catch (Exception ignored) {
        }
    }

    private static Runnable ring(Context ctx) {
        try {
            Uri u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (u == null) u = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            final Ringtone r = u != null ? RingtoneManager.getRingtone(ctx, u) : null;
            if (r != null) {
                r.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
                if (Build.VERSION.SDK_INT >= 28) r.setLooping(true);
                r.play();
                return r::stop;
            }
        } catch (Exception ignored) {
        }
        try {
            final ToneGenerator tg = new ToneGenerator(AudioManager.STREAM_ALARM, 100);
            tg.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 10000);
            return () -> { tg.stopTone(); tg.release(); };
        } catch (Exception ignored) {
            return null;
        }
    }
}
