package com.flowstate.wear.presentation.quickstart

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.flowstate.core.sync.ProfileSnapshotDto
import com.flowstate.wear.R
import com.flowstate.wear.presentation.theme.WearAmber
import com.flowstate.wear.presentation.theme.WearOnSurfaceMuted
import com.flowstate.wear.presentation.theme.WearPurple

@Composable
fun QuickstartScreen(
    profile: ProfileSnapshotDto,
    onStart: (Int) -> Unit,
    onOpenStats: () -> Unit,
) {
    val listState = rememberScalingLazyListState()
    ScalingLazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        item {
            Column(modifier = Modifier.fillMaxWidth().padding(top = 4.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(stringResource(R.string.quickstart_title), color = MaterialTheme.colors.onSurface, fontWeight = FontWeight.Bold)
                if (profile.streak > 0) {
                    Text("${profile.streak}🔥 · ${profile.todayMinutes}m", color = WearAmber)
                }
            }
        }
        item {
            Chip(
                onClick = { onStart(10) },
                label = { Text(stringResource(R.string.quickstart_10)) },
                modifier = Modifier.fillMaxWidth(),
                colors = ChipDefaults.primaryChipColors(backgroundColor = WearPurple),
            )
        }
        item {
            Chip(
                onClick = { onStart(25) },
                label = { Text(stringResource(R.string.quickstart_25)) },
                modifier = Modifier.fillMaxWidth(),
                colors = ChipDefaults.primaryChipColors(backgroundColor = WearPurple),
            )
        }
        item {
            Chip(
                onClick = { onStart(45) },
                label = { Text(stringResource(R.string.quickstart_45)) },
                modifier = Modifier.fillMaxWidth(),
                colors = ChipDefaults.primaryChipColors(backgroundColor = WearPurple),
            )
        }
        item {
            Chip(
                onClick = onOpenStats,
                label = { Text(stringResource(R.string.stats_title)) },
                modifier = Modifier.fillMaxWidth(),
                colors = ChipDefaults.secondaryChipColors(),
            )
        }
    }
}
