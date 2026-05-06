package com.flowstate.app.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.flowstate.core.datastore.SettingsDataStore
import com.flowstate.core.sync.SessionStateHolder
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FocusShieldAccessibilityService : AccessibilityService() {

    @Inject lateinit var stateHolder: SessionStateHolder
    @Inject lateinit var settings: SettingsDataStore

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var lastBlockedPackage: String? = null

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return
        if (pkg == packageName) return
        if (pkg == lastBlockedPackage) return

        val state = stateHolder.state.value
        if (!state.isRunning || state.isPauseStep) return

        scope.launch {
            val whitelist = settings.snapshot.first().whitelistedPackages
            if (pkg !in whitelist) {
                lastBlockedPackage = pkg
                openBlocker(pkg)
            }
        }
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    private fun openBlocker(blockedPackage: String) {
        val intent = Intent(this, BlockerActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra(BlockerActivity.EXTRA_PACKAGE, blockedPackage)
        }
        startActivity(intent)
    }
}
