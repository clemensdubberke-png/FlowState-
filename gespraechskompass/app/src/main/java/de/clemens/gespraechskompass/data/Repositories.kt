package de.clemens.gespraechskompass.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

val ScenarioJson = Json { ignoreUnknownKeys = true }

/** Lädt die Szenarien aus den Assets (data/scenarios.json wird von Gradle direkt eingebunden). */
class ScenarioRepository(private val context: Context) {
    private val mutex = Mutex()
    private var cache: ScenarioFile? = null

    suspend fun load(): ScenarioFile = mutex.withLock {
        cache ?: withContext(Dispatchers.IO) {
            context.assets.open("scenarios.json").bufferedReader(Charsets.UTF_8).use {
                ScenarioJson.decodeFromString(ScenarioFile.serializer(), it.readText())
            }
        }.also { cache = it }
    }
}

data class ScenarioProgress(val besteSterne: Int, val zuletztGespielt: Long)

data class Progress(
    val proSzenario: Map<String, ScenarioProgress>,
    val zuletztSzenario: String?,
)

private val Context.dataStore by preferencesDataStore(name = "fortschritt")

/** Speichert Fortschritt lokal auf dem Gerät (Jetpack DataStore). Nichts verlässt das Handy. */
class ProgressStore(private val context: Context) {
    private val lastKey = stringPreferencesKey("zuletzt_szenario")

    val progress: Flow<Progress> = context.dataStore.data.map { prefs ->
        val map = mutableMapOf<String, ScenarioProgress>()
        prefs.asMap().forEach { (key, value) ->
            if (key.name.startsWith("sterne_")) {
                val id = key.name.removePrefix("sterne_")
                val zeit = prefs[longPreferencesKey("zeit_$id")] ?: 0L
                map[id] = ScenarioProgress(value as Int, zeit)
            }
        }
        Progress(map, prefs[lastKey])
    }

    suspend fun speichere(szenarioId: String, sterne: Int) {
        context.dataStore.edit { prefs ->
            val key = intPreferencesKey("sterne_$szenarioId")
            prefs[key] = maxOf(prefs[key] ?: 0, sterne)
            prefs[longPreferencesKey("zeit_$szenarioId")] = System.currentTimeMillis()
            prefs[lastKey] = szenarioId
        }
    }

    suspend fun merkeGestartet(szenarioId: String) {
        context.dataStore.edit { it[lastKey] = szenarioId }
    }
}
