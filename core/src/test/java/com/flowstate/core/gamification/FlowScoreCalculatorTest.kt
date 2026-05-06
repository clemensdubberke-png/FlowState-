package com.flowstate.core.gamification

import com.flowstate.core.model.SessionEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FlowScoreCalculatorTest {

    private fun sess(durationMin: Int) = SessionEntity(
        startTime = 0, endTime = 0, durationMinutes = durationMin
    )

    @Test fun `leere woche gibt 0`() {
        val s = FlowScoreCalculator.scoreFor(emptyList(), 0)
        assertEquals(0, s)
    }

    @Test fun `viele minuten geben hohen score`() {
        val sessions = List(20) { sess(45) }
        val s = FlowScoreCalculator.scoreFor(sessions, 14)
        assertTrue(s in 90..100)
    }

    @Test fun `aenderung positiv wenn vorwoche leer aber jetzt aktiv`() {
        val current = listOf(sess(30), sess(30))
        val score = FlowScoreCalculator.compute(current, emptyList(), 2)
        assertEquals(100, score.percentChange)
    }
}
