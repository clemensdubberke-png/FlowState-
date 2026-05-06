package com.flowstate.app.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AmbientSoundPlayer @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private var player: MediaPlayer? = null
    private var currentSoundId: String? = null

    fun play(soundId: String) {
        if (currentSoundId == soundId && player?.isPlaying == true) return
        stop()
        val resId = context.resources.getIdentifier(soundId, "raw", context.packageName)
        if (resId == 0) {
            Log.w(TAG, "No raw resource for sound id=$soundId")
            return
        }
        player = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )
            try {
                val afd = context.resources.openRawResourceFd(resId) ?: return@apply
                afd.use {
                    setDataSource(it.fileDescriptor, it.startOffset, it.length)
                }
                isLooping = true
                setVolume(0.6f, 0.6f)
                prepare()
                start()
            } catch (t: Throwable) {
                Log.e(TAG, "Failed to start ambient sound", t)
                release()
            }
        }
        currentSoundId = soundId
    }

    fun stop() {
        runCatching {
            player?.takeIf { it.isPlaying }?.stop()
            player?.release()
        }
        player = null
        currentSoundId = null
    }

    companion object { private const val TAG = "AmbientSoundPlayer" }
}
