package de.clemens.gespraechskompass.ui

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.modes.ModeRegistry
import de.clemens.gespraechskompass.ui.home.HomeScreen
import de.clemens.gespraechskompass.ui.werkzeug.WerkzeugkastenScreen

object Routes {
    const val HOME = "home"
    const val WERKZEUGKASTEN = "werkzeugkasten"
}

@Composable
fun AppNav(app: AppContainer) {
    val nav = rememberNavController()
    val dauer = 320
    NavHost(
        navController = nav,
        startDestination = Routes.HOME,
        enterTransition = {
            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start, tween(dauer), initialOffset = { it / 6 }) + fadeIn(tween(dauer))
        },
        exitTransition = { fadeOut(tween(dauer / 2)) },
        popEnterTransition = { fadeIn(tween(dauer)) },
        popExitTransition = {
            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End, tween(dauer), targetOffset = { it / 6 }) + fadeOut(tween(dauer))
        },
    ) {
        composable(Routes.HOME) {
            HomeScreen(
                app = app,
                onMode = { mode -> nav.navigate(mode.startRoute) },
                onWerkzeugkasten = { nav.navigate(Routes.WERKZEUGKASTEN) },
                onSzenario = { id -> nav.navigate("duell/$id") },
            )
        }
        composable(Routes.WERKZEUGKASTEN) {
            WerkzeugkastenScreen(app = app, onBack = { nav.popBackStack() })
        }
        ModeRegistry.modes.forEach { it.register(this, nav, app) }
    }
}
