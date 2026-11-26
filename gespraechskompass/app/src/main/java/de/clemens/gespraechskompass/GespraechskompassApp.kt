package de.clemens.gespraechskompass

import android.app.Application
import android.content.Context
import de.clemens.gespraechskompass.data.ProgressStore
import de.clemens.gespraechskompass.data.ScenarioRepository

/** Einfache, manuelle Abhängigkeiten. Alles lokal, keine Netzwerkzugriffe. */
class AppContainer(context: Context) {
    val szenarien = ScenarioRepository(context)
    val fortschritt = ProgressStore(context)
}

class GespraechskompassApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
