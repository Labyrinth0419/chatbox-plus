import { Link } from '@mui/material'
import { ChatboxAIAPIError } from '@shared/models/errors'
import type { FC } from 'react'
import { Trans } from 'react-i18next'
import { navigateToSettings } from '@/modals/Settings'

interface ChatboxAIErrorMessageProps {
  errorCode: number
  /** Optional model name for `{{model}}` interpolation in i18n keys. */
  model?: string
  /** Kept for compatibility with existing call sites. */
  trackingSource?: string
}

/**
 * Renders a neutral message for known ChatboxAIAPIError codes. The no-subscription
 * build keeps these errors actionable without linking to paid services.
 */
export const ChatboxAIErrorMessage: FC<ChatboxAIErrorMessageProps> = ({ errorCode, model }) => {
  const detail = ChatboxAIAPIError.getDetail(errorCode)
  if (!detail) return null

  return (
    <Trans
      i18nKey={
        model
          ? 'The current model {{model}} does not support this feature. Please switch to another configured model in <OpenSettingButton>Settings</OpenSettingButton>.'
          : 'The current model does not support this feature. Please switch to another configured model in <OpenSettingButton>Settings</OpenSettingButton>.'
      }
      values={{ model: model || '' }}
      components={{
        OpenSettingButton: (
          <Link
            component="button"
            type="button"
            className="cursor-pointer italic"
            onClick={() => {
              navigateToSettings()
            }}
          />
        ),
      }}
    />
  )
}
