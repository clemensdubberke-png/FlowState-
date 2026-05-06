package com.flowstate.wear.complication

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.flowstate.wear.MainActivity
import com.flowstate.wear.sync.WearProfileStore
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class FocusStreakComplicationService : SuspendingComplicationDataSourceService() {

    @Inject lateinit var profileStore: WearProfileStore

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder("4🔥").build(),
            contentDescription = PlainComplicationText.Builder("Streak").build(),
        )
            .setTitle(PlainComplicationText.Builder("45m").build())
            .build()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        if (request.complicationType != ComplicationType.SHORT_TEXT) return null
        val profile = profileStore.profile.value
        val tap = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder("${profile.streak}🔥").build(),
            contentDescription = PlainComplicationText.Builder("FlowState Streak").build(),
        )
            .setTitle(PlainComplicationText.Builder("${profile.todayMinutes}m").build())
            .setTapAction(tap)
            .build()
    }
}
