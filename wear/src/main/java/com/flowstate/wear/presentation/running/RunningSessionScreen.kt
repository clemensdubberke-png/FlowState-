package com.flowstate.wear.presentation.running

import androidx.compose.foundation.Canvas
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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.flowstate.core.sync.SessionStateHolder
import com.flowstate.wear.R
import com.flowstate.wear.presentation.theme.WearAmber
import com.flowstate.wear.presentation.theme.WearPurple
import com.flowstate.wear.presentation.theme.WearPurpleDeep

@Composable
fun RunningSessionScreen(
    timer: SessionStateHolder.State,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onStop: () -> Unit,
    onCompleted: () -> Unit,
) {
    LaunchedEffect(timer.isRunning) {
        if (!timer.isRunning && timer.totalDurationSeconds > 0 && timer.remainingSeconds == 0) {
            onCompleted()
        }
    }
    val ratio = if (timer.totalDurationSeconds == 0) 0f
    else (timer.totalDurationSeconds - timer.remainingSeconds).toFloat() / timer.totalDurationSeconds
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize().padding(8.dp)) {
            val stroke = 10f
            val diameter = size.minDimension - stroke
            val topLeft = Offset((size.width - diameter) / 2f, (size.height - diameter) / 2f)
            val s = Size(diameter, diameter)
            drawArc(
                color = WearPurpleDeep.copy(alpha = 0.25f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = s,
                style = Stroke(width = stroke, cap = StrokeCap.Round),
            )
            drawArc(
                color = if (timer.isPauseStep) WearAmber else WearPurple,
                startAngle = -90f,
                sweepAngle = 360f * ratio,
                useCenter = false,
                topLeft = topLeft,
                size = s,
                style = Stroke(width = stroke, cap = StrokeCap.Round),
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text(
                text = if (timer.isPauseStep) stringResource(R.string.session_pause) else stringResource(R.string.session_running),
                color = MaterialTheme.colors.onSurfaceVariant,
            )
            Spacer(Modifier.height(2.dp))
            val mm = timer.remainingSeconds / 60
            val ss = timer.remainingSeconds % 60
            Text(
                text = "%02d:%02d".format(mm, ss),
                color = MaterialTheme.colors.onSurface,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.display1,
            )
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = if (timer.isPaused) onResume else onPause,
                    colors = ButtonDefaults.secondaryButtonColors(),
                    modifier = Modifier.size(40.dp),
                ) {
                    Text(if (timer.isPaused) "▶" else "❚❚")
                }
                Button(
                    onClick = onStop,
                    colors = ButtonDefaults.buttonColors(backgroundColor = androidx.compose.ui.graphics.Color(0xFFB91C1C)),
                    modifier = Modifier.size(40.dp),
                ) {
                    Text("■")
                }
            }
        }
    }
}
