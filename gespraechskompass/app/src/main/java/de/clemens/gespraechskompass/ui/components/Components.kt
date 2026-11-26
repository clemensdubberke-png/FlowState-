package de.clemens.gespraechskompass.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.Chat
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Forum
import androidx.compose.material.icons.rounded.LocalCafe
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.People
import androidx.compose.material.icons.rounded.Restaurant
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.StarOutline
import androidx.compose.material.icons.rounded.WarningAmber
import androidx.compose.material.icons.rounded.Work
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import de.clemens.gespraechskompass.R
import de.clemens.gespraechskompass.data.Baustein
import de.clemens.gespraechskompass.data.Bewertung
import de.clemens.gespraechskompass.ui.theme.LocalGk
import de.clemens.gespraechskompass.ui.theme.hexColor
import kotlinx.coroutines.delay

// ---- Kleine Bausteine der Oberfläche -------------------------------------------

@Composable
fun AppLogo(size: Dp = 44.dp) {
    Image(
        painter = painterResource(R.drawable.ic_logo),
        contentDescription = null,
        modifier = Modifier.size(size),
    )
}

fun szenarioIcon(name: String): ImageVector = when (name) {
    "essen" -> Icons.Rounded.Restaurant
    "pause" -> Icons.Rounded.LocalCafe
    "kommentar" -> Icons.Rounded.Forum
    "freund" -> Icons.Rounded.People
    "leitung" -> Icons.Rounded.Work
    else -> Icons.AutoMirrored.Rounded.Chat
}

@Composable
fun IconBadge(icon: ImageVector, tint: Color, size: Dp = 48.dp) {
    Box(
        Modifier
            .size(size)
            .clip(RoundedCornerShape(size * 0.34f))
            .background(tint.copy(alpha = 0.14f)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(size * 0.5f))
    }
}

/** Textfarbe einer Bausteinfarbe, im Dunkelmodus aufgehellt, damit sie lesbar bleibt. */
@Composable
fun lesbar(c: Color): Color = if (isSystemInDarkTheme()) lerp(c, Color.White, 0.35f) else c

@Composable
fun BausteinChip(baustein: Baustein, modifier: Modifier = Modifier) {
    val c = hexColor(baustein.farbe)
    val prefix = when (baustein.art) {
        "kunstgriff" -> "Kunstgriff · "
        "stolperfalle" -> "Stolperfalle · "
        else -> ""
    }
    Row(
        modifier
            .clip(RoundedCornerShape(50))
            .background(c.copy(alpha = 0.14f))
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(c))
        Spacer(Modifier.width(6.dp))
        Text(prefix + baustein.name, style = MaterialTheme.typography.labelMedium, color = lesbar(c))
    }
}

@Composable
fun SmallChip(text: String, color: Color = MaterialTheme.colorScheme.onSurfaceVariant) {
    Text(
        text,
        style = MaterialTheme.typography.labelSmall,
        color = color,
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(color.copy(alpha = 0.10f))
            .padding(horizontal = 9.dp, vertical = 4.dp),
    )
}

@Composable
fun StarRow(sterne: Int, max: Int = 3, size: Dp = 18.dp, animiert: Boolean = false) {
    val gk = LocalGk.current
    Row(
        horizontalArrangement = Arrangement.spacedBy(size * 0.12f),
        modifier = Modifier.semantics { contentDescription = "$sterne von $max Sternen" },
    ) {
        for (i in 0 until max) {
            val voll = i < sterne
            val scale = remember { Animatable(if (animiert) 0f else 1f) }
            if (animiert) {
                LaunchedEffect(Unit) {
                    delay(250L + i * 220L)
                    scale.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow))
                }
            }
            Icon(
                if (voll) Icons.Rounded.Star else Icons.Rounded.StarOutline,
                contentDescription = null,
                tint = if (voll) gk.star else MaterialTheme.colorScheme.outline,
                modifier = Modifier.size(size).scale(scale.value),
            )
        }
    }
}

/** Sichtbarer Balken (Vertrauen/Erkenntnis) mit kurz aufblitzender Änderung. */
@Composable
fun ValueBar(label: String, value: Int, color: Color, modifier: Modifier = Modifier) {
    val fraction by animateFloatAsState(value / 100f, tween(700, easing = FastOutSlowInEasing), label = "bar")
    var letzter by remember { mutableStateOf(value) }
    var delta by remember { mutableStateOf(0) }
    LaunchedEffect(value) {
        if (value != letzter) {
            delta = value - letzter
            letzter = value
            delay(1800)
            delta = 0
        }
    }
    Column(modifier.semantics { contentDescription = "$label $value von 100" }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.weight(1f))
            AnimatedVisibility(delta != 0, enter = fadeIn() + slideInVertically { it / 2 }, exit = fadeOut()) {
                Text(
                    (if (delta > 0) "+" else "") + delta,
                    style = MaterialTheme.typography.labelMedium,
                    color = if (delta > 0) LocalGk.current.gut else LocalGk.current.unguenstig,
                    modifier = Modifier.padding(end = 6.dp),
                )
            }
            Text("$value", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurface)
        }
        Spacer(Modifier.height(6.dp))
        Box(
            Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(50))
                .background(LocalGk.current.track),
        ) {
            Box(
                Modifier
                    .fillMaxWidth(fraction.coerceIn(0.02f, 1f))
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(50))
                    .background(color),
            )
        }
    }
}

// ---- Gesprächsverlauf -------------------------------------------------------------

@Composable
fun Avatar(name: String, color: Color, size: Dp = 36.dp) {
    Box(
        Modifier.size(size).clip(CircleShape).background(color.copy(alpha = 0.18f)),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            (name.trim().split(" ").lastOrNull() ?: name).firstOrNull { it.isLetter() }?.uppercase() ?: "?",
            style = MaterialTheme.typography.titleSmall,
            color = lesbar(color),
        )
    }
}

@Composable
fun TheirBubble(name: String, text: String, color: Color, zeigeKopf: Boolean = true) {
    Row(Modifier.fillMaxWidth().padding(end = 40.dp), verticalAlignment = Alignment.Top) {
        if (zeigeKopf) Avatar(name, color) else Spacer(Modifier.width(36.dp))
        Spacer(Modifier.width(10.dp))
        Column {
            if (zeigeKopf) {
                Text(name, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(3.dp))
            }
            Surface(
                shape = RoundedCornerShape(topStart = 6.dp, topEnd = 22.dp, bottomEnd = 22.dp, bottomStart = 22.dp),
                color = LocalGk.current.theirBubble,
            ) {
                Text(
                    text,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 11.dp),
                )
            }
        }
    }
}

@Composable
fun NarratorText(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic),
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 28.dp, vertical = 2.dp),
    )
}

@Composable
fun MineBubble(text: String, akzent: Color?) {
    val gk = LocalGk.current
    Row(Modifier.fillMaxWidth().padding(start = 48.dp), horizontalArrangement = Arrangement.End) {
        Surface(
            shape = RoundedCornerShape(topStart = 22.dp, topEnd = 6.dp, bottomEnd = 22.dp, bottomStart = 22.dp),
            color = gk.mineBubble,
            border = akzent?.let { BorderStroke(2.dp, it) },
        ) {
            Text(
                text,
                style = MaterialTheme.typography.bodyLarge,
                color = gk.onMineBubble,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 11.dp),
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FeedbackCard(
    bewertung: Bewertung,
    warum: String,
    bausteine: List<Baustein>,
    deltaVertrauen: Int,
    deltaErkenntnis: Int,
    labelVertrauen: String,
    labelErkenntnis: String,
) {
    val farbe = LocalGk.current.fuer(bewertung)
    val (icon, titel) = when (bewertung) {
        Bewertung.GUT -> Icons.Rounded.CheckCircle to "Warum das funktioniert"
        Bewertung.TEILS -> Icons.Rounded.Lightbulb to "Teilweise hilfreich"
        Bewertung.UNGUENSTIG -> Icons.Rounded.WarningAmber to "Warum das nicht funktioniert"
    }
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = farbe.copy(alpha = 0.08f),
        modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
    ) {
        Row(Modifier.height(IntrinsicSize.Min)) {
            Box(Modifier.width(5.dp).fillMaxHeight().background(farbe))
            Column(Modifier.padding(start = 14.dp, end = 16.dp, top = 12.dp, bottom = 14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(icon, contentDescription = null, tint = farbe, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(titel, style = MaterialTheme.typography.titleSmall, color = lesbar(farbe))
                }
                Spacer(Modifier.height(6.dp))
                Text(warum, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface)
                Spacer(Modifier.height(10.dp))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    bausteine.forEach { BausteinChip(it) }
                }
                if (deltaVertrauen != 0 || deltaErkenntnis != 0) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        listOf(
                            deltaVertrauen.takeIf { it != 0 }?.let { "${signed(it)} $labelVertrauen" },
                            deltaErkenntnis.takeIf { it != 0 }?.let { "${signed(it)} $labelErkenntnis" },
                        ).filterNotNull().joinToString("  ·  "),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

private fun signed(v: Int) = if (v > 0) "+$v" else "$v"

@Composable
fun TypingIndicator(name: String, color: Color) {
    val t = rememberInfiniteTransition(label = "typing")
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Avatar(name, color)
        Spacer(Modifier.width(10.dp))
        Surface(shape = RoundedCornerShape(22.dp), color = LocalGk.current.theirBubble) {
            Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                repeat(3) { i ->
                    val a by t.animateFloat(
                        initialValue = 0.25f, targetValue = 1f,
                        animationSpec = infiniteRepeatable(tween(500, delayMillis = i * 160), RepeatMode.Reverse),
                        label = "dot$i",
                    )
                    Box(Modifier.size(8.dp).alpha(a).clip(CircleShape).background(MaterialTheme.colorScheme.onSurfaceVariant))
                }
            }
        }
    }
}

/** Runde Antwortkarte. Mindesthöhe 56 dp (Tippfläche ≥ 44 dp). */
@Composable
fun AnswerCard(text: String, nummer: Int, onClick: () -> Unit, enabled: Boolean = true) {
    Surface(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.5.dp, MaterialTheme.colorScheme.outlineVariant),
        shadowElevation = 1.dp,
        modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp),
    ) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(28.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center,
            ) {
                Text("$nummer", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Spacer(Modifier.width(12.dp))
            Text(text, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        }
    }
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier) {
    Text(
        text.uppercase(),
        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = modifier.padding(top = 8.dp, bottom = 4.dp),
    )
}

@Composable
fun GkCard(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable () -> Unit) {
    val shape = RoundedCornerShape(26.dp)
    val border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
    if (onClick != null) {
        Surface(onClick = onClick, shape = shape, border = border, color = MaterialTheme.colorScheme.surface, modifier = modifier.widthIn(max = 640.dp)) { content() }
    } else {
        Surface(shape = shape, border = border, color = MaterialTheme.colorScheme.surface, modifier = modifier.widthIn(max = 640.dp)) { content() }
    }
}

@Composable
fun TopBar(
    titel: String,
    untertitel: String? = null,
    onBack: () -> Unit,
    backIcon: ImageVector = Icons.AutoMirrored.Rounded.ArrowBack,
    backLabel: String = "Zurück",
    trailing: @Composable () -> Unit = {},
) {
    Row(
        Modifier.fillMaxWidth().statusBarsPadding().padding(start = 6.dp, end = 12.dp, top = 4.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onBack, modifier = Modifier.size(48.dp)) { Icon(backIcon, contentDescription = backLabel) }
        Spacer(Modifier.width(4.dp))
        Column(Modifier.weight(1f)) {
            Text(titel, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (untertitel != null) {
                Text(untertitel, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        trailing()
    }
}
