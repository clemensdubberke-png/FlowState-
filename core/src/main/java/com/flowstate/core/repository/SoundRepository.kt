package com.flowstate.core.repository

import com.flowstate.core.db.SoundDao
import com.flowstate.core.model.SoundEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SoundRepository @Inject constructor(
    private val soundDao: SoundDao,
) {
    fun observeAll(): Flow<List<SoundEntity>> = soundDao.observeAll()
    suspend fun get(id: String): SoundEntity? = soundDao.getById(id)
    suspend fun unlockUpTo(level: Int) = soundDao.unlockUpTo(level)
}
