package com.flowstate.app.ui.timer

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.app.service.TimerForegroundService
import com.flowstate.core.datastore.SettingsDataStore
import com.flowstate.core.datastore.SettingsSnapshot
import com.flowstate.core.gamification.XpCalculator
import com.flowstate.core.model.DailyQuestEntity
import com.flowstate.core.model.Levels
import com.flowstate.core.model.RoutineWithSteps
import com.flowstate.core.model.SessionEntity
import com.flowstate.core.model.UserProfileEntity
import com.flowstate.core.repository.QuestRepository
import com.flowstate.core.repository.RoutineRepository
import com.flowstate.core.repository.SessionRepository
import com.flowstate.core.repository.ProfileRepository
import com.flowstate.core.sync.SessionStateHolder
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TimerViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    profileRepository: ProfileRepository,
    sessionRepository: SessionRepository,
    routineRepository: RoutineRepository,
    questRepository: QuestRepository,
    private val settings: SettingsDataStore,
    private val stateHolder: SessionStateHolder,
) : ViewModel() {

    init {
        viewModelScope.launch { questRepository.ensureForToday() }
    }

    data class UiState(
        val profile: UserProfileEntity? = null,
        val todaySessions: List<SessionEntity> = emptyList(),
        val activeRoutine: RoutineWithSteps? = null,
        val routines: List<RoutineWithSteps> = emptyList(),
        val activeQuest: DailyQuestEntity? = null,
        val timer: SessionStateHolder.State = SessionStateHolder.State(),
        val settings: SettingsSnapshot = SettingsSnapshot(),
    ) {
        val name: String get() = profile?.name ?: ""
        val streak: Int get() = profile?.currentStreak ?: 0
        val xpMultiplier: Float get() = XpCalculator.streakMultiplier(streak)
        val totalXp: Int get() = profile?.totalXp ?: 0
        val nextLevelName: String? get() = Levels.nextLevel(totalXp)?.name
        val todaySessionCount: Int get() = todaySessions.size
        val todayMinutes: Int get() = todaySessions.sumOf { it.durationMinutes }
    }

    val uiState: StateFlow<UiState> = combine(
        profileRepository.observe(),
        sessionRepository.observeForToday(),
        routineRepository.observeAll(),
        questRepository.observeToday(),
        combine(
            settings.snapshot,
            stateHolder.state,
        ) { s, t -> s to t },
    ) { profile, sessions, routines, quests, settingsAndTimer ->
        val (settingsSnap, timerState) = settingsAndTimer
        val active = settingsSnap.activeRoutineId?.let { id -> routines.firstOrNull { it.routine.id == id } }
        UiState(
            profile = profile,
            todaySessions = sessions,
            activeRoutine = active,
            routines = routines,
            activeQuest = quests.firstOrNull { !it.completed } ?: quests.firstOrNull(),
            timer = timerState,
            settings = settingsSnap,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

    fun startTimer(durationMin: Int, intention: String?) {
        TimerForegroundService.start(
            context = context,
            durationMin = durationMin,
            intention = intention?.takeIf { it.isNotBlank() },
            routineId = uiState.value.activeRoutine?.routine?.id,
        )
    }

    fun pause() = TimerForegroundService.pause(context)
    fun resume() = TimerForegroundService.resume(context)
    fun stop() = TimerForegroundService.stop(context)

    fun setActiveRoutine(routineId: Long?) {
        viewModelScope.launch { settings.setActiveRoutine(routineId) }
    }

    fun selectSound(id: String) {
        viewModelScope.launch { settings.setSelectedSound(id) }
    }
}
