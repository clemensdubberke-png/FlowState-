package de.clemens.gespraechskompass.modes.dialogduell

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.FormatQuote
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.ThumbUp
import androidx.compose.material.icons.rounded.TipsAndUpdates
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import de.clemens.gespraechskompass.data.Baustein
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.ui.components.BausteinChip
import de.clemens.gespraechskompass.ui.components.GkCard
import de.clemens.gespraechskompass.ui.components.StarRow
import de.clemens.gespraechskompass.ui.components.ValueBar
import de.clemens.gespraechskompass.ui.components.lesbar
import de.clemens.gespraechskompass.ui.theme.LocalGk

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ResultContent(
    s: Scenario,
    bausteine: Map<String, Baustein>,
    e: Ergebnis,
    onNochmal: () -> Unit,
    onFertig: () -> Unit,
) {
    val gk = LocalGk.current
    val insets = WindowInsets.safeDrawing.asPaddingValues()
    val auswertung = e.ende.auswertung
    // Gute Bausteine, die du genutzt hast (nur Züge und erkannte Kunstgriffe, keine Stolperfallen).
    val guteBausteine = e.guteZuege
        .flatMap { it.option.bausteine }
        .distinct()
        .mapNotNull { bausteine[it] }
        .filter { it.art != "stolperfalle" }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(bottom = insets.calculateBottomPadding() + 20.dp),
    ) {
        // Kopf mit Sternen
        Box(
            Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(gk.star.copy(alpha = 0.16f), Color.Transparent)))
                .statusBarsPadding()
                .padding(top = 28.dp, bottom = 20.dp, start = 24.dp, end = 24.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Auswertung · ${s.titel}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(14.dp))
                StarRow(e.sterne, size = 52.dp, animiert = true)
                Spacer(Modifier.height(14.dp))
                Text(
                    auswertung?.titel ?: "Geschafft",
                    style = MaterialTheme.typography.headlineMedium,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "${e.zuege.size} Schritte · ${e.guteZuege.size} starke Züge",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (e.sterne < e.ende.sterne) {
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Ein Stern Abzug: ${s.balken.vertrauen} lag am Ende unter ${DialogEngine.VERTRAUEN_SCHWELLE}.",
                        style = MaterialTheme.typography.bodySmall,
                        color = gk.unguenstig,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }

        Column(Modifier.padding(horizontal = 20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                ValueBar(s.balken.vertrauen, e.werte.vertrauen, gk.vertrauen, Modifier.weight(1f))
                ValueBar(s.balken.erkenntnis, e.werte.erkenntnis, gk.erkenntnis, Modifier.weight(1f))
            }

            AbschnittKarte(Icons.Rounded.ThumbUp, "Was gut lief", gk.gut) {
                Text(auswertung?.gut.orEmpty(), style = MaterialTheme.typography.bodyLarge)
                if (guteBausteine.isNotEmpty()) {
                    Spacer(Modifier.height(10.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        guteBausteine.forEach { BausteinChip(it) }
                    }
                }
            }

            AbschnittKarte(Icons.Rounded.TipsAndUpdates, "Beim nächsten Mal", gk.teils) {
                Text(auswertung?.anders.orEmpty(), style = MaterialTheme.typography.bodyLarge)
                val f = e.ersterFehler
                if (f != null) {
                    Spacer(Modifier.height(12.dp))
                    Text("Du hast gesagt:", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("„${f.option.text}“", style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic))
                    Spacer(Modifier.height(4.dp))
                    Text(f.option.warum, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    val alt = e.bessereAlternative
                    if (alt != null) {
                        Spacer(Modifier.height(10.dp))
                        Text("Stärker wäre zum Beispiel:", style = MaterialTheme.typography.labelMedium, color = lesbar(gk.gut))
                        Text("„${alt.text}“", style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic))
                        Spacer(Modifier.height(6.dp))
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            alt.bausteine.mapNotNull { bausteine[it] }.forEach { BausteinChip(it) }
                        }
                    }
                }
            }

            // Selbstcheck als ruhiges Zitat
            Surface(
                shape = RoundedCornerShape(26.dp),
                color = gk.erkenntnis.copy(alpha = 0.10f),
                border = BorderStroke(1.dp, gk.erkenntnis.copy(alpha = 0.25f)),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(20.dp)) {
                    Icon(Icons.Rounded.FormatQuote, contentDescription = null, tint = gk.erkenntnis, modifier = Modifier.size(28.dp))
                    Text("Selbstcheck", style = MaterialTheme.typography.labelMedium, color = lesbar(gk.erkenntnis))
                    Spacer(Modifier.height(6.dp))
                    Text(auswertung?.selbstcheck.orEmpty(), style = MaterialTheme.typography.titleLarge)
                }
            }

            if (s.fakten.isNotEmpty()) {
                GkCard(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Fakten in diesem Szenario", style = MaterialTheme.typography.titleSmall)
                        s.fakten.forEach { f ->
                            Column {
                                Text("• ${f.text}", style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    "Stand: ${f.stand}" + if (f.quellePruefen) " · vor Verwendung prüfen" else "",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(start = 10.dp),
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(4.dp))
            Button(onClick = onFertig, shape = RoundedCornerShape(50), modifier = Modifier.fillMaxWidth().height(56.dp)) {
                Text("Zur Übersicht", style = MaterialTheme.typography.labelLarge)
            }
            OutlinedButton(onClick = onNochmal, shape = RoundedCornerShape(50), modifier = Modifier.fillMaxWidth().height(56.dp)) {
                Icon(Icons.Rounded.Replay, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Noch mal spielen", style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}

@Composable
private fun AbschnittKarte(icon: ImageVector, titel: String, farbe: Color, content: @Composable () -> Unit) {
    GkCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = farbe, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text(titel, style = MaterialTheme.typography.titleSmall, color = lesbar(farbe))
            }
            Spacer(Modifier.height(8.dp))
            content()
        }
    }
}
