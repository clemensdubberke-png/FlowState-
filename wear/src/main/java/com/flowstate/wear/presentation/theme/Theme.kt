package com.flowstate.wear.presentation.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

val WearPurple = Color(0xFFA78BFA)
val WearPurpleDeep = Color(0xFF7C3AED)
val WearAmber = Color(0xFFF59E0B)
val WearBackground = Color(0xFF0D0B14)
val WearCard = Color(0xFF1C1A26)
val WearOnSurface = Color.White
val WearOnSurfaceMuted = Color(0xFF9CA0AE)

private val WearColors = Colors(
    primary = WearPurple,
    primaryVariant = WearPurpleDeep,
    secondary = WearAmber,
    secondaryVariant = WearAmber,
    background = WearBackground,
    surface = WearCard,
    error = Color(0xFFB91C1C),
    onPrimary = WearOnSurface,
    onSecondary = WearOnSurface,
    onBackground = WearOnSurface,
    onSurface = WearOnSurface,
    onSurfaceVariant = WearOnSurfaceMuted,
    onError = WearOnSurface,
)

@Composable
fun FlowStateWearTheme(content: @Composable () -> Unit) {
    MaterialTheme(colors = WearColors, content = content)
}
