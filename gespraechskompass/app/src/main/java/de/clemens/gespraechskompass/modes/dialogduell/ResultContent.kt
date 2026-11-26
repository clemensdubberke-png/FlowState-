package de.clemens.gespraechskompass.modes.dialogduell

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.FormatQuote
import androidx.compose.material.icons.rounded.HeartBroken
import androidx.compose.material.icons.rounded.History
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.ThumbUp
import androidx.compose.material.icons.rounded.TipsAndUpdates
import androidx.compose.material.icons.automirrored.rounded.TrendingDown
import androidx.compose.material.icons.rounded.Healing
import androidx.compose.material.icons.rounded.WarningAmber
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import de.clemens.gespraechskompass.data.Baustein
import de.clemens.gespraechskompass.data.Bewertung
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.ui.components.BausteinChip
import de.clemens.gespraechskompass.ui.components.GkCard
import de.clemens.gespraechskompass.ui.components.SectionTitle
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
    // Gute Bausteine, die du genutzt hast (Züge und erkannte Kunstgriffe, keine Stolperfallen).
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
        // ---- Kopf mit Sternen ----
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
                Text(auswertung?.titel ?: "Geschafft", style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
                Spacer(Modifier.height(4.dp))
                Text(
                    "${e.zuege.size} Schritte · ${e.guteZuege.size} starke Züge" +
                        if (e.kraenkendeZuege.isNotEmpty()) " · ${e.kraenkendeZuege.size}× ${s.nachwirkung}" else "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                )
                e.abzuege.forEach {
                    Spacer(Modifier.height(6.dp))
                    Text(it, style = MaterialTheme.typography.bodySmall, color = lesbar(gk.unguenstig), textAlign = TextAlign.Center)
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
                val w = e.wendepunkt
                if (w != null) {
                    Spacer(Modifier.height(10.dp))
                    Text(
                        "Wendepunkt: Schritt ${w.schritt}",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text("„${w.option.text}“", style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic))
                    Text(
                        "Details siehst du unten im Gesprächsverlauf.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

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

            // ---- Chronologischer Verlauf ----
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 10.dp)) {
                Icon(Icons.Rounded.History, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp))
                SectionTitle("Das Gespräch Schritt für Schritt")
            }
            Text(
                "Hier siehst du jede deiner Antworten, wie sie gewirkt hat und warum, und wo Fehler nachgewirkt haben.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            e.zuege.forEach { z -> SchrittKarte(s, bausteine, z) }
            e.ende.sagt.firstOrNull()?.let {
                Text(
                    "Ende: ${it.text}",
                    style = MaterialTheme.typography.bodySmall.copy(fontStyle = FontStyle.Italic),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 6.dp),
                )
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

/** Ein Schritt im Gesprächsverlauf: was gesagt wurde, deine Antwort, Bewertung, Nachwirkung. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SchrittKarte(s: Scenario, bausteine: Map<String, Baustein>, z: Zug) {
    val gk = LocalGk.current
    val farbe = gk.fuer(z.bewertung)
    val (icon, label) = when (z.bewertung) {
        Bewertung.GUT -> Icons.Rounded.CheckCircle to "Hat funktioniert"
        Bewertung.TEILS -> Icons.Rounded.Lightbulb to "Teilweise hilfreich"
        Bewertung.UNGUENSTIG -> Icons.Rounded.WarningAmber to "Hat nicht funktioniert"
    }
    Surface(
        shape = RoundedCornerShape(22.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(Modifier.height(IntrinsicSize.Min)) {
            Box(Modifier.width(5.dp).fillMaxHeight().background(farbe))
            Column(Modifier.padding(start = 14.dp, end = 16.dp, top = 14.dp, bottom = 16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Schritt ${z.schritt}",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.width(10.dp))
                    Icon(icon, contentDescription = null, tint = farbe, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(label, style = MaterialTheme.typography.labelMedium, color = lesbar(farbe))
                }

                // Was das Gegenüber gesagt hat
                if (z.kontext.isNotEmpty()) {
                    Spacer(Modifier.height(8.dp))
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .background(gk.theirBubble, RoundedCornerShape(14.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        z.kontext.forEach { zeile ->
                            val erzaehlung = zeile.trim().startsWith("(") && zeile.trim().endsWith(")")
                            Text(
                                if (erzaehlung) zeile else "${s.gegenueber.name}: „$zeile“",
                                style = MaterialTheme.typography.bodySmall.copy(fontStyle = if (erzaehlung) FontStyle.Italic else FontStyle.Normal),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }

                // Deine Antwort
                Spacer(Modifier.height(8.dp))
                Text("Du:", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("„${z.option.text}“", style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold))

                Spacer(Modifier.height(8.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    z.option.bausteine.mapNotNull { bausteine[it] }.forEach { BausteinChip(it) }
                }
                Spacer(Modifier.height(8.dp))
                Text(z.warum, style = MaterialTheme.typography.bodyMedium)

                // Lage hat die Wirkung verändert
                z.notiz?.let { Hinweis(Icons.Rounded.Info, it, gk.erkenntnis) }

                // Nachwirkungen
                if (z.kraenkt > 0) {
                    val staerke = if (z.kraenkt >= 2) "schwer" else "leicht"
                    val text = if (s.nachwirkung == "Kränkung") {
                        "Das hat gekränkt ($staerke). Die Kränkung wirkt in den nächsten Schritten nach: Gute Züge wirken schwächer, weitere Fehler schwerer."
                    } else {
                        "${s.nachwirkung} ($staerke): Das wirkt in den nächsten Schritten nach und macht es schwerer, loszulassen."
                    }
                    Hinweis(Icons.Rounded.HeartBroken, text, gk.unguenstig)
                }
                z.nachwirkungAus?.let {
                    Hinweis(
                        Icons.AutoMirrored.Rounded.TrendingDown,
                        "Nachwirkung aus Schritt $it: Diese Antwort hat nur gedämpft gewirkt.",
                        gk.teils,
                    )
                }
                if (z.repariert) {
                    Hinweis(
                        Icons.Rounded.Healing,
                        "Eingeständnis: Die ${s.nachwirkung} ist kleiner geworden, aber nicht verschwunden.",
                        gk.gut,
                    )
                }
                if (z.gekippt) {
                    Hinweis(Icons.Rounded.WarningAmber, "Hier ist das Gespräch gekippt. Zu viele Kränkungen hatten sich aufgeschichtet.", gk.unguenstig)
                }

                // Stärkere Alternative
                z.bessereAlternative?.let { alt ->
                    Spacer(Modifier.height(10.dp))
                    Text("Stärker wäre gewesen:", style = MaterialTheme.typography.labelMedium, color = lesbar(gk.gut))
                    Text("„${alt.text}“", style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic))
                    Spacer(Modifier.height(6.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        alt.bausteine.mapNotNull { bausteine[it] }.forEach { BausteinChip(it) }
                    }
                }

                // Wirkung in Zahlen
                val d = z.delta
                Spacer(Modifier.height(8.dp))
                Text(
                    listOf(
                        "${vorzeichen(d.vertrauen)} ${s.balken.vertrauen}",
                        "${vorzeichen(d.erkenntnis)} ${s.balken.erkenntnis}",
                    ).joinToString("  ·  "),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun Hinweis(icon: ImageVector, text: String, farbe: Color) {
    Spacer(Modifier.height(8.dp))
    Row(
        Modifier
            .fillMaxWidth()
            .background(farbe.copy(alpha = 0.10f), RoundedCornerShape(12.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Icon(icon, contentDescription = null, tint = farbe, modifier = Modifier.size(16.dp).padding(top = 2.dp))
        Spacer(Modifier.width(8.dp))
        Text(text, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface)
    }
}

private fun vorzeichen(v: Int) = if (v > 0) "+$v" else "$v"

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
