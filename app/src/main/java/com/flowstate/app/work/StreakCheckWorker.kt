package com.flowstate.app.work

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.flowstate.core.gamification.StreakManager
import com.flowstate.core.repository.InventoryRepository
import com.flowstate.core.repository.ProfileRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class StreakCheckWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted params: WorkerParameters,
    private val profileRepository: ProfileRepository,
    private val inventoryRepository: InventoryRepository,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val profile = profileRepository.get() ?: return Result.success()
        val shields = inventoryRepository.shieldCount()
        val (updated, used) = StreakManager.checkAndApplyShield(profile, System.currentTimeMillis(), shields)
        if (used) inventoryRepository.consumeShield()
        if (updated != profile) profileRepository.upsert(updated)
        return Result.success()
    }
}
