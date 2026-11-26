package de.clemens.gespraechskompass.modes.dialogduell

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.QuestionAnswer
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import de.clemens.gespraechskompass.AppContainer
import de.clemens.gespraechskompass.modes.GameMode

object DialogDuellMode : GameMode {
    override val id = "dialog-duell"
    override val titel = "Dialog-Duell"
    override val beschreibung = "Echte Gesprächsszenen. Du wählst die Antwort, das Gegenüber reagiert. Belohnt wird gutes Gespräch, nicht Rechthaben."
    override val icon = Icons.Rounded.QuestionAnswer
    override val farbe = Color(0xFF2A9D8F)
    override val verfuegbar = true
    override val startRoute = "duell"

    fun playRoute(szenarioId: String) = "duell/$szenarioId"

    override fun register(builder: NavGraphBuilder, nav: NavController, app: AppContainer) {
        builder.composable(startRoute) {
            ScenarioListScreen(
                app = app,
                onBack = { nav.popBackStack() },
                onSzenario = { nav.navigate(playRoute(it)) },
            )
        }
        builder.composable(
            route = "duell/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("id").orEmpty()
            val vm: PlayViewModel = viewModel(
                key = "play_$id",
                factory = viewModelFactory { initializer { PlayViewModel(app, id) } },
            )
            PlayScreen(
                vm = vm,
                onExit = { nav.popBackStack() },
            )
        }
    }
}
