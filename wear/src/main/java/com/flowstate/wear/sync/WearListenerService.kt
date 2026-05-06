package com.flowstate.wear.sync

import com.flowstate.core.sync.ProfileSnapshotDto
import com.flowstate.core.sync.SessionStateHolder
import com.flowstate.core.sync.WearableKeys
import com.flowstate.core.sync.WearablePaths
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class WearListenerService : WearableListenerService() {

    @Inject lateinit var stateHolder: SessionStateHolder
    @Inject lateinit var profileStore: WearProfileStore

    override fun onDataChanged(events: DataEventBuffer) {
        for (e in events) {
            if (e.type != DataEvent.TYPE_CHANGED) continue
            val item = e.dataItem
            val map = DataMapItem.fromDataItem(item).dataMap
            when (item.uri.path) {
                WearablePaths.TIMER_STATE -> {
                    stateHolder.update {
                        it.copy(
                            isRunning = map.getBoolean(WearableKeys.IS_RUNNING, false),
                            isPaused = map.getBoolean(WearableKeys.IS_PAUSED, false),
                            remainingSeconds = map.getInt(WearableKeys.REMAINING_SEC, 0),
                            totalDurationSeconds = map.getInt(WearableKeys.DURATION_MIN, 0) * 60,
                            startTimeMillis = map.getLong(WearableKeys.START_TIME, 0L),
                        )
                    }
                }
                WearablePaths.PROFILE_SNAPSHOT -> {
                    profileStore.setProfile(
                        ProfileSnapshotDto(
                            name = map.getString(WearableKeys.NAME).orEmpty(),
                            streak = map.getInt(WearableKeys.STREAK, 0),
                            todaySessions = map.getInt(WearableKeys.TODAY_SESSIONS, 0),
                            todayMinutes = map.getInt(WearableKeys.TODAY_MINUTES, 0),
                            totalXp = map.getInt(WearableKeys.TOTAL_XP, 0),
                            flowScore = map.getInt(WearableKeys.FLOW_SCORE, 0),
                        )
                    )
                }
                WearablePaths.SESSION_SUMMARY -> {
                    profileStore.setSummary(
                        WearProfileStore.SessionSummary(
                            durationMin = map.getInt(WearableKeys.SUMMARY_DURATION, 0),
                            xp = map.getInt(WearableKeys.SUMMARY_XP, 0),
                        )
                    )
                }
            }
        }
    }
}
