import type { SentryAdapter, SentryScope } from '../../shared/utils/sentry_adapter'

// Renderer-side Sentry adapter: telemetry stripped from this fork.
// All methods are no-ops; @sentry/react is not initialised anywhere.
export class RendererSentryAdapter implements SentryAdapter {
  captureException(_error: any): void {}

  withScope(callback: (scope: SentryScope) => void): void {
    const scope: SentryScope = {
      setTag(_key: string, _value: string): void {},
      setExtra(_key: string, _value: any): void {},
    }
    callback(scope)
  }
}
