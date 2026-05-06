package com.flowstate.wear.presentation.stats

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.flowstate.core.sync.ProfileSnapshotDto
import com.flowstate.wear.R
import com.flowstate.wear.presentation.theme.WearAmber
import com.flowstate.wear.presentation.theme.WearOnSurfaceMuted
import com.flowstate.wear.presentation.theme.WearPurple

@Composable
fun StatsGlanceScreen(profile: ProfileSnapshotDto) {
    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(stringResource(R.string.stats_title), color = MaterialTheme.colors.onSurfaceVariant)
        Spacer(Modifier.height(2.dp))
        Text("${profile.todaySessions}", color = WearPurple, style = MaterialTheme.typography.display2, fontWeight = FontWeight.Bold)
        Text(stringResource(R.string.sessions_label), color = WearOnSurfaceMuted, style = MaterialTheme.typography.caption2)
        Spacer(Modifier.height(8.dp))
        Text("${profile.streak}🔥", color = WearAmber, fontWeight = FontWeight.SemiBold)
        Text(stringResource(R.string.streak_label), color = WearOnSurfaceMuted, style = MaterialTheme.typography.caption2)
        Spacer(Modifier.height(8.dp))
        Text("${profile.flowScore}", color = MaterialTheme.colors.onSurface, fontWeight = FontWeight.SemiBold)
        Text(stringResource(R.string.flow_score_label), color = WearOnSurfaceMuted, style = MaterialTheme.typography.caption2)
    }
}
