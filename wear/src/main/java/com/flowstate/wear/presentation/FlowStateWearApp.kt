package com.flowstate.wear.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.flowstate.wear.presentation.quickstart.QuickstartScreen
import com.flowstate.wear.presentation.running.RunningSessionScreen
import com.flowstate.wear.presentation.stats.StatsGlanceScreen
import com.flowstate.wear.presentation.summary.SessionSummaryScreen
import com.flowstate.wear.presentation.theme.FlowStateWearTheme
import com.flowstate.wear.presentation.theme.WearBackground

object WearRoutes {
    const val QUICKSTART = "quickstart"
    const val RUNNING = "running"
    const val SUMMARY = "summary"
    const val STATS = "stats"
}

@Composable
fun FlowStateWearApp(viewModel: WearAppViewModel = hiltViewModel()) {
    val navController = rememberSwipeDismissableNavController()
    val state by viewModel.state.collectAsStateWithLifecycle()

    FlowStateWearTheme {
        SwipeDismissableNavHost(
            navController = navController,
            startDestination = if (state.timer.isRunning) WearRoutes.RUNNING else WearRoutes.QUICKSTART,
            modifier = Modifier.fillMaxSize().background(WearBackground),
        ) {
            composable(WearRoutes.QUICKSTART) {
                QuickstartScreen(
                    profile = state.profile,
                    onStart = { minutes -> viewModel.startSession(minutes); navController.navigate(WearRoutes.RUNNING) },
                    onOpenStats = { navController.navigate(WearRoutes.STATS) },
                )
            }
            composable(WearRoutes.RUNNING) {
                RunningSessionScreen(
                    timer = state.timer,
                    onPause = { viewModel.pause() },
                    onResume = { viewModel.resume() },
                    onStop = {
                        viewModel.stop()
                        navController.popBackStack(WearRoutes.QUICKSTART, false)
                    },
                    onCompleted = { navController.navigate(WearRoutes.SUMMARY) },
                )
            }
            composable(WearRoutes.SUMMARY) {
                SessionSummaryScreen(
                    summary = state.lastSummary,
                    onClose = { navController.popBackStack(WearRoutes.QUICKSTART, false) },
                )
            }
            composable(WearRoutes.STATS) {
                StatsGlanceScreen(profile = state.profile)
            }
        }
    }
}
