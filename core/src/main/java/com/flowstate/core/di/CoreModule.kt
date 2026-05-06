package com.flowstate.core.di

import android.content.Context
import com.flowstate.core.db.AppDatabase
import com.flowstate.core.db.InventoryDao
import com.flowstate.core.db.MomentumDao
import com.flowstate.core.db.ProfileDao
import com.flowstate.core.db.QuestDao
import com.flowstate.core.db.RoutineDao
import com.flowstate.core.db.SessionDao
import com.flowstate.core.db.SoundDao
import com.flowstate.core.db.TrophyDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object CoreModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase =
        AppDatabase.build(context)

    @Provides fun sessionDao(db: AppDatabase): SessionDao = db.sessionDao()
    @Provides fun routineDao(db: AppDatabase): RoutineDao = db.routineDao()
    @Provides fun profileDao(db: AppDatabase): ProfileDao = db.profileDao()
    @Provides fun questDao(db: AppDatabase): QuestDao = db.questDao()
    @Provides fun trophyDao(db: AppDatabase): TrophyDao = db.trophyDao()
    @Provides fun inventoryDao(db: AppDatabase): InventoryDao = db.inventoryDao()
    @Provides fun soundDao(db: AppDatabase): SoundDao = db.soundDao()
    @Provides fun momentumDao(db: AppDatabase): MomentumDao = db.momentumDao()
}
