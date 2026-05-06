package com.flowstate.core.gamification

import com.flowstate.core.model.SessionEntity
import kotlin.math.min

object FlowScoreCalculator {

    private const val TARGET_MINUTES_PER_WEEK = 600 // 10h
    private const val TARGET_SESSIONS_PER_WEEK = 14
    private const val TARGET_STREAK_FOR_FULL = 14

    private const val W_MINUTES = 0.5f
    private const val W_SESSIONS = 0.3f
    private const val W_STREAK = 0.2f

    data class FlowScore(
        val score: Int,
        val previousScore: Int,
        val percentChange: Int,
        val motivation: String,
    )

    fun compute(
        currentWeek: List<SessionEntity>,
        previousWeek: List<SessionEntity>,
        currentStreak: Int,
    ): FlowScore {
        val score = scoreFor(currentWeek, currentStreak)
        val prev = scoreFor(previousWeek, currentStreak)
        val change = if (prev == 0) {
            if (score > 0) 100 else 0
        } else {
            (((score - prev).toFloat() / prev) * 100f).toInt()
        }
        return FlowScore(score, prev, change, motivationFor(score))
    }

    fun scoreFor(sessions: List<SessionEntity>, streak: Int): Int {
        if (sessions.isEmpty()) return 0
        val minutes = sessions.sumOf { it.durationMinutes }
        val count = sessions.size
        val mNorm = min(1f, minutes.toFloat() / TARGET_MINUTES_PER_WEEK)
        val sNorm = min(1f, count.toFloat() / TARGET_SESSIONS_PER_WEEK)
        val stNorm = min(1f, streak.toFloat() / TARGET_STREAK_FOR_FULL)
        val raw = W_MINUTES * mNorm + W_SESSIONS * sNorm + W_STREAK * stNorm
        return (raw * 100f).toInt().coerceIn(0, 100)
    }

    fun motivationFor(score: Int): String = when {
        score >= 85 -> "Du bist im Tiefenflow."
        score >= 70 -> "Das Momentum ist auf deiner Seite."
        score >= 50 -> "Solider Rhythmus — bleib dran."
        score >= 30 -> "Klein anfangen, groß werden."
        score > 0 -> "Jeder Schritt zählt."
        else -> "Setz dein Momentum heute in Gang."
    }
}
