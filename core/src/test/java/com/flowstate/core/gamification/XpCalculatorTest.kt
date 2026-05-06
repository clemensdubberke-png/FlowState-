package com.flowstate.core.gamification

import org.junit.Assert.assertEquals
import org.junit.Test

class XpCalculatorTest {
    @Test fun `1 xp pro minute ohne streak`() {
        assertEquals(30, XpCalculator.computeXp(30, 0))
    }

    @Test fun `1_4x xp bei 4-tage-streak`() {
        assertEquals((30 * 1.4f).toInt(), XpCalculator.computeXp(30, 4))
    }

    @Test fun `1_2x xp bei 3-tage-streak`() {
        assertEquals((30 * 1.2f).toInt(), XpCalculator.computeXp(30, 3))
    }

    @Test fun `2x xp ab 14 tage streak`() {
        assertEquals(60, XpCalculator.computeXp(30, 14))
        assertEquals(60, XpCalculator.computeXp(30, 100))
    }
}
