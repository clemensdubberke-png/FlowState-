package de.clemens.gespraechskompass.ui.werkzeug

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.data.Baustein
import de.clemens.gespraechskompass.data.ScenarioFile
import de.clemens.gespraechskompass.ui.components.GkCard
import de.clemens.gespraechskompass.ui.components.SectionTitle
import de.clemens.gespraechskompass.ui.components.TopBar
import de.clemens.gespraechskompass.ui.components.lesbar
import de.clemens.gespraechskompass.ui.theme.hexColor

@Composable
fun WerkzeugkastenScreen(app: AppContainer, onBack: () -> Unit) {
    val daten by produceState<ScenarioFile?>(null) { value = runCatching { app.szenarien.load() }.getOrNull() }
    val insets = WindowInsets.safeDrawing.asPaddingValues()
    val gruppen = listOf(
        "zug" to "Gesprächszüge",
        "kunstgriff" to "Kunstgriffe erkennen (Schopenhauer)",
        "stolperfalle" to "Stolperfallen",
    )

    Column(Modifier.fillMaxSize()) {
        TopBar(titel = "Werkzeugkasten", untertitel = "Alle Bausteine im Überblick", onBack = onBack)
        LazyColumn(
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 4.dp, bottom = insets.calculateBottomPadding() + 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                Text(
                    "Die Techniken sind zum Entschärfen und Verstehen da, nicht zum Bloßstellen. Typen sind nur eine Arbeitshypothese, keine Schublade.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            gruppen.forEach { (art, titel) ->
                val liste = daten?.bausteine?.values?.filter { it.art == art }.orEmpty()
                if (liste.isNotEmpty()) {
                    item(key = "h_$art") { SectionTitle(titel, Modifier.padding(top = 8.dp)) }
                    items(liste, key = { "${art}_${it.name}" }) { BausteinZeile(it) }
                }
            }
        }
    }
}

@Composable
private fun BausteinZeile(b: Baustein) {
    val c = hexColor(b.farbe)
    GkCard(Modifier.fillMaxWidth()) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
            Box(Modifier.padding(top = 5.dp).size(12.dp).clip(CircleShape).background(c))
            Spacer(Modifier.width(12.dp))
            Column {
                Text(b.name, style = MaterialTheme.typography.titleSmall, color = lesbar(c))
                if (b.kunstgriffe.isNotEmpty()) {
                    Text(
                        "Kunstgriff " + b.kunstgriffe.joinToString(", "),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(4.dp))
                Text(b.kurz, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}
