import { getModel } from '@shared/models'
import type { ModelInterface } from '@shared/models/types'
import type { Config, Settings } from '@shared/types'
import type { ModelDependencies } from '@shared/types/adapters'
import { tool } from 'ai'
import { z } from 'zod'

export type TestResult = {
  /** queued = waiting in the bulk worker pool; pending = actively running; success/error = settled. */
  status: 'queued' | 'pending' | 'success' | 'error'
  error?: string
  /** ms since epoch when this result was produced. Set on success/error transitions. */
  completedAt?: number
  /** Total wall-clock duration of the probe in ms. */
  durationMs?: number
}

export type ModelTestState = {
  testing: boolean
  basicTest?: TestResult
  visionTest?: TestResult
  toolTest?: TestResult
}

export type TestModelOptions = {
  providerId: string
  modelId: string
  settings: Settings
  configs: Config
  dependencies: ModelDependencies
  onStateChange?: (state: ModelTestState) => void
}

export type ProbeModelOptions = Omit<TestModelOptions, 'onStateChange'> & {
  /** Per-probe timeout in ms. Defaults to 15s. Returns a `timeout` error result if exceeded. */
  timeoutMs?: number
}

const TEST_IMAGE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='

/**
 * Test a model's capabilities
 * @returns The final test state
 */
export async function testModelCapabilities(options: TestModelOptions): Promise<ModelTestState> {
  const { providerId, modelId, settings, configs, dependencies, onStateChange } = options

  let state: ModelTestState = {
    testing: true,
    basicTest: { status: 'pending' },
    visionTest: { status: 'pending' },
    toolTest: { status: 'pending' },
  }

  onStateChange?.(state)

  try {
    const modelInstance = getModel({ ...settings, provider: providerId, modelId }, settings, configs, dependencies)

    // Test 1: Basic text request
    state = await testBasicRequest(modelInstance, state)
    onStateChange?.({ ...state })

    // Test 2: Vision request (if basic test passed)
    if (state.basicTest?.status === 'success') {
      state = await testVisionRequest(modelInstance, state)
      onStateChange?.({ ...state })
    }

    // Test 3: Tool use request (if basic test passed)
    if (state.basicTest?.status === 'success') {
      state = await testToolUseRequest(modelInstance, state)
      onStateChange?.({ ...state })
    }
    state = { ...state, testing: false }
    onStateChange?.({ ...state })
  } catch (e: unknown) {
    state = { ...state, testing: false, basicTest: { status: 'error', error: String(e) } }
    onStateChange?.({ ...state })
  }
  return state
}

/**
 * Lightweight availability probe for a single model. Runs only the basic "Hi"
 * chat request without vision/tool tests, so it can be used for bulk testing of
 * many models without overwhelming the provider.
 */
export async function probeModelAvailability(options: ProbeModelOptions): Promise<TestResult> {
  const { providerId, modelId, settings, configs, dependencies, timeoutMs = 15_000 } = options
  const startedAt = Date.now()
  try {
    // Probes are single-shot: force retry=0 on the underlying apiRequest so a
    // failing model fails fast (the default chat path keeps retry=3).
    const probeDeps: typeof dependencies = {
      ...dependencies,
      request: {
        ...dependencies.request,
        apiRequest: (opts) => dependencies.request.apiRequest({ ...opts, retry: 0 }),
        fetchWithOptions: (url, init, fopts) => dependencies.request.fetchWithOptions(url, init, { ...fopts, retry: 0 }),
      },
    }
    const modelInstance = getModel({ ...settings, provider: providerId, modelId }, settings, configs, probeDeps)
    const probe = modelInstance.chat([{ role: 'user', content: 'Hi' }], { onResultChange: undefined, noRetry: true })
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Probe timed out after ${Math.round(timeoutMs / 1000)}s`)), timeoutMs)
    )
    await Promise.race([probe, timeout])
    return { status: 'success', completedAt: Date.now(), durationMs: Date.now() - startedAt }
  } catch (e: unknown) {
    const error = e as { responseBody?: string; message?: string }
    return {
      status: 'error',
      error: error?.responseBody || error?.message || String(e),
      completedAt: Date.now(),
      durationMs: Date.now() - startedAt,
    }
  }
}

async function testBasicRequest(modelInstance: ModelInterface, state: ModelTestState): Promise<ModelTestState> {
  try {
    await modelInstance.chat([{ role: 'user', content: 'Hi' }], { onResultChange: undefined })

    return { ...state, basicTest: { status: 'success' } }
  } catch (e: unknown) {
    const error = e as { responseBody?: string; message?: string }
    return {
      ...state,
      basicTest: {
        status: 'error',
        error: error?.responseBody || error?.message || String(e),
      },
    }
  }
}

async function testVisionRequest(modelInstance: ModelInterface, state: ModelTestState): Promise<ModelTestState> {
  try {
    await modelInstance.chat(
      [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What color is in this image?' },
            { type: 'image', image: `data:image/png;base64,${TEST_IMAGE_BASE64}` },
          ],
        },
      ],
      { onResultChange: () => {} }
    )
    return {
      ...state,
      visionTest: { status: 'success' },
    }
  } catch (e: unknown) {
    const error = e as { responseBody?: string; message?: string }

    return {
      ...state,
      visionTest: {
        status: 'error',
        error: error?.responseBody || error?.message || String(e),
      },
    }
  }
}

async function testToolUseRequest(modelInstance: ModelInterface, state: ModelTestState): Promise<ModelTestState> {
  try {
    await modelInstance.chat([{ role: 'user', content: 'What is the weather in San Francisco?' }], {
      tools: {
        get_weather: tool({
          description: 'Get the weather',
          inputSchema: z.object({ location: z.string().describe('City name') }),
          execute: async () => ({ temperature: 72, condition: 'sunny' }),
        }),
      },
      onResultChange: () => {},
      maxSteps: 1,
    })
    return { ...state, toolTest: { status: 'success' } }
  } catch (e: unknown) {
    const error = e as { responseBody?: string; message?: string }
    return {
      ...state,
      toolTest: {
        status: 'error',
        error: error?.responseBody || error?.message || String(e),
      },
    }
  }
}
