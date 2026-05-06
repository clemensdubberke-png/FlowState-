package com.flowstate.core.repository

import com.flowstate.core.db.ProfileDao
import com.flowstate.core.model.UserProfileEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepository @Inject constructor(
    private val profileDao: ProfileDao,
) {
    fun observe(): Flow<UserProfileEntity?> = profileDao.observe()
    suspend fun get(): UserProfileEntity? = profileDao.get()

    suspend fun setName(name: String) {
        val current = profileDao.get() ?: UserProfileEntity()
        profileDao.upsert(current.copy(name = name))
    }

    suspend fun upsert(profile: UserProfileEntity) = profileDao.upsert(profile)
}
