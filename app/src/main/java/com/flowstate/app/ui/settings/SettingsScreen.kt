package com.flowstate.app.ui.settings

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.IosShare
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.flowstate.app.R
import com.flowstate.app.ui.components.SectionLabel
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.CardSurface
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple

@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onOpenRoutines: () -> Unit,
    onOpenAppWhitelist: () -> Unit,
    onOpenFocusBoost: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val ctx = LocalContext.current
    var customizationExpanded by remember { mutableStateOf(false) }
    var nameDialogVisible by remember { mutableStateOf(false) }
    var showOverlayDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Background).padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item { SettingsHeader(name = state.name, onBack = onBack) }

        item { SectionLabel(text = stringResource(R.string.settings_section_focus_mode), modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)) }
        item {
            SettingsCard {
                NavRow(
                    title = stringResource(R.string.settings_flow_routines),
                    onClick = onOpenRoutines,
                )
                Divider()
                NavRow(
                    title = stringResource(R.string.settings_focus_shield),
                    subtitle = stringResource(R.string.settings_focus_shield_subtitle),
                    onClick = onOpenAppWhitelist,
                )
                Divider()
                ToggleRow(
                    title = stringResource(R.string.settings_auto_dnd),
                    subtitle = stringResource(R.string.settings_auto_dnd_subtitle),
                    checked = state.settings.autoDnd,
                    onChange = viewModel::setAutoDnd,
                )
                Divider()
                ToggleRow(
                    title = stringResource(R.string.settings_mute_media),
                    subtitle = stringResource(R.string.settings_mute_media_subtitle),
                    checked = state.settings.muteMedia,
                    onChange = viewModel::setMuteMedia,
                )
                Divider()
                NavRow(
                    title = stringResource(R.string.settings_focus_boost),
                    subtitle = stringResource(R.string.settings_focus_boost_subtitle),
                    onClick = onOpenFocusBoost,
                )
                Divider()
                ToggleRow(
                    title = stringResource(R.string.settings_confirm_focus),
                    subtitle = stringResource(R.string.settings_confirm_focus_subtitle),
                    checked = state.settings.confirmBeforeFocus,
                    onChange = viewModel::setConfirmBeforeFocus,
                )
                Divider()
                ToggleRow(
                    title = stringResource(R.string.settings_lock_timer),
                    subtitle = stringResource(R.string.settings_lock_timer_subtitle),
                    checked = state.settings.lockScreenTimer,
                    onChange = viewModel::setLockScreenTimer,
                )
            }
        }

        item { SectionLabel(text = stringResource(R.string.settings_section_floating), modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)) }
        item {
            SettingsCard {
                ToggleRow(
                    title = stringResource(R.string.settings_floating_overlay),
                    subtitle = stringResource(R.string.settings_floating_overlay_subtitle),
                    checked = state.settings.floatingTimerEnabled,
                    onChange = { v ->
                        if (v && !canDrawOverlays(ctx)) {
                            showOverlayDialog = true
                        } else {
                            viewModel.setFloatingTimer(v)
                        }
                    },
                )
            }
        }

        item {
            SectionLabel(text = stringResource(R.string.settings_section_customization), modifier = Modifier.padding(top = 12.dp, bottom = 4.dp))
        }
        item {
            SettingsCard {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { customizationExpanded = !customizationExpanded }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text("Personalisierung", color = OnSurface, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                    Icon(
                        if (customizationExpanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                        contentDescription = null, tint = OnSurfaceMuted,
                    )
                }
                AnimatedVisibility(visible = customizationExpanded) {
                    Column {
                        Divider()
                        NavRow(
                            title = stringResource(R.string.settings_change_name),
                            subtitle = state.name,
                            onClick = { nameDialogVisible = true },
                        )
                        Divider()
                        NavRow(
                            title = stringResource(R.string.settings_app_version),
                            subtitle = "1.0.0",
                            onClick = {},
                        )
                    }
                }
            }
        }
        item { Spacer(Modifier.height(24.dp)) }
    }

    if (nameDialogVisible) {
        var newName by remember { mutableStateOf(state.name) }
        AlertDialog(
            onDismissRequest = { nameDialogVisible = false },
            title = { Text(stringResource(R.string.settings_change_name), color = OnSurface) },
            text = {
                OutlinedTextField(
                    value = newName,
                    onValueChange = { newName = it },
                    singleLine = true,
                    colors = TextFieldDefaults.colors(
                        focusedTextColor = OnSurface,
                        unfocusedTextColor = OnSurface,
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Purple,
                        unfocusedIndicatorColor = OnSurfaceMuted,
                    ),
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    if (newName.isNotBlank()) viewModel.setName(newName.trim())
                    nameDialogVisible = false
                }) { Text(stringResource(R.string.editor_save), color = Purple) }
            },
            dismissButton = {
                TextButton(onClick = { nameDialogVisible = false }) {
                    Text(stringResource(R.string.routines_cancel))
                }
            },
            containerColor = CardSurface,
            titleContentColor = OnSurface,
            textContentColor = OnSurfaceMuted,
        )
    }

    if (showOverlayDialog) {
        AlertDialog(
            onDismissRequest = { showOverlayDialog = false },
            title = { Text(stringResource(R.string.settings_overlay_request_title), color = OnSurface) },
            text = { Text(stringResource(R.string.settings_overlay_request_msg), color = OnSurfaceMuted) },
            confirmButton = {
                TextButton(onClick = {
                    showOverlayDialog = false
                    requestOverlayPermission(ctx)
                }) { Text(stringResource(R.string.settings_grant_permission), color = Purple) }
            },
            dismissButton = {
                TextButton(onClick = { showOverlayDialog = false }) {
                    Text(stringResource(R.string.routines_cancel))
                }
            },
            containerColor = CardSurface,
        )
    }
}

@Composable
private fun SettingsHeader(name: String, onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.Filled.ArrowBack, contentDescription = stringResource(R.string.back), tint = OnSurface)
        }
        Text(
            text = name.ifBlank { stringResource(R.string.settings_title) },
            color = OnSurface,
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.weight(1f),
        )
        IconButton(onClick = {}) {
            Icon(Icons.Filled.IosShare, contentDescription = stringResource(R.string.share), tint = OnSurface)
        }
        IconButton(onClick = {}) {
            Icon(Icons.Filled.Shield, contentDescription = null, tint = OnSurface)
        }
    }
}

@Composable
private fun SettingsCard(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(CardSurface),
    ) { Column { content() } }
}

@Composable
private fun NavRow(title: String, subtitle: String? = null, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = OnSurface, fontWeight = FontWeight.SemiBold)
            if (!subtitle.isNullOrEmpty()) {
                Text(subtitle, color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
            }
        }
        Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = OnSurfaceMuted)
    }
}

@Composable
private fun ToggleRow(title: String, subtitle: String? = null, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = OnSurface, fontWeight = FontWeight.SemiBold)
            if (!subtitle.isNullOrEmpty()) {
                Text(subtitle, color = OnSurfaceMuted, style = MaterialTheme.typography.bodySmall)
            }
        }
        Switch(
            checked = checked,
            onCheckedChange = onChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = OnSurface,
                checkedTrackColor = Purple,
                uncheckedThumbColor = OnSurface,
                uncheckedTrackColor = OnSurfaceMuted.copy(alpha = 0.4f),
            ),
        )
    }
}

@Composable
private fun Divider() {
    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Background.copy(alpha = 0.5f)))
}

private fun canDrawOverlays(ctx: Context): Boolean =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) Settings.canDrawOverlays(ctx) else true

private fun requestOverlayPermission(ctx: Context) {
    val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${ctx.packageName}"),
    ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    ctx.startActivity(intent)
}
