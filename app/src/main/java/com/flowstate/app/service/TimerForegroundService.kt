package com.flowstate.app.service

import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.getSystemService
import com.flowstate.app.MainActivity
import com.flowstate.app.R
import com.flowstate.app.audio.AmbientSoundPlayer
import com.flowstate.app.notification.NotificationChannels
import com.flowstate.app.wear.PhoneWearSync
import com.flowstate.core.datastore.SettingsDataStore
import com.flowstate.core.model.RoutineWithSteps
import com.flowstate.core.model.StepType
import com.flowstate.core.repository.RoutineRepository
import com.flowstate.core.repository.SessionRepository
import com.flowstate.core.sync.SessionStateHolder
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject
import kotlin.math.max

@AndroidEntryPoint
class TimerForegroundService : Service() {

    @Inject lateinit var stateHolder: SessionStateHolder
    @Inject lateinit var sessionRepository: SessionRepository
    @Inject lateinit var routineRepository: RoutineRepository
    @Inject lateinit var ambientSoundPlayer: AmbientSoundPlayer
    @Inject lateinit var settings: SettingsDataStore
    @Inject lateinit var phoneWearSync: PhoneWearSync

    private val scope = CoroutineScope(SupervisorJob())
    private var tickerJob: Job? = null
    private var sessionStartMillis: Long = 0L
    private var totalSeconds: Int = 0
    private var intentionText: String? = null
    private var routineId: Long? = null
    private var routine: RoutineWithSteps? = null
    private var stepIndex: Int = 0

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> handleStart(intent)
            ACTION_PAUSE -> handlePause()
            ACTION_RESUME -> handleResume()
            ACTION_STOP -> handleStop(complete = false)
        }
        return START_STICKY
    }

    private fun handleStart(intent: Intent) {
        val durationMin = intent.getIntExtra(EXTRA_DURATION_MIN, 25)
        intentionText = intent.getStringExtra(EXTRA_INTENTION)
        routineId = intent.getLongExtra(EXTRA_ROUTINE_ID, -1L).takeIf { it >= 0 }
        sessionStartMillis = System.currentTimeMillis()
        totalSeconds = durationMin * 60
        stepIndex = 0

        startForeground(NOTIFICATION_ID, buildNotification(totalSeconds, paused = false, isPause = false))

        scope.launch {
            routine = routineId?.let { routineRepository.get(it) }
            val first = routine?.orderedSteps?.firstOrNull()
            if (routine != null && first != null) {
                runRoutine()
            } else {
                runFocus(durationSeconds = totalSeconds, isPause = false)
            }
        }
    }

    private suspend fun runRoutine() {
        val r = routine ?: return
        val steps = r.orderedSteps
        for ((idx, step) in steps.withIndex()) {
            stepIndex = idx
            val isPause = step.type == StepType.PAUSE
            runFocus(durationSeconds = step.durationMinutes * 60, isPause = isPause)
            if (stateHolder.state.value.isRunning.not()) return
        }
    }

    private suspend fun runFocus(durationSeconds: Int, isPause: Boolean) {
        val started = System.currentTimeMillis()
        val soundId = if (isPause) null else settings.snapshot.first().selectedSoundId

        stateHolder.update {
            it.copy(
                isRunning = true,
                isPaused = false,
                totalDurationSeconds = durationSeconds,
                remainingSeconds = durationSeconds,
                startTimeMillis = started,
                intentionText = intentionText,
                routineId = routineId,
                routineStepIndex = stepIndex,
                isPauseStep = isPause,
            )
        }
        if (soundId != null) ambientSoundPlayer.play(soundId) else ambientSoundPlayer.stop()

        tickerJob?.cancel()
        tickerJob = scope.launch {
            var remaining = durationSeconds
            while (remaining > 0) {
                if (!stateHolder.state.value.isPaused) {
                    delay(1000)
                    remaining--
                    stateHolder.update { it.copy(remainingSeconds = remaining) }
                    val mm = remaining / 60
                    val ss = remaining % 60
                    updateNotification(remaining, paused = false, isPause = isPause)
                    phoneWearSync.broadcastTimerState()
                    if (mm == 0 && ss == 0) break
                } else {
                    delay(500)
                }
            }
            // step complete
            if (!isPause) {
                onFocusStepCompleted(started, durationSeconds)
            }
        }
        tickerJob?.join()
    }

    private suspend fun onFocusStepCompleted(startedAt: Long, durationSeconds: Int) {
        val endedAt = startedAt + durationSeconds * 1000L
        val result = sessionRepository.completeSession(
            startTime = startedAt,
            endTime = endedAt,
            intentionText = intentionText,
            routineId = routineId,
        )
        getSystemService<NotificationManager>()?.notify(
            NOTIFICATION_ID,
            NotificationCompat.Builder(this, NotificationChannels.TIMER)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle(getString(R.string.app_name))
                .setContentText(getString(R.string.notification_session_complete, result.xpEarned))
                .setOngoing(false)
                .setAutoCancel(true)
                .build()
        )
        phoneWearSync.notifySessionCompleted(durationSeconds / 60, result.xpEarned)
        // routine continues automatically; final stop happens at the end of routine loop
        if (routine == null || stepIndex == (routine?.orderedSteps?.lastIndex ?: 0)) {
            handleStop(complete = true)
        }
    }

    private fun handlePause() {
        stateHolder.update { it.copy(isPaused = true) }
        updateNotification(stateHolder.state.value.remainingSeconds, paused = true, isPause = stateHolder.state.value.isPauseStep)
    }

    private fun handleResume() {
        stateHolder.update { it.copy(isPaused = false) }
        updateNotification(stateHolder.state.value.remainingSeconds, paused = false, isPause = stateHolder.state.value.isPauseStep)
    }

    private fun handleStop(complete: Boolean) {
        tickerJob?.cancel()
        ambientSoundPlayer.stop()
        stateHolder.reset()
        phoneWearSync.broadcastTimerState()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(remainingSec: Int, paused: Boolean, isPause: Boolean): android.app.Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val stopIntent = PendingIntent.getService(
            this, 1,
            Intent(this, TimerForegroundService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val text = formatDuration(remainingSec)
        val title = if (paused) getString(R.string.notification_session_paused, text)
        else getString(R.string.notification_session_running, text)
        return NotificationCompat.Builder(this, NotificationChannels.TIMER)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(title)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setOnlyAlertOnce(true)
            .setContentIntent(openIntent)
            .addAction(0, getString(R.string.timer_stop), stopIntent)
            .build()
    }

    private fun updateNotification(remainingSec: Int, paused: Boolean, isPause: Boolean) {
        getSystemService<NotificationManager>()?.notify(
            NOTIFICATION_ID,
            buildNotification(max(0, remainingSec), paused, isPause)
        )
    }

    override fun onDestroy() {
        scope.cancel()
        ambientSoundPlayer.stop()
        super.onDestroy()
    }

    companion object {
        const val NOTIFICATION_ID = 4711
        const val ACTION_START = "com.flowstate.app.timer.START"
        const val ACTION_PAUSE = "com.flowstate.app.timer.PAUSE"
        const val ACTION_RESUME = "com.flowstate.app.timer.RESUME"
        const val ACTION_STOP = "com.flowstate.app.timer.STOP"
        const val EXTRA_DURATION_MIN = "duration_min"
        const val EXTRA_INTENTION = "intention"
        const val EXTRA_ROUTINE_ID = "routine_id"

        fun start(context: Context, durationMin: Int, intention: String?, routineId: Long?) {
            val intent = Intent(context, TimerForegroundService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_DURATION_MIN, durationMin)
                putExtra(EXTRA_INTENTION, intention)
                putExtra(EXTRA_ROUTINE_ID, routineId ?: -1L)
            }
            startServiceCompat(context, intent)
        }

        fun pause(context: Context) = startServiceCompat(context, Intent(context, TimerForegroundService::class.java).setAction(ACTION_PAUSE))
        fun resume(context: Context) = startServiceCompat(context, Intent(context, TimerForegroundService::class.java).setAction(ACTION_RESUME))
        fun stop(context: Context) = startServiceCompat(context, Intent(context, TimerForegroundService::class.java).setAction(ACTION_STOP))

        private fun startServiceCompat(context: Context, intent: Intent) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent)
            else context.startService(intent)
        }

        fun formatDuration(seconds: Int): String {
            val s = seconds.coerceAtLeast(0)
            return "%02d:%02d".format(s / 60, s % 60)
        }
    }
}
