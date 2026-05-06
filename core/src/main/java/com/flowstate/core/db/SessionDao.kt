package com.flowstate.core.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.flowstate.core.model.SessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(session: SessionEntity): Long

    @Query("SELECT * FROM sessions ORDER BY startTime DESC")
    fun observeAll(): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE startTime >= :startOfDay AND startTime < :endOfDay ORDER BY startTime DESC")
    fun observeForDay(startOfDay: Long, endOfDay: Long): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE startTime >= :start AND startTime < :end")
    suspend fun forRange(start: Long, end: Long): List<SessionEntity>

    @Query("SELECT COUNT(*) FROM sessions")
    suspend fun count(): Int

    @Query("SELECT IFNULL(SUM(durationMinutes), 0) FROM sessions")
    suspend fun totalMinutes(): Int

    @Query("SELECT MAX(startTime) FROM sessions")
    suspend fun lastSessionTime(): Long?
}
