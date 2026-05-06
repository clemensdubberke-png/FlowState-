package com.flowstate.core.db

import androidx.room.TypeConverter
import com.flowstate.core.model.ItemType
import com.flowstate.core.model.StepType

class Converters {
    @TypeConverter fun stepTypeToString(t: StepType): String = t.name
    @TypeConverter fun stepTypeFromString(s: String): StepType = StepType.valueOf(s)
    @TypeConverter fun itemTypeToString(t: ItemType): String = t.name
    @TypeConverter fun itemTypeFromString(s: String): ItemType = ItemType.valueOf(s)
}
