import type { SentryAdapter, SentryScope } from '../../shared/utils/sentry_adapter'

// Sentry telemetry stripped from this fork.
// We keep the SentryAdapter shape so existing call sites compile, but every
// method is a no-op and no DSN is configured. @sentry/node is no longer initialised.
export class MainSentryAdapter implements SentryAdapter {
  captureException(_error: any): void {}

  withScope(callback: (scope: SentryScope) => void): void {
    const scope: SentryScope = {
      setTag(_key: string, _value: string): void {},
      setExtra(_key: string, _value: any): void {},
    }
    callback(scope)
  }
}

export const sentry = new MainSentryAdapter()
