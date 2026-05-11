// Keep the Android status bar in sync with the app's resolved theme so it
// doesn't blend into the white app background. iOS handles status bar styling
// via Info.plist + safe-area; this is primarily for Android, but the calls
// are safe on iOS too (Capacitor no-ops where unsupported).

import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { uiStore } from '@/stores/uiStore'

// Colors mirror the MUI palette in src/renderer/hooks/useAppTheme.ts:
// - dark mode background.default is '#242424'
// - light mode background uses the default white
const DARK_BG = '#242424'
const LIGHT_BG = '#ffffff'

async function applyStatusBar(realTheme: 'light' | 'dark') {
  try {
    if (realTheme === 'dark') {
      // Style.Dark = light foreground content on a dark bar
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: DARK_BG })
    } else {
      // Style.Light = dark foreground content on a light bar
      await StatusBar.setStyle({ style: Style.Light })
      await StatusBar.setBackgroundColor({ color: LIGHT_BG })
    }
  } catch {
    // Some Android variants (and iOS for setBackgroundColor) reject these
    // calls; swallow so we don't crash the renderer on startup.
  }
}

if (Capacitor.isNativePlatform()) {
  ;(async () => {
    try {
      // Ensure the WebView doesn't draw under the status bar; the safe-area
      // plugin still provides insets, but overlay:false keeps the bar visually
      // distinct from the app content.
      await StatusBar.setOverlaysWebView({ overlay: false })
    } catch {
      // ignore
    }

    // Apply once on load using the current resolved theme.
    await applyStatusBar(uiStore.getState().realTheme)

    // Re-apply whenever the resolved theme changes.
    let lastTheme = uiStore.getState().realTheme
    uiStore.subscribe((state) => {
      if (state.realTheme !== lastTheme) {
        lastTheme = state.realTheme
        void applyStatusBar(state.realTheme)
      }
    })
  })()
}
