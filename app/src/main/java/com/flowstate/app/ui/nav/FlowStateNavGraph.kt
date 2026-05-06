package com.flowstate.app.ui.nav

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.PlaylistPlay
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.flowstate.app.R
import com.flowstate.app.ui.onboarding.OnboardingScreen
import com.flowstate.app.ui.progress.ProgressScreen
import com.flowstate.app.ui.routines.RoutineEditorScreen
import com.flowstate.app.ui.routines.RoutinesScreen
import com.flowstate.app.ui.settings.AppWhitelistScreen
import com.flowstate.app.ui.settings.FocusBoostScreen
import com.flowstate.app.ui.settings.SettingsScreen
import com.flowstate.app.ui.theme.Background
import com.flowstate.app.ui.theme.CardSurface
import com.flowstate.app.ui.theme.OnSurface
import com.flowstate.app.ui.theme.OnSurfaceMuted
import com.flowstate.app.ui.theme.Purple
import com.flowstate.app.ui.timer.TimerScreen

@Composable
fun FlowStateNavGraph(
    rootViewModel: RootViewModel = hiltViewModel(),
) {
    val state by rootViewModel.state.collectAsStateWithLifecycle()
    val navController = rememberNavController()

    when (state) {
        RootViewModel.RootState.Loading -> Unit
        RootViewModel.RootState.NeedsOnboarding -> {
            NavHost(navController = navController, startDestination = Routes.ONBOARDING) {
                composable(Routes.ONBOARDING) {
                    OnboardingScreen(onComplete = { rootViewModel.refresh() })
                }
            }
        }
        RootViewModel.RootState.Ready -> RootScaffold(navController)
    }
}

@Composable
private fun RootScaffold(navController: NavHostController) {
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route ?: Routes.TIMER
    val showBottomBar = currentRoute in setOf(Routes.TIMER, Routes.PROGRESS, Routes.ROUTINES, Routes.SETTINGS)

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Background,
        bottomBar = {
            if (showBottomBar) FlowStateBottomBar(currentRoute) { dest ->
                navController.navigate(dest) {
                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                    launchSingleTop = true
                    restoreState = true
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.TIMER,
            modifier = Modifier.fillMaxSize().padding(padding),
        ) {
            composable(Routes.TIMER) {
                TimerScreen(
                    onOpenSettings = { navController.navigate(Routes.SETTINGS) },
                    onOpenProgress = { navController.navigate(Routes.PROGRESS) },
                    onOpenRoutines = { navController.navigate(Routes.ROUTINES) },
                )
            }
            composable(Routes.PROGRESS) { ProgressScreen() }
            composable(Routes.ROUTINES) {
                RoutinesScreen(
                    onCreateRoutine = { navController.navigate(Routes.routineEditor(null)) },
                    onEditRoutine = { id -> navController.navigate(Routes.routineEditor(id)) },
                )
            }
            composable(Routes.SETTINGS) {
                SettingsScreen(
                    onBack = { navController.popBackStack() },
                    onOpenRoutines = { navController.navigate(Routes.ROUTINES) },
                    onOpenAppWhitelist = { navController.navigate(Routes.APP_WHITELIST) },
                    onOpenFocusBoost = { navController.navigate(Routes.FOCUS_BOOST) },
                )
            }
            composable(Routes.APP_WHITELIST) {
                AppWhitelistScreen(onBack = { navController.popBackStack() })
            }
            composable(Routes.FOCUS_BOOST) {
                FocusBoostScreen(onBack = { navController.popBackStack() })
            }
            composable(
                route = Routes.ROUTINE_EDITOR_ARG_PATTERN,
                arguments = listOf(navArgument("routineId") { type = NavType.LongType; defaultValue = -1L }),
            ) { entry ->
                val id = entry.arguments?.getLong("routineId")?.takeIf { it >= 0L }
                RoutineEditorScreen(
                    routineId = id,
                    onBack = { navController.popBackStack() },
                )
            }
        }
    }
}

private data class BottomDest(val route: String, val labelRes: Int, val icon: ImageVector)

@Composable
private fun FlowStateBottomBar(currentRoute: String, onSelect: (String) -> Unit) {
    val items = listOf(
        BottomDest(Routes.TIMER, R.string.nav_timer, Icons.Filled.AccessTime),
        BottomDest(Routes.PROGRESS, R.string.nav_progress, Icons.Filled.Insights),
        BottomDest(Routes.ROUTINES, R.string.nav_routines, Icons.Filled.PlaylistPlay),
        BottomDest(Routes.SETTINGS, R.string.nav_settings, Icons.Filled.Settings),
    )
    NavigationBar(containerColor = CardSurface, contentColor = OnSurface) {
        for (item in items) {
            NavigationBarItem(
                selected = currentRoute == item.route,
                onClick = { onSelect(item.route) },
                icon = { Icon(item.icon, contentDescription = null) },
                label = { Text(stringResource(item.labelRes)) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Purple,
                    selectedTextColor = Purple,
                    unselectedIconColor = OnSurfaceMuted,
                    unselectedTextColor = OnSurfaceMuted,
                    indicatorColor = Background,
                ),
            )
        }
    }
}
