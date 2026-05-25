import { Button, Flex, Stack, Text, TextInput } from '@mantine/core'
import { ModelProviderType } from '@shared/types'
import { IconUpload } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { type ChangeEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { AdaptiveSelect } from '@/components/AdaptiveSelect'
import { AdaptiveModal } from '@/components/common/AdaptiveModal'
import { ScalableIcon } from '@/components/common/ScalableIcon'
import { CustomProviderAvatar } from '@/components/CustomProviderIcon'
import { useSettingsStore } from '@/stores/settingsStore'
import { add as addToast } from '@/stores/toastActions'
import {
  isCustomProviderIconStorageUrl,
  isSupportedCustomProviderIconFile,
  saveCustomProviderIconFile,
} from '@/utils/custom-provider-icon'

interface AddProviderModalProps {
  opened: boolean
  onClose: () => void
}

export function AddProviderModal({ opened, onClose }: AddProviderModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSettings = useSettingsStore((s) => s.setSettings)
  const customProviders = useSettingsStore((s) => s.customProviders)
  const [newProviderName, setNewProviderName] = useState('')
  const [newProviderIconUrl, setNewProviderIconUrl] = useState('')
  const [newProviderMode, setNewProviderMode] = useState<ModelProviderType>(ModelProviderType.OpenAI)
  const iconInputRef = useRef<HTMLInputElement | null>(null)

  const handleIconUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    if (!isSupportedCustomProviderIconFile(file)) {
      addToast(t('Support jpg or png file smaller than 5MB'))
      return
    }

    try {
      const iconUrl = await saveCustomProviderIconFile(file, newProviderName || 'new-provider')
      setNewProviderIconUrl(iconUrl)
    } catch (error) {
      console.error('Failed to upload custom provider icon:', error)
      addToast(t('Support jpg or png file smaller than 5MB'))
    }
  }

  const handleAddProvider = () => {
    const pid = `custom-provider-${uuidv4()}`
    const iconUrl = newProviderIconUrl.trim() || undefined
    setSettings({
      customProviders: [
        ...(customProviders || []),
        {
          id: pid,
          name: newProviderName,
          type: newProviderMode,
          iconUrl,
          isCustom: true,
        },
      ],
    })
    onClose()
    navigate({
      to: '/settings/provider/$providerId',
      params: {
        providerId: pid,
      },
    })
  }

  return (
    <AdaptiveModal size="sm" opened={opened} onClose={onClose} centered title={t('Add provider')}>
      <Stack gap="xs">
        <Text>{t('Name')}</Text>
        <TextInput
          value={newProviderName}
          onChange={(e) => setNewProviderName(e.currentTarget.value)}
          required
          error={!newProviderName.trim() ? t('Name is required') : ''}
        />
        <Text>{t('Icon')}</Text>
        <Flex gap="xs" align="center" wrap="wrap">
          <input
            ref={iconInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={handleIconUpload}
          />
          <CustomProviderAvatar
            providerId={newProviderName || 'custom-provider'}
            providerName={newProviderName || 'X'}
            iconUrl={newProviderIconUrl.trim() || undefined}
            size={40}
          />
          <TextInput
            flex={1}
            value={isCustomProviderIconStorageUrl(newProviderIconUrl) ? '' : newProviderIconUrl}
            placeholder="https://example.com/icon.png"
            onChange={(e) => setNewProviderIconUrl(e.currentTarget.value)}
          />
          <Button
            variant="light"
            leftSection={<ScalableIcon icon={IconUpload} size={14} />}
            onClick={() => iconInputRef.current?.click()}
          >
            {t('Upload')}
          </Button>
          {newProviderIconUrl && (
            <Button variant="light" color="gray" onClick={() => setNewProviderIconUrl('')}>
              {t('Reset')}
            </Button>
          )}
        </Flex>
        <Text>{t('API Mode')}</Text>
        <AdaptiveSelect
          value={newProviderMode}
          classNames={{ dropdown: 'pointer-events-auto' }}
          onChange={(value) => setNewProviderMode(value as ModelProviderType)}
          data={[
            {
              value: ModelProviderType.OpenAI,
              label: t('OpenAI API Compatible'),
            },
            {
              value: ModelProviderType.OpenAIResponses,
              label: t('OpenAI Responses API Compatible'),
            },
            {
              value: ModelProviderType.Claude,
              label: t('Claude API Compatible'),
            },
            {
              value: ModelProviderType.Gemini,
              label: t('Google Gemini API Compatible'),
            },
          ]}
        />
        <AdaptiveModal.Actions>
          <AdaptiveModal.CloseButton onClick={onClose} />
          <Button onClick={handleAddProvider} disabled={!newProviderName.trim()}>
            {t('Add')}
          </Button>
        </AdaptiveModal.Actions>
      </Stack>
    </AdaptiveModal>
  )
}
