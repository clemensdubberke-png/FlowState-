package com.flowstate.app.ui.routines

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.datastore.SettingsDataStore
import com.flowstate.core.model.RoutineEntity
import com.flowstate.core.model.RoutineStepEntity
import com.flowstate.core.model.RoutineWithSteps
import com.flowstate.core.repository.RoutineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RoutinesViewModel @Inject constructor(
    private val routineRepository: RoutineRepository,
    private val settings: SettingsDataStore,
) : ViewModel() {

    data class UiState(
        val routines: List<RoutineWithSteps> = emptyList(),
        val activeRoutineId: Long? = null,
    )

    val uiState: StateFlow<UiState> = combine(
        routineRepository.observeAll(),
        settings.snapshot,
    ) { routines, s -> UiState(routines, s.activeRoutineId) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

    fun deleteRoutine(routine: RoutineEntity) {
        viewModelScope.launch { routineRepository.delete(routine) }
    }

    fun setActive(id: Long?) {
        viewModelScope.launch { settings.setActiveRoutine(id) }
    }
}
