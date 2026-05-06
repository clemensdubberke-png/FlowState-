package com.flowstate.app.ui.progress

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flowstate.app.R
import com.flowstate.app.ui.components.FlowCard
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.app.ui.theme.PurpleDeep

private val DAYS_DE = listOf("Mo", "Di", "Mi", "Do", "Fr", "Sa", "So")

@Composable
fun MomentumChart(current: List<Int>, previous: List<Int>, modifier: Modifier = Modifier) {
    val maxVal = maxOf(current.maxOrNull() ?: 0, previous.maxOrNull() ?: 0).coerceAtLeast(1)
    FlowCard(modifier = modifier) {
        Column {
            Text(
                text = androidx.compose.ui.res.stringResource(R.string.progress_weekly_momentum),
                color = OnSurface,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                LegendDot(color = Purple, label = androidx.compose.ui.res.stringResource(R.string.progress_this_week))
                LegendDot(color = PurpleDeep.copy(alpha = 0.3f), label = androidx.compose.ui.res.stringResource(R.string.progress_last_week))
            }
            Spacer(Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth().height(160.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom,
            ) {
                for (i in 0..6) {
                    DayBars(
                        currentMin = current.getOrElse(i) { 0 },
                        previousMin = previous.getOrElse(i) { 0 },
                        max = maxVal,
                        label = DAYS_DE[i],
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

@Composable
private fun LegendDot(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(modifier = Modifier.size(8.dp).clip(RoundedCornerShape(2.dp)).background(color))
        Spacer(Modifier.size(6.dp))
        Text(label, color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun DayBars(currentMin: Int, previousMin: Int, max: Int, label: String, modifier: Modifier = Modifier) {
    val curRatio = currentMin.toFloat() / max
    val prevRatio = previousMin.toFloat() / max
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Row(
            modifier = Modifier.height(140.dp).fillMaxWidth(),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.spacedBy(2.dp, Alignment.CenterHorizontally),
        ) {
            Box(
                modifier = Modifier
                    .size(width = 10.dp, height = (140 * curRatio).dp.coerceAtLeast(4.dp))
                    .clip(RoundedCornerShape(4.dp))
                    .background(Purple)
            )
            Box(
                modifier = Modifier
                    .size(width = 10.dp, height = (140 * prevRatio).dp.coerceAtLeast(4.dp))
                    .clip(RoundedCornerShape(4.dp))
                    .background(PurpleDeep.copy(alpha = 0.3f))
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(label, color = OnSurfaceMuted, fontSize = 11.sp)
    }
}
