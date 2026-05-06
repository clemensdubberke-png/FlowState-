package com.flowstate.app.ui.sounds

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.model.SoundEntity
import com.flowstate.core.repository.SoundRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class SoundPickerViewModel @Inject constructor(
    soundRepository: SoundRepository,
) : ViewModel() {
    val sounds: StateFlow<List<SoundEntity>> = soundRepository.observeAll()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
