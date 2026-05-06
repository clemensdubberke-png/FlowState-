package com.flowstate.app.ui.progress

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DirectionsRun
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material.icons.filled.Whatshot
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.CardSurface
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.app.ui.theme.SuccessGreen
import com.flowstate.core.model.TrophyEntity

@Composable
fun TrophyGrid(trophies: List<TrophyEntity>, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Text(
            text = "Trophäenschrank",
            color = OnSurface,
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.titleLarge,
        )
        Spacer(Modifier.height(12.dp))
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxWidth().height(((trophies.size / 3 + 1) * 130).dp),
        ) {
            items(trophies) { t -> TrophyCard(t) }
        }
    }
}

@Composable
private fun TrophyCard(trophy: TrophyEntity) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(CardSurface)
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(if (trophy.unlocked) Purple.copy(alpha = 0.25f) else Background),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = iconFor(trophy.iconKey),
                contentDescription = null,
                tint = if (trophy.unlocked) Purple else OnSurfaceMuted,
                modifier = Modifier.size(28.dp),
            )
            if (!trophy.unlocked) {
                Box(modifier = Modifier
                    .size(56.dp).clip(CircleShape).background(Background.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.Center) {
                    Icon(Icons.Filled.Lock, contentDescription = null, tint = OnSurfaceMuted, modifier = Modifier.size(20.dp))
                }
            } else {
                Box(
                    modifier = Modifier.align(Alignment.BottomEnd).padding(2.dp).size(18.dp).clip(CircleShape).background(SuccessGreen),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Filled.Check, contentDescription = null, tint = OnSurface, modifier = Modifier.size(12.dp))
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = trophy.name,
            color = if (trophy.unlocked) OnSurface else OnSurfaceMuted,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.bodySmall,
        )
    }
}

private fun iconFor(key: String): ImageVector = when (key) {
    "EmojiEvents" -> Icons.Filled.EmojiEvents
    "Whatshot" -> Icons.Filled.Whatshot
    "Star" -> Icons.Filled.Star
    "DirectionsRun" -> Icons.Filled.DirectionsRun
    "WbSunny" -> Icons.Filled.WbSunny
    "SelfImprovement" -> Icons.Filled.SelfImprovement
    "AutoAwesome" -> Icons.Filled.AutoAwesome
    "LocalFireDepartment" -> Icons.Filled.LocalFireDepartment
    "Bolt" -> Icons.Filled.Bolt
    "Lightbulb" -> Icons.Filled.Lightbulb
    else -> Icons.Filled.EmojiEvents
}
