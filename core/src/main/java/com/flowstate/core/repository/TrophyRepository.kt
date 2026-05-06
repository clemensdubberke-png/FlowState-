package com.flowstate.core.repository

import com.flowstate.core.db.TrophyDao
import com.flowstate.core.model.TrophyEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TrophyRepository @Inject constructor(
    private val trophyDao: TrophyDao,
) {
    fun observeAll(): Flow<List<TrophyEntity>> = trophyDao.observeAll()
}
