package com.flowstate.core.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.flowstate.core.model.DailyQuestEntity
import com.flowstate.core.model.InventoryItemEntity
import com.flowstate.core.model.RoutineEntity
import com.flowstate.core.model.RoutineStepEntity
import com.flowstate.core.model.SessionEntity
import com.flowstate.core.model.SoundEntity
import com.flowstate.core.model.TrophyEntity
import com.flowstate.core.model.UserProfileEntity
import com.flowstate.core.model.WeeklyMomentumEntity

@Database(
    entities = [
        SessionEntity::class,
        RoutineEntity::class,
        RoutineStepEntity::class,
        UserProfileEntity::class,
        DailyQuestEntity::class,
        TrophyEntity::class,
        InventoryItemEntity::class,
        SoundEntity::class,
        WeeklyMomentumEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun sessionDao(): SessionDao
    abstract fun routineDao(): RoutineDao
    abstract fun profileDao(): ProfileDao
    abstract fun questDao(): QuestDao
    abstract fun trophyDao(): TrophyDao
    abstract fun inventoryDao(): InventoryDao
    abstract fun soundDao(): SoundDao
    abstract fun momentumDao(): MomentumDao

    companion object {
        const val DB_NAME = "flowstate.db"

        fun build(context: Context): AppDatabase =
            Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, DB_NAME)
                .addCallback(SeedCallback)
                .fallbackToDestructiveMigration()
                .build()
    }

    object SeedCallback : Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            DbSeeder.seed(db)
        }
    }
}
