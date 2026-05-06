package com.flowstate.wear.sync

import android.content.Context
import com.flowstate.core.sync.WearableKeys
import com.flowstate.core.sync.WearablePaths
import com.google.android.gms.wearable.Wearable
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WearMessenger @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    fun startSession(durationMin: Int) {
        val payload = JSONObject().apply { put(WearableKeys.DURATION_MIN, durationMin) }
        sendToConnected(WearablePaths.TIMER_START, payload.toString().toByteArray())
    }

    fun stopSession() = sendToConnected(WearablePaths.TIMER_STOP, byteArrayOf())
    fun pauseSession() = sendToConnected(WearablePaths.TIMER_PAUSE, byteArrayOf())
    fun resumeSession() = sendToConnected(WearablePaths.TIMER_RESUME, byteArrayOf())

    private fun sendToConnected(path: String, data: ByteArray) {
        scope.launch {
            runCatching {
                val nodes = Wearable.getNodeClient(context).connectedNodes.await()
                val client = Wearable.getMessageClient(context)
                for (n in nodes) {
                    runCatching { client.sendMessage(n.id, path, data).await() }
                }
            }
        }
    }
}
