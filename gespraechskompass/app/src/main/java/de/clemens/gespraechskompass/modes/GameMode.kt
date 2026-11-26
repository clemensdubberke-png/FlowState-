package de.clemens.gespraechskompass.modes

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.EditNote
import androidx.compose.material.icons.rounded.RateReview
import androidx.compose.material.icons.rounded.Search
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.modes.dialogduell.DialogDuellMode

/**
 * Ein Spielmodus ist ein eigenes Modul: Er bringt Titel, Symbol und seine eigenen Bildschirme
 * (Navigationsziele) mit. Neue Modi werden nur in [ModeRegistry] eingetragen.
 */
interface GameMode {
    val id: String
    val titel: String
    val beschreibung: String
    val icon: ImageVector
    val farbe: Color
    val verfuegbar: Boolean
    /** Route, die beim Antippen auf der Startseite geöffnet wird. */
    val startRoute: String

    /** Registriert die Bildschirme dieses Modus im Navigationsgraphen. */
    fun register(builder: NavGraphBuilder, nav: NavController, app: AppContainer)
}

/** Platzhalter für geplante Modi: erscheinen auf der Startseite als „Bald“. */
class GeplanterModus(
    override val id: String,
    override val titel: String,
    override val beschreibung: String,
    override val icon: ImageVector,
    override val farbe: Color,
) : GameMode {
    override val verfuegbar = false
    override val startRoute = ""
    override fun register(builder: NavGraphBuilder, nav: NavController, app: AppContainer) = Unit
}

object ModeRegistry {
    val modes: List<GameMode> = listOf(
        DialogDuellMode,
        GeplanterModus("trick-detektiv", "Trick-Detektiv", "Kunstgriffe aus Schopenhauers Warnliste in kurzen Sätzen erkennen.", Icons.Rounded.Search, Color(0xFFC8553D)),
        GeplanterModus("pausentest-blitz", "Pausentest-Blitz", "Schnell entscheiden: Lohnt sich das Gespräch, oder nicken und Energie sparen?", Icons.Rounded.Bolt, Color(0xFF6B7FD7)),
        GeplanterModus("nachbesprechung", "Nachbesprechung", "Ein echtes Gespräch reflektieren, ohne Namen und ohne Details zu echten Personen.", Icons.Rounded.RateReview, Color(0xFF2A9D8F)),
        GeplanterModus("satz-werkstatt", "Satz-Werkstatt", "Einen Konter in eine Frage oder ein Fakt-Sandwich umbauen.", Icons.Rounded.EditNote, Color(0xFFD99A2B)),
        GeplanterModus("ki-gegenueber", "KI-Gegenüber", "Freies Gespräch mit einem simulierten Gegenüber (optional, online).", Icons.Rounded.AutoAwesome, Color(0xFF8E6CC9)),
    )
}
