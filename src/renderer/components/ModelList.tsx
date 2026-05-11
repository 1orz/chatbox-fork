import { Badge, Button, Flex, Loader, Stack, Text, TextInput, Tooltip } from '@mantine/core'
import type { ProviderModelInfo } from '@shared/types'
import { formatNumber } from '@shared/utils'
import {
  IconBolt,
  IconBulb,
  IconCircleMinus,
  IconCirclePlus,
  IconDatabase,
  IconEye,
  IconLogout,
  IconPlayerPlay,
  IconSearch,
  IconSettings,
  IconTool,
} from '@tabler/icons-react'
import { capitalize } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScalableIcon } from './common/ScalableIcon'

export type ModelProbeState = {
  status: 'pending' | 'success' | 'error'
  error?: string
}

interface ModelListProps {
  models: ProviderModelInfo[]
  showActions?: boolean
  onEditModel?: (model: ProviderModelInfo) => void
  onDeleteModel?: (modelId: string) => void
  onAddModel?: (model: ProviderModelInfo) => void
  onRemoveModel?: (modelId: string) => void
  displayedModelIds?: string[]
  showSearch?: boolean
  className?: string
  onTestModel?: (modelId: string) => void
  testStates?: Record<string, ModelProbeState>
  onBulkTest?: () => void
  bulkTesting?: boolean
}

export function ModelList({
  models,
  showActions = true,
  onEditModel,
  onDeleteModel,
  onAddModel,
  onRemoveModel,
  displayedModelIds,
  showSearch = true,
  className,
  onTestModel,
  testStates,
  onBulkTest,
  bulkTesting,
}: ModelListProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models

    const query = searchQuery.toLowerCase()
    return models.filter((model) => {
      const displayName = (model.nickname || model.modelId).toLowerCase()
      return displayName.includes(query)
    })
  }, [models, searchQuery])

  const formatTokenCount = (count?: number) => {
    if (!count) return null
    return formatNumber(count)
  }

  return (
    <Stack gap="sm" className={className}>
      {(showSearch && models.length > 0) || onBulkTest ? (
        <Flex gap="xs" align="center" className="px-xxs pt-xxs">
          {showSearch && models.length > 0 && (
            <TextInput
              placeholder={t('Search models...') as string}
              leftSection={<ScalableIcon icon={IconSearch} size={16} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              flex="1 1 auto"
            />
          )}
          {onBulkTest && (
            <Button
              variant="light"
              color="chatbox-gray"
              c="chatbox-secondary"
              size="compact-xs"
              px="sm"
              loading={bulkTesting}
              disabled={bulkTesting || models.length === 0}
              onClick={onBulkTest}
              leftSection={<ScalableIcon icon={IconBolt} size={12} />}
            >
              {t('Test All Models')}
            </Button>
          )}
        </Flex>
      ) : null}

      <Stack
        gap={0}
        px="xxs"
        className={`border-solid border rounded-sm min-h-[100px] max-h-[80vh] overflow-y-auto border-chatbox-border-primary`}
      >
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <Flex
              key={model.modelId}
              gap="xs"
              align="center"
              py="sm"
              px="xs"
              className="border-solid border-0 border-b last:border-b-0 border-chatbox-border-primary"
            >
              <Stack gap={4} flex="1 1 0" miw={0}>
                <Flex gap="xs" align="center" miw={0}>
                  <Text
                    component="span"
                    size="sm"
                    flex="1 1 auto"
                    style={{
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={model.nickname || model.modelId}
                    c={model.labels?.includes('recommended') ? 'chatbox-brand' : undefined}
                  >
                    {model.nickname || model.modelId}
                  </Text>
                  {model.labels?.includes('pro') && (
                    <Badge color="chatbox-brand" size="xs" variant="light">
                      Pro
                    </Badge>
                  )}
                  {model.labels?.includes('new') && (
                    <Badge color="teal" size="xs" variant="light">
                      New
                    </Badge>
                  )}
                </Flex>

                {(model.type !== 'chat' || model.capabilities?.length || model.contextWindow || model.maxOutput) && (
                  <Flex gap="xs" align="center" wrap="wrap">
                    {model.type && model.type !== 'chat' && <Badge color="blue">{t(capitalize(model.type))}</Badge>}

                    {model.capabilities?.includes('reasoning') && (
                      <Tooltip label={t('Reasoning')} events={{ hover: true, focus: true, touch: true }}>
                        <Text span c="chatbox-warning" className="flex items-center" style={{ opacity: 0.7 }}>
                          <ScalableIcon icon={IconBulb} size={14} />
                        </Text>
                      </Tooltip>
                    )}
                    {model.capabilities?.includes('vision') && (
                      <Tooltip label={t('Vision')} events={{ hover: true, focus: true, touch: true }}>
                        <Text span c="chatbox-brand" className="flex items-center" style={{ opacity: 0.7 }}>
                          <ScalableIcon icon={IconEye} size={14} />
                        </Text>
                      </Tooltip>
                    )}
                    {model.capabilities?.includes('tool_use') && (
                      <Tooltip label={t('Tool Use')} events={{ hover: true, focus: true, touch: true }}>
                        <Text span c="chatbox-success" className="flex items-center" style={{ opacity: 0.7 }}>
                          <ScalableIcon icon={IconTool} size={14} />
                        </Text>
                      </Tooltip>
                    )}

                    {model.contextWindow && (
                      <Tooltip
                        label={`${t('Context Window')}: ${formatTokenCount(model.contextWindow)} ${t('tokens')}`}
                        events={{ hover: true, focus: true, touch: true }}
                      >
                        <Flex gap={2} align="center" c="dimmed" style={{ flexShrink: 0, opacity: 0.8 }}>
                          <ScalableIcon icon={IconDatabase} size={12} />
                          <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
                            {formatTokenCount(model.contextWindow)}
                          </Text>
                        </Flex>
                      </Tooltip>
                    )}
                    {model.maxOutput && (
                      <Tooltip
                        label={`${t('Max Output')}: ${formatTokenCount(model.maxOutput)} ${t('tokens')}`}
                        events={{ hover: true, focus: true, touch: true }}
                      >
                        <Flex gap={2} align="center" c="dimmed" style={{ flexShrink: 0, opacity: 0.8 }}>
                          <ScalableIcon icon={IconLogout} size={12} />
                          <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
                            {formatTokenCount(model.maxOutput)}
                          </Text>
                        </Flex>
                      </Tooltip>
                    )}
                  </Flex>
                )}
              </Stack>

              {showActions && (
                <Flex flex="0 0 auto" gap="xs" align="center" className="ml-auto">
                  {testStates?.[model.modelId] &&
                    (() => {
                      const probe = testStates[model.modelId]
                      if (probe.status === 'pending') {
                        return <Loader size="xs" />
                      }
                      if (probe.status === 'success') {
                        return (
                          <Badge color="green" size="xs" variant="light">
                            OK
                          </Badge>
                        )
                      }
                      const errText = probe.error || (t('Error') as string) || 'Error'
                      const truncated = errText.length > 60 ? `${errText.slice(0, 60)}…` : errText
                      return (
                        <Tooltip
                          label={truncated}
                          multiline
                          maw={320}
                          events={{ hover: true, focus: true, touch: true }}
                        >
                          <Badge color="red" size="xs" variant="light" style={{ cursor: 'help' }}>
                            {t('Error')}
                          </Badge>
                        </Tooltip>
                      )
                    })()}

                  {onTestModel && (
                    <Button
                      variant="transparent"
                      c="chatbox-tertiary"
                      p={0}
                      h="auto"
                      size="xs"
                      bd={0}
                      disabled={testStates?.[model.modelId]?.status === 'pending'}
                      onClick={() => onTestModel(model.modelId)}
                    >
                      <ScalableIcon icon={IconPlayerPlay} size={20} />
                    </Button>
                  )}

                  {onEditModel && (
                    <Button
                      variant="transparent"
                      c="chatbox-tertiary"
                      p={0}
                      h="auto"
                      size="xs"
                      bd={0}
                      onClick={() => onEditModel(model)}
                    >
                      <ScalableIcon icon={IconSettings} size={20} />
                    </Button>
                  )}

                  {onDeleteModel && (
                    <Button
                      variant="transparent"
                      c="chatbox-error"
                      p={0}
                      h="auto"
                      size="compact-xs"
                      bd={0}
                      onClick={() => onDeleteModel(model.modelId)}
                    >
                      <ScalableIcon icon={IconCircleMinus} size={20} />
                    </Button>
                  )}

                  {onAddModel &&
                    onRemoveModel &&
                    displayedModelIds &&
                    (displayedModelIds.includes(model.modelId) ? (
                      <Button
                        variant="transparent"
                        p={0}
                        h="auto"
                        size="xs"
                        bd={0}
                        onClick={() => onRemoveModel(model.modelId)}
                      >
                        <ScalableIcon icon={IconCircleMinus} size={20} className="text-chatbox-tint-error" />
                      </Button>
                    ) : (
                      <Button variant="transparent" p={0} h="auto" size="xs" bd={0} onClick={() => onAddModel(model)}>
                        <ScalableIcon icon={IconCirclePlus} size={20} className="text-chatbox-tint-success" />
                      </Button>
                    ))}
                </Flex>
              )}
            </Flex>
          ))
        ) : (
          <Flex align="center" justify="center" py="lg" px="xs">
            <Text component="span" size="sm" c="chatbox-tertiary">
              {searchQuery.trim() ? t('No models found matching your search') : t('No models available')}
            </Text>
          </Flex>
        )}
      </Stack>
    </Stack>
  )
}
