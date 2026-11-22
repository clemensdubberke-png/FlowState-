package de.blitzeblank.wear;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.view.View;

/** Round countdown: orange arc on a dark track, time in the middle. */
public class TimerRing extends View {
    private final Paint track = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint arc = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint big = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint small = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint badge = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF box = new RectF();

    float fraction = 0f;     // 0 = full time left, 1 = over
    String time = "15:00";
    String label = "Bereit?";
    String extra = null;      // e.g. "Fokus 1/3"

    public TimerRing(Context c) {
        super(c);
        float d = getResources().getDisplayMetrics().density;
        track.setStyle(Paint.Style.STROKE);
        track.setStrokeWidth(9 * d);
        track.setColor(Color.parseColor("#26384d"));
        arc.setStyle(Paint.Style.STROKE);
        arc.setStrokeWidth(9 * d);
        arc.setStrokeCap(Paint.Cap.ROUND);
        arc.setColor(Color.parseColor("#ff9500"));
        big.setColor(Color.WHITE);
        big.setTextAlign(Paint.Align.CENTER);
        big.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        big.setFontFeatureSettings("tnum");
        small.setColor(Color.parseColor("#b8cbe0"));
        small.setTextAlign(Paint.Align.CENTER);
        badge.setColor(Color.parseColor("#ff9500"));
        badge.setTextAlign(Paint.Align.CENTER);
        badge.setTypeface(Typeface.DEFAULT_BOLD);
    }

    @Override
    protected void onMeasure(int w, int h) {
        int size = MeasureSpec.getSize(w);
        setMeasuredDimension(size, size);
    }

    @Override
    protected void onDraw(Canvas c) {
        float s = getWidth();
        float pad = track.getStrokeWidth();
        box.set(pad, pad, s - pad, s - pad);
        c.drawArc(box, 0, 360, false, track);
        float sweep = 360f * (1f - Math.max(0f, Math.min(1f, fraction)));
        if (sweep > 0.5f) c.drawArc(box, -90, sweep, false, arc);
        big.setTextSize(s * 0.23f);
        small.setTextSize(s * 0.085f);
        badge.setTextSize(s * 0.08f);
        float cy = s / 2f;
        c.drawText(time, s / 2f, cy + s * 0.06f, big);
        c.drawText(label, s / 2f, cy + s * 0.19f, small);
        if (extra != null) c.drawText(extra, s / 2f, cy - s * 0.2f, badge);
    }
}
