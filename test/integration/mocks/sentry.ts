import type { SentryAdapter, SentryScope } from '../../../src/shared/utils/sentry_adapter'
export class MockSentryAdapter implements SentryAdapter {
  private errors: any[] = []

  captureException(error: any): void {
    this.errors.push(error)
    console.error('[MockSentry] Captured exception:', error)
  }

  withScope(callback: (scope: SentryScope) => void): void {
    const scope: SentryScope = {
      setTag: (_key: string, _value: string) => {},
      setExtra: (_key: string, _value: any) => {},
    }
    callback(scope)
  }

  getErrors(): any[] {
    return this.errors
  }

  clear(): void {
    this.errors = []
  }
}
