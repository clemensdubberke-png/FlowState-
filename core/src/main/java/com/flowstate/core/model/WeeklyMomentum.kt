package com.flowstate.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "weekly_momentum")
data class WeeklyMomentumEntity(
    @PrimaryKey val weekStart: Long,
    val totalMinutes: Int,
    val sessionCount: Int,
    val flowScore: Int = 0,
)
