package com.flowstate.core.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import androidx.room.Relation

enum class StepType { FOCUS, PAUSE }

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val createdAt: Long = System.currentTimeMillis(),
)

@Entity(
    tableName = "routine_steps",
    foreignKeys = [
        ForeignKey(
            entity = RoutineEntity::class,
            parentColumns = ["id"],
            childColumns = ["routineId"],
            onDelete = ForeignKey.CASCADE,
        )
    ],
    indices = [androidx.room.Index("routineId")],
)
data class RoutineStepEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val routineId: Long,
    val type: StepType,
    val durationMinutes: Int,
    val order: Int,
)

data class RoutineWithSteps(
    @Embedded val routine: RoutineEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "routineId",
    )
    val steps: List<RoutineStepEntity>,
) {
    val totalMinutes: Int get() = steps.sumOf { it.durationMinutes }
    val orderedSteps: List<RoutineStepEntity> get() = steps.sortedBy { it.order }
}
