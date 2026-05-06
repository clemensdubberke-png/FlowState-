package com.flowstate.app.ui.progress

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.gamification.FlowScoreCalculator
import com.flowstate.core.model.InventoryItemEntity
import com.flowstate.core.model.ItemType
import com.flowstate.core.model.Levels
import com.flowstate.core.model.SessionEntity
import com.flowstate.core.model.TrophyEntity
import com.flowstate.core.model.UserProfileEntity
import com.flowstate.core.repository.InventoryRepository
import com.flowstate.core.repository.ProfileRepository
import com.flowstate.core.repository.SessionRepository
import com.flowstate.core.repository.TrophyRepository
import com.flowstate.core.util.DateTimeUtil
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProgressViewModel @Inject constructor(
    profileRepository: ProfileRepository,
    private val sessionRepository: SessionRepository,
    trophyRepository: TrophyRepository,
    inventoryRepository: InventoryRepository,
) : ViewModel() {

    data class WeekBars(val current: List<Int>, val previous: List<Int>)

    data class UiState(
        val profile: UserProfileEntity? = null,
        val flowScore: FlowScoreCalculator.FlowScore = FlowScoreCalculator.FlowScore(0, 0, 0, ""),
        val totalMinutes: Int = 0,
        val totalSessions: Int = 0,
        val bestDayMinutes: Int = 0,
        val streak: Int = 0,
        val weekBars: WeekBars = WeekBars(List(7) { 0 }, List(7) { 0 }),
        val trophies: List<TrophyEntity> = emptyList(),
        val streakShields: Int = 0,
        val maxShields: Int = InventoryItemEntity.MAX_STREAK_SHIELD,
    ) {
        val currentLevel get() = profile?.currentLevel ?: 1
    }

    private val _flowScore = MutableStateFlow(FlowScoreCalculator.FlowScore(0, 0, 0, ""))

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _flowScore.value = sessionRepository.computeFlowScore()
        }
    }

    val uiState: StateFlow<UiState> = combine(
        profileRepository.observe(),
        sessionRepository.observeAll(),
        trophyRepository.observeAll(),
        inventoryRepository.observe(),
        _flowScore,
    ) { profile, sessions, trophies, inventory, flowScore ->
        val totalMin = sessions.sumOf { it.durationMinutes }
        val byDay = sessions.groupBy { DateTimeUtil.dayKey(it.startTime) }
        val bestDay = byDay.values.maxOfOrNull { it.sumOf { s -> s.durationMinutes } } ?: 0

        val (curStart, _) = DateTimeUtil.weekBounds()
        val previousStart = curStart - 7 * DateTimeUtil.DAY_MILLIS
        val current = (0..6).map { i ->
            val dayStart = curStart + i * DateTimeUtil.DAY_MILLIS
            val dayEnd = dayStart + DateTimeUtil.DAY_MILLIS
            sessions.filter { it.startTime in dayStart until dayEnd }.sumOf { it.durationMinutes }
        }
        val previous = (0..6).map { i ->
            val dayStart = previousStart + i * DateTimeUtil.DAY_MILLIS
            val dayEnd = dayStart + DateTimeUtil.DAY_MILLIS
            sessions.filter { it.startTime in dayStart until dayEnd }.sumOf { it.durationMinutes }
        }
        val shields = inventory.firstOrNull { it.type == ItemType.STREAK_SHIELD }?.quantity ?: 0

        UiState(
            profile = profile,
            flowScore = flowScore,
            totalMinutes = totalMin,
            totalSessions = sessions.size,
            bestDayMinutes = bestDay,
            streak = profile?.currentStreak ?: 0,
            weekBars = WeekBars(current, previous),
            trophies = trophies,
            streakShields = shields,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

    val levels = Levels.ALL
}
