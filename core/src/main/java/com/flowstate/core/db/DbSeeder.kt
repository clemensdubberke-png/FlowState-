package com.flowstate.core.db

import androidx.sqlite.db.SupportSQLiteDatabase

object DbSeeder {
    fun seed(db: SupportSQLiteDatabase) {
        seedProfile(db)
        seedSounds(db)
        seedTrophies(db)
        seedInventory(db)
    }

    private fun seedProfile(db: SupportSQLiteDatabase) {
        db.execSQL(
            "INSERT OR IGNORE INTO user_profile " +
                "(id, name, totalXp, currentStreak, longestStreak, lastSessionDate, currentLevel) " +
                "VALUES (1, NULL, 0, 0, 0, NULL, 1)"
        )
    }

    private fun seedSounds(db: SupportSQLiteDatabase) {
        val sounds = listOf(
            arrayOf("deep_space", "Deep Space", "sound_deep_space", 1, 1, 0),
            arrayOf("tibetan_bowl", "Tibetische Klangschale", "sound_tibetan_bowl", 2, 0, 1),
            arrayOf("botanical_zen", "Botanischer Zen", "sound_botanical_zen", 3, 0, 2),
            arrayOf("black_drum", "Schwarze Tonne", "sound_black_drum", 4, 0, 3),
            arrayOf("aurora", "Polarlichter", "sound_aurora", 5, 0, 4),
            arrayOf("starsea", "Sternenmeer", "sound_starsea", 6, 0, 5),
        )
        for (s in sounds) {
            db.execSQL(
                "INSERT OR IGNORE INTO sounds (id, name, assetPath, requiredLevel, unlocked, sortOrder) " +
                    "VALUES (?, ?, ?, ?, ?, ?)",
                s
            )
        }
    }

    private fun seedTrophies(db: SupportSQLiteDatabase) {
        val trophies = listOf(
            arrayOf("first_step", "Erster Schritt", "Schließe deine erste Fokus-Session ab", "EmojiEvents", 0),
            arrayOf("consistent", "Konsistent", "Erreiche einen 7-Tage-Streak", "Whatshot", 1),
            arrayOf("devoted", "Hingebungsvoll", "30 abgeschlossene Sessions", "Star", 2),
            arrayOf("marathon", "Marathonläufer", "Eine 60-Minuten-Session", "DirectionsRun", 3),
            arrayOf("early_bird", "Frühaufsteher", "5 Sessions vor 8 Uhr morgens", "WbSunny", 4),
            arrayOf("deep_focus", "Tiefenfokus", "10 Sessions à 45 Minuten oder mehr", "SelfImprovement", 5),
            arrayOf("ascended", "Vollendet", "Erreiche Level 3", "AutoAwesome", 6),
            arrayOf("endurance", "Ausdauer", "14-Tage-Streak", "LocalFireDepartment", 7),
            arrayOf("xp_collector", "XP-Sammler", "Sammle 1000 XP", "Bolt", 8),
            arrayOf("intentional", "Mit Absicht", "10 Sessions mit gesetzter Intention", "Lightbulb", 9),
        )
        for (t in trophies) {
            db.execSQL(
                "INSERT OR IGNORE INTO trophies (`key`, name, description, iconKey, unlocked, unlockedDate, sortOrder) " +
                    "VALUES (?, ?, ?, ?, 0, NULL, ?)",
                t
            )
        }
    }

    private fun seedInventory(db: SupportSQLiteDatabase) {
        db.execSQL("INSERT OR IGNORE INTO inventory (type, quantity) VALUES ('STREAK_SHIELD', 1)")
    }
}
