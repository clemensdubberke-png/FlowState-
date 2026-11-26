package de.clemens.gespraechskompass

import de.clemens.gespraechskompass.data.Knoten
import de.clemens.gespraechskompass.data.ScenarioFile
import de.clemens.gespraechskompass.data.ScenarioJson
import de.clemens.gespraechskompass.data.Werte
import de.clemens.gespraechskompass.modes.dialogduell.DialogEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import kotlin.random.Random

/**
 * Lädt die echte data/scenarios.json mit denselben Kotlin-Modellen wie die App
 * und spielt jedes Szenario tausendfach zufällig durch.
 */
class DialogEngineTest {

    private val daten: ScenarioFile by lazy {
        val f = listOf(File("../data/scenarios.json"), File("data/scenarios.json")).first { it.exists() }
        ScenarioJson.decodeFromString(ScenarioFile.serializer(), f.readText())
    }

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
            repeat(2000) {
                val e = DialogEngine(s, rnd)
                assertFalse(e.eroeffnung().isNullOrBlank())
                var schritte = 0
                while (!e.istEnde) {
                    val opts = e.optionen()
                    assertTrue("${s.id}/${e.aktuell.id}: zu wenige Optionen", opts.size in 3..4)
                    val r = e.waehle(opts.random(rnd))
                    assertTrue(r.reaktion.isNotBlank())
                    with(e.werte) {
                        assertTrue(vertrauen in 0..100 && erkenntnis in 0..100 && anspannung in 0..100)
                    }
                    schritte++
                    assertTrue("${s.id}: Endlosschleife?", schritte <= 12)
                }
                val erg = e.ergebnis()
                assertTrue(erg.sterne in 1..3)
                assertTrue(erg.ende.auswertung != null)
            }
        }
    }

    @Test
    fun `nur gute Antworten ergeben drei Sterne`() {
        daten.szenarien.forEach { s ->
            val e = DialogEngine(s, Random(1))
            while (!e.istEnde) {
                val beste = e.aktuell.optionen
                    .filter { it.bewertung == "gut" }
                    .maxBy { it.effekt.vertrauen + it.effekt.erkenntnis - it.effekt.anspannung }
                e.waehle(beste)
            }
            assertEquals("${s.id}: beste Antworten sollten 3 Sterne bringen", 3, e.ergebnis().sterne)
        }
    }

    @Test
    fun `reaktion haengt von der Anspannung vor der Antwort ab`() {
        val s = daten.szenarien.first { it.id == "onkel-ukraine" }
        val ruhig = DialogEngine(s.copy(startwerte = s.startwerte.copy(anspannung = 10)), Random(3))
        val gereizt = DialogEngine(s.copy(startwerte = s.startwerte.copy(anspannung = 90)), Random(3))
        val text = { e: DialogEngine -> e.waehle(e.aktuell.optionen.first()).reaktion }
        val opt = s.knoten.first { it.id == "k1" }.optionen.first()
        assertTrue(opt.reaktion.first { it.passt(10) }.text == text(ruhig))
        assertTrue(opt.reaktion.first { it.passt(90) }.text == text(gereizt))
    }

    @Test
    fun `sterne abzug bei wenig vertrauen`() {
        val ende = Knoten(id = "x", ende = true, sterne = 3)
        assertEquals(3, DialogEngine.sterne(ende, Werte(vertrauen = 60)))
        assertEquals(2, DialogEngine.sterne(ende, Werte(vertrauen = 20)))
        assertEquals(1, DialogEngine.sterne(ende.copy(sterne = 1), Werte(vertrauen = 0)))
    }
}
