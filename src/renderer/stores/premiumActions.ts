// License/premium logic was tied to the Chatbox cloud service and is disabled
// in this build. The functions below are kept as no-ops so existing imports
// stay valid; useAutoValidate now reports the existing local license state
// without making any network calls.

import { useSettingsStore } from './settingsStore'

export function useAutoValidate(): boolean {
  const licenseKey = useSettingsStore((state) => state.licenseKey)
  const licenseInstances = useSettingsStore((state) => state.licenseInstances)
  if (!licenseKey || !licenseInstances) {
    return false
  }
  return !!licenseInstances[licenseKey]
}

export async function deactivate(_clearLoginState = true): Promise<void> {
  // no-op
}

export async function activate(
  _licenseKey: string,
  _method: 'login' | 'manual' = 'manual',
  _options?: { pageName?: string }
): Promise<{ valid: boolean; error?: string }> {
  return { valid: false, error: 'Chatbox cloud service disabled in this build' }
}
