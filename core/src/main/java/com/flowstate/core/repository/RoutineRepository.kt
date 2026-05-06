package com.flowstate.core.repository

import com.flowstate.core.db.RoutineDao
import com.flowstate.core.model.RoutineEntity
import com.flowstate.core.model.RoutineStepEntity
import com.flowstate.core.model.RoutineWithSteps
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RoutineRepository @Inject constructor(
    private val routineDao: RoutineDao,
) {
    fun observeAll(): Flow<List<RoutineWithSteps>> = routineDao.observeAll()
    suspend fun get(id: Long): RoutineWithSteps? = routineDao.getById(id)
    suspend fun save(routine: RoutineEntity, steps: List<RoutineStepEntity>): Long =
        routineDao.saveWithSteps(routine, steps)

    suspend fun delete(routine: RoutineEntity) = routineDao.deleteRoutine(routine)
}
