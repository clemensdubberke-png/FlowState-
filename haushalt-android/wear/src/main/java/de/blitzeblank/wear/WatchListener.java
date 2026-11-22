package de.blitzeblank.wear;

import android.os.Handler;
import android.os.Looper;

import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataItem;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.WearableListenerService;

/** Receives the phone's state (timer + due tasks), also when the watch app is closed. */
public class WatchListener extends WearableListenerService {
    @Override
    public void onDataChanged(DataEventBuffer events) {
        for (DataEvent e : events) {
            if (e.getType() != DataEvent.TYPE_CHANGED) continue;
            DataItem item = e.getDataItem();
            if (!WatchStore.PATH_STATE.equals(item.getUri().getPath())) continue;
            final String json = DataMapItem.fromDataItem(item).getDataMap().getString("json");
            if (json != null) new Handler(Looper.getMainLooper()).post(() -> WatchStore.applyPhoneState(getApplicationContext(), json));
        }
    }
}
