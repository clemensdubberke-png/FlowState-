package de.clemens.gespraechskompass.modes.dialogduell

import de.clemens.gespraechskompass.data.Bewertung
import de.clemens.gespraechskompass.data.Knoten
import de.clemens.gespraechskompass.data.Option
import de.clemens.gespraechskompass.data.Scenario
import de.clemens.gespraechskompass.data.Variante
import de.clemens.gespraechskompass.data.Werte
import de.clemens.gespraechskompass.data.Zustand
import kotlin.math.roundToInt
import kotlin.random.Random

/** Ein gespielter Zug mit allem, was die Auswertung braucht. */
data class Zug(
    val schritt: Int,
    val knotenId: String,
    /** Was das Gegenüber vor dieser Antwort gesagt hat. */
    val kontext: List<String>,
    val option: Option,
    /** Welche Optionen in diesem Moment zur Wahl standen. */
    val angeboten: List<Option>,
    val bewertung: Bewertung,
    val warum: String,
    /** Zusatz, wenn die Lage die Wirkung verändert hat (z. B. „nach dem Etikett prallen Fakten ab“). */
    val notiz: String?,
    val vorher: Werte,
    val nachher: Werte,
    val kraenkungVorher: Double,
    val kraenkungNachher: Double,
    /** Schwere der Kränkung, die diese Antwort ausgelöst hat (0, 1, 2). */
    val kraenkt: Int,
    /** Schritt, dessen Kränkung hier noch nachwirkte (gute Wirkung gedämpft), sonst null. */
    val nachwirkungAus: Int?,
    val repariert: Boolean,
    val gekippt: Boolean,
) {
    val delta get() = Werte(
        nachher.vertrauen - vorher.vertrauen,
        nachher.erkenntnis - vorher.erkenntnis,
        nachher.anspannung - vorher.anspannung,
    )

    /** Beste gute Alternative, die in diesem Moment zur Wahl stand (nur wenn diese Antwort nicht gut war). */
    val bessereAlternative: Option?
        get() = if (bewertung == Bewertung.GUT) null else angeboten
            .filter { it !== option && Bewertung.von(it.bewertung) == Bewertung.GUT }
            .maxByOrNull { it.effekt.vertrauen + it.effekt.erkenntnis - it.effekt.anspannung }
}

data class ZugErgebnis(
    val zug: Zug,
    /** Direkte Reaktion des Gegenübers (abhängig von Stimmung und Verlauf VOR der Antwort). */
    val reaktion: String,
    val naechster: Knoten,
    /** Folgetext des nächsten Knotens (abhängig vom Zustand danach), falls vorhanden. */
    val naechsterText: String?,
)

data class Ergebnis(
    val sterne: Int,
    val ende: Knoten,
    val werte: Werte,
    val zuege: List<Zug>,
    val gekippt: Boolean,
    /** Erklärungen, warum es weniger Sterne gab. */
    val abzuege: List<String>,
) {
    val guteZuege get() = zuege.filter { it.bewertung == Bewertung.GUT }
    val kraenkendeZuege get() = zuege.filter { it.kraenkt > 0 }
    /** Der Zug, der am meisten gekostet hat (erste schwere Kränkung, sonst erster Fehler). */
    val wendepunkt get() = zuege.firstOrNull { it.kraenkt >= 2 }
        ?: zuege.firstOrNull { it.kraenkt > 0 }
        ?: zuege.firstOrNull { it.bewertung == Bewertung.UNGUENSTIG }
}

/**
 * Spiellogik des Dialog-Duells, unabhängig von Android und Oberfläche (per Unit-Test prüfbar).
 *
 * Realistische Nachwirkung von Fehlern („Kränkung“, versteckt):
 * - Eine kränkende Antwort erhöht die Kränkung um 1 (leicht) oder 2 (schwer).
 * - Vertrauen wächst grundsätzlich langsamer (×0,7), als es verloren geht.
 * - Solange Kränkung besteht, wirken gute Züge gedämpft (Faktor 1 / (1 + 0,6·K)),
 *   und schlechte Züge wiegen schwerer (Faktor 1 + 0,25·K). Vertrauen geht schneller verloren,
 *   als es zurückkommt.
 * - Die Kränkung klingt langsam ab: −0,5 je guter Antwort, −0,25 je teils guter Antwort,
 *   zusätzlich −1 bei einem ehrlichen Eingeständnis („repariert“).
 * - Ab einer Kränkung von 3,5 kippt das Gespräch (Endknoten „kipp_ende“).
 * - Nach einer schweren Kränkung gibt es höchstens 2 Sterne, und unter 35 Vertrauen einen Stern weniger.
 *
 * Außerdem merkt sich das Gegenüber Dinge („merker“), auf die spätere Sätze Bezug nehmen,
 * und dieselbe Antwort kann je nach Lage anders wirken („falls“).
 */
class DialogEngine(
    val scenario: Scenario,
    private val random: Random = Random.Default,
) {
    private val knoten = scenario.knoten.associateBy { it.id }
    private val verlauf = mutableListOf<Zug>()
    private val merker = mutableSetOf<String>()
    private var letzterKontext: List<String> = emptyList()
    private var offeneKraenkungen = mutableListOf<Int>() // Schritte, deren Kränkung noch wirkt

    var werte: Werte = scenario.startwerte.begrenzt()
        private set
    var kraenkung: Double = 0.0
        private set
    var aktuell: Knoten = knoten.getValue(scenario.start)
        private set
    var gekippt: Boolean = false
        private set
    var schwereKraenkungen: Int = 0
        private set

    val zuege: List<Zug> get() = verlauf
    val istEnde: Boolean get() = aktuell.ende
    val schritt: Int get() = verlauf.size + 1
    val zustand: Zustand get() = Zustand(werte, kraenkung, merker.toSet())

    /** Erster Satz des Gegenübers. */
    fun eroeffnung(): String? = aktuell.sagt.waehle(zustand).also { letzterKontext = listOfNotNull(it) }

    /** Sichtbare Optionen des aktuellen Knotens in zufälliger Reihenfolge. */
    fun optionen(): List<Option> = sichtbareOptionen().shuffled(random)

    private fun sichtbareOptionen() = aktuell.optionen.filter { it.nurWenn?.erfuellt(zustand) ?: true }

    fun waehle(option: Option): ZugErgebnis {
        check(!istEnde) { "Szenario ist bereits beendet" }
        val angeboten = sichtbareOptionen()
        require(angeboten.any { it === option }) { "Option steht gerade nicht zur Wahl" }

        val z = zustand
        val fall = option.falls.firstOrNull { it.wenn.erfuellt(z) }
        val effekt = fall?.effekt ?: option.effekt
        val bewertung = Bewertung.von(fall?.bewertung ?: option.bewertung)
        val kraenkt = (fall?.kraenkt ?: option.kraenkt).coerceIn(0, 2)
        val reaktionsTexte = fall?.reaktion ?: option.reaktion

        // Reaktion: abhängig vom Zustand VOR der Antwort.
        val reaktion = reaktionsTexte.waehle(z).orEmpty()

        // Wirkung: durch bestehende Kränkung gedämpft bzw. verstärkt.
        val k = kraenkung
        val daempfung = 1.0 / (1.0 + 0.6 * k)
        val verstaerkung = 1.0 + 0.25 * k
        fun gut(x: Int) = if (x > 0) (x * daempfung).roundToInt() else (x * verstaerkung).roundToInt()
        fun ruhe(x: Int) = if (x < 0) (x * daempfung).roundToInt() else (x * verstaerkung).roundToInt()
        // Asymmetrie: Vertrauen wächst langsamer, als es verloren geht.
        val vertrauensGewinn = if (effekt.vertrauen > 0) (effekt.vertrauen * VERTRAUEN_AUFBAU).roundToInt() else effekt.vertrauen
        val wirkung = Werte(gut(vertrauensGewinn), gut(effekt.erkenntnis), ruhe(effekt.anspannung))
        val nachher = (werte + wirkung).begrenzt()
        val gedaempft = k > 0.0 && (effekt.vertrauen > 0 || effekt.erkenntnis > 0 || effekt.anspannung < 0)
        val nachwirkungAus = if (gedaempft) offeneKraenkungen.lastOrNull() else null

        // Kränkung fortschreiben.
        var kNeu = k
        if (kraenkt > 0) {
            kNeu += kraenkt
            offeneKraenkungen += schritt
            if (kraenkt >= 2) schwereKraenkungen++
        } else {
            kNeu -= when (bewertung) {
                Bewertung.GUT -> 0.5
                Bewertung.TEILS -> 0.25
                Bewertung.UNGUENSTIG -> 0.0
            }
        }
        if (option.repariert && k > 0.0) kNeu -= 1.0
        kNeu = kNeu.coerceAtLeast(0.0)
        if (kNeu == 0.0) offeneKraenkungen.clear()

        merker += option.merkt
        fall?.let { merker += it.merkt }

        // Ziel bestimmen.
        var zielId = fall?.weiter ?: option.weiter
        option.weiterBeiAnspannung?.let { if (nachher.anspannung >= it.ab) zielId = it.ziel }
        var kippt = false
        val kippZiel = scenario.kippEnde
        if (kippZiel != null && kNeu >= KIPP_SCHWELLE && knoten[zielId]?.ende != true) {
            zielId = kippZiel
            kippt = true
        }

        val zug = Zug(
            schritt = schritt,
            knotenId = aktuell.id,
            kontext = letzterKontext,
            option = option,
            angeboten = angeboten,
            bewertung = bewertung,
            warum = fall?.warum ?: option.warum,
            notiz = fall?.notiz,
            vorher = werte,
            nachher = nachher,
            kraenkungVorher = k,
            kraenkungNachher = kNeu,
            kraenkt = kraenkt,
            nachwirkungAus = nachwirkungAus,
            repariert = option.repariert && k > 0.0,
            gekippt = kippt,
        )
        verlauf += zug
        werte = nachher
        kraenkung = kNeu
        gekippt = gekippt || kippt
        aktuell = knoten.getValue(zielId)

        val folgeText = aktuell.sagt.waehle(zustand)
        letzterKontext = listOfNotNull(reaktion.takeIf { it.isNotBlank() }, folgeText)
        return ZugErgebnis(zug, reaktion, aktuell, folgeText)
    }

    fun ergebnis(): Ergebnis {
        check(istEnde) { "Szenario ist noch nicht beendet" }
        val abzuege = mutableListOf<String>()
        var sterne = aktuell.sterne.coerceIn(1, 3)
        // Ein kleiner Ausrutscher (eine leichte Kränkung) ist verzeihlich, mehr nicht.
        val kraenkungsPunkte = verlauf.sumOf { it.kraenkt }
        if (kraenkungsPunkte >= 2 && sterne > 2) {
            sterne = 2
            val schwer = verlauf.firstOrNull { it.kraenkt >= 2 }
            abzuege += if (schwer != null) {
                "Höchstens 2 Sterne: In Schritt ${schwer.schritt} hast du schwer gekränkt. Das lässt sich abmildern, aber nicht ungeschehen machen."
            } else {
                val schritte = verlauf.filter { it.kraenkt > 0 }.joinToString(" und ") { it.schritt.toString() }
                "Höchstens 2 Sterne: Mehrere kleine Kränkungen (Schritt $schritte) haben sich summiert. Ein Ausrutscher ist verzeihlich, zwei nicht mehr ganz."
            }
        }
        if (werte.vertrauen < VERTRAUEN_SCHWELLE && sterne > 1) {
            sterne -= 1
            abzuege += "Ein Stern Abzug: ${scenario.balken.vertrauen} lag am Ende unter $VERTRAUEN_SCHWELLE."
        }
        return Ergebnis(sterne, aktuell, werte, verlauf.toList(), gekippt, abzuege)
    }

    /** Passende Variante wählen; Varianten mit Rückbezug (spezifischer) haben Vorrang. */
    private fun List<Variante>.waehle(z: Zustand): String? {
        if (isEmpty()) return null
        val passend = filter { it.passt(z) }.ifEmpty { filter { it.passt(z.werte.anspannung) && it.spezifitaet == 0 } }.ifEmpty { this }
        val max = passend.maxOf { it.spezifitaet }
        return passend.filter { it.spezifitaet == max }.randomOrNull(random)?.text
    }

    companion object {
        const val VERTRAUEN_SCHWELLE = 35
        const val KIPP_SCHWELLE = 3.5
        /** Vertrauen wächst langsamer, als es verloren geht (Asymmetrie-Prinzip nach Slovic). */
        const val VERTRAUEN_AUFBAU = 0.7
    }
}
