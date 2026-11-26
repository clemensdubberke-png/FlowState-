package de.clemens.gespraechskompass.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Datenmodell von data/scenarios.json. Feldnamen entsprechen der JSON-Datei
 * (siehe docs/SZENARIEN.md). Die Struktur wird von scripts/validate-scenarios.mjs geprüft.
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
    val start: String,
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

@Serializable
data class Variante(
    val text: String,
    @SerialName("anspannung_ab") val ab: Int? = null,
    @SerialName("anspannung_bis") val bis: Int? = null,
) {
    fun passt(anspannung: Int) = (ab ?: 0) <= anspannung && anspannung <= (bis ?: 100)
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
