package com.flowstate.app.work

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.flowstate.core.repository.QuestRepository
import com.flowstate.core.util.DateTimeUtil
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class DailyQuestWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted params: WorkerParameters,
    private val questRepository: QuestRepository,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        questRepository.ensureForToday()
        questRepository.pruneOlderThan(DateTimeUtil.dayKey() - 14L * DateTimeUtil.DAY_MILLIS)
        return Result.success()
    }
}
