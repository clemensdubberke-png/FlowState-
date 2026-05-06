package com.flowstate.app.ui.nav

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.repository.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RootViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
) : ViewModel() {

    sealed interface RootState {
        data object Loading : RootState
        data object NeedsOnboarding : RootState
        data object Ready : RootState
    }

    private val _state = MutableStateFlow<RootState>(RootState.Loading)
    val state: StateFlow<RootState> = _state

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            val p = profileRepository.get()
            _state.value = if (p?.name.isNullOrBlank()) RootState.NeedsOnboarding else RootState.Ready
        }
    }
}
