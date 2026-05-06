package com.flowstate.wear.presentation

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.sync.ProfileSnapshotDto
import com.flowstate.core.sync.SessionStateHolder
import com.flowstate.wear.service.WearTimerService
import com.flowstate.wear.sync.WearProfileStore
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class WearAppViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val stateHolder: SessionStateHolder,
    profileStore: WearProfileStore,
) : ViewModel() {

    data class UiState(
        val profile: ProfileSnapshotDto = ProfileSnapshotDto("Du", 0, 0, 0, 0, 0),
        val timer: SessionStateHolder.State = SessionStateHolder.State(),
        val lastSummary: WearProfileStore.SessionSummary? = null,
    )

    val state: StateFlow<UiState> = combine(
        profileStore.profile,
        stateHolder.state,
        profileStore.lastSummary,
    ) { p, t, s -> UiState(p, t, s) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

    fun startSession(minutes: Int) = WearTimerService.start(context, minutes)
    fun pause() = WearTimerService.pause(context)
    fun resume() = WearTimerService.resume(context)
    fun stop() = WearTimerService.stop(context)
}
