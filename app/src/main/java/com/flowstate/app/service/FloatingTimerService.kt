package com.flowstate.app.service

import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.app.NotificationCompat
import androidx.core.content.getSystemService
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.flowstate.app.MainActivity
import com.flowstate.app.R
import com.flowstate.app.notification.NotificationChannels
import com.flowstate.app.ui.theme.FlowStateTheme
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.Purple
import com.flowstate.core.sync.SessionStateHolder
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlin.math.abs

@AndroidEntryPoint
class FloatingTimerService : Service(), LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {

    @Inject lateinit var stateHolder: SessionStateHolder

    private val lifecycleRegistry = LifecycleRegistry(this)
    private val savedStateController = SavedStateRegistryController.create(this)
    override val lifecycle: Lifecycle get() = lifecycleRegistry
    override val viewModelStore: ViewModelStore = ViewModelStore()
    override val savedStateRegistry: SavedStateRegistry get() = savedStateController.savedStateRegistry

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var layoutParams: WindowManager.LayoutParams? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        savedStateController.performAttach()
        savedStateController.performRestore(null)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        startForeground(NOTIFICATION_ID, buildOngoingNotification())
        windowManager = getSystemService<WindowManager>()
        addOverlay()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
    }

    private fun addOverlay() {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100; y = 300
        }
        layoutParams = params

        val composeView = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@FloatingTimerService)
            setViewTreeViewModelStoreOwner(this@FloatingTimerService)
            setViewTreeSavedStateRegistryOwner(this@FloatingTimerService)
            setContent {
                FlowStateTheme {
                    val state by stateHolder.state.collectAsState()
                    FloatingBubble(remainingSec = state.remainingSeconds, isPause = state.isPauseStep)
                }
            }
        }

        composeView.setOnTouchListener(DragAndDoubleTapListener(
            onDoubleTap = {
                val open = Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(open)
            },
            onMove = { dx, dy ->
                params.x += dx
                params.y += dy
                runCatching { windowManager?.updateViewLayout(composeView, params) }
            },
        ))

        overlayView = composeView
        runCatching { windowManager?.addView(composeView, params) }
    }

    override fun onDestroy() {
        runCatching { overlayView?.let { windowManager?.removeView(it) } }
        overlayView = null
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        viewModelStore.clear()
        super.onDestroy()
    }

    private fun buildOngoingNotification(): android.app.Notification {
        val open = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return NotificationCompat.Builder(this, NotificationChannels.FLOATING)
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(getString(R.string.settings_floating_overlay))
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setContentIntent(open)
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 4712
        fun start(context: Context) {
            val intent = Intent(context, FloatingTimerService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent)
            else context.startService(intent)
        }

        fun stop(context: Context) = context.stopService(Intent(context, FloatingTimerService::class.java))
    }
}

@Composable
private fun FloatingBubble(remainingSec: Int, isPause: Boolean) {
    val text = TimerForegroundService.formatDuration(remainingSec)
    Box(
        modifier = Modifier
            .size(72.dp)
            .clip(CircleShape)
            .background(if (isPause) com.flowstate.app.ui.theme.Amber else Purple),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = OnSurface, fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.titleMedium)
    }
}

private class DragAndDoubleTapListener(
    val onDoubleTap: () -> Unit,
    val onMove: (Int, Int) -> Unit,
) : View.OnTouchListener {
    private var initialX = 0
    private var initialY = 0
    private var rawX = 0f
    private var rawY = 0f
    private var lastTapMs = 0L
    private var dragged = false

    override fun onTouch(v: View, event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                rawX = event.rawX
                rawY = event.rawY
                dragged = false
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val dx = (event.rawX - rawX).toInt()
                val dy = (event.rawY - rawY).toInt()
                if (abs(dx) > 8 || abs(dy) > 8) {
                    dragged = true
                    onMove(dx, dy)
                    rawX = event.rawX
                    rawY = event.rawY
                }
                return true
            }
            MotionEvent.ACTION_UP -> {
                if (!dragged) {
                    val now = System.currentTimeMillis()
                    if (now - lastTapMs < 300) {
                        onDoubleTap()
                        lastTapMs = 0
                    } else {
                        lastTapMs = now
                    }
                }
                v.performClick()
                return true
            }
        }
        return false
    }
}
