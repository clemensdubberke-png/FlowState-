package com.flowstate.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_quests")
data class DailyQuestEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val date: Long,
    val title: String,
    val description: String,
    val targetMinutes: Int,
    val targetTimeRangeStart: Int? = null,
    val targetTimeRangeEnd: Int? = null,
    val completed: Boolean = false,
    val xpReward: Int,
    val rewardShield: Boolean = false,
)
