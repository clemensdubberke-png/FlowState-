package com.flowstate.core.gamification

import com.flowstate.core.model.UserProfileEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.ZoneId
import java.time.ZonedDateTime

class StreakManagerTest {

    private val zone = ZoneId.systemDefault()
    private fun millisAt(year: Int, month: Int, day: Int): Long =
        ZonedDateTime.of(year, month, day, 12, 0, 0, 0, zone).toInstant().toEpochMilli()

    @Test fun `erste session setzt streak auf 1`() {
        val p = UserProfileEntity()
        val updated = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 1))
        assertEquals(1, updated.currentStreak)
        assertEquals(1, updated.longestStreak)
    }

    @Test fun `zwei sessions am gleichen tag`() {
        val p = UserProfileEntity().let {
            StreakManager.onSessionCompleted(it, millisAt(2025, 5, 1))
        }
        val again = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 1))
        assertEquals(1, again.currentStreak)
    }

    @Test fun `aufeinanderfolgende tage erhoehen streak`() {
        var p = UserProfileEntity()
        p = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 1))
        p = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 2))
        p = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 3))
        assertEquals(3, p.currentStreak)
        assertEquals(3, p.longestStreak)
    }

    @Test fun `luecke setzt streak zurueck`() {
        var p = UserProfileEntity()
        p = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 1))
        p = StreakManager.onSessionCompleted(p, millisAt(2025, 5, 5))
        assertEquals(1, p.currentStreak)
    }

    @Test fun `schild rettet 1-tag-luecke`() {
        val p = UserProfileEntity(currentStreak = 4, lastSessionDate = millisAt(2025, 5, 1))
        val (updated, used) = StreakManager.checkAndApplyShield(p, millisAt(2025, 5, 3), shieldsAvailable = 1)
        assertTrue(used)
        assertEquals(4, updated.currentStreak)
    }

    @Test fun `kein schild verfuegbar setzt streak zurueck`() {
        val p = UserProfileEntity(currentStreak = 4, lastSessionDate = millisAt(2025, 5, 1))
        val (updated, used) = StreakManager.checkAndApplyShield(p, millisAt(2025, 5, 3), shieldsAvailable = 0)
        assertFalse(used)
        assertEquals(0, updated.currentStreak)
    }
}
