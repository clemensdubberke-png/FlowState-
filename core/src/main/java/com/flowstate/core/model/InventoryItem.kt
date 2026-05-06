package com.flowstate.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class ItemType { STREAK_SHIELD }

@Entity(tableName = "inventory")
data class InventoryItemEntity(
    @PrimaryKey val type: ItemType,
    val quantity: Int = 0,
) {
    companion object {
        const val MAX_STREAK_SHIELD = 5
    }
}
