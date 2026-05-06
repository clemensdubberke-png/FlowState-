package com.flowstate.core.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.flowstate.core.model.RoutineEntity
import com.flowstate.core.model.RoutineStepEntity
import com.flowstate.core.model.RoutineWithSteps
import kotlinx.coroutines.flow.Flow

@Dao
interface RoutineDao {
    @Transaction
    @Query("SELECT * FROM routines ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<RoutineWithSteps>>

    @Transaction
    @Query("SELECT * FROM routines WHERE id = :id")
    suspend fun getById(id: Long): RoutineWithSteps?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoutine(routine: RoutineEntity): Long

    @Update
    suspend fun updateRoutine(routine: RoutineEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSteps(steps: List<RoutineStepEntity>)

    @Query("DELETE FROM routine_steps WHERE routineId = :routineId")
    suspend fun deleteSteps(routineId: Long)

    @Delete
    suspend fun deleteRoutine(routine: RoutineEntity)

    @Transaction
    suspend fun saveWithSteps(routine: RoutineEntity, steps: List<RoutineStepEntity>): Long {
        val id = if (routine.id == 0L) insertRoutine(routine) else {
            updateRoutine(routine); routine.id
        }
        deleteSteps(id)
        insertSteps(steps.map { it.copy(routineId = id) })
        return id
    }
}
