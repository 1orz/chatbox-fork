import { Link } from '@mui/material'
import { ChatboxAIAPIError } from '@shared/models/errors'
import type { FC } from 'react'
import { Trans } from 'react-i18next'
import { navigateToSettings } from '@/modals/Settings'

interface ChatboxAIErrorMessageProps {
  errorCode: number
  model?: string
  trackingSource?: string
}

const SUPPORTED_WEB_BROWSING_MODELS = 'gemini-2.0-flash(API), perplexity API'

export const ChatboxAIErrorMessage: FC<ChatboxAIErrorMessageProps> = ({ errorCode, model }) => {
  const detail = ChatboxAIAPIError.getDetail(errorCode)
  if (!detail) return null

  return (
    <Trans
      i18nKey={detail.i18nKey}
      values={{
        model,
        supported_web_browsing_models: SUPPORTED_WEB_BROWSING_MODELS,
      }}
      components={{
        OpenSettingButton: (
          <Link
            component="button"
            type="button"
            className="cursor-pointer italic"
            onClick={() => navigateToSettings()}
          />
        ),
        OpenExtensionSettingButton: (
          <Link
            component="button"
            type="button"
            className="cursor-pointer italic"
            onClick={() => navigateToSettings('/web-search')}
          />
        ),
        OpenMorePlanButton: <span />,
        LinkToHomePage: <span />,
        LinkToAdvancedFileProcessing: <span />,
        LinkToAdvancedUrlProcessing: <span />,
        OpenDocumentParserSettingButton: (
          <Link
            component="button"
            type="button"
            className="cursor-pointer italic"
            onClick={() => navigateToSettings('/document-parser')}
          />
        ),
      }}
    />
  )
}
