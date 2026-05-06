package com.flowstate.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.flowstate.app.R
import com.flowstate.app.ui.components.FlowCard
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted

@Composable
fun FocusBoostScreen(onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().background(Background)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Filled.ArrowBack, contentDescription = stringResource(R.string.back), tint = OnSurface)
            }
            Text(
                text = stringResource(R.string.settings_focus_boost),
                color = OnSurface,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.weight(1f),
            )
        }
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                FlowCard {
                    Column {
                        Text("Bildschirm-Helligkeit reduzieren", color = OnSurface, fontWeight = FontWeight.SemiBold)
                        Text(
                            "Während einer Session wird die Anzeige automatisch gedimmt.",
                            color = OnSurfaceMuted,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                }
            }
            item {
                FlowCard {
                    Column {
                        Text("Haptisches Feedback", color = OnSurface, fontWeight = FontWeight.SemiBold)
                        Text(
                            "Sanfte Vibration zum Session-Start und -Ende.",
                            color = OnSurfaceMuted,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                }
            }
            item {
                FlowCard {
                    Column {
                        Text("Session-Erinnerungen", color = OnSurface, fontWeight = FontWeight.SemiBold)
                        Text(
                            "Tägliche Erinnerungen, deine Streak-Tage zu sichern.",
                            color = OnSurfaceMuted,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                }
            }
            item { Spacer(Modifier.height(12.dp)) }
        }
    }
}
