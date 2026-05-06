package com.flowstate.core.gamification

import com.flowstate.core.model.SessionEntity
import com.flowstate.core.model.TrophyEntity
import com.flowstate.core.model.UserProfileEntity
import java.time.Instant
import java.time.ZoneId

object TrophyEvaluator {

    data class Snapshot(
        val sessions: List<SessionEntity>,
        val profile: UserProfileEntity,
    ) {
        val totalSessions: Int = sessions.count { it.completed }
        val totalMinutes: Int = sessions.sumOf { it.durationMinutes }
        val intentionalSessions: Int = sessions.count { !it.intentionText.isNullOrBlank() }
        val sessionsBeforeEight: Int = sessions.count {
            Instant.ofEpochMilli(it.startTime).atZone(ZoneId.systemDefault()).hour < 8
        }
        val sessionsAt45OrMore: Int = sessions.count { it.durationMinutes >= 45 }
        val anySessionAt60: Boolean = sessions.any { it.durationMinutes >= 60 }
    }

    fun evaluate(existing: List<TrophyEntity>, snapshot: Snapshot): List<TrophyEntity> {
        val now = System.currentTimeMillis()
        val updated = mutableListOf<TrophyEntity>()
        for (t in existing) {
            if (t.unlocked) continue
            val unlocked = when (t.key) {
                "first_step" -> snapshot.totalSessions >= 1
                "consistent" -> snapshot.profile.currentStreak >= 7
                "devoted" -> snapshot.totalSessions >= 30
                "marathon" -> snapshot.anySessionAt60
                "early_bird" -> snapshot.sessionsBeforeEight >= 5
                "deep_focus" -> snapshot.sessionsAt45OrMore >= 10
                "ascended" -> snapshot.profile.currentLevel >= 3
                "endurance" -> snapshot.profile.currentStreak >= 14
                "xp_collector" -> snapshot.profile.totalXp >= 1000
                "intentional" -> snapshot.intentionalSessions >= 10
                else -> false
            }
            if (unlocked) updated.add(t.copy(unlocked = true, unlockedDate = now))
        }
        return updated
    }
}
