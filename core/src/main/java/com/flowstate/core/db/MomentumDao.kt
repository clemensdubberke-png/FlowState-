package com.flowstate.core.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.flowstate.core.model.WeeklyMomentumEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MomentumDao {
    @Query("SELECT * FROM weekly_momentum ORDER BY weekStart DESC LIMIT 8")
    fun observeRecent(): Flow<List<WeeklyMomentumEntity>>

    @Query("SELECT * FROM weekly_momentum WHERE weekStart = :weekStart")
    suspend fun getForWeek(weekStart: Long): WeeklyMomentumEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(item: WeeklyMomentumEntity)
}
