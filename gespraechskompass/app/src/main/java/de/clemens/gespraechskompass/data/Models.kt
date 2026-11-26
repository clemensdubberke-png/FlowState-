package de.clemens.gespraechskompass.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Datenmodell von data/scenarios.json. Feldnamen entsprechen der JSON-Datei
 * (siehe docs/SZENARIEN.md). Die Struktur prüft scripts/validate-scenarios.mjs.
 */
@Serializable
data class ScenarioFile(
    val version: Int,
    val bausteine: Map<String, Baustein>,
    val szenarien: List<Scenario>,
)

@Serializable
data class Baustein(
    val name: String,
    /** "zug" (guter Gesprächszug), "kunstgriff" (Manipulation aus der Warnliste), "stolperfalle". */
    val art: String,
    val farbe: String,
    val kurz: String,
    val kunstgriffe: List<Int> = emptyList(),
)

@Serializable
data class Scenario(
    val id: String,
    val titel: String,
    val ort: String,
    val thema: String,
    /** "dialog" oder "pausentest". */
    val art: String = "dialog",
    val icon: String = "chat",
    val gegenueber: Gegenueber,
    val einleitung: String,
    val startwerte: Werte,
    val balken: BalkenNamen = BalkenNamen(),
    /** Wie die versteckte Nachwirkung von Fehlern in der Auswertung heißt. */
    val nachwirkung: String = "Kränkung",
    val start: String,
    /** Endknoten, zu dem das Gespräch kippt, wenn sich Kränkungen häufen. */
    @SerialName("kipp_ende") val kippEnde: String? = null,
    val fakten: List<Fakt> = emptyList(),
    val knoten: List<Knoten>,
)

@Serializable
data class Gegenueber(
    val name: String,
    val rolle: String,
    /** Arbeitshypothese: 1 selbstsicher, 2 emotional gebunden, 3 Machtgefälle. Leer = unbekannt. */
    val typ: List<Int> = emptyList(),
    val beschreibung: String = "",
)

@Serializable
data class Werte(
    val vertrauen: Int = 0,
    val erkenntnis: Int = 0,
    val anspannung: Int = 0,
) {
    operator fun plus(o: Werte) = Werte(vertrauen + o.vertrauen, erkenntnis + o.erkenntnis, anspannung + o.anspannung)
    fun begrenzt() = Werte(vertrauen.coerceIn(0, 100), erkenntnis.coerceIn(0, 100), anspannung.coerceIn(0, 100))
}

@Serializable
data class BalkenNamen(
    val vertrauen: String = "Vertrauen",
    val erkenntnis: String = "Erkenntnis",
)

@Serializable
data class Fakt(
    val id: String,
    val text: String,
    val stand: String,
    @SerialName("quelle_pruefen") val quellePruefen: Boolean,
    val quelle: String = "",
)

/** Momentaufnahme, gegen die Bedingungen geprüft werden. */
data class Zustand(
    val werte: Werte,
    val kraenkung: Double,
    val merker: Set<String>,
)

/** Bedingung: alle gesetzten Felder müssen zutreffen. */
@Serializable
data class Bedingung(
    @SerialName("anspannung_ab") val anspannungAb: Int? = null,
    @SerialName("anspannung_bis") val anspannungBis: Int? = null,
    @SerialName("vertrauen_ab") val vertrauenAb: Int? = null,
    @SerialName("vertrauen_bis") val vertrauenBis: Int? = null,
    @SerialName("kraenkung_ab") val kraenkungAb: Double? = null,
    val merker: List<String> = emptyList(),
    @SerialName("ohne_merker") val ohneMerker: List<String> = emptyList(),
) {
    fun erfuellt(z: Zustand): Boolean =
        (anspannungAb == null || z.werte.anspannung >= anspannungAb) &&
            (anspannungBis == null || z.werte.anspannung <= anspannungBis) &&
            (vertrauenAb == null || z.werte.vertrauen >= vertrauenAb) &&
            (vertrauenBis == null || z.werte.vertrauen <= vertrauenBis) &&
            (kraenkungAb == null || z.kraenkung >= kraenkungAb) &&
            merker.all { it in z.merker } &&
            ohneMerker.none { it in z.merker }
}

/** Eine Formulierung. Ohne Bedingungen gilt sie immer; spezifischere passende Varianten haben Vorrang. */
@Serializable
data class Variante(
    val text: String,
    @SerialName("anspannung_ab") val anspannungAb: Int? = null,
    @SerialName("anspannung_bis") val anspannungBis: Int? = null,
    @SerialName("vertrauen_ab") val vertrauenAb: Int? = null,
    @SerialName("vertrauen_bis") val vertrauenBis: Int? = null,
    @SerialName("kraenkung_ab") val kraenkungAb: Double? = null,
    val merker: List<String> = emptyList(),
    @SerialName("ohne_merker") val ohneMerker: List<String> = emptyList(),
) {
    private val bedingung get() = Bedingung(anspannungAb, anspannungBis, vertrauenAb, vertrauenBis, kraenkungAb, merker, ohneMerker)
    fun passt(z: Zustand) = bedingung.erfuellt(z)
    fun passt(anspannung: Int) = (anspannungAb ?: 0) <= anspannung && anspannung <= (anspannungBis ?: 100)

    /** Wie speziell die Variante ist (Anspannung zählt nicht): Rückbezüge auf Merker gewinnen. */
    val spezifitaet: Int
        get() = listOfNotNull(vertrauenAb, vertrauenBis, kraenkungAb).size + merker.size + ohneMerker.size
}

@Serializable
data class Knoten(
    val id: String,
    val sagt: List<Variante> = emptyList(),
    /** true: Text ist Erzählung (Situation), nicht wörtliche Rede des Gegenübers. */
    val erzaehler: Boolean = false,
    val optionen: List<Option> = emptyList(),
    val ende: Boolean = false,
    val sterne: Int = 0,
    val auswertung: Auswertung? = null,
)

@Serializable
data class Option(
    val text: String,
    val bausteine: List<String>,
    /** "gut", "teils" oder "ungünstig". */
    val bewertung: String,
    val effekt: Werte,
    val warum: String,
    val reaktion: List<Variante>,
    val weiter: String,
    @SerialName("weiter_bei_anspannung") val weiterBeiAnspannung: Bedingt? = null,
    val fakten: List<String> = emptyList(),
    /** 0 = nein, 1 = leichte, 2 = schwere Kränkung. */
    val kraenkt: Int = 0,
    /** Ehrliches Eingeständnis: senkt eine bestehende Kränkung zusätzlich. */
    val repariert: Boolean = false,
    /** Merker, die das Gegenüber sich ab jetzt merkt (für Rückbezüge). */
    val merkt: List<String> = emptyList(),
    /** Option erscheint nur, wenn die Bedingung erfüllt ist. */
    @SerialName("nur_wenn") val nurWenn: Bedingung? = null,
    /** Zustandsabhängige Wirkung: der erste passende Fall ersetzt die angegebenen Felder. */
    val falls: List<Fall> = emptyList(),
)

@Serializable
data class Fall(
    val wenn: Bedingung,
    val effekt: Werte? = null,
    val bewertung: String? = null,
    val warum: String? = null,
    val notiz: String? = null,
    val reaktion: List<Variante>? = null,
    val weiter: String? = null,
    val kraenkt: Int? = null,
    val merkt: List<String> = emptyList(),
)

@Serializable
data class Bedingt(val ab: Int, val ziel: String)

@Serializable
data class Auswertung(
    val titel: String,
    val gut: String,
    val anders: String,
    val selbstcheck: String,
)

enum class Bewertung { GUT, TEILS, UNGUENSTIG;
    companion object {
        fun von(s: String) = when (s) {
            "gut" -> GUT
            "teils" -> TEILS
            else -> UNGUENSTIG
        }
    }
}

fun typName(typ: Int) = when (typ) {
    1 -> "Selbstsicher"
    2 -> "Emotional gebunden"
    3 -> "Machtgefälle"
    else -> "Unbekannt"
}
