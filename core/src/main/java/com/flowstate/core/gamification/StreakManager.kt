package com.flowstate.core.gamification

import com.flowstate.core.model.UserProfileEntity
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit

object StreakManager {

    fun toLocalDate(epochMillis: Long): LocalDate =
        Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDate()

    fun daysBetween(a: LocalDate, b: LocalDate): Long = ChronoUnit.DAYS.between(a, b)

    /**
     * Aktualisiert Streak nach Abschluss einer Session.
     * Returnt das aktualisierte Profil.
     */
    fun onSessionCompleted(
        profile: UserProfileEntity,
        sessionEpochMillis: Long,
    ): UserProfileEntity {
        val today = toLocalDate(sessionEpochMillis)
        val last = profile.lastSessionDate?.let(::toLocalDate)

        val newStreak = when {
            last == null -> 1
            last == today -> profile.currentStreak.coerceAtLeast(1)
            daysBetween(last, today) == 1L -> profile.currentStreak + 1
            else -> 1
        }

        return profile.copy(
            currentStreak = newStreak,
            longestStreak = maxOf(profile.longestStreak, newStreak),
            lastSessionDate = sessionEpochMillis,
        )
    }

    /**
     * Tägliche Prüfung: ist Streak in Gefahr? Verbraucht ggf. Schild.
     * @return Pair<updatedProfile, shieldConsumed>
     */
    fun checkAndApplyShield(
        profile: UserProfileEntity,
        currentEpochMillis: Long,
        shieldsAvailable: Int,
    ): Pair<UserProfileEntity, Boolean> {
        val today = toLocalDate(currentEpochMillis)
        val last = profile.lastSessionDate?.let(::toLocalDate) ?: return profile to false
        val gap = daysBetween(last, today)
        if (gap <= 1) return profile to false
        if (gap == 2L && shieldsAvailable > 0) {
            return profile.copy(lastSessionDate = currentEpochMillis) to true
        }
        return profile.copy(currentStreak = 0) to false
    }
}
