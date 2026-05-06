package com.flowstate.core.repository

import com.flowstate.core.db.InventoryDao
import com.flowstate.core.model.InventoryItemEntity
import com.flowstate.core.model.ItemType
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class InventoryRepository @Inject constructor(
    private val inventoryDao: InventoryDao,
) {
    fun observe(): Flow<List<InventoryItemEntity>> = inventoryDao.observeAll()
    suspend fun shieldCount(): Int = inventoryDao.get(ItemType.STREAK_SHIELD)?.quantity ?: 0
    suspend fun consumeShield(): Boolean {
        val current = inventoryDao.get(ItemType.STREAK_SHIELD) ?: return false
        if (current.quantity <= 0) return false
        inventoryDao.upsert(current.copy(quantity = current.quantity - 1))
        return true
    }

    suspend fun grantShield() {
        val current = inventoryDao.get(ItemType.STREAK_SHIELD)
        val next = ((current?.quantity ?: 0) + 1).coerceAtMost(InventoryItemEntity.MAX_STREAK_SHIELD)
        inventoryDao.upsert(InventoryItemEntity(ItemType.STREAK_SHIELD, next))
    }
}
