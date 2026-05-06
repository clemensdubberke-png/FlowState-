package com.flowstate.app.work

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.Duration
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WorkScheduler @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    fun scheduleAll() {
        val wm = WorkManager.getInstance(context)
        val constraints = Constraints.Builder().build()

        val midnightDelay = millisUntilNextLocal(0, 0)
        wm.enqueueUniquePeriodicWork(
            "daily_quest",
            ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<DailyQuestWorker>(1, TimeUnit.DAYS)
                .setInitialDelay(midnightDelay, TimeUnit.MILLISECONDS)
                .setConstraints(constraints)
                .build(),
        )

        val streakDelay = millisUntilNextLocal(0, 5)
        wm.enqueueUniquePeriodicWork(
            "streak_check",
            ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<StreakCheckWorker>(1, TimeUnit.DAYS)
                .setInitialDelay(streakDelay, TimeUnit.MILLISECONDS)
                .setConstraints(constraints)
                .build(),
        )

        val mondayDelay = millisUntilNextMondayMidnight()
        wm.enqueueUniquePeriodicWork(
            "weekly_aggregator",
            ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<WeeklyAggregatorWorker>(7, TimeUnit.DAYS)
                .setInitialDelay(mondayDelay, TimeUnit.MILLISECONDS)
                .setConstraints(constraints)
                .build(),
        )
    }

    private fun millisUntilNextLocal(hour: Int, minute: Int): Long {
        val zone = ZoneId.systemDefault()
        val now = LocalDateTime.now(zone)
        var target = now.toLocalDate().atTime(hour, minute)
        if (!target.isAfter(now)) target = target.plusDays(1)
        return Duration.between(now, target).toMillis()
    }

    private fun millisUntilNextMondayMidnight(): Long {
        val zone = ZoneId.systemDefault()
        val now = LocalDateTime.now(zone)
        var target = now.toLocalDate().atStartOfDay()
        while (target.dayOfWeek != java.time.DayOfWeek.MONDAY || !target.isAfter(now)) {
            target = target.plusDays(1)
        }
        return Duration.between(now, target).toMillis()
    }
}
