package com.flowstate.core.datastore

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "flowstate_settings")

data class SettingsSnapshot(
    val autoDnd: Boolean = false,
    val muteMedia: Boolean = false,
    val confirmBeforeFocus: Boolean = true,
    val lockScreenTimer: Boolean = false,
    val floatingTimerEnabled: Boolean = false,
    val selectedSoundId: String = "deep_space",
    val whitelistedPackages: Set<String> = emptySet(),
    val activeRoutineId: Long? = null,
)

@Singleton
class SettingsDataStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val store = context.dataStore

    private object Keys {
        val AUTO_DND = booleanPreferencesKey("auto_dnd")
        val MUTE_MEDIA = booleanPreferencesKey("mute_media")
        val CONFIRM_BEFORE_FOCUS = booleanPreferencesKey("confirm_before_focus")
        val LOCK_SCREEN_TIMER = booleanPreferencesKey("lock_screen_timer")
        val FLOATING_TIMER = booleanPreferencesKey("floating_timer")
        val SELECTED_SOUND = stringPreferencesKey("selected_sound")
        val WHITELIST = stringSetPreferencesKey("whitelisted_packages")
        val ACTIVE_ROUTINE = stringPreferencesKey("active_routine")
    }

    val snapshot: Flow<SettingsSnapshot> = store.data.map { prefs ->
        SettingsSnapshot(
            autoDnd = prefs[Keys.AUTO_DND] ?: false,
            muteMedia = prefs[Keys.MUTE_MEDIA] ?: false,
            confirmBeforeFocus = prefs[Keys.CONFIRM_BEFORE_FOCUS] ?: true,
            lockScreenTimer = prefs[Keys.LOCK_SCREEN_TIMER] ?: false,
            floatingTimerEnabled = prefs[Keys.FLOATING_TIMER] ?: false,
            selectedSoundId = prefs[Keys.SELECTED_SOUND] ?: "deep_space",
            whitelistedPackages = prefs[Keys.WHITELIST] ?: emptySet(),
            activeRoutineId = prefs[Keys.ACTIVE_ROUTINE]?.toLongOrNull(),
        )
    }

    suspend fun setAutoDnd(v: Boolean) = store.edit { it[Keys.AUTO_DND] = v }
    suspend fun setMuteMedia(v: Boolean) = store.edit { it[Keys.MUTE_MEDIA] = v }
    suspend fun setConfirmBeforeFocus(v: Boolean) = store.edit { it[Keys.CONFIRM_BEFORE_FOCUS] = v }
    suspend fun setLockScreenTimer(v: Boolean) = store.edit { it[Keys.LOCK_SCREEN_TIMER] = v }
    suspend fun setFloatingTimer(v: Boolean) = store.edit { it[Keys.FLOATING_TIMER] = v }
    suspend fun setSelectedSound(id: String) = store.edit { it[Keys.SELECTED_SOUND] = id }
    suspend fun setWhitelist(pkgs: Set<String>) = store.edit { it[Keys.WHITELIST] = pkgs }
    suspend fun setActiveRoutine(id: Long?) = store.edit {
        if (id == null) it.remove(Keys.ACTIVE_ROUTINE) else it[Keys.ACTIVE_ROUTINE] = id.toString()
    }
}
