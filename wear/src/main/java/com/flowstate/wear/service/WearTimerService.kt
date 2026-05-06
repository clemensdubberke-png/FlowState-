package com.flowstate.wear.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.core.app.NotificationCompat
import androidx.core.content.getSystemService
import com.flowstate.core.sync.SessionStateHolder
import com.flowstate.wear.R
import com.flowstate.wear.sync.WearMessenger
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class WearTimerService : Service() {

    @Inject lateinit var stateHolder: SessionStateHolder
    @Inject lateinit var messenger: WearMessenger

    private val scope = CoroutineScope(SupervisorJob())
    private var tickerJob: Job? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startSession(intent.getIntExtra(EXTRA_DURATION_MIN, 25))
            ACTION_PAUSE -> stateHolder.update { it.copy(isPaused = true) }.also { messenger.pauseSession() }
            ACTION_RESUME -> stateHolder.update { it.copy(isPaused = false) }.also { messenger.resumeSession() }
            ACTION_STOP -> {
                messenger.stopSession()
                stop()
            }
        }
        return START_STICKY
    }

    private fun startSession(durationMin: Int) {
        startForeground(NOTIFICATION_ID, buildNotification(durationMin * 60))
        val totalSec = durationMin * 60
        val started = System.currentTimeMillis()
        stateHolder.update {
            it.copy(
                isRunning = true,
                isPaused = false,
                totalDurationSeconds = totalSec,
                remainingSeconds = totalSec,
                startTimeMillis = started,
            )
        }
        messenger.startSession(durationMin)
        tickerJob?.cancel()
        tickerJob = scope.launch {
            var remaining = totalSec
            while (remaining > 0) {
                if (!stateHolder.state.value.isPaused) {
                    delay(1000)
                    remaining--
                    stateHolder.update { it.copy(remainingSeconds = remaining) }
                } else delay(500)
            }
            vibrate()
            stateHolder.update { it.copy(isRunning = false, remainingSeconds = 0) }
            stop()
        }
    }

    private fun buildNotification(remainingSec: Int): android.app.Notification {
        return NotificationCompat.Builder(this, "wear_timer")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(getString(R.string.notification_running))
            .setContentText("%02d:%02d".format(remainingSec / 60, remainingSec % 60))
            .setOngoing(true)
            .build()
    }

    private fun vibrate() {
        val v = getSystemService<Vibrator>() ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            v.vibrate(VibrationEffect.createOneShot(300, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION") v.vibrate(300)
        }
    }

    private fun stop() {
        tickerJob?.cancel()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    companion object {
        const val NOTIFICATION_ID = 4801
        const val ACTION_START = "com.flowstate.wear.START"
        const val ACTION_PAUSE = "com.flowstate.wear.PAUSE"
        const val ACTION_RESUME = "com.flowstate.wear.RESUME"
        const val ACTION_STOP = "com.flowstate.wear.STOP"
        const val EXTRA_DURATION_MIN = "duration_min"

        fun start(context: Context, minutes: Int) {
            val intent = Intent(context, WearTimerService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_DURATION_MIN, minutes)
            }
            startCompat(context, intent)
        }

        fun pause(context: Context) = startCompat(context, Intent(context, WearTimerService::class.java).setAction(ACTION_PAUSE))
        fun resume(context: Context) = startCompat(context, Intent(context, WearTimerService::class.java).setAction(ACTION_RESUME))
        fun stop(context: Context) = startCompat(context, Intent(context, WearTimerService::class.java).setAction(ACTION_STOP))

        private fun startCompat(context: Context, intent: Intent) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent)
            else context.startService(intent)
        }
    }
}
