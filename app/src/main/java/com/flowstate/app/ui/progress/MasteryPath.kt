package com.flowstate.app.ui.progress

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.flowstate.app.ui.components.FlowCard
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.app.ui.theme.PurpleDeep
import com.flowstate.core.model.Level

@Composable
fun MasteryPath(levels: List<Level>, currentLevel: Int, modifier: Modifier = Modifier) {
    FlowCard(modifier = modifier) {
        Column {
            Text(
                text = "Pfad zur Meisterschaft",
                color = OnSurface,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium,
            )
            Spacer(Modifier.height(16.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(0.dp)) {
                items(levels) { lvl ->
                    LevelNode(
                        level = lvl,
                        isUnlocked = lvl.number <= currentLevel,
                        isCurrent = lvl.number == currentLevel,
                        showConnector = lvl.number != levels.last().number,
                    )
                }
            }
        }
    }
}

@Composable
private fun LevelNode(level: Level, isUnlocked: Boolean, isCurrent: Boolean, showConnector: Boolean) {
    Row(verticalAlignment = Alignment.Top) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(96.dp)) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(if (isUnlocked) Purple.copy(alpha = if (isCurrent) 0.55f else 0.3f) else PurpleDeep.copy(alpha = 0.15f))
                    .let { if (isCurrent) it.border(2.dp, Purple, CircleShape) else it },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = if (isUnlocked) Icons.Filled.AutoAwesome else Icons.Filled.Lock,
                    contentDescription = null,
                    tint = if (isUnlocked) OnSurface else OnSurfaceMuted,
                    modifier = Modifier.size(24.dp),
                )
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = "LVL ${level.number}",
                color = if (isUnlocked) OnSurface else OnSurfaceMuted,
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = level.name,
                color = if (isUnlocked) OnSurface else OnSurfaceMuted,
                style = MaterialTheme.typography.bodySmall,
            )
        }
        if (showConnector) {
            Box(
                modifier = Modifier
                    .padding(top = 26.dp)
                    .height(3.dp)
                    .width(20.dp)
                    .background(if (isUnlocked) Purple.copy(alpha = 0.6f) else PurpleDeep.copy(alpha = 0.2f))
            )
        }
    }
}
