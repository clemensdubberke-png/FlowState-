package com.flowstate.core.sync

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * In-memory shared state for the running timer. Used by:
 * - TimerForegroundService (writer)
 * - TimerViewModel (reader)
 * - FocusShieldAccessibilityService (reader, decides whether to block apps)
 * - FloatingTimerService (reader)
 */
@Singleton
class SessionStateHolder @Inject constructor() {

    data class State(
        val isRunning: Boolean = false,
        val isPaused: Boolean = false,
        val totalDurationSeconds: Int = 0,
        val remainingSeconds: Int = 0,
        val startTimeMillis: Long = 0L,
        val intentionText: String? = null,
        val routineId: Long? = null,
        val routineStepIndex: Int = 0,
        val isPauseStep: Boolean = false,
    )

    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state

    fun update(transform: (State) -> State) {
        _state.value = transform(_state.value)
    }

    fun reset() {
        _state.value = State()
    }
}
