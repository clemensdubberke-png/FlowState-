package com.flowstate.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startTime: Long,
    val endTime: Long,
    val durationMinutes: Int,
    val intentionText: String? = null,
    val xpEarned: Int = 0,
    val routineId: Long? = null,
    val completed: Boolean = true,
)
