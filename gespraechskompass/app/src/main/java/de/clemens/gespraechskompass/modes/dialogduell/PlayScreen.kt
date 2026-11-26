package de.clemens.gespraechskompass.modes.dialogduell

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Place
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.data.typName
import de.clemens.gespraechskompass.ui.components.GkCard
import de.clemens.gespraechskompass.ui.components.IconBadge
import de.clemens.gespraechskompass.ui.components.MineBubble
import de.clemens.gespraechskompass.ui.components.NarratorText
import de.clemens.gespraechskompass.ui.components.SectionTitle
import de.clemens.gespraechskompass.ui.components.SmallChip
import de.clemens.gespraechskompass.ui.components.TheirBubble
import de.clemens.gespraechskompass.ui.components.TopBar
import de.clemens.gespraechskompass.ui.components.TypingIndicator
import de.clemens.gespraechskompass.ui.components.ValueBar
import de.clemens.gespraechskompass.ui.components.AnswerCard
import de.clemens.gespraechskompass.ui.components.Avatar
import de.clemens.gespraechskompass.ui.components.szenarioIcon
import de.clemens.gespraechskompass.ui.theme.LocalGk

@Composable
fun PlayScreen(vm: PlayViewModel, onExit: () -> Unit) {
    val st by vm.state.collectAsStateWithLifecycle()
    var frageVerlassen by rememberSaveable { mutableStateOf(false) }
    val laeuft = st.phase == Phase.SPIEL

    // Zurück-Taste: Während des Spiels mit Rückfrage, sonst direkt zurück.
    BackHandler(enabled = laeuft) { frageVerlassen = true }

    if (frageVerlassen) {
        AlertDialog(
            onDismissRequest = { frageVerlassen = false },
            title = { Text("Szenario verlassen?") },
            text = { Text("Dieser Durchgang wird nicht gewertet. Du kannst jederzeit neu starten.") },
            confirmButton = {
                TextButton(onClick = { frageVerlassen = false; onExit() }) { Text("Verlassen") }
            },
            dismissButton = {
                Button(onClick = { frageVerlassen = false }) { Text("Weiterspielen") }
            },
        )
    }

    AnimatedContent(
        targetState = when (st.phase) {
            Phase.SPIEL, Phase.ENDE -> Phase.SPIEL
            else -> st.phase
        },
        transitionSpec = { fadeIn(tween(300)) togetherWith fadeOut(tween(200)) },
        label = "phase",
    ) { phase ->
        when (phase) {
            Phase.LADEN -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            Phase.FEHLER -> Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                Text("Dieses Szenario konnte nicht geladen werden.", textAlign = TextAlign.Center)
            }
            Phase.INTRO -> st.scenario?.let { IntroContent(it, onStart = vm::starte, onBack = onExit) }
            Phase.AUSWERTUNG -> {
                val s = st.scenario
                val e = st.ergebnis
                if (s != null && e != null) {
                    ResultContent(s, st.bausteine, e, onNochmal = vm::nochmal, onFertig = onExit)
                }
            }
            else -> GameContent(st, onOption = vm::waehle, onAuswertung = vm::zeigeAuswertung, onClose = {
                if (st.phase == Phase.SPIEL) frageVerlassen = true else onExit()
            })
        }
    }
}

@Composable
private fun IntroContent(s: Scenario, onStart: () -> Unit, onBack: () -> Unit) {
    val farbe = gegenueberFarbe(s)
    val insets = WindowInsets.safeDrawing.asPaddingValues()
    Column(Modifier.fillMaxSize()) {
        TopBar(titel = s.titel, untertitel = DialogDuellMode.titel, onBack = onBack)
        Column(
            Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconBadge(szenarioIcon(s.icon), farbe, size = 56.dp)
                Spacer(Modifier.width(14.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Rounded.Place, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text(s.ort, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text(s.thema, style = MaterialTheme.typography.titleMedium)
                }
            }

            GkCard(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(s.gegenueber.name, farbe, size = 44.dp)
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(s.gegenueber.name, style = MaterialTheme.typography.titleMedium)
                            Text(s.gegenueber.rolle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    if (s.gegenueber.beschreibung.isNotBlank()) {
                        Spacer(Modifier.height(10.dp))
                        Text(s.gegenueber.beschreibung, style = MaterialTheme.typography.bodyMedium)
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        if (s.gegenueber.typ.isEmpty()) SmallChip("Typ unbekannt")
                        s.gegenueber.typ.forEach { SmallChip("Typ $it · ${typName(it)}", farbe) }
                    }
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Der Typ ist nur eine Arbeitshypothese, keine Schublade.",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            SectionTitle("Die Szene")
            Text(s.einleitung, style = MaterialTheme.typography.bodyLarge)

            GkCard(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("So funktioniert's", style = MaterialTheme.typography.titleSmall)
                    Text(
                        if (s.art == "pausentest")
                            "Hier zählt deine ${s.balken.vertrauen}. Manchmal ist Nicken oder Gehen die beste Antwort."
                        else
                            "Wähle jeweils eine Antwort. ${s.balken.vertrauen} und ${s.balken.erkenntnis} zeigen, wie das Gespräch läuft. Wie angespannt dein Gegenüber ist, siehst du nur an den Reaktionen.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    ValueBar(s.balken.vertrauen, s.startwerte.vertrauen, LocalGk.current.vertrauen)
                    ValueBar(s.balken.erkenntnis, s.startwerte.erkenntnis, LocalGk.current.erkenntnis)
                }
            }
            Spacer(Modifier.height(8.dp))
        }
        Box(Modifier.fillMaxWidth().padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = insets.calculateBottomPadding() + 16.dp)) {
            Button(
                onClick = onStart,
                shape = RoundedCornerShape(50),
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) {
                Text("Gespräch beginnen", style = MaterialTheme.typography.labelLarge)
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun GameContent(
    st: PlayUiState,
    onOption: (de.clemens.gespraechskompass.data.Option) -> Unit,
    onAuswertung: () -> Unit,
    onClose: () -> Unit,
) {
    val s = st.scenario ?: return
    val gk = LocalGk.current
    val farbe = gegenueberFarbe(s)
    val insets = WindowInsets.safeDrawing.asPaddingValues()
    val listState = rememberLazyListState()

    // Automatisch mitscrollen: Beim Warten auf die eigene Antwort verankern,
    // sobald Optionen erscheinen, auf die letzte Aussage des Gegenübers.
    val ankerIndex = remember(st.items, st.optionen, st.phase) {
        val letzteEigene = st.items.indexOfLast { it is ChatItem.Mine }
        when {
            // Am Ende bis zum Knopf „Auswertung ansehen“ scrollen (er folgt direkt auf den Verlauf).
            st.phase == Phase.ENDE -> st.items.size
            st.optionen.isNotEmpty() -> {
                val nachAntwort = st.items.indexOfLast { it is ChatItem.Mine }
                if (nachAntwort >= 0) (nachAntwort + 1).coerceAtMost(st.items.lastIndex) else 0
            }
            letzteEigene >= 0 -> letzteEigene
            else -> st.items.lastIndex.coerceAtLeast(0)
        }
    }
    LaunchedEffect(st.items.size, st.optionen.size, st.phase) {
        if (st.items.isNotEmpty()) listState.animateScrollToItem(ankerIndex)
    }

    Column(Modifier.fillMaxSize()) {
        TopBar(
            titel = s.titel,
            untertitel = if (st.phase == Phase.ENDE) "Gespräch beendet" else "Schritt ${st.schritt}",
            onBack = onClose,
            backIcon = Icons.Rounded.Close,
            backLabel = "Szenario verlassen",
        )
        Row(
            Modifier.fillMaxWidth().padding(start = 20.dp, end = 20.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            ValueBar(s.balken.vertrauen, st.werte.vertrauen, gk.vertrauen, Modifier.weight(1f))
            ValueBar(s.balken.erkenntnis, st.werte.erkenntnis, gk.erkenntnis, Modifier.weight(1f))
        }
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = insets.calculateBottomPadding() + 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            itemsIndexed(st.items, key = { _, it -> it.key }) { _, item ->
                Box(Modifier.animateItem(fadeInSpec = tween(260))) {
                    when (item) {
                        is ChatItem.Their -> TheirBubble(s.gegenueber.name, item.text, farbe, item.zeigeKopf)
                        is ChatItem.Narrator -> NarratorText(item.text)
                        is ChatItem.Mine -> MineBubble(item.text, null)
                        is ChatItem.Typing -> TypingIndicator(s.gegenueber.name, farbe)
                    }
                }
            }

            if (st.optionen.isNotEmpty()) {
                item(key = "antwort_kopf_${st.schritt}") {
                    SectionTitle("Deine Antwort", Modifier.padding(top = 10.dp, start = 4.dp).animateItem())
                }
                itemsIndexed(st.optionen, key = { i, o -> "opt_${st.schritt}_${i}_${o.text.hashCode()}" }) { i, o ->
                    Box(
                        Modifier
                            .animateItem(fadeInSpec = tween(300, delayMillis = 60 * i))
                            .animateContentSize(),
                    ) {
                        AnswerCard(o.text, nummer = i + 1, onClick = { onOption(o) }, enabled = !st.wartet)
                    }
                }
            }

            if (st.phase == Phase.ENDE) {
                item(key = "ende_button") {
                    Column(
                        Modifier.fillMaxWidth().padding(top = 16.dp).animateItem(fadeInSpec = tween(400)),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text("Das Gespräch ist zu Ende.", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onAuswertung, shape = RoundedCornerShape(50), modifier = Modifier.fillMaxWidth().height(56.dp)) {
                            Text("Auswertung ansehen", style = MaterialTheme.typography.labelLarge)
                            Spacer(Modifier.width(8.dp))
                            Icon(Icons.AutoMirrored.Rounded.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }
}
