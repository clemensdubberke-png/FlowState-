package de.clemens.gespraechskompass.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import de.clemens.gespraechskompass.R
import de.clemens.gespraechskompass.data.Bewertung

// ---- Farben ------------------------------------------------------------------
// Ruhig: weißer Grund, tiefe Tinte, ein Akzent in Petrol. Bausteine bringen ihre eigenen Farben mit.
private val Ink = Color(0xFF1B2333)
private val InkSoft = Color(0xFF5B6476)
private val Paper = Color(0xFFFFFFFF)
private val Mist = Color(0xFFF3F5F8)
private val Line = Color(0xFFE3E7ED)
private val Petrol = Color(0xFF2A7F86)

private val InkDark = Color(0xFFE8ECF2)
private val InkSoftDark = Color(0xFFA2ABBA)
private val PaperDark = Color(0xFF0E131B)
private val MistDark = Color(0xFF19202B)
private val LineDark = Color(0xFF2A3341)
private val PetrolDark = Color(0xFF6CC3C3)

@Immutable
data class GkExtraColors(
    val gut: Color,
    val teils: Color,
    val unguenstig: Color,
    val vertrauen: Color,
    val erkenntnis: Color,
    val mineBubble: Color,
    val onMineBubble: Color,
    val theirBubble: Color,
    val track: Color,
    val star: Color,
) {
    fun fuer(b: Bewertung) = when (b) {
        Bewertung.GUT -> gut
        Bewertung.TEILS -> teils
        Bewertung.UNGUENSTIG -> unguenstig
    }
}

private val LightExtra = GkExtraColors(
    gut = Color(0xFF2E8B57),
    teils = Color(0xFFC98A1B),
    unguenstig = Color(0xFFC4554D),
    vertrauen = Color(0xFF2A9D8F),
    erkenntnis = Color(0xFF6B7FD7),
    mineBubble = Ink,
    onMineBubble = Paper,
    theirBubble = Mist,
    track = Color(0xFFE9EDF2),
    star = Color(0xFFE6A532),
)

private val DarkExtra = GkExtraColors(
    gut = Color(0xFF5CC08A),
    teils = Color(0xFFE5B04B),
    unguenstig = Color(0xFFE57B72),
    vertrauen = Color(0xFF4FC1B2),
    erkenntnis = Color(0xFF8E9DF0),
    mineBubble = Color(0xFFDDE3EC),
    onMineBubble = Color(0xFF141A24),
    theirBubble = MistDark,
    track = Color(0xFF263040),
    star = Color(0xFFF2B84B),
)

val LocalGk = staticCompositionLocalOf { LightExtra }

private val LightScheme = lightColorScheme(
    primary = Ink, onPrimary = Paper,
    secondary = Petrol, onSecondary = Paper,
    tertiary = Petrol,
    background = Paper, onBackground = Ink,
    surface = Paper, onSurface = Ink,
    surfaceVariant = Mist, onSurfaceVariant = InkSoft,
    surfaceContainer = Mist, surfaceContainerHigh = Color(0xFFECEFF4), surfaceContainerLow = Color(0xFFF8F9FB),
    outline = Color(0xFFC9CFD8), outlineVariant = Line,
)

private val DarkScheme = darkColorScheme(
    primary = InkDark, onPrimary = PaperDark,
    secondary = PetrolDark, onSecondary = PaperDark,
    tertiary = PetrolDark,
    background = PaperDark, onBackground = InkDark,
    surface = PaperDark, onSurface = InkDark,
    surfaceVariant = MistDark, onSurfaceVariant = InkSoftDark,
    surfaceContainer = MistDark, surfaceContainerHigh = Color(0xFF212936), surfaceContainerLow = Color(0xFF131922),
    outline = Color(0xFF3A4556), outlineVariant = LineDark,
)

// ---- Schriften (lokal in res/font, OFL) ---------------------------------------
val Lexend = FontFamily(
    Font(R.font.lexend_regular, FontWeight.Normal),
    Font(R.font.lexend_medium, FontWeight.Medium),
    Font(R.font.lexend_semibold, FontWeight.SemiBold),
)
val SourceSans = FontFamily(
    Font(R.font.sourcesans3_regular, FontWeight.Normal),
    Font(R.font.sourcesans3_italic, FontWeight.Normal, FontStyle.Italic),
    Font(R.font.sourcesans3_semibold, FontWeight.SemiBold),
)

private val GkTypography = Typography(
    displaySmall = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.SemiBold, fontSize = 34.sp, lineHeight = 40.sp, letterSpacing = (-0.5).sp),
    headlineMedium = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.SemiBold, fontSize = 26.sp, lineHeight = 32.sp, letterSpacing = (-0.3).sp),
    headlineSmall = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.SemiBold, fontSize = 22.sp, lineHeight = 28.sp, letterSpacing = (-0.2).sp),
    titleLarge = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.Medium, fontSize = 20.sp, lineHeight = 26.sp),
    titleMedium = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.Medium, fontSize = 17.sp, lineHeight = 22.sp),
    titleSmall = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 20.sp),
    bodyLarge = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Normal, fontSize = 18.sp, lineHeight = 25.sp),
    bodyMedium = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 22.sp),
    bodySmall = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 19.sp),
    labelLarge = TextStyle(fontFamily = Lexend, fontWeight = FontWeight.Medium, fontSize = 15.sp, lineHeight = 20.sp),
    labelMedium = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, lineHeight = 16.sp, letterSpacing = 0.2.sp),
    labelSmall = TextStyle(fontFamily = SourceSans, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, lineHeight = 15.sp, letterSpacing = 0.4.sp),
)

@Composable
fun GespraechskompassTheme(dark: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalGk provides if (dark) DarkExtra else LightExtra) {
        MaterialTheme(
            colorScheme = if (dark) DarkScheme else LightScheme,
            typography = GkTypography,
            content = content,
        )
    }
}

/** "#RRGGBB" → Color. Unbekannte Werte fallen auf Grau zurück. */
fun hexColor(hex: String): Color = runCatching {
    Color(("FF" + hex.removePrefix("#")).toLong(16))
}.getOrDefault(Color(0xFF7A8B99))
