package com.flowstate.app.work

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.flowstate.core.db.MomentumDao
import com.flowstate.core.db.SessionDao
import com.flowstate.core.gamification.FlowScoreCalculator
import com.flowstate.core.model.WeeklyMomentumEntity
import com.flowstate.core.repository.ProfileRepository
import com.flowstate.core.util.DateTimeUtil
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class WeeklyAggregatorWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted params: WorkerParameters,
    private val sessionDao: SessionDao,
    private val momentumDao: MomentumDao,
    private val profileRepository: ProfileRepository,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val (currentStart, _) = DateTimeUtil.weekBounds()
        val previousStart = currentStart - 7L * DateTimeUtil.DAY_MILLIS
        val previousSessions = sessionDao.forRange(previousStart, currentStart)
        val streak = profileRepository.get()?.currentStreak ?: 0
        val score = FlowScoreCalculator.scoreFor(previousSessions, streak)
        momentumDao.upsert(
            WeeklyMomentumEntity(
                weekStart = previousStart,
                totalMinutes = previousSessions.sumOf { it.durationMinutes },
                sessionCount = previousSessions.size,
                flowScore = score,
            )
        )
        return Result.success()
    }
}
