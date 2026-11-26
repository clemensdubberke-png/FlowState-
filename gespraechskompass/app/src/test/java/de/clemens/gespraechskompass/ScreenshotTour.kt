package de.clemens.gespraechskompass

import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Looper
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import org.junit.Assume.assumeTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import java.time.Duration

/**
 * Bedient die echte App (Robolectric) und speichert Screenshots nach docs/screenshots.
 * Läuft nur mit:  ./gradlew testDebugUnitTest -Pscreenshots
 * Gleichzeitig ein End-to-End-Test: Startseite → Szenario → 7 Antworten → Auswertung.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34])
class ScreenshotTour {

    @get:Rule
    val rule = createAndroidComposeRule<MainActivity>()

    private val outDir = File(System.getProperty("gk.screenshotDir") ?: "build/screenshots")

    @Before
    fun nurAufWunsch() {
        assumeTrue(System.getProperty("gk.screenshots") == "true")
        outDir.mkdirs()
    }

    @Test
    @Config(qualifiers = "w411dp-h914dp-notnight-xxhdpi")
    fun hell() = tour("hell", alles = true)

    @Test
    @Config(qualifiers = "w411dp-h914dp-night-xxhdpi")
    fun dunkel() = tour("dunkel", alles = false)

    private fun tour(prefix: String, alles: Boolean) {
        warte("Gesprächskompass")
        shot("$prefix-01-start")

        klick("Dialog-Duell")
        warte("Das Familienessen")
        if (alles) shot("$prefix-02-szenarien")

        klick("Das Familienessen")
        warte("Gespräch beginnen")
        if (alles) shot("$prefix-03-intro")

        klick("Gespräch beginnen")
        warte("Deine Antwort")
        shot("$prefix-04-spielstart")

        antworte("Das klingt, als würde dich das richtig ärgern")
        antworte("Die Renten werden doch gar nicht gekürzt")
        shot("$prefix-05-rueckmeldung")
        antworte("Darf ich dir einen Punkt zeigen")
        antworte("Der Bund schießt etwa")
        antworte("Ja, das ist viel, darüber darf man streiten")
        antworte("Das ist ein neues Thema")
        antworte("Mir geht's nicht ums Gewinnen", danach = "Auswertung ansehen")
        if (alles) shot("$prefix-06-ende")

        klick("Auswertung ansehen")
        warte("Was gut lief")
        vergehe(2500) // Sterne-Animation
        shot("$prefix-07-auswertung")

        if (alles) {
            rule.activity.onBackPressedDispatcher.onBackPressed()
            warte("Dialog-Duell")
            rule.activity.onBackPressedDispatcher.onBackPressed()
            warte("Gesprächskompass")
            vergehe(600)
            shot("$prefix-08-start-mit-fortschritt")
        }
    }

    // ---- Hilfen ---------------------------------------------------------------

    private fun antworte(textAnfang: String, danach: String = "Deine Antwort") {
        klick(textAnfang)
        vergehe(400)
        warte(danach)
        vergehe(800)
    }

    private fun klick(text: String) {
        val m = hasText(text, substring = true) and hasClickAction()
        warteAuf(m)
        rule.onNode(m, useUnmergedTree = false).also { runCatching { it.performScrollTo() } }.performClick()
        rule.waitForIdle()
    }

    private fun warte(text: String) = warteAuf(hasText(text, substring = true, ignoreCase = true))

    private fun warteAuf(m: SemanticsMatcher) {
        repeat(150) {
            if (rule.onAllNodes(m).fetchSemanticsNodes().isNotEmpty()) return
            vergehe(100)
        }
        error("Nicht gefunden: ${m.description}")
    }

    /** Lässt Zeit vergehen (Hauptthread-Looper und Compose-Uhr). */
    private fun vergehe(ms: Long) {
        var rest = ms
        while (rest > 0) {
            shadowOf(Looper.getMainLooper()).idleFor(Duration.ofMillis(50))
            rule.mainClock.advanceTimeBy(50)
            rest -= 50
        }
        rule.waitForIdle()
    }

    private fun shot(name: String) {
        vergehe(500)
        val v = rule.activity.window.decorView
        val bmp = Bitmap.createBitmap(v.width, v.height, Bitmap.Config.ARGB_8888)
        v.draw(Canvas(bmp))
        File(outDir, "$name.png").outputStream().use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
}
