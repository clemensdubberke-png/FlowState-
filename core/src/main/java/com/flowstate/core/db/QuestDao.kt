package com.flowstate.core.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.flowstate.core.model.DailyQuestEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface QuestDao {
    @Query("SELECT * FROM daily_quests WHERE date = :date ORDER BY id ASC")
    fun observeForDate(date: Long): Flow<List<DailyQuestEntity>>

    @Query("SELECT * FROM daily_quests WHERE date = :date")
    suspend fun getForDate(date: Long): List<DailyQuestEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(quests: List<DailyQuestEntity>)

    @Update
    suspend fun update(quest: DailyQuestEntity)

    @Query("DELETE FROM daily_quests WHERE date < :before")
    suspend fun deleteOlderThan(before: Long)
}
