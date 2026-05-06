package com.flowstate.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.datastore.SettingsDataStore
import com.flowstate.core.datastore.SettingsSnapshot
import com.flowstate.core.repository.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settings: SettingsDataStore,
    private val profileRepository: ProfileRepository,
) : ViewModel() {

    data class UiState(
        val name: String = "",
        val settings: SettingsSnapshot = SettingsSnapshot(),
    )

    val uiState: StateFlow<UiState> = combine(
        profileRepository.observe(),
        settings.snapshot,
    ) { profile, s -> UiState(profile?.name ?: "", s) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

    fun setAutoDnd(v: Boolean) = viewModelScope.launch { settings.setAutoDnd(v) }
    fun setMuteMedia(v: Boolean) = viewModelScope.launch { settings.setMuteMedia(v) }
    fun setConfirmBeforeFocus(v: Boolean) = viewModelScope.launch { settings.setConfirmBeforeFocus(v) }
    fun setLockScreenTimer(v: Boolean) = viewModelScope.launch { settings.setLockScreenTimer(v) }
    fun setFloatingTimer(v: Boolean) = viewModelScope.launch { settings.setFloatingTimer(v) }
    fun setName(name: String) = viewModelScope.launch { profileRepository.setName(name) }
}
