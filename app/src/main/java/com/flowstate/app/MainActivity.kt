package com.flowstate.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.flowstate.app.ui.nav.FlowStateNavGraph
import com.flowstate.app.ui.theme.FlowStateTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { FlowStateApp() }
    }
}

@Composable
private fun FlowStateApp() {
    FlowStateTheme {
        Surface(modifier = Modifier.fillMaxSize().background(com.flowstate.app.ui.theme.Background)) {
            FlowStateNavGraph()
        }
    }
}
