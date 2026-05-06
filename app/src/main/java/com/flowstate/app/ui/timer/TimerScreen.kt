package com.flowstate.app.ui.timer

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
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
import com.flowstate.app.ui.components.NextGoalChip
import com.flowstate.app.ui.components.StreakBadge
import com.flowstate.app.ui.components.ToolbarIconButton
import com.flowstate.app.ui.sounds.SoundPickerSheet
import com.flowstate.app.ui.theme.Amber
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.CardSurface
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.app.ui.theme.PurpleDeep
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val PRESETS_MIN = listOf(10, 15, 25, 45, 60)

@Composable
fun TimerScreen(
    viewModel: TimerViewModel = hiltViewModel(),
    onOpenSettings: () -> Unit,
    onOpenProgress: () -> Unit,
    onOpenRoutines: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedPreset by remember { mutableStateOf(25) }
    var intentionExpanded by remember { mutableStateOf(false) }
    var intentionText by remember { mutableStateOf("") }
    var soundPickerVisible by remember { mutableStateOf(false) }

    val timer = state.timer
    val isRunning = timer.isRunning

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(top = 12.dp, bottom = 16.dp),
    ) {
        TopIconRow(
            onOpenRoutines = onOpenRoutines,
            onOpenProgress = onOpenProgress,
            onOpenSounds = { soundPickerVisible = true },
            onOpenSettings = onOpenSettings,
        )
        Spacer(Modifier.height(12.dp))

        // User info card
        UserInfoCard(
            name = state.name,
            streak = state.streak,
            multiplier = state.xpMultiplier,
            totalXp = state.totalXp,
            nextLevelName = state.nextLevelName,
            currentPresetMin = selectedPreset,
        )

        Spacer(Modifier.height(12.dp))
        state.activeQuest?.let { quest ->
            DailyQuestBanner(title = quest.title)
            Spacer(Modifier.height(12.dp))
        }

        TimerDisplay(
            remainingSec = if (isRunning) timer.remainingSeconds else selectedPreset * 60,
            totalSec = if (isRunning) timer.totalDurationSeconds else selectedPreset * 60,
            isPauseStep = timer.isPauseStep,
        )

        Spacer(Modifier.height(20.dp))

        if (!isRunning) {
            PresetChips(
                selected = selectedPreset,
                onSelected = { selectedPreset = it },
            )
            Spacer(Modifier.height(16.dp))

            IntentionField(
                expanded = intentionExpanded,
                onExpandToggle = { intentionExpanded = !intentionExpanded },
                text = intentionText,
                onTextChange = { intentionText = it },
            )

            Spacer(Modifier.height(16.dp))

            Button(
                onClick = { viewModel.startTimer(selectedPreset, intentionText) },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Purple, contentColor = OnSurface),
            ) {
                Text(stringResource(R.string.timer_start), fontWeight = FontWeight.Bold)
            }

            state.activeRoutine?.let { active ->
                Spacer(Modifier.height(8.dp))
                OutlinedButton(
                    onClick = onOpenRoutines,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(14.dp),
                ) {
                    Text(stringResource(R.string.timer_active_routine, active.routine.name), color = OnSurfaceMuted)
                }
            }
        } else {
            RunningControls(
                isPaused = timer.isPaused,
                onPause = { viewModel.pause() },
                onResume = { viewModel.resume() },
                onStop = { viewModel.stop() },
            )
        }

        Spacer(Modifier.height(20.dp))

        SessionHistoryCard(
            streak = state.streak,
            sessionsToday = state.todaySessionCount,
            minutesToday = state.todayMinutes,
            sessions = state.todaySessions,
        )
    }

    if (soundPickerVisible) {
        SoundPickerSheet(
            onDismiss = { soundPickerVisible = false },
            onSelect = { id ->
                viewModel.selectSound(id)
                soundPickerVisible = false
            },
            currentSoundId = state.settings.selectedSoundId,
        )
    }
}

@Composable
private fun TopIconRow(
    onOpenRoutines: () -> Unit,
    onOpenProgress: () -> Unit,
    onOpenSounds: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        ToolbarIconButton(Icons.Filled.Edit, "Routinen", onOpenRoutines)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ToolbarIconButton(Icons.Filled.Star, "Stats", onOpenProgress)
            ToolbarIconButton(Icons.Filled.EmojiEvents, "Trophäen", onOpenProgress)
            ToolbarIconButton(Icons.Filled.GraphicEq, "Sounds", onOpenSounds)
            ToolbarIconButton(Icons.Filled.Settings, "Einstellungen", onOpenSettings)
        }
    }
}

@Composable
private fun UserInfoCard(
    name: String,
    streak: Int,
    multiplier: Float,
    totalXp: Int,
    nextLevelName: String?,
    currentPresetMin: Int,
) {
    val greetingTemplate = greetingResId()
    val greeting = stringResource(greetingTemplate, name.ifBlank { "Du" })
    FlowCard {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = name.ifBlank { "Du" },
                        color = OnSurface,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(greeting, color = OnSurfaceMuted, style = MaterialTheme.typography.bodyMedium)
                }
                Text(
                    text = stringResource(R.string.timer_xp_format, totalXp, currentPresetMin),
                    color = Purple,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
            }
            Spacer(Modifier.height(12.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                StreakBadge(streak = streak, multiplier = multiplier)
                if (nextLevelName != null) {
                    NextGoalChip(stringResource(R.string.timer_next_label, nextLevelName))
                }
            }
        }
    }
}

@Composable
private fun greetingResId(): Int {
    val hour = LocalTime.now().hour
    return when (hour) {
        in 5..11 -> R.string.timer_motivation_morning
        in 12..17 -> R.string.timer_motivation_afternoon
        in 18..22 -> R.string.timer_motivation_evening
        else -> R.string.timer_motivation_night
    }
}

@Composable
private fun DailyQuestBanner(title: String) {
    FlowCard(
        backgroundColor = PurpleDeep.copy(alpha = 0.18f),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 14.dp, vertical = 12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(Purple.copy(alpha = 0.4f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.EmojiEvents, contentDescription = null, tint = Amber, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(10.dp))
            Text(
                text = stringResource(R.string.timer_daily_quest_banner, title),
                color = OnSurface,
                fontWeight = FontWeight.SemiBold,
                style = MaterialTheme.typography.bodyLarge,
            )
        }
    }
}

@Composable
private fun TimerDisplay(remainingSec: Int, totalSec: Int, isPauseStep: Boolean) {
    val color = if (isPauseStep) Amber else OnSurface
    val mm = remainingSec / 60
    val ss = remainingSec % 60
    Box(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
        Text(
            text = "%02d:%02d".format(mm, ss),
            color = color,
            style = MaterialTheme.typography.displayLarge,
            fontWeight = FontWeight.Medium,
        )
    }
}

@Composable
private fun PresetChips(selected: Int, onSelected: (Int) -> Unit) {
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(PRESETS_MIN) { min ->
            PresetChip(min = min, selected = min == selected, onClick = { onSelected(min) })
        }
    }
}

@Composable
private fun PresetChip(min: Int, selected: Boolean, onClick: () -> Unit) {
    val bg = if (selected) Purple else CardSurface
    val fg = if (selected) OnSurface else OnSurfaceMuted
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(bg)
            .clickable(onClick = onClick)
            .padding(horizontal = 18.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text("${min}m", color = fg, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun IntentionField(
    expanded: Boolean,
    onExpandToggle: () -> Unit,
    text: String,
    onTextChange: (String) -> Unit,
) {
    FlowCard(contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth().clickable(onClick = onExpandToggle).padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Filled.Lightbulb, contentDescription = null, tint = Purple, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(10.dp))
                Text(
                    text = stringResource(R.string.timer_intention_set),
                    color = OnSurface,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                )
                Text(if (expanded) "▴" else "▾", color = OnSurfaceMuted)
            }
            AnimatedVisibility(visible = expanded) {
                OutlinedTextField(
                    value = text,
                    onValueChange = onTextChange,
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 16.dp),
                    placeholder = { Text(stringResource(R.string.timer_intention_hint), color = OnSurfaceMuted) },
                    shape = RoundedCornerShape(14.dp),
                    colors = TextFieldDefaults.colors(
                        focusedTextColor = OnSurface,
                        unfocusedTextColor = OnSurface,
                        focusedContainerColor = Background,
                        unfocusedContainerColor = Background,
                        focusedIndicatorColor = Purple,
                        unfocusedIndicatorColor = OnSurfaceMuted.copy(alpha = 0.3f),
                    ),
                )
            }
        }
    }
}

@Composable
private fun RunningControls(
    isPaused: Boolean,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onStop: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        OutlinedButton(
            onClick = if (isPaused) onResume else onPause,
            modifier = Modifier.weight(1f).height(56.dp),
            shape = RoundedCornerShape(16.dp),
        ) {
            Text(stringResource(if (isPaused) R.string.timer_resume else R.string.timer_pause))
        }
        Button(
            onClick = onStop,
            modifier = Modifier.weight(1f).height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFB91C1C), contentColor = OnSurface),
        ) {
            Text(stringResource(R.string.timer_stop), fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun SessionHistoryCard(
    streak: Int,
    sessionsToday: Int,
    minutesToday: Int,
    sessions: List<com.flowstate.core.model.SessionEntity>,
) {
    FlowCard {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Amber.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Filled.LocalFireDepartment,
                        contentDescription = null,
                        tint = Amber,
                        modifier = Modifier.size(18.dp),
                    )
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.timer_history_today, sessionsToday, minutesToday),
                        color = OnSurface,
                        fontWeight = FontWeight.SemiBold,
                        style = MaterialTheme.typography.titleMedium,
                    )
                }
                Text("$streak🔥", color = Amber, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(12.dp))
            if (sessions.isEmpty()) {
                Text(
                    text = stringResource(R.string.timer_no_sessions_today),
                    color = OnSurfaceMuted,
                    style = MaterialTheme.typography.bodyMedium,
                )
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    sessions.take(5).forEach { s -> SessionRow(s) }
                }
            }
        }
    }
}

@Composable
private fun SessionRow(session: com.flowstate.core.model.SessionEntity) {
    val time = Instant.ofEpochMilli(session.startTime)
        .atZone(ZoneId.systemDefault())
        .format(DateTimeFormatter.ofPattern("HH:mm"))
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Background)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(time, color = OnSurfaceMuted, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.width(54.dp))
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            Text("${session.durationMinutes} Min", color = OnSurface, fontWeight = FontWeight.SemiBold)
            session.intentionText?.takeIf { it.isNotBlank() }?.let {
                Text(it, color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
            }
        }
        Text("+${session.xpEarned} XP", color = Purple, fontWeight = FontWeight.SemiBold)
    }
}
