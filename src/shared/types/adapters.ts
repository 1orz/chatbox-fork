import type { SentryAdapter } from '../utils/sentry_adapter'

export interface ApiRequestOptions {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: RequestInit['body']
  useProxy?: boolean
  signal?: AbortSignal
  retry?: number
  // When false, forces the renderer-side `apiRequest` to bypass CapacitorHttp / native streaming
  // on mobile and use the WebView's regular fetch instead. Default `true` preserves the legacy
  // mobile-always-native behaviour for callers that don't pass this flag.
  useNativeOnMobile?: boolean
}

export interface StorageAdapter {
  saveImage(folder: string, dataUrl: string): Promise<string>
  getImage(storageKey: string): Promise<string>
}

export interface RequestAdapter {
  fetchWithOptions(
    url: string,
    init?: RequestInit,
    options?: { retry?: number; parseChatboxRemoteError?: boolean }
  ): Promise<Response>
  apiRequest(options: ApiRequestOptions): Promise<Response>
}

export interface ModelDependencies {
  request: RequestAdapter
  storage: StorageAdapter
  sentry: SentryAdapter
  getRemoteConfig(): any
} 