package com.flowstate.wear.presentation.summary

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.flowstate.wear.R
import com.flowstate.wear.presentation.theme.WearPurple
import com.flowstate.wear.sync.WearProfileStore

@Composable
fun SessionSummaryScreen(summary: WearProfileStore.SessionSummary?, onClose: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = WearPurple, modifier = Modifier.size(40.dp))
        Spacer(Modifier.height(8.dp))
        Text(stringResource(R.string.session_summary_title), color = MaterialTheme.colors.onSurface, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text(
            text = stringResource(
                R.string.session_summary_format,
                summary?.durationMin ?: 0,
                summary?.xp ?: 0,
            ),
            color = MaterialTheme.colors.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
        Button(
            onClick = onClose,
            colors = ButtonDefaults.primaryButtonColors(backgroundColor = WearPurple),
        ) { Text(stringResource(R.string.session_close)) }
    }
}
