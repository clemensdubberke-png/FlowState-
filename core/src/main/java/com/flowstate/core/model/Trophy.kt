package com.flowstate.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "trophies")
data class TrophyEntity(
    @PrimaryKey val key: String,
    val name: String,
    val description: String,
    val iconKey: String,
    val unlocked: Boolean = false,
    val unlockedDate: Long? = null,
    val sortOrder: Int = 0,
)
