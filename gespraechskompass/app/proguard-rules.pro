# kotlinx.serialization bringt eigene Regeln mit; die Datenmodelle zusätzlich sicher behalten.
-keepattributes *Annotation*, InnerClasses
-keep,includedescriptorclasses class de.clemens.gespraechskompass.data.**$$serializer { *; }
-keepclassmembers class de.clemens.gespraechskompass.data.** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}
