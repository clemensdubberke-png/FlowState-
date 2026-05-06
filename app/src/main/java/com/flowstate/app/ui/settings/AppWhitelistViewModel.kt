package com.flowstate.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.datastore.SettingsDataStore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AppWhitelistViewModel @Inject constructor(
    private val settings: SettingsDataStore,
) : ViewModel() {

    data class UiState(val whitelisted: Set<String> = emptySet())

    val uiState: StateFlow<UiState> = settings.snapshot
        .map { UiState(it.whitelistedPackages) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UiState())

    fun toggle(pkg: String, on: Boolean) {
        viewModelScope.launch {
            val current = uiState.value.whitelisted.toMutableSet()
            if (on) current.add(pkg) else current.remove(pkg)
            settings.setWhitelist(current)
        }
    }
}
