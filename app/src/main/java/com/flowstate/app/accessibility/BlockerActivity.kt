package com.flowstate.app.accessibility

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.flowstate.app.R
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.FlowStateTheme
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay

@AndroidEntryPoint
class BlockerActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val pkg = intent.getStringExtra(EXTRA_PACKAGE).orEmpty()
        setContent {
            FlowStateTheme {
                BlockerScreen(
                    blockedPackage = pkg,
                    onBackToFocus = { finish() },
                    onOpenAnyway = {
                        val launchIntent = packageManager.getLaunchIntentForPackage(pkg)
                        if (launchIntent != null) startActivity(launchIntent)
                        finish()
                    },
                )
            }
        }
    }

    companion object {
        const val EXTRA_PACKAGE = "extra_package"
    }
}

@Composable
private fun BlockerScreen(
    blockedPackage: String,
    onBackToFocus: () -> Unit,
    onOpenAnyway: () -> Unit,
) {
    var cooldown by remember { mutableIntStateOf(5) }
    LaunchedEffect(Unit) {
        while (cooldown > 0) {
            delay(1000L)
            cooldown--
        }
    }
    Box(
        modifier = Modifier.fillMaxSize().background(Background).padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier.size(96.dp).clip(CircleShape).background(Purple.copy(alpha = 0.25f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.Shield, contentDescription = null, tint = Purple, modifier = Modifier.size(48.dp))
            }
            Spacer(Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.focus_shield_blocker_title),
                color = OnSurface,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.headlineMedium,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.focus_shield_blocker_msg),
                color = OnSurfaceMuted,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
            )
            if (blockedPackage.isNotBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(blockedPackage, color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
            }
            Spacer(Modifier.height(32.dp))
            Button(
                onClick = onBackToFocus,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Purple, contentColor = OnSurface),
            ) { Text(stringResource(R.string.focus_shield_back_to_focus), fontWeight = FontWeight.SemiBold) }
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                onClick = onOpenAnyway,
                enabled = cooldown == 0,
                modifier = Modifier.fillMaxWidth().height(48.dp),
            ) {
                Text(
                    text = if (cooldown > 0) "${stringResource(R.string.focus_shield_open_anyway)} (${cooldown}s)"
                    else stringResource(R.string.focus_shield_open_anyway),
                    color = OnSurfaceMuted,
                )
            }
        }
    }
}
