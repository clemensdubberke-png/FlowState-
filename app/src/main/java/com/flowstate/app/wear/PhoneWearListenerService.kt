package com.flowstate.app.wear

import com.flowstate.app.service.TimerForegroundService
import com.flowstate.core.sync.WearableKeys
import com.flowstate.core.sync.WearablePaths
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import dagger.hilt.android.AndroidEntryPoint
import org.json.JSONObject

@AndroidEntryPoint
class PhoneWearListenerService : WearableListenerService() {

    override fun onMessageReceived(event: MessageEvent) {
        when (event.path) {
            WearablePaths.TIMER_START -> {
                val payload = runCatching { JSONObject(String(event.data)) }.getOrNull()
                val durationMin = payload?.optInt(WearableKeys.DURATION_MIN, 25) ?: 25
                val intention = payload?.optString(WearableKeys.INTENTION, null)?.takeIf { it.isNotBlank() }
                val routineId = payload?.optLong(WearableKeys.ROUTINE_ID, -1L)?.takeIf { it >= 0 }
                TimerForegroundService.start(this, durationMin, intention, routineId)
            }
            WearablePaths.TIMER_STOP -> TimerForegroundService.stop(this)
            WearablePaths.TIMER_PAUSE -> TimerForegroundService.pause(this)
            WearablePaths.TIMER_RESUME -> TimerForegroundService.resume(this)
        }
    }
}
