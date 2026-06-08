import { Flex, Stack, Text, Tooltip } from '@mantine/core'
import type { OpenAIParams } from '@shared/types'
import { IconInfoCircle } from '@tabler/icons-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScalableIcon } from '@/components/common/ScalableIcon'
import SegmentedControl from '@/components/common/SegmentedControl'

export type OpenAIReasoningEffort = NonNullable<OpenAIParams['reasoningEffort']>

interface OpenAIReasoningEffortControlProps {
  value?: OpenAIReasoningEffort
  onChange: (value?: OpenAIReasoningEffort) => void
  labelWeight?: string | number
}

export default function OpenAIReasoningEffortControl({
  value,
  onChange,
  labelWeight = 600,
}: OpenAIReasoningEffortControlProps) {
  const { t } = useTranslation()

  const reasoningEffortOptions = useMemo(
    () => [
      { label: t('Disabled'), value: 'null' },
      { label: t('Low'), value: 'low' },
      { label: t('Medium'), value: 'medium' },
      { label: t('High'), value: 'high' },
    ],
    [t]
  )

  const handleReasoningEffortChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue === 'null' ? undefined : (nextValue as OpenAIReasoningEffort))
    },
    [onChange]
  )

  return (
    <Stack gap="md">
      <Flex align="center" gap="xs">
        <Text size="sm" fw={labelWeight}>
          {t('Thinking Depth')}
        </Text>
        <Tooltip
          label={t('Thinking Depth only works for OpenAI reasoning models')}
          withArrow={true}
          maw={320}
          className="!whitespace-normal"
          zIndex={3000}
          events={{ hover: true, focus: true, touch: true }}
        >
          <ScalableIcon icon={IconInfoCircle} size={20} className="text-chatbox-tint-tertiary" />
        </Tooltip>
      </Flex>

      <SegmentedControl
        key="reasoning-effort-control"
        value={value ?? 'null'}
        onChange={handleReasoningEffortChange}
        data={reasoningEffortOptions}
      />
    </Stack>
  )
}
