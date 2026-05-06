package com.flowstate.core.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.flowstate.core.model.TrophyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TrophyDao {
    @Query("SELECT * FROM trophies ORDER BY sortOrder ASC")
    fun observeAll(): Flow<List<TrophyEntity>>

    @Query("SELECT * FROM trophies WHERE `key` = :key")
    suspend fun getByKey(key: String): TrophyEntity?

    @Query("SELECT * FROM trophies")
    suspend fun all(): List<TrophyEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(trophies: List<TrophyEntity>)

    @Update
    suspend fun update(trophy: TrophyEntity)
}
