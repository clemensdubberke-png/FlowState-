package com.flowstate.core.repository

import com.flowstate.core.db.QuestDao
import com.flowstate.core.gamification.QuestGenerator
import com.flowstate.core.model.DailyQuestEntity
import com.flowstate.core.util.DateTimeUtil
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class QuestRepository @Inject constructor(
    private val questDao: QuestDao,
) {
    fun observeToday(now: Long = System.currentTimeMillis()): Flow<List<DailyQuestEntity>> =
        questDao.observeForDate(DateTimeUtil.dayKey(now))

    suspend fun ensureForToday(now: Long = System.currentTimeMillis()): List<DailyQuestEntity> {
        val today = DateTimeUtil.dayKey(now)
        val existing = questDao.getForDate(today)
        if (existing.isNotEmpty()) return existing
        val fresh = QuestGenerator.generate(today)
        questDao.insertAll(fresh)
        return fresh
    }

    suspend fun pruneOlderThan(beforeDayKey: Long) = questDao.deleteOlderThan(beforeDayKey)
}
