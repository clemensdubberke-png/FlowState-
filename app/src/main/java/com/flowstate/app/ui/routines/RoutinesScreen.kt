package com.flowstate.app.ui.routines

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.flowstate.app.R
import com.flowstate.app.service.TimerForegroundService
import com.flowstate.app.ui.components.FlowCard
import com.flowstate.app.ui.theme.Amber
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.CardSurface
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.core.model.RoutineWithSteps
import com.flowstate.core.model.StepType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoutinesScreen(
    onCreateRoutine: () -> Unit,
    onEditRoutine: (Long) -> Unit,
    viewModel: RoutinesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val ctx = LocalContext.current
    var deleteCandidate by remember { mutableStateOf<RoutineWithSteps?>(null) }

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(R.string.routines_title),
                color = OnSurface,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.headlineLarge,
                modifier = Modifier.weight(1f),
            )
            IconButton(
                onClick = onCreateRoutine,
                modifier = Modifier.size(48.dp).clip(CircleShape).background(Purple),
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Routine erstellen", tint = OnSurface)
            }
        }
        if (state.routines.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                Text(
                    text = stringResource(R.string.routines_no_routines),
                    color = OnSurfaceMuted,
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
            return
        }
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(state.routines, key = { it.routine.id }) { r ->
                val swipeState = rememberSwipeToDismissBoxState()
                LaunchedEffect(swipeState.currentValue) {
                    when (swipeState.currentValue) {
                        SwipeToDismissBoxValue.StartToEnd -> {
                            onEditRoutine(r.routine.id)
                            swipeState.reset()
                        }
                        SwipeToDismissBoxValue.EndToStart -> {
                            deleteCandidate = r
                            swipeState.reset()
                        }
                        else -> Unit
                    }
                }
                SwipeToDismissBox(
                    state = swipeState,
                    backgroundContent = { SwipeBackground(swipeState.dismissDirection) },
                ) {
                    RoutineCard(
                        routine = r,
                        isActive = r.routine.id == state.activeRoutineId,
                        onStart = {
                            viewModel.setActive(r.routine.id)
                            val first = r.orderedSteps.firstOrNull() ?: return@RoutineCard
                            TimerForegroundService.start(
                                ctx,
                                durationMin = first.durationMinutes,
                                intention = null,
                                routineId = r.routine.id,
                            )
                        },
                    )
                }
            }
            item {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.routines_swipe_hint),
                    color = OnSurfaceMuted,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                )
            }
        }
    }

    deleteCandidate?.let { target ->
        AlertDialog(
            onDismissRequest = { deleteCandidate = null },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteRoutine(target.routine)
                    deleteCandidate = null
                }) { Text(stringResource(R.string.routines_delete_confirm), color = Amber) }
            },
            dismissButton = {
                TextButton(onClick = { deleteCandidate = null }) { Text(stringResource(R.string.routines_cancel)) }
            },
            title = { Text(stringResource(R.string.routines_delete_title), color = OnSurface) },
            text = { Text(stringResource(R.string.routines_delete_message, target.routine.name), color = OnSurfaceMuted) },
            containerColor = CardSurface,
            titleContentColor = OnSurface,
            textContentColor = OnSurfaceMuted,
        )
    }
}

@Composable
private fun SwipeBackground(direction: SwipeToDismissBoxValue) {
    val color = when (direction) {
        SwipeToDismissBoxValue.StartToEnd -> Purple
        SwipeToDismissBoxValue.EndToStart -> Color(0xFFB91C1C)
        else -> Color.Transparent
    }
    val icon = when (direction) {
        SwipeToDismissBoxValue.StartToEnd -> Icons.Filled.Edit
        SwipeToDismissBoxValue.EndToStart -> Icons.Filled.Delete
        else -> null
    }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(20.dp))
            .background(color)
            .padding(horizontal = 24.dp),
        contentAlignment = if (direction == SwipeToDismissBoxValue.StartToEnd) Alignment.CenterStart else Alignment.CenterEnd,
    ) {
        icon?.let { Icon(it, contentDescription = null, tint = OnSurface) }
    }
}

@Composable
private fun RoutineCard(routine: RoutineWithSteps, isActive: Boolean, onStart: () -> Unit) {
    FlowCard {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = routine.routine.name,
                    color = OnSurface,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.weight(1f),
                )
                if (isActive) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Purple.copy(alpha = 0.25f))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) { Text("AKTIV", color = Purple, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold) }
                }
            }
            Spacer(Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    stringResource(R.string.routines_total, routine.totalMinutes),
                    color = OnSurfaceMuted,
                    style = MaterialTheme.typography.bodyMedium,
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(CardSurface)
                        .padding(horizontal = 8.dp, vertical = 2.dp),
                ) { Text(stringResource(R.string.routines_steps_count, routine.steps.size), color = Purple, style = MaterialTheme.typography.bodySmall) }
            }
            Spacer(Modifier.height(12.dp))
            StepTimeline(routine.orderedSteps)
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = onStart,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Purple, contentColor = OnSurface),
            ) {
                Text(stringResource(R.string.routines_start), fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun StepTimeline(steps: List<com.flowstate.core.model.RoutineStepEntity>) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            steps.forEachIndexed { i, step ->
                Box(
                    modifier = Modifier.size(14.dp).clip(CircleShape)
                        .background(if (step.type == StepType.FOCUS) Purple else Amber)
                )
                if (i < steps.lastIndex) {
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 4.dp)
                            .height(2.dp)
                            .weight(1f)
                            .background(OnSurfaceMuted.copy(alpha = 0.4f))
                    )
                }
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            steps.forEach { step ->
                Text(
                    text = if (step.type == StepType.FOCUS)
                        stringResource(R.string.routines_step_focus, step.durationMinutes)
                    else
                        stringResource(R.string.routines_step_pause, step.durationMinutes),
                    color = OnSurfaceMuted,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}
