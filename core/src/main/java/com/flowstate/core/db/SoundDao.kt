package com.flowstate.core.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.flowstate.core.model.SoundEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SoundDao {
    @Query("SELECT * FROM sounds ORDER BY sortOrder ASC")
    fun observeAll(): Flow<List<SoundEntity>>

    @Query("SELECT * FROM sounds WHERE id = :id")
    suspend fun getById(id: String): SoundEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(sounds: List<SoundEntity>)

    @Update
    suspend fun update(sound: SoundEntity)

    @Query("UPDATE sounds SET unlocked = 1 WHERE requiredLevel <= :level")
    suspend fun unlockUpTo(level: Int)
}
