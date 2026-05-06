package com.flowstate.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.content.getSystemService
import com.flowstate.app.R

object NotificationChannels {
    const val TIMER = "flowstate_timer"
    const val FLOATING = "flowstate_floating"

    fun create(context: Context) {
        val nm = context.getSystemService<NotificationManager>() ?: return
        nm.createNotificationChannel(
            NotificationChannel(
                TIMER,
                context.getString(R.string.notification_channel_timer),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = context.getString(R.string.notification_channel_timer_desc)
                setShowBadge(false)
            }
        )
        nm.createNotificationChannel(
            NotificationChannel(
                FLOATING,
                context.getString(R.string.notification_channel_floating),
                NotificationManager.IMPORTANCE_MIN
            ).apply {
                description = context.getString(R.string.notification_channel_floating_desc)
                setShowBadge(false)
            }
        )
    }
}
