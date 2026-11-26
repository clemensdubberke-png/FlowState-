package de.clemens.gespraechskompass.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Build
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.data.Progress
import de.clemens.gespraechskompass.data.ScenarioFile
import de.clemens.gespraechskompass.modes.GameMode
import de.clemens.gespraechskompass.modes.ModeRegistry
import de.clemens.gespraechskompass.modes.dialogduell.DialogDuellMode
import de.clemens.gespraechskompass.ui.components.AppLogo
import de.clemens.gespraechskompass.ui.components.GkCard
import de.clemens.gespraechskompass.ui.components.IconBadge
import de.clemens.gespraechskompass.ui.components.SectionTitle
import de.clemens.gespraechskompass.ui.components.SmallChip
import de.clemens.gespraechskompass.ui.components.szenarioIcon
import de.clemens.gespraechskompass.ui.theme.LocalGk

@Composable
fun HomeScreen(
    app: AppContainer,
    onMode: (GameMode) -> Unit,
    onWerkzeugkasten: () -> Unit,
    onSzenario: (String) -> Unit,
) {
    val daten by produceState<ScenarioFile?>(null) { value = runCatching { app.szenarien.load() }.getOrNull() }
    val progress by app.fortschritt.progress.collectAsStateWithLifecycle(Progress(emptyMap(), null))
    val insets = WindowInsets.safeDrawing.asPaddingValues()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            start = 20.dp, end = 20.dp,
            top = insets.calculateTopPadding() + 12.dp,
            bottom = insets.calculateBottomPadding() + 24.dp,
        ),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                AppLogo(48.dp)
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text("Gesprächskompass", style = MaterialTheme.typography.headlineSmall)
                    Text(
                        "Gelassen reden. Wirksam bleiben.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                FilledTonalIconButton(
                    onClick = onWerkzeugkasten,
                    modifier = Modifier.size(48.dp),
                    colors = IconButtonDefaults.filledTonalIconButtonColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant,
                        contentColor = MaterialTheme.colorScheme.onSurface,
                    ),
                ) {
                    Icon(Icons.Rounded.Build, contentDescription = "Werkzeugkasten: alle Bausteine")
                }
            }
        }

        item { HeroCard(daten, progress, onSzenario) }

        item { SectionTitle("Spielmodi", Modifier.fillMaxWidth()) }

        items(ModeRegistry.modes, key = { it.id }) { mode ->
            ModeCard(mode, daten, progress, onClick = { onMode(mode) })
        }

        item {
            Text(
                "Alles bleibt auf deinem Handy: keine Konten, kein Tracking, kein Internet nötig.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp, start = 12.dp, end = 12.dp),
            )
        }
    }
}

@Composable
private fun HeroCard(daten: ScenarioFile?, progress: Progress, onSzenario: (String) -> Unit) {
    val gk = LocalGk.current
    val szenarien = daten?.szenarien.orEmpty()
    val letztes = szenarien.firstOrNull { it.id == progress.zuletztSzenario }
    val naechstes = letztes ?: szenarien.firstOrNull { (progress.proSzenario[it.id]?.besteSterne ?: 0) == 0 } ?: szenarien.firstOrNull()
    val gesamt = progress.proSzenario.values.sumOf { it.besteSterne }

    Surface(
        shape = RoundedCornerShape(30.dp),
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Box(
            Modifier.background(
                Brush.linearGradient(
                    listOf(gk.vertrauen.copy(alpha = 0.16f), gk.erkenntnis.copy(alpha = 0.14f)),
                ),
            ),
        ) {
            Column(Modifier.padding(22.dp)) {
                Text(
                    if (letztes != null) "Weiter üben" else "Heute üben?",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    naechstes?.titel ?: "Gesprächskompass",
                    style = MaterialTheme.typography.headlineMedium,
                )
                if (naechstes != null) {
                    Spacer(Modifier.height(4.dp))
                    Text(naechstes.thema, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Spacer(Modifier.height(16.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Button(
                        onClick = { naechstes?.let { onSzenario(it.id) } },
                        enabled = naechstes != null,
                        shape = RoundedCornerShape(50),
                        contentPadding = ButtonDefaults.ButtonWithIconContentPadding,
                        modifier = Modifier.height(48.dp),
                    ) {
                        Text(if (letztes != null) "Weiterspielen" else "Los geht's", style = MaterialTheme.typography.labelLarge)
                        Spacer(Modifier.width(8.dp))
                        Icon(Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                    }
                    Spacer(Modifier.weight(1f))
                    if (szenarien.isNotEmpty()) {
                        Column(horizontalAlignment = Alignment.End) {
                            Text("$gesamt / ${szenarien.size * 3}", style = MaterialTheme.typography.titleMedium)
                            Text("Sterne", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ModeCard(mode: GameMode, daten: ScenarioFile?, progress: Progress, onClick: () -> Unit) {
    GkCard(
        modifier = Modifier.fillMaxWidth().alpha(if (mode.verfuegbar) 1f else 0.62f),
        onClick = if (mode.verfuegbar) onClick else null,
    ) {
        Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
            IconBadge(mode.icon, mode.farbe)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(mode.titel, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f, fill = false))
                    if (!mode.verfuegbar) {
                        Spacer(Modifier.width(8.dp))
                        SmallChip("Bald")
                    }
                }
                Spacer(Modifier.height(2.dp))
                Text(mode.beschreibung, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                if (mode === DialogDuellMode && daten != null) {
                    Spacer(Modifier.height(10.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clip(RoundedCornerShape(50)),
                    ) {
                        daten.szenarien.forEach { s ->
                            val st = progress.proSzenario[s.id]?.besteSterne ?: 0
                            Icon(
                                szenarioIcon(s.icon),
                                contentDescription = null,
                                tint = if (st > 0) LocalGk.current.star else MaterialTheme.colorScheme.outline,
                                modifier = Modifier.size(18.dp),
                            )
                        }
                    }
                }
            }
            if (!mode.verfuegbar) {
                Icon(Icons.Rounded.Lock, contentDescription = "noch nicht verfügbar", tint = MaterialTheme.colorScheme.outline, modifier = Modifier.size(18.dp))
            } else {
                Icon(Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
