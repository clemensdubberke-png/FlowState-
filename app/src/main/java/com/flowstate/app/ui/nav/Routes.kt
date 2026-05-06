package com.flowstate.app.ui.nav

object Routes {
    const val ONBOARDING = "onboarding"
    const val ROOT = "root"
    const val TIMER = "timer"
    const val PROGRESS = "progress"
    const val ROUTINES = "routines"
    const val ROUTINE_EDITOR = "routine_editor"
    fun routineEditor(id: Long? = null) = "routine_editor?routineId=${id ?: -1}"
    const val ROUTINE_EDITOR_ARG_PATTERN = "routine_editor?routineId={routineId}"

    const val SETTINGS = "settings"
    const val APP_WHITELIST = "app_whitelist"
    const val FOCUS_BOOST = "focus_boost"
}
