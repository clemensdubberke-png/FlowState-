package com.flowstate.wear.sync

import com.flowstate.core.sync.ProfileSnapshotDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WearProfileStore @Inject constructor() {
    data class SessionSummary(val durationMin: Int, val xp: Int)

    private val _profile = MutableStateFlow(ProfileSnapshotDto("Du", 0, 0, 0, 0, 0))
    val profile: StateFlow<ProfileSnapshotDto> = _profile

    private val _lastSummary = MutableStateFlow<SessionSummary?>(null)
    val lastSummary: StateFlow<SessionSummary?> = _lastSummary

    fun setProfile(p: ProfileSnapshotDto) { _profile.value = p }
    fun setSummary(s: SessionSummary) { _lastSummary.value = s }
    fun clearSummary() { _lastSummary.value = null }
}
