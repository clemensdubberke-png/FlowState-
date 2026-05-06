package com.flowstate.app.ui.routines

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DragIndicator
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.flowstate.app.R
import com.flowstate.app.ui.components.FlowCard
import com.flowstate.app.ui.theme.Amber
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.CardSurface
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.core.model.StepType
import org.burnoutcrew.reorderable.ReorderableItem
import org.burnoutcrew.reorderable.detectReorderAfterLongPress
import org.burnoutcrew.reorderable.rememberReorderableLazyListState
import org.burnoutcrew.reorderable.reorderable
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items

@Composable
fun RoutineEditorScreen(
    routineId: Long?,
    onBack: () -> Unit,
    viewModel: RoutineEditorViewModel = hiltViewModel(),
) {
    LaunchedEffect(routineId) { viewModel.load(routineId) }
    val state by viewModel.state.collectAsStateWithLifecycle()

    val reorderState = rememberReorderableLazyListState(onMove = { from, to ->
        // Header (index 0) and trailing items shift the data list; account for offset.
        val dataFromIndex = from.index - HEADER_ITEMS
        val dataToIndex = to.index - HEADER_ITEMS
        if (dataFromIndex >= 0 && dataToIndex >= 0) {
            viewModel.moveStep(dataFromIndex, dataToIndex)
        }
    })

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Filled.ArrowBack, contentDescription = stringResource(R.string.back), tint = OnSurface)
            }
            Text(
                text = if (state.routineId == null) stringResource(R.string.editor_title_new)
                else stringResource(R.string.editor_title_edit),
                color = OnSurface,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.weight(1f),
            )
            Button(
                onClick = { viewModel.save(onBack) },
                enabled = state.canSave,
                colors = ButtonDefaults.buttonColors(containerColor = Purple, contentColor = OnSurface),
                modifier = Modifier.padding(end = 8.dp),
                shape = RoundedCornerShape(12.dp),
            ) { Text(stringResource(R.string.editor_save), fontWeight = FontWeight.SemiBold) }
        }

        LazyColumn(
            state = reorderState.listState,
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .reorderable(reorderState)
                .detectReorderAfterLongPress(reorderState),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                OutlinedTextField(
                    value = state.name,
                    onValueChange = viewModel::setName,
                    label = { Text(stringResource(R.string.editor_name_label)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = TextFieldDefaults.colors(
                        focusedTextColor = OnSurface,
                        unfocusedTextColor = OnSurface,
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Purple,
                        unfocusedIndicatorColor = OnSurfaceMuted,
                        focusedLabelColor = Purple,
                        unfocusedLabelColor = OnSurfaceMuted,
                    ),
                )
            }
            item {
                Text(
                    text = stringResource(R.string.editor_total_format, state.totalMinutes),
                    color = OnSurfaceMuted,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            items(state.steps, key = { it.key }) { step ->
                ReorderableItem(reorderState, key = step.key) { isDragging ->
                    StepEditorRow(
                        step = step,
                        isDragging = isDragging,
                        onTypeChange = { viewModel.setStepType(step.key, it) },
                        onDurationChange = { viewModel.setStepDuration(step.key, it) },
                        onRemove = { viewModel.removeStep(step.key) },
                    )
                }
            }
            item {
                Button(
                    onClick = { viewModel.addStep() },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CardSurface, contentColor = OnSurface),
                ) {
                    Icon(Icons.Filled.Add, contentDescription = null, tint = Purple)
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(R.string.editor_add_step))
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

private const val HEADER_ITEMS = 2 // name field + total label

@Composable
private fun StepEditorRow(
    step: RoutineEditorViewModel.EditableStep,
    isDragging: Boolean,
    onTypeChange: (StepType) -> Unit,
    onDurationChange: (Int) -> Unit,
    onRemove: () -> Unit,
) {
    val bg = if (isDragging) CardSurface.copy(alpha = 0.6f) else CardSurface
    FlowCard(backgroundColor = bg) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.DragIndicator, contentDescription = null, tint = OnSurfaceMuted, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(8.dp))
            TypeToggle(step.type, onTypeChange)
            Spacer(Modifier.width(12.dp))
            DurationStepper(step.durationMinutes, onDurationChange)
            Spacer(Modifier.width(12.dp))
            IconButton(onClick = onRemove) {
                Icon(Icons.Filled.Close, contentDescription = "Entfernen", tint = OnSurfaceMuted)
            }
        }
    }
}

@Composable
private fun TypeToggle(type: StepType, onChange: (StepType) -> Unit) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(Background)
            .padding(2.dp),
    ) {
        TypePill(label = stringResource(R.string.editor_step_focus), icon = Icons.Filled.PlayArrow,
            selected = type == StepType.FOCUS, color = Purple, onClick = { onChange(StepType.FOCUS) })
        TypePill(label = stringResource(R.string.editor_step_pause), icon = Icons.Filled.Pause,
            selected = type == StepType.PAUSE, color = Amber, onClick = { onChange(StepType.PAUSE) })
    }
}

@Composable
private fun TypePill(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, selected: Boolean, color: Color, onClick: () -> Unit) {
    val bg = if (selected) color.copy(alpha = 0.3f) else Color.Transparent
    val fg = if (selected) color else OnSurfaceMuted
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .clickable(onClick = onClick)
            .background(bg)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = null, tint = fg, modifier = Modifier.size(14.dp))
        Spacer(Modifier.width(4.dp))
        Text(label, color = fg, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun DurationStepper(minutes: Int, onChange: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(
            onClick = { onChange((minutes - 5).coerceAtLeast(1)) },
            modifier = Modifier.size(32.dp).clip(CircleShape).background(Background),
        ) { Icon(Icons.Filled.Remove, contentDescription = null, tint = OnSurface, modifier = Modifier.size(16.dp)) }
        Text(
            text = "${minutes} Min",
            color = OnSurface,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 12.dp).width(64.dp),
            style = MaterialTheme.typography.bodyMedium,
        )
        IconButton(
            onClick = { onChange(minutes + 5) },
            modifier = Modifier.size(32.dp).clip(CircleShape).background(Background),
        ) { Icon(Icons.Filled.Add, contentDescription = null, tint = OnSurface, modifier = Modifier.size(16.dp)) }
    }
}
