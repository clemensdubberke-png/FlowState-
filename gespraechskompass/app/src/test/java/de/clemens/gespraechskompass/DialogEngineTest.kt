package de.clemens.gespraechskompass

import de.clemens.gespraechskompass.data.Knoten
import de.clemens.gespraechskompass.data.Option
import de.clemens.gespraechskompass.data.ScenarioFile
import de.clemens.gespraechskompass.data.ScenarioJson
import de.clemens.gespraechskompass.modes.dialogduell.DialogEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import kotlin.random.Random

/**
 * Lädt die echte data/scenarios.json mit denselben Kotlin-Modellen wie die App
 * und prüft Spielmechanik und Durchspielbarkeit.
 */
class DialogEngineTest {

    private val daten: ScenarioFile by lazy {
        val f = listOf(File("../data/scenarios.json"), File("data/scenarios.json")).first { it.exists() }
        ScenarioJson.decodeFromString(ScenarioFile.serializer(), f.readText())
    }

    private fun szenario(id: String) = daten.szenarien.first { it.id == id }

    /** Wählt die beste gute Option (nach Grundeffekt). */
    private fun DialogEngine.besteGute(): Option = optionen()
        .filter { it.bewertung == "gut" }
        .maxBy { it.effekt.vertrauen + it.effekt.erkenntnis - it.effekt.anspannung }

    private fun DialogEngine.waehleText(anfang: String) =
        waehle(optionen().first { it.text.startsWith(anfang) })

    @Test
    fun `json passt zu den Kotlin-Modellen`() {
        assertEquals(5, daten.szenarien.size)
        daten.szenarien.forEach { s ->
            s.knoten.flatMap { it.optionen }.flatMap { it.bausteine }.forEach { b ->
                assertTrue("${s.id}: Baustein $b fehlt", daten.bausteine.containsKey(b))
            }
        }
    }

    @Test
    fun `zufaellige Durchlaeufe enden immer und bleiben im Wertebereich`() {
        val rnd = Random(42)
        daten.szenarien.forEach { s ->
            repeat(3000) {
                val e = DialogEngine(s, rnd)
                assertFalse(e.eroeffnung().isNullOrBlank())
                var schritte = 0
                while (!e.istEnde) {
                    val opts = e.optionen()
                    assertTrue("${s.id}/${e.aktuell.id}: ${opts.size} Optionen", opts.size in 3..4)
                    val r = e.waehle(opts.random(rnd))
                    assertTrue("${s.id}: leere Reaktion", r.reaktion.isNotBlank())
                    with(e.werte) {
                        assertTrue(vertrauen in 0..100 && erkenntnis in 0..100 && anspannung in 0..100)
                    }
                    assertTrue(e.kraenkung >= 0.0)
                    schritte++
                    assertTrue("${s.id}: Endlosschleife?", schritte <= 14)
                }
                val erg = e.ergebnis()
                assertTrue(erg.sterne in 1..3)
                assertTrue(erg.ende.auswertung != null)
                assertEquals(schritte, erg.zuege.size)
            }
        }
    }

    @Test
    fun `nur gute Antworten ergeben drei Sterne`() {
        daten.szenarien.forEach { s ->
            val e = DialogEngine(s, Random(1))
            while (!e.istEnde) e.waehle(e.besteGute())
            val erg = e.ergebnis()
            assertEquals("${s.id}: beste Antworten sollten 3 Sterne bringen (Ende ${erg.ende.id}, Werte ${erg.werte})", 3, erg.sterne)
            assertFalse(erg.gekippt)
        }
    }

    @Test
    fun `eine schwere Kraenkung laesst sich abmildern, kostet aber den dritten Stern`() {
        val e = DialogEngine(szenario("onkel-ukraine"), Random(2))
        e.waehleText("Ach Rainer, das ist doch so ein typisches Fake-News-Bild")
        assertEquals(2.0, e.kraenkung, 0.001)
        while (!e.istEnde) e.waehle(e.besteGute())
        val erg = e.ergebnis()
        assertFalse("Gespräch sollte nicht kippen", erg.gekippt)
        assertEquals(2, erg.sterne)
        assertTrue(erg.abzuege.any { it.contains("schwer gekränkt") })
    }

    @Test
    fun `gute Zuege wirken nach einer Kraenkung gedaempft`() {
        val s = szenario("onkel-ukraine")
        val ohne = DialogEngine(s, Random(3))
        ohne.waehleText("Wo hast du das her?")
        val vorherOhne = ohne.werte.vertrauen
        val zugOhne = ohne.waehleText("Da hast du einen Punkt").zug

        val mit = DialogEngine(s, Random(3))
        mit.waehleText("Ach Rainer, das ist doch so ein typisches Fake-News-Bild")
        val zugMit = mit.waehleText("Da hast du einen Punkt").zug

        assertTrue("ungedämpft: ${zugOhne.delta.vertrauen}, gedämpft: ${zugMit.delta.vertrauen}", zugMit.delta.vertrauen < zugOhne.delta.vertrauen)
        assertEquals(1, zugMit.nachwirkungAus)
        assertTrue(vorherOhne > 0)
    }

    @Test
    fun `gehaeufte schwere Kraenkungen lassen das Gespraech kippen`() {
        val e = DialogEngine(szenario("onkel-ukraine"), Random(4))
        e.waehleText("Ach Rainer, das ist doch so ein typisches Fake-News-Bild")
        val r = e.waehleText("Die Pfandflaschen-Story ist echt der Klassiker")
        assertTrue(r.zug.gekippt)
        assertTrue(e.istEnde)
        assertEquals("ende_streit", e.aktuell.id)
        assertEquals(1, e.ergebnis().sterne)
    }

    @Test
    fun `das Gegenueber erinnert sich an fruehere Fehler`() {
        val s = szenario("onkel-ukraine")
        val e = DialogEngine(s, Random(5))
        val r = e.waehleText("Ach Rainer, das ist doch so ein typisches Fake-News-Bild")
        assertTrue("Rückbezug erwartet: ${r.naechsterText}", r.naechsterText!!.contains("Fake News"))
    }

    @Test
    fun `fakten prallen bei zu wenig Vertrauen ab`() {
        val s = szenario("onkel-ukraine")
        // Mit Vertrauen: Fakt-Sandwich ist gut.
        val gut = DialogEngine(s, Random(6))
        gut.waehleText("Das Bild regt dich richtig auf")
        gut.waehleText("Das klingt nach echter Sorge")
        assertEquals("gut", gut.waehleText("Der Bund schießt jedes Jahr").zug.bewertung.name.lowercase())
        // Ohne Vertrauen (Startwert niedrig): derselbe Zug prallt ab.
        val schlecht = DialogEngine(s.copy(startwerte = s.startwerte.copy(vertrauen = 25)), Random(6))
        schlecht.waehleText("Das Bild regt dich richtig auf")
        schlecht.waehleText("Dir geht's doch gut")
        val zug = schlecht.waehleText("Der Bund schießt jedes Jahr").zug
        assertEquals("TEILS", zug.bewertung.name)
        assertTrue(zug.notiz!!.contains("abgeprallt"))
    }

    @Test
    fun `reparatur erscheint nur nach einer Kraenkung`() {
        val s = szenario("onkel-ukraine")
        val ohne = DialogEngine(s, Random(7))
        ohne.waehleText("Wo hast du das her?")
        ohne.waehleText("Da hast du einen Punkt")
        assertFalse(ohne.optionen().any { it.repariert })

        val mit = DialogEngine(s, Random(7))
        mit.waehleText("Ach Rainer, das ist doch so ein typisches Fake-News-Bild")
        mit.waehleText("Da hast du einen Punkt")
        assertTrue(mit.optionen().any { it.repariert })
        val k = mit.kraenkung
        mit.waehle(mit.optionen().first { it.repariert })
        assertTrue("Kränkung sinkt: $k → ${mit.kraenkung}", mit.kraenkung < k - 1.0)
    }

    @Test
    fun `sterne abzug bei wenig vertrauen`() {
        val s = szenario("onkel-ukraine")
        val e = DialogEngine(s.copy(startwerte = s.startwerte.copy(vertrauen = 0)), Random(8))
        // Schwache, aber nicht kränkende Antworten bis zum Ende.
        while (!e.istEnde) {
            val o = e.optionen().filter { it.kraenkt == 0 }.minBy { it.effekt.vertrauen }
            e.waehle(o)
        }
        val erg = e.ergebnis()
        if (erg.werte.vertrauen < DialogEngine.VERTRAUEN_SCHWELLE) {
            assertTrue(erg.abzuege.any { it.contains("unter") })
            assertTrue(erg.sterne < (erg.ende.sterne))
        }
        assertTrue(Knoten(id = "x").sagt.isEmpty())
    }
}
