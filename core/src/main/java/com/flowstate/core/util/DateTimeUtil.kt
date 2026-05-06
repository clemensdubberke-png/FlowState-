package com.flowstate.core.util

import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

object DateTimeUtil {
    const val DAY_MILLIS = 24L * 60L * 60L * 1000L

    fun dayBounds(now: Long = System.currentTimeMillis()): Pair<Long, Long> {
        val zone = ZoneId.systemDefault()
        val date = Instant.ofEpochMilli(now).atZone(zone).toLocalDate()
        val start = date.atStartOfDay(zone).toInstant().toEpochMilli()
        val end = date.plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli()
        return start to end
    }

    /** Stable Long key per local day (epoch millis at start of day). */
    fun dayKey(epochMillis: Long = System.currentTimeMillis()): Long = dayBounds(epochMillis).first

    /** Monday-based week bounds. */
    fun weekBounds(now: Long = System.currentTimeMillis()): Pair<Long, Long> {
        val zone = ZoneId.systemDefault()
        val date = Instant.ofEpochMilli(now).atZone(zone).toLocalDate()
        val mondayOffset = (date.dayOfWeek.value - DayOfWeek.MONDAY.value + 7) % 7
        val monday = date.minusDays(mondayOffset.toLong())
        val start = monday.atStartOfDay(zone).toInstant().toEpochMilli()
        val end = monday.plusDays(7).atStartOfDay(zone).toInstant().toEpochMilli()
        return start to end
    }

    fun daysOfCurrentWeek(now: Long = System.currentTimeMillis()): List<LocalDate> {
        val (start, _) = weekBounds(now)
        val zone = ZoneId.systemDefault()
        val first = Instant.ofEpochMilli(start).atZone(zone).toLocalDate()
        return (0..6).map { first.plusDays(it.toLong()) }
    }
}
