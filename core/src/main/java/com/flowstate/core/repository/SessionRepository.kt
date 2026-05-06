package com.flowstate.core.repository

import com.flowstate.core.db.InventoryDao
import com.flowstate.core.db.MomentumDao
import com.flowstate.core.db.ProfileDao
import com.flowstate.core.db.QuestDao
import com.flowstate.core.db.SessionDao
import com.flowstate.core.db.SoundDao
import com.flowstate.core.db.TrophyDao
import com.flowstate.core.gamification.FlowScoreCalculator
import com.flowstate.core.gamification.QuestGenerator
import com.flowstate.core.gamification.StreakManager
import com.flowstate.core.gamification.TrophyEvaluator
import com.flowstate.core.gamification.XpCalculator
import com.flowstate.core.model.DailyQuestEntity
import com.flowstate.core.model.ItemType
import com.flowstate.core.model.Levels
import com.flowstate.core.model.SessionEntity
import com.flowstate.core.util.DateTimeUtil
import kotlinx.coroutines.flow.Flow
import java.time.Instant
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton

data class SessionResult(
    val sessionId: Long,
    val xpEarned: Int,
    val newStreak: Int,
    val leveledUp: Boolean,
    val newLevel: Int,
    val unlockedTrophyKeys: List<String>,
    val completedQuestIds: List<Long>,
)

@Singleton
class SessionRepository @Inject constructor(
    private val sessionDao: SessionDao,
    private val profileDao: ProfileDao,
    private val trophyDao: TrophyDao,
    private val questDao: QuestDao,
    private val inventoryDao: InventoryDao,
    private val soundDao: SoundDao,
    private val momentumDao: MomentumDao,
) {
    fun observeAll(): Flow<List<SessionEntity>> = sessionDao.observeAll()

    fun observeForToday(now: Long = System.currentTimeMillis()): Flow<List<SessionEntity>> {
        val (start, end) = DateTimeUtil.dayBounds(now)
        return sessionDao.observeForDay(start, end)
    }

    suspend fun completeSession(
        startTime: Long,
        endTime: Long,
        intentionText: String?,
        routineId: Long?,
    ): SessionResult {
        val durationMin = ((endTime - startTime) / 60000L).toInt().coerceAtLeast(1)
        var profile = profileDao.get() ?: error("Profile not initialized")

        val updatedProfile = StreakManager.onSessionCompleted(profile, endTime)
        val xp = XpCalculator.computeXp(durationMin, updatedProfile.currentStreak)
        val newTotal = updatedProfile.totalXp + xp

        val newLevelObj = Levels.levelForXp(newTotal)
        val leveledUp = newLevelObj.number > profile.currentLevel

        val finalProfile = updatedProfile.copy(
            totalXp = newTotal,
            currentLevel = newLevelObj.number,
        )
        profileDao.upsert(finalProfile)

        if (leveledUp) {
            soundDao.unlockUpTo(newLevelObj.number)
        }

        val sessionId = sessionDao.insert(
            SessionEntity(
                startTime = startTime,
                endTime = endTime,
                durationMinutes = durationMin,
                intentionText = intentionText?.takeIf { it.isNotBlank() },
                xpEarned = xp,
                routineId = routineId,
                completed = true,
            )
        )

        // Trophies
        val allSessions = sessionDao.forRange(0, Long.MAX_VALUE)
        val newlyUnlocked = TrophyEvaluator.evaluate(
            existing = trophyDao.all(),
            snapshot = TrophyEvaluator.Snapshot(allSessions, finalProfile),
        )
        for (t in newlyUnlocked) trophyDao.update(t)

        // Quests
        val today = DateTimeUtil.dayKey(endTime)
        val quests = questDao.getForDate(today)
        val hour = Instant.ofEpochMilli(startTime).atZone(ZoneId.systemDefault()).hour
        val todayMinutes = allSessions.filter {
            DateTimeUtil.dayKey(it.startTime) == today
        }.sumOf { it.durationMinutes }
        val intentionalToday = allSessions.count {
            DateTimeUtil.dayKey(it.startTime) == today && !it.intentionText.isNullOrBlank()
        }
        val completedQuests = mutableListOf<Long>()
        for (q in quests) {
            if (QuestGenerator.questCompletedBy(
                    quest = q,
                    sessionStartHour = hour,
                    sessionDuration = durationMin,
                    intentionSet = !intentionText.isNullOrBlank(),
                    todaysTotalMinutes = todayMinutes,
                    intentionalSessionsToday = intentionalToday,
                )
            ) {
                questDao.update(q.copy(completed = true))
                completedQuests.add(q.id)
                if (q.rewardShield) {
                    val current = inventoryDao.get(ItemType.STREAK_SHIELD)
                    val qty = ((current?.quantity ?: 0) + 1).coerceAtMost(5)
                    inventoryDao.upsert(
                        com.flowstate.core.model.InventoryItemEntity(ItemType.STREAK_SHIELD, qty)
                    )
                }
                profileDao.upsert(profileDao.get()!!.copy(totalXp = profileDao.get()!!.totalXp + q.xpReward))
            }
        }

        return SessionResult(
            sessionId = sessionId,
            xpEarned = xp,
            newStreak = finalProfile.currentStreak,
            leveledUp = leveledUp,
            newLevel = newLevelObj.number,
            unlockedTrophyKeys = newlyUnlocked.map { it.key },
            completedQuestIds = completedQuests,
        )
    }

    suspend fun ensureQuestsForToday() {
        val today = DateTimeUtil.dayKey()
        val existing = questDao.getForDate(today)
        if (existing.isEmpty()) {
            val generated: List<DailyQuestEntity> = QuestGenerator.generate(today)
            questDao.insertAll(generated)
        }
    }

    suspend fun computeFlowScore(now: Long = System.currentTimeMillis()): FlowScoreCalculator.FlowScore {
        val profile = profileDao.get()
        val (currentStart, currentEnd) = DateTimeUtil.weekBounds(now)
        val previousStart = currentStart - 7 * DateTimeUtil.DAY_MILLIS
        val previousEnd = currentStart
        val current = sessionDao.forRange(currentStart, currentEnd)
        val prev = sessionDao.forRange(previousStart, previousEnd)
        return FlowScoreCalculator.compute(current, prev, profile?.currentStreak ?: 0)
    }
}
