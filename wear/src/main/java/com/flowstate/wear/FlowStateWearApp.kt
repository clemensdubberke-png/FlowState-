package com.flowstate.wear

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import androidx.core.content.getSystemService
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class FlowStateWearApp : Application() {
    override fun onCreate() {
        super.onCreate()
        getSystemService<NotificationManager>()?.createNotificationChannel(
            NotificationChannel("wear_timer", "Fokus", NotificationManager.IMPORTANCE_LOW)
        )
    }
}
