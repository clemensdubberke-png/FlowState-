package com.flowstate.core.sync

object WearablePaths {
    const val TIMER_START = "/flowstate/timer/start"
    const val TIMER_STOP = "/flowstate/timer/stop"
    const val TIMER_PAUSE = "/flowstate/timer/pause"
    const val TIMER_RESUME = "/flowstate/timer/resume"
    const val TIMER_STATE = "/flowstate/timer/state"
    const val PROFILE_SNAPSHOT = "/flowstate/profile/snapshot"
    const val SESSION_SUMMARY = "/flowstate/session/summary"
}

object WearableKeys {
    const val DURATION_MIN = "durationMin"
    const val START_TIME = "startTime"
    const val REMAINING_SEC = "remainingSec"
    const val IS_PAUSED = "isPaused"
    const val INTENTION = "intention"
    const val ROUTINE_ID = "routineId"
    const val IS_RUNNING = "isRunning"

    const val NAME = "name"
    const val STREAK = "streak"
    const val TODAY_SESSIONS = "todaySessions"
    const val TODAY_MINUTES = "todayMinutes"
    const val TOTAL_XP = "totalXp"
    const val FLOW_SCORE = "flowScore"

    const val SUMMARY_DURATION = "summaryDuration"
    const val SUMMARY_XP = "summaryXp"
}

data class TimerStateDto(
    val isRunning: Boolean,
    val isPaused: Boolean,
    val remainingSec: Int,
    val durationMin: Int,
    val startTime: Long,
)

data class ProfileSnapshotDto(
    val name: String,
    val streak: Int,
    val todaySessions: Int,
    val todayMinutes: Int,
    val totalXp: Int,
    val flowScore: Int,
)
