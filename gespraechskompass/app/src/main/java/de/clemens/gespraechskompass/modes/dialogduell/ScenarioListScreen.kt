package de.clemens.gespraechskompass.modes.dialogduell

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.data.Progress
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.data.ScenarioFile
import de.clemens.gespraechskompass.data.ScenarioProgress
import de.clemens.gespraechskompass.data.typName
import de.clemens.gespraechskompass.ui.components.GkCard
import de.clemens.gespraechskompass.ui.components.IconBadge
import de.clemens.gespraechskompass.ui.components.SmallChip
import de.clemens.gespraechskompass.ui.components.StarRow
import de.clemens.gespraechskompass.ui.components.TopBar
import de.clemens.gespraechskompass.ui.components.szenarioIcon
import java.util.concurrent.TimeUnit

/** Farbe des Gegenübers nach Typ (nur Arbeitshypothese). */
fun gegenueberFarbe(s: Scenario): Color = when (s.gegenueber.typ.firstOrNull()) {
    1 -> if (s.gegenueber.typ.contains(2)) Color(0xFFC0706B) else Color(0xFF8E6CC9)
    2 -> Color(0xFFE07A5F)
    3 -> Color(0xFFB07D62)
    else -> Color(0xFF7A8B99)
}

@Composable
fun ScenarioListScreen(app: AppContainer, onBack: () -> Unit, onSzenario: (String) -> Unit) {
    val daten by produceState<ScenarioFile?>(null) { value = runCatching { app.szenarien.load() }.getOrNull() }
    val progress by app.fortschritt.progress.collectAsStateWithLifecycle(Progress(emptyMap(), null))
    val insets = WindowInsets.safeDrawing.asPaddingValues()

    Column(Modifier.fillMaxSize()) {
        TopBar(titel = DialogDuellMode.titel, untertitel = "${daten?.szenarien?.size ?: 0} Szenarien", onBack = onBack)
        LazyColumn(
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 4.dp, bottom = insets.calculateBottomPadding() + 24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            item {
                Text(
                    "Wähle eine Szene. Zwei Balken zeigen Vertrauen und Erkenntnis. Kontern kostet Vertrauen, echte Fragen bringen beides.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                )
            }
            items(daten?.szenarien.orEmpty(), key = { it.id }) { s ->
                ScenarioCard(s, progress.proSzenario[s.id], istLetztes = progress.zuletztSzenario == s.id) { onSzenario(s.id) }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScenarioCard(s: Scenario, p: ScenarioProgress?, istLetztes: Boolean, onClick: () -> Unit) {
    val farbe = gegenueberFarbe(s)
    GkCard(Modifier.fillMaxWidth(), onClick = onClick) {
        Column(Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconBadge(szenarioIcon(s.icon), farbe)
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(s.titel, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "${s.gegenueber.name} · ${s.ort}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                StarRow(p?.besteSterne ?: 0, size = 18.dp)
            }
            Spacer(Modifier.height(10.dp))
            Text(s.thema, style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(10.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                if (s.art == "pausentest") SmallChip("Pausentest", Color(0xFF6B7FD7))
                if (s.gegenueber.typ.isEmpty()) SmallChip("Typ unbekannt")
                s.gegenueber.typ.forEach { SmallChip("Typ $it · ${typName(it)}", farbe) }
                if (p != null && p.zuletztGespielt > 0) SmallChip(wannText(p.zuletztGespielt))
                else if (istLetztes) SmallChip("Begonnen")
            }
        }
    }
}

private fun wannText(zeit: Long): String {
    val tage = TimeUnit.MILLISECONDS.toDays(System.currentTimeMillis() - zeit)
    return when {
        tage <= 0L -> "Heute gespielt"
        tage == 1L -> "Gestern gespielt"
        else -> "Vor $tage Tagen gespielt"
    }
}
