package com.flowstate.core.model

data class Level(
    val number: Int,
    val name: String,
    val xpRequired: Int,
    val soundId: String,
)

object Levels {
    val ALL = listOf(
        Level(1, "Deep Space", 0, "deep_space"),
        Level(2, "Tibetische Klangschale", 200, "tibetan_bowl"),
        Level(3, "Botanischer Zen", 600, "botanical_zen"),
        Level(4, "Schwarze Tonne", 1500, "black_drum"),
        Level(5, "Polarlichter", 3000, "aurora"),
        Level(6, "Sternenmeer", 6000, "starsea"),
    )

    fun levelForXp(xp: Int): Level = ALL.last { xp >= it.xpRequired }
    fun nextLevel(xp: Int): Level? = ALL.firstOrNull { xp < it.xpRequired }
}
