package de.clemens.gespraechskompass.modes.dialogduell

import de.clemens.gespraechskompass.data.Bewertung
import de.clemens.gespraechskompass.data.Knoten
import de.clemens.gespraechskompass.data.Option
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.data.Variante
import de.clemens.gespraechskompass.data.Werte
import kotlin.random.Random

/** Ein gespielter Zug: an welchem Knoten, welche Option, Werte davor und danach. */
data class Zug(
    val knotenId: String,
    val option: Option,
    val vorher: Werte,
    val nachher: Werte,
) {
    val bewertung get() = Bewertung.von(option.bewertung)
    /** Tatsächliche Änderung (nach Begrenzung auf 0..100). */
    val delta get() = Werte(
        nachher.vertrauen - vorher.vertrauen,
        nachher.erkenntnis - vorher.erkenntnis,
        nachher.anspannung - vorher.anspannung,
    )
}

data class ZugErgebnis(
    val zug: Zug,
    /** Direkte Reaktion des Gegenübers auf genau diese Antwort (abhängig von der Anspannung davor). */
    val reaktion: String,
    val naechster: Knoten,
    /** Folgetext des nächsten Knotens (abhängig von der neuen Anspannung), falls vorhanden. */
    val naechsterText: String?,
)

data class Ergebnis(
    val sterne: Int,
    val ende: Knoten,
    val werte: Werte,
    val zuege: List<Zug>,
    val guteZuege: List<Zug>,
    val ersterFehler: Zug?,
    /** Eine bessere Antwort an der Stelle des ersten Fehlers. */
    val bessereAlternative: Option?,
)

/**
 * Spiellogik des Dialog-Duells, unabhängig von Android und Oberfläche (per Unit-Test prüfbar).
 *
 * Regeln:
 * - Die Anspannung VOR einer Antwort wählt die Reaktionsvariante (dieselbe Antwort wirkt je nach Stimmung anders).
 * - Effekte werden addiert und auf 0..100 begrenzt.
 * - Optional führt eine Antwort ab einer Anspannung zu einem anderen Knoten.
 * - Sterne kommen vom Endknoten. Ist der erste Balken (Vertrauen bzw. Energie) unter 35, gibt es einen Stern weniger.
 */
class DialogEngine(
    val scenario: Scenario,
    private val random: Random = Random.Default,
) {
    private val knoten = scenario.knoten.associateBy { it.id }
    private val verlauf = mutableListOf<Zug>()

    var werte: Werte = scenario.startwerte.begrenzt()
        private set
    var aktuell: Knoten = knoten.getValue(scenario.start)
        private set

    val zuege: List<Zug> get() = verlauf
    val istEnde: Boolean get() = aktuell.ende
    val schritt: Int get() = verlauf.size + 1

    /** Erster Satz des Gegenübers. */
    fun eroeffnung(): String? = aktuell.sagt.waehle(werte.anspannung)

    /** Optionen des aktuellen Knotens in zufälliger Reihenfolge (damit man nicht nach Position lernt). */
    fun optionen(): List<Option> = aktuell.optionen.shuffled(random)

    fun waehle(option: Option): ZugErgebnis {
        check(!istEnde) { "Szenario ist bereits beendet" }
        require(aktuell.optionen.any { it === option }) { "Option gehört nicht zum aktuellen Knoten" }
        val vorher = werte
        val reaktion = option.reaktion.waehle(vorher.anspannung).orEmpty()
        val nachher = (vorher + option.effekt).begrenzt()
        val zielId = option.weiterBeiAnspannung
            ?.takeIf { nachher.anspannung >= it.ab }
            ?.ziel
            ?: option.weiter
        val zug = Zug(aktuell.id, option, vorher, nachher)
        verlauf += zug
        werte = nachher
        aktuell = knoten.getValue(zielId)
        return ZugErgebnis(zug, reaktion, aktuell, aktuell.sagt.waehle(nachher.anspannung))
    }

    fun ergebnis(): Ergebnis {
        check(istEnde) { "Szenario ist noch nicht beendet" }
        val fehler = verlauf.firstOrNull { it.bewertung == Bewertung.UNGUENSTIG }
            ?: verlauf.firstOrNull { it.bewertung == Bewertung.TEILS }
        val alternative = fehler?.let { f ->
            knoten[f.knotenId]?.optionen
                ?.filter { Bewertung.von(it.bewertung) == Bewertung.GUT }
                ?.maxByOrNull { it.effekt.vertrauen + it.effekt.erkenntnis - it.effekt.anspannung }
        }
        return Ergebnis(
            sterne = sterne(aktuell, werte),
            ende = aktuell,
            werte = werte,
            zuege = verlauf.toList(),
            guteZuege = verlauf.filter { it.bewertung == Bewertung.GUT },
            ersterFehler = fehler,
            bessereAlternative = alternative,
        )
    }

    private fun List<Variante>.waehle(anspannung: Int): String? =
        filter { it.passt(anspannung) }.ifEmpty { this }.randomOrNull(random)?.text

    companion object {
        const val VERTRAUEN_SCHWELLE = 35

        fun sterne(ende: Knoten, werte: Werte): Int {
            val basis = ende.sterne.coerceIn(1, 3)
            return if (werte.vertrauen < VERTRAUEN_SCHWELLE) maxOf(1, basis - 1) else basis
        }
    }
}
