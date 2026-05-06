package com.flowstate.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sounds")
data class SoundEntity(
    @PrimaryKey val id: String,
    val name: String,
    val assetPath: String,
    val requiredLevel: Int,
    val unlocked: Boolean,
    val sortOrder: Int = 0,
)
