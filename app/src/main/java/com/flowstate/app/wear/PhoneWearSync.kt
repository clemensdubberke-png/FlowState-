package com.flowstate.app.wear

import android.content.Context
import com.flowstate.core.repository.ProfileRepository
import com.flowstate.core.repository.SessionRepository
import com.flowstate.core.sync.SessionStateHolder
import com.flowstate.core.sync.WearableKeys
import com.flowstate.core.sync.WearablePaths
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PhoneWearSync @Inject constructor(
    @ApplicationContext private val context: Context,
    private val stateHolder: SessionStateHolder,
    private val sessionRepository: SessionRepository,
    private val profileRepository: ProfileRepository,
) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val dataClient: DataClient by lazy { Wearable.getDataClient(context) }

    fun broadcastTimerState() {
        scope.launch {
            val s = stateHolder.state.value
            val req = PutDataMapRequest.create(WearablePaths.TIMER_STATE).apply {
                dataMap.putBoolean(WearableKeys.IS_RUNNING, s.isRunning)
                dataMap.putBoolean(WearableKeys.IS_PAUSED, s.isPaused)
                dataMap.putInt(WearableKeys.REMAINING_SEC, s.remainingSeconds)
                dataMap.putInt(WearableKeys.DURATION_MIN, s.totalDurationSeconds / 60)
                dataMap.putLong(WearableKeys.START_TIME, s.startTimeMillis)
            }.asPutDataRequest().setUrgent()
            runCatching { dataClient.putDataItem(req) }
        }
    }

    fun broadcastProfileSnapshot() {
        scope.launch {
            val profile = profileRepository.get() ?: return@launch
            val flowScore = sessionRepository.computeFlowScore()
            val req = PutDataMapRequest.create(WearablePaths.PROFILE_SNAPSHOT).apply {
                dataMap.putString(WearableKeys.NAME, profile.name ?: "")
                dataMap.putInt(WearableKeys.STREAK, profile.currentStreak)
                dataMap.putInt(WearableKeys.TOTAL_XP, profile.totalXp)
                dataMap.putInt(WearableKeys.FLOW_SCORE, flowScore.score)
                dataMap.putLong("ts", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()
            runCatching { dataClient.putDataItem(req) }
        }
    }

    fun notifySessionCompleted(durationMin: Int, xpEarned: Int) {
        scope.launch {
            val req = PutDataMapRequest.create(WearablePaths.SESSION_SUMMARY).apply {
                dataMap.putInt(WearableKeys.SUMMARY_DURATION, durationMin)
                dataMap.putInt(WearableKeys.SUMMARY_XP, xpEarned)
                dataMap.putLong("ts", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()
            runCatching { dataClient.putDataItem(req) }
        }
        broadcastProfileSnapshot()
    }
}
