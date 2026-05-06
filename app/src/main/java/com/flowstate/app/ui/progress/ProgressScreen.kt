package com.flowstate.app.ui.progress

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
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
import com.flowstate.core.model.InventoryItemEntity
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.TextStyle
import java.util.Locale

@Composable
fun ProgressScreen(viewModel: ProgressViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var tabIdx by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        ProgressGreeting(name = state.profile?.name)
        PrimaryTabRow(
            selectedTabIndex = tabIdx,
            containerColor = Background,
            contentColor = OnSurface,
        ) {
            Tab(
                selected = tabIdx == 0, onClick = { tabIdx = 0 },
                text = { Text(stringResource(R.string.progress_tab_stats), fontWeight = FontWeight.SemiBold) },
                selectedContentColor = Purple,
                unselectedContentColor = OnSurfaceMuted,
            )
            Tab(
                selected = tabIdx == 1, onClick = { tabIdx = 1 },
                text = { Text(stringResource(R.string.progress_tab_trophies), fontWeight = FontWeight.SemiBold) },
                selectedContentColor = Purple,
                unselectedContentColor = OnSurfaceMuted,
            )
        }
        when (tabIdx) {
            0 -> StatsTab(state)
            1 -> TrophiesTab(state, viewModel)
        }
    }
}

@Composable
private fun ProgressGreeting(name: String?) {
    val day = LocalDate.now().dayOfWeek.getDisplayName(TextStyle.FULL_STANDALONE, Locale.GERMAN)
    val tod = LocalTime.now().hour.let { h ->
        when (h) {
            in 5..11 -> "Guten Morgen"
            in 12..17 -> "Guten Nachmittag"
            in 18..22 -> "Guten Abend"
            else -> "Späte Stunde"
        }
    }
    Text(
        text = "$day, $tod${name?.let { ", $it" } ?: ""}.",
        color = OnSurface,
        fontWeight = FontWeight.Bold,
        style = MaterialTheme.typography.headlineMedium,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
    )
}

@Composable
private fun StatsTab(state: ProgressViewModel.UiState) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            FlowCard {
                Column {
                    Text(
                        text = stringResource(R.string.progress_flow_score_title),
                        color = OnSurface,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Spacer(Modifier.height(8.dp))
                    FlowScoreGauge(
                        score = state.flowScore.score,
                        percentChange = state.flowScore.percentChange,
                        motivation = state.flowScore.motivation,
                    )
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OverviewTile(
                    label = stringResource(R.string.progress_overview_total_time),
                    value = formatHm(state.totalMinutes),
                    icon = Icons.Filled.AccessTime,
                    modifier = Modifier.weight(1f),
                )
                OverviewTile(
                    label = stringResource(R.string.progress_overview_sessions),
                    value = state.totalSessions.toString(),
                    icon = Icons.Filled.PlayArrow,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OverviewTile(
                    label = stringResource(R.string.progress_overview_best_day),
                    value = formatHm(state.bestDayMinutes),
                    icon = Icons.Filled.TrendingUp,
                    modifier = Modifier.weight(1f),
                )
                OverviewTile(
                    label = stringResource(R.string.progress_overview_streak),
                    value = "${state.streak} Tage",
                    icon = Icons.Filled.LocalFireDepartment,
                    iconTint = Amber,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        item { MomentumChart(current = state.weekBars.current, previous = state.weekBars.previous) }
        item { Spacer(Modifier.height(8.dp)) }
    }
}

@Composable
private fun TrophiesTab(state: ProgressViewModel.UiState, vm: ProgressViewModel) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { MasteryPath(levels = vm.levels, currentLevel = state.currentLevel) }
        item { InventorySection(state.streakShields, state.maxShields) }
        item { TrophyGrid(state.trophies) }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
private fun OverviewTile(label: String, value: String, icon: ImageVector, modifier: Modifier = Modifier, iconTint: Color = Purple) {
    FlowCard(modifier = modifier) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(iconTint.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center,
                ) { Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(16.dp)) }
                Spacer(Modifier.size(8.dp))
                Text(label, color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
            }
            Spacer(Modifier.height(8.dp))
            Text(value, color = OnSurface, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.headlineMedium)
        }
    }
}

@Composable
private fun InventorySection(shields: Int, max: Int) {
    FlowCard {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = stringResource(R.string.progress_inventory_title),
                    color = OnSurface,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f),
                )
                if (shields >= max) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Amber.copy(alpha = 0.25f))
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                    ) {
                        Text(
                            stringResource(R.string.progress_inventory_full),
                            color = Amber,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(48.dp).clip(CircleShape).background(Amber.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Filled.Shield, contentDescription = null, tint = Amber, modifier = Modifier.size(24.dp))
                }
                Spacer(Modifier.size(12.dp))
                Column {
                    Text(stringResource(R.string.progress_inventory_streak_shield), color = OnSurface, fontWeight = FontWeight.SemiBold)
                    Text("$shields/$max", color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

private fun formatHm(min: Int): String {
    val h = min / 60
    val m = min % 60
    return if (h > 0) "${h}h ${m}m" else "${m}m"
}
