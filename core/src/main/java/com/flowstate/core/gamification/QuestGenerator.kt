package com.flowstate.core.gamification

import com.flowstate.core.model.DailyQuestEntity
import kotlin.random.Random

object QuestGenerator {

    private data class Template(
        val title: String,
        val description: String,
        val targetMinutes: Int,
        val rangeStart: Int? = null,
        val rangeEnd: Int? = null,
        val xp: Int,
        val rewardShield: Boolean = false,
    )

    private val POOL = listOf(
        Template("Morgendlicher Flow", "Fokussiere dich am Morgen 30 Minuten zwischen 5–11 Uhr.", 30, 5, 11, 40),
        Template("Nachmittags-Flow", "Fokussiere dich am Nachmittag 30 Minuten zwischen 12–18 Uhr.", 30, 12, 18, 40),
        Template("Abend-Flow", "Fokussiere dich am Abend 30 Minuten zwischen 18–23 Uhr.", 30, 18, 23, 40),
        Template("Marathon", "Eine ununterbrochene Session von mindestens 60 Minuten.", 60, null, null, 80, true),
        Template("Mit Absicht", "Schließe 3 Sessions mit gesetzter Intention ab.", 0, null, null, 50),
        Template("Streak-Hüter", "Schließe heute mindestens eine Session ab.", 1, null, null, 20),
        Template("Doppelstunde", "Mindestens 90 Fokus-Minuten heute insgesamt.", 90, null, null, 70),
        Template("Tiefe Konzentration", "Eine Session von mindestens 45 Minuten.", 45, null, null, 60),
    )

    fun generate(date: Long, count: Int = Random.nextInt(1, 4)): List<DailyQuestEntity> {
        val n = count.coerceIn(1, 3)
        val picks = POOL.shuffled().take(n)
        return picks.map { t ->
            DailyQuestEntity(
                date = date,
                title = t.title,
                description = t.description,
                targetMinutes = t.targetMinutes,
                targetTimeRangeStart = t.rangeStart,
                targetTimeRangeEnd = t.rangeEnd,
                completed = false,
                xpReward = t.xp,
                rewardShield = t.rewardShield,
            )
        }
    }

    /**
     * Prüft, ob eine bereits laufende Quest durch eine neu abgeschlossene Session erfüllt wurde.
     */
    fun questCompletedBy(
        quest: DailyQuestEntity,
        sessionStartHour: Int,
        sessionDuration: Int,
        intentionSet: Boolean,
        todaysTotalMinutes: Int,
        intentionalSessionsToday: Int,
    ): Boolean {
        if (quest.completed) return false
        return when (quest.title) {
            "Marathon" -> sessionDuration >= 60
            "Tiefe Konzentration" -> sessionDuration >= 45
            "Mit Absicht" -> intentionalSessionsToday >= 3 && intentionSet
            "Streak-Hüter" -> sessionDuration >= 1
            "Doppelstunde" -> todaysTotalMinutes >= 90
            else -> {
                val rangeOk = quest.targetTimeRangeStart == null ||
                    (sessionStartHour in (quest.targetTimeRangeStart..(quest.targetTimeRangeEnd ?: 23)))
                rangeOk && sessionDuration >= quest.targetMinutes
            }
        }
    }
}
