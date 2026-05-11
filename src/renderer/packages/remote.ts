import { z } from 'zod'
import type {
  ChatboxAILicenseDetail,
  Config,
  CopilotDetail,
  ModelProvider,
  ProviderModelInfo,
  RemoteConfig,
  Settings,
} from '../../shared/types'

// All Chatbox-AI backed remote calls are disabled in this build.
// Functions retain their signatures so existing callers compile,
// but they throw or return safe empty values at runtime.

const DISABLED = 'Chatbox cloud service disabled in this build'
function disabled(): never {
  throw new Error(DISABLED)
}

export function getChatboxOrigin() {
  return ''
}

export function buildChatboxUrl(path: string) {
  return path
}

export async function checkNeedUpdate(_version: string, _os: string, _config: Config, _settings: Settings) {
  return false
}

export async function listCopilotTags(_lang: string): Promise<string[]> {
  return []
}

export async function listCopilotsByCursor(
  _lang: string,
  _filters?: {
    limit?: number
    cursor?: string
    tag?: string
    search?: string
  }
): Promise<{ data: CopilotDetail[]; next_cursor: string | null }> {
  return { data: [], next_cursor: null }
}

export async function recordCopilotUsage(_params: {
  id: string
  action: 'create_session' | 'create_thread' | 'create_message' | 'use_copilot'
}) {
  // no-op
}

export async function recordCopilotShare(_detail: CopilotDetail) {
  // no-op
}

export async function getPremiumPrice() {
  return disabled()
}

export async function getRemoteConfig(_config: keyof RemoteConfig): Promise<RemoteConfig> {
  return {} as RemoteConfig
}

export interface DialogConfig {
  markdown: string
  buttons: { label: string; url: string }[]
}

export async function getDialogConfig(_params: {
  uuid: string
  language: string
  version: string
}): Promise<DialogConfig | null> {
  return null
}

export async function getLicenseDetail(_params: { licenseKey: string }): Promise<ChatboxAILicenseDetail | null> {
  return null
}

export interface LicenseDetailError {
  code: string
  detail: string
  status: number
  title: string
}

export interface LicenseDetailResponse {
  data: ChatboxAILicenseDetail | null
  error?: LicenseDetailError
}

export async function getLicenseDetailRealtime(_params: { licenseKey: string }): Promise<LicenseDetailResponse> {
  return { data: null }
}

export async function generateUploadUrl(_params: { licenseKey: string; filename: string }): Promise<{
  url: string
  filename: string
}> {
  return disabled()
}

export async function createUserFile<T extends boolean>(_params: {
  licenseKey: string
  filename: string
  filetype: string
  returnContent: T
}): Promise<{
  uuid: string
  content: T extends true ? string : undefined
}> {
  return disabled()
}

export async function uploadAndCreateUserFile(_licenseKey: string, _file: File): Promise<string> {
  return disabled()
}

export async function parseUserLinkPro(_params: {
  licenseKey: string
  url: string
  abortSignal?: AbortSignal
}): Promise<{ key: string; title: string; storageKey: string }> {
  return disabled()
}

export async function parseUserLinkFree(_params: { url: string }): Promise<{ title: string; text: string }> {
  return disabled()
}

export async function webBrowsing(_params: { licenseKey: string; query: string }): Promise<{
  uuid?: string
  query: string
  links: { title: string; url: string; content: string }[]
}> {
  return disabled()
}

export async function activateLicense(_params: { licenseKey: string; instanceName: string }): Promise<{
  valid: boolean
  instanceId: string
  error: string
}> {
  return disabled()
}

export async function deactivateLicense(_params: { licenseKey: string; instanceId: string }): Promise<void> {
  // no-op
}

export async function validateLicense(_params: {
  licenseKey: string
  instanceId: string
}): Promise<{ valid: boolean }> {
  return { valid: false }
}

export async function getModelManifest(_params: {
  aiProvider: ModelProvider
  licenseKey?: string
  language?: string
}): Promise<{ groupName: string; models: any[] }> {
  return { groupName: '', models: [] }
}

export async function getProviderModelsInfo(_params: {
  modelIds: string[]
}): Promise<Record<string, ProviderModelInfo | null>> {
  return {}
}

export async function requestLoginTicketId(): Promise<string> {
  return disabled()
}

export async function sendEmailLoginCode(_params: { email: string; lang?: string }): Promise<string> {
  return disabled()
}

export async function loginOrSignupWithEmailCode(_params: {
  email: string
  code: string
}): Promise<{ accessToken: string; refreshToken: string }> {
  return disabled()
}

export async function getWebAuthToken(): Promise<string> {
  return disabled()
}

export async function checkLoginStatus(_ticketId: string): Promise<{
  status: 'pending' | 'success' | 'rejected'
  accessToken: string | null
  refreshToken: string | null
}> {
  return { status: 'rejected', accessToken: null, refreshToken: null }
}

export async function refreshAccessToken(_params: {
  refreshToken: string
}): Promise<{ accessToken: string; refreshToken: string }> {
  return disabled()
}

export async function getUserProfile(): Promise<{
  email: string
  id: string
  created_at: string
}> {
  return disabled()
}

export interface UserLicense {
  id: number
  key: string
  status: string
  platform: string
  product_name: string
  payment_type: string
  image_usage: number
  unified_token_usage: number
  unified_token_limit: number
  unified_token_usage_details: Array<{
    type: string
    token_usage: number
    token_limit: number
  }>
  image_limit: number
  next_token_refresh_at: string
  expires_at: string
  created_at: string
  recurring_canceled: boolean
  quota_packs: any[]
}

export async function listLicensesByUser(): Promise<UserLicense[]> {
  return []
}

export interface ImageCompletionRequest {
  model: string
  prompt: string
  response_format: 'b64_json'
  style?: string
  aspect_ratio?: string
  quantity?: number
  images?: Array<{ image_url: string }>
}

const ImageGenerationItemSchema = z.object({
  uuid: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  created_at: z.string(),
  image_url: z.string().optional(),
  generated_at: z.string().optional(),
})

const ImageGenerationTaskResponseSchema = z.object({
  items: z.array(ImageGenerationItemSchema),
  is_finished: z.boolean(),
  task_id: z.string(),
})

export type ImageGenerationItem = z.infer<typeof ImageGenerationItemSchema>
export type ImageGenerationTaskResponse = z.infer<typeof ImageGenerationTaskResponseSchema>

export async function submitImageGeneration(
  _params: ImageCompletionRequest,
  _licenseKey: string
): Promise<ImageGenerationTaskResponse> {
  return disabled()
}

export async function pollImageTask(
  _taskId: string,
  _licenseKey: string,
  _signal?: AbortSignal
): Promise<ImageGenerationTaskResponse> {
  return disabled()
}

export async function pollTaskUntilComplete(
  _taskId: string,
  _licenseKey: string,
  _options?: {
    signal?: AbortSignal
    onPoll?: (response: ImageGenerationTaskResponse) => void
  }
): Promise<ImageGenerationTaskResponse> {
  return disabled()
}
