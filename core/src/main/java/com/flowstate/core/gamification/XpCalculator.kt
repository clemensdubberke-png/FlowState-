package com.flowstate.core.gamification

object XpCalculator {
    fun streakMultiplier(streak: Int): Float = when {
        streak >= 14 -> 2.0f
        streak >= 7 -> 1.6f
        streak >= 4 -> 1.4f
        streak >= 3 -> 1.2f
        else -> 1.0f
    }

    fun computeXp(durationMinutes: Int, streak: Int): Int {
        val mult = streakMultiplier(streak)
        return (durationMinutes * mult).toInt()
    }
}
