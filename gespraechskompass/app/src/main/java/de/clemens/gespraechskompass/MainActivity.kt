package de.clemens.gespraechskompass

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import de.clemens.gespraechskompass.ui.AppNav
import de.clemens.gespraechskompass.ui.theme.GespraechskompassTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)

        val app = (application as GespraechskompassApp).container
        // Startbildschirm halten, bis die Szenarien geladen sind (dauert nur Millisekunden).
        var bereit = false
        splash.setKeepOnScreenCondition { !bereit }
        lifecycleScope.launch {
            runCatching { app.szenarien.load() }
            bereit = true
        }

        // Randlos zeichnen; Statusleisten-Symbole folgen automatisch Hell/Dunkel.
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT),
        )

        setContent {
            GespraechskompassTheme {
                // Surface setzt Hintergrund UND Standard-Textfarbe (wichtig für den Dunkelmodus).
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    AppNav(app)
                }
            }
        }
    }
}
