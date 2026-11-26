package de.clemens.gespraechskompass.modes.dialogduell

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.data.Baustein
import de.clemens.gespraechskompass.data.Option
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.data.Werte
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

sealed interface ChatItem {
    val key: Long

    data class Their(override val key: Long, val text: String, val zeigeKopf: Boolean) : ChatItem
    data class Narrator(override val key: Long, val text: String) : ChatItem
    data class Mine(override val key: Long, val text: String, val akzent: String?) : ChatItem
    data class Feedback(override val key: Long, val zug: Zug) : ChatItem
    data class Typing(override val key: Long) : ChatItem
}

enum class Phase { LADEN, INTRO, SPIEL, ENDE, AUSWERTUNG, FEHLER }

data class PlayUiState(
    val phase: Phase = Phase.LADEN,
    val scenario: Scenario? = null,
    val bausteine: Map<String, Baustein> = emptyMap(),
    val items: List<ChatItem> = emptyList(),
    val optionen: List<Option> = emptyList(),
    val werte: Werte = Werte(),
    val schritt: Int = 1,
    val wartet: Boolean = false,
    val ergebnis: Ergebnis? = null,
)

class PlayViewModel(private val app: AppContainer, private val szenarioId: String) : ViewModel() {
    private val _state = MutableStateFlow(PlayUiState())
    val state: StateFlow<PlayUiState> = _state.asStateFlow()

    private var engine: DialogEngine? = null
    private var nextKey = 0L
    private fun key() = nextKey++

    init {
        viewModelScope.launch {
            val daten = runCatching { app.szenarien.load() }.getOrNull()
            val s = daten?.szenarien?.firstOrNull { it.id == szenarioId }
            if (daten == null || s == null) {
                _state.value = PlayUiState(phase = Phase.FEHLER)
                return@launch
            }
            engine = DialogEngine(s)
            _state.value = PlayUiState(phase = Phase.INTRO, scenario = s, bausteine = daten.bausteine, werte = s.startwerte.begrenzt())
        }
    }

    fun starte() {
        val e = engine ?: return
        if (_state.value.phase != Phase.INTRO) return
        viewModelScope.launch {
            app.fortschritt.merkeGestartet(szenarioId)
        }
        _state.update { it.copy(phase = Phase.SPIEL, wartet = true) }
        viewModelScope.launch {
            delay(350)
            sprich(e.eroeffnung(), e.aktuell.erzaehler, ersteZeile = true)
            _state.update { it.copy(optionen = e.optionen(), wartet = false, schritt = e.schritt) }
        }
    }

    fun waehle(option: Option) {
        val e = engine ?: return
        val st = _state.value
        if (st.wartet || st.phase != Phase.SPIEL) return
        val ergebnis = e.waehle(option)
        val akzent = option.bausteine.firstOrNull()?.let { st.bausteine[it]?.farbe }
        _state.update {
            it.copy(
                wartet = true,
                optionen = emptyList(),
                items = it.items + ChatItem.Mine(key(), option.text, akzent) + ChatItem.Feedback(key(), ergebnis.zug),
                werte = e.werte,
            )
        }
        viewModelScope.launch {
            delay(700)
            sprich(ergebnis.reaktion, erzaehler = false)
            if (ergebnis.naechsterText != null) {
                delay(250)
                sprich(ergebnis.naechsterText, ergebnis.naechster.erzaehler)
            }
            if (e.istEnde) {
                val erg = e.ergebnis()
                app.fortschritt.speichere(szenarioId, erg.sterne)
                _state.update { it.copy(phase = Phase.ENDE, wartet = false, ergebnis = erg, schritt = e.zuege.size) }
            } else {
                _state.update { it.copy(optionen = e.optionen(), wartet = false, schritt = e.schritt) }
            }
        }
    }

    fun zeigeAuswertung() {
        if (_state.value.phase == Phase.ENDE) _state.update { it.copy(phase = Phase.AUSWERTUNG) }
    }

    fun nochmal() {
        val s = _state.value.scenario ?: return
        engine = DialogEngine(s)
        nextKey = 0
        _state.update {
            PlayUiState(phase = Phase.INTRO, scenario = s, bausteine = it.bausteine, werte = s.startwerte.begrenzt())
        }
    }

    /** Zeigt kurz „tippt …“ und dann den Text. Ganz in Klammern gesetzte Texte sind Erzählung. */
    private suspend fun sprich(text: String?, erzaehler: Boolean, ersteZeile: Boolean = false) {
        if (text.isNullOrBlank()) return
        val t = text.trim()
        val istErzaehlung = erzaehler || (t.startsWith("(") && t.endsWith(")"))
        if (!istErzaehlung) {
            val typingKey = key()
            _state.update { it.copy(items = it.items + ChatItem.Typing(typingKey)) }
            delay((550L + t.length * 12L).coerceAtMost(1500L))
            _state.update { s -> s.copy(items = s.items.filterNot { it.key == typingKey }) }
        } else {
            delay(300)
        }
        _state.update { s ->
            val vorher = s.items.lastOrNull()
            val item = if (istErzaehlung) {
                ChatItem.Narrator(key(), t)
            } else {
                ChatItem.Their(key(), t, zeigeKopf = ersteZeile || vorher !is ChatItem.Their)
            }
            s.copy(items = s.items + item)
        }
    }
}
