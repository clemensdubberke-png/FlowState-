package com.flowstate.app.ui.routines

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.flowstate.core.model.RoutineEntity
import com.flowstate.core.model.RoutineStepEntity
import com.flowstate.core.model.StepType
import com.flowstate.core.repository.RoutineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RoutineEditorViewModel @Inject constructor(
    private val routineRepository: RoutineRepository,
) : ViewModel() {

    data class EditableStep(
        val key: String,
        val type: StepType,
        val durationMinutes: Int,
    )

    data class EditorState(
        val routineId: Long? = null,
        val name: String = "",
        val steps: List<EditableStep> = listOf(
            EditableStep("step_${System.nanoTime()}", StepType.FOCUS, 25),
            EditableStep("step_${System.nanoTime() + 1}", StepType.PAUSE, 5),
        ),
    ) {
        val totalMinutes: Int = steps.sumOf { it.durationMinutes }
        val canSave: Boolean = name.isNotBlank() && steps.isNotEmpty()
    }

    private val _state = MutableStateFlow(EditorState())
    val state: StateFlow<EditorState> = _state.asStateFlow()

    fun load(routineId: Long?) {
        if (routineId == null) return
        viewModelScope.launch {
            val r = routineRepository.get(routineId) ?: return@launch
            _state.value = EditorState(
                routineId = r.routine.id,
                name = r.routine.name,
                steps = r.orderedSteps.map { EditableStep("step_${it.id}", it.type, it.durationMinutes) },
            )
        }
    }

    fun setName(name: String) {
        _state.value = _state.value.copy(name = name)
    }

    fun addStep(type: StepType = StepType.FOCUS, durationMin: Int = 25) {
        _state.value = _state.value.copy(
            steps = _state.value.steps + EditableStep("step_${System.nanoTime()}", type, durationMin)
        )
    }

    fun removeStep(key: String) {
        _state.value = _state.value.copy(steps = _state.value.steps.filterNot { it.key == key })
    }

    fun moveStep(fromIndex: Int, toIndex: Int) {
        val current = _state.value.steps.toMutableList()
        if (fromIndex !in current.indices || toIndex !in current.indices) return
        val item = current.removeAt(fromIndex)
        current.add(toIndex, item)
        _state.value = _state.value.copy(steps = current)
    }

    fun setStepType(key: String, type: StepType) {
        _state.value = _state.value.copy(
            steps = _state.value.steps.map { if (it.key == key) it.copy(type = type) else it }
        )
    }

    fun setStepDuration(key: String, minutes: Int) {
        _state.value = _state.value.copy(
            steps = _state.value.steps.map { if (it.key == key) it.copy(durationMinutes = minutes.coerceIn(1, 240)) else it }
        )
    }

    fun save(onSaved: () -> Unit) {
        val s = _state.value
        if (!s.canSave) return
        viewModelScope.launch {
            val routine = RoutineEntity(id = s.routineId ?: 0, name = s.name)
            val steps = s.steps.mapIndexed { i, step ->
                RoutineStepEntity(
                    id = 0,
                    routineId = s.routineId ?: 0,
                    type = step.type,
                    durationMinutes = step.durationMinutes,
                    order = i,
                )
            }
            routineRepository.save(routine, steps)
            onSaved()
        }
    }
}
