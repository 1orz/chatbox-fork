import NiceModal from '@ebay/nice-modal-react'
import { ActionIcon, Avatar, Box, Button, Flex, Stack, Text } from '@mantine/core'
import type { ImageSource, Session } from '@shared/types'
import { IconMessageCircle2Filled, IconX } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import clsx from 'clsx'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { MessageLayoutSelector } from '@/components/common/MessageLayoutPreview'
import { ScalableIcon } from '@/components/common/ScalableIcon'
import { ImageInStorage } from '@/components/Image'
import InputBox, { type InputBoxPayload } from '@/components/InputBox/InputBox'
import HomepageIcon from '@/components/icons/HomepageIcon'
import Page from '@/components/layout/Page'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import { navigateToSettings } from '@/modals/Settings'
import { createSession as createSessionStore } from '@/stores/chatStore'
import { submitNewUserMessage, switchCurrentSession } from '@/stores/sessionActions'
import { initEmptyChatSession } from '@/stores/sessionHelpers'
import { useSettingsStore } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodValidator(
    z.object({
      copilotId: z.string().optional(),
      copilot: z.string().optional(),
      settings: z.string().optional(),
    })
  ),
})

function Index() {
  const { t } = useTranslation()
  const isSmallScreen = useIsSmallScreen()
  const messageLayout = useSettingsStore((s) => s.messageLayout)
  const [tempMessageLayout, setTempMessageLayout] = useState<'left' | 'bubble' | undefined>(undefined)

  const setSettings = useSettingsStore((s) => s.setSettings)
  const newSessionState = useUIStore((s) => s.newSessionState)
  const setNewSessionState = useUIStore((s) => s.setNewSessionState)
  const addSessionKnowledgeBase = useUIStore((s) => s.addSessionKnowledgeBase)
  const widthFull = useUIStore((s) => s.widthFull)
  const sessionWebBrowsingMap = useUIStore((s) => s.sessionWebBrowsingMap)
  const setSessionWebBrowsing = useUIStore((s) => s.setSessionWebBrowsing)
  const clearSessionWebBrowsing = useUIStore((s) => s.clearSessionWebBrowsing)
  const [session, setSession] = useState<Session>({
    id: 'new',
    ...initEmptyChatSession(),
  })
  const welcomeCardMode = 'none' as const

  const selectedModel = useMemo(() => {
    if (session.settings?.provider && session.settings?.modelId) {
      return {
        provider: session.settings.provider,
        modelId: session.settings.modelId,
      }
    }
  }, [session.settings?.provider, session.settings?.modelId])


  const handleSubmit = useCallback(
    async ({ constructedMessage, needGenerating = true, onUserMessageReady }: InputBoxPayload) => {
      const newSession = await createSessionStore({
        name: session.name,
        type: 'chat',
        assistantAvatarKey: session.assistantAvatarKey,
        picUrl: session.picUrl,
        backgroundImage: session.backgroundImage,
        messages: session.messages,
        copilotId: session.copilotId,
        settings: session.settings,
      })

      // Transfer knowledge base from newSessionState to the actual session
      if (newSessionState.knowledgeBase) {
        addSessionKnowledgeBase(newSession.id, newSessionState.knowledgeBase)
        // Clear newSessionState after transfer
        setNewSessionState({})
      }

      // Transfer web browsing setting from "new" session to the actual session
      const newSessionWebBrowsing = sessionWebBrowsingMap.new
      if (newSessionWebBrowsing !== undefined) {
        setSessionWebBrowsing(newSession.id, newSessionWebBrowsing)
        clearSessionWebBrowsing('new')
      }

      switchCurrentSession(newSession.id)

      void submitNewUserMessage(newSession.id, {
        newUserMsg: constructedMessage,
        needGenerating,
        onUserMessageReady,
      })
    },
    [
      session,
      addSessionKnowledgeBase,
      newSessionState.knowledgeBase,
      setNewSessionState,
      sessionWebBrowsingMap,
      setSessionWebBrowsing,
      clearSessionWebBrowsing,
    ]
  )

  const onSelectModel = useCallback((p: string, m: string) => {
    setSession((old) => ({
      ...old,
      settings: {
        ...(old.settings || {}),
        provider: p,
        modelId: m,
      },
    }))
  }, [])

  const onClickSessionSettings = useCallback(async () => {
    const res: Session = await NiceModal.show('session-settings', {
      session,
      disableAutoSave: true,
    })
    if (res) {
      setSession((old) => ({
        ...old,
        ...res,
      }))
    }
    return true
  }, [session])

  return (
    <Page title="">
      <div className="p-0 flex flex-col h-full">
        {messageLayout || welcomeCardMode !== 'none' ? (
          <Stack align="center" justify="center" gap="sm" flex={1}>
            <HomepageIcon className="h-8" />
            <Text fw="600" size={isSmallScreen ? 'sm' : 'md'}>
              {t('What can I help you with today?')}
            </Text>
          </Stack>
        ) : (
          <Stack align="center" justify="center" gap="sm" flex={1} p="sm">
            <Stack
              align="center"
              justify="center"
              gap="lg"
              w={isSmallScreen ? '100%' : '80%'}
              maw={386}
              p="xl"
              className="border border-solid border-chatbox-border-primary rounded-lg relative"
            >
              <div className="absolute top-0 right-0">
                <ActionIcon
                  variant="transparent"
                  color="chatbox-tertiary"
                  m={10}
                  onClick={() => setSettings({ messageLayout: 'left' })}
                >
                  <ScalableIcon icon={IconX} size={20} className="text-chatbox-tint-tertiary" />
                </ActionIcon>
              </div>
              <Text size="md" fw="600">
                {t('Message Layout')}
              </Text>
              <Stack gap="sm">
                <MessageLayoutSelector
                  w="100%"
                  size="sm"
                  value={tempMessageLayout || 'left'}
                  onValueChange={(val) => setTempMessageLayout(val)}
                />

                <Text size="xs" c="chatbox-secondary">
                  {t('You can change this setting later in Settings → ')}
                  <a className="cursor-pointer !text-chatbox-tint-brand" onClick={() => navigateToSettings('chat')}>
                    {t('Conversation Settings')}
                  </a>
                </Text>
              </Stack>

              <Button
                variant="filled"
                size="md"
                className="w-full"
                onClick={() => setSettings({ messageLayout: tempMessageLayout || 'left' })}
              >
                {t('Save')}
              </Button>
            </Stack>
          </Stack>
        )}

        <Stack gap="sm">
          {session.copilotId ? (
            <Box px="md">
              <Stack gap="sm" className={widthFull ? 'w-full' : 'w-full max-w-4xl mx-auto'}>
                <Flex align="center" gap="sm">
                  <CopilotItem
                    name={session.name}
                    avatar={
                      session.assistantAvatarKey
                        ? { type: 'storage-key', storageKey: session.assistantAvatarKey }
                        : undefined
                    }
                    picUrl={session.picUrl}
                    selected
                    onClick={() => onClickSessionSettings?.()}
                  />
                  <ActionIcon
                    size={32}
                    radius={16}
                    c="chatbox-tertiary"
                    bg="#F1F3F5"
                    onClick={() => setSession((old) => ({ ...old, copilotId: undefined }))}
                  >
                    <ScalableIcon icon={IconX} size={24} />
                  </ActionIcon>
                </Flex>

                <Text c="chatbox-secondary" className="line-clamp-5">
                  {session.messages[0]?.contentParts?.map((part) => (part.type === 'text' ? part.text : '')).join('') ||
                    ''}
                </Text>
              </Stack>
            </Box>
          ) : null}

          <InputBox
            sessionType="chat"
            sessionId="new"
            model={selectedModel}
            // fullWidth
            onSelectModel={onSelectModel}
            onClickSessionSettings={onClickSessionSettings}
            onSubmit={handleSubmit}
          />
        </Stack>
      </div>
    </Page>
  )
}

const CopilotItem = ({
  name,
  avatar,
  picUrl,
  selected,
  onClick,
  noAvatar = false,
}: {
  name: string
  avatar?: ImageSource
  picUrl?: string
  selected?: boolean
  onClick?(): void
  noAvatar?: boolean
}) => {
  const isSmallScreen = useIsSmallScreen()
  return (
    <Flex
      align="center"
      gap={isSmallScreen ? 'xxs' : 'xs'}
      py="xs"
      px={isSmallScreen ? 'xs' : 'md'}
      bd={selected ? 'none' : '1px solid var(--chatbox-border-primary)'}
      bg={selected ? 'var(--chatbox-background-brand-secondary)' : 'transparent'}
      className={clsx(
        'max-w-[75vw] sm:max-w-[50vw] cursor-pointer shrink-0 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]',
        isSmallScreen ? 'rounded-full' : 'rounded-md'
      )}
      onClick={onClick}
    >
      {!noAvatar &&
        (avatar?.type === 'storage-key' || avatar?.type === 'url' || picUrl ? (
          <Avatar
            src={avatar?.type === 'storage-key' ? '' : avatar?.url || picUrl}
            alt={name}
            size={isSmallScreen ? 20 : 24}
            radius="xl"
            className="flex-shrink-0 border border-solid border-chatbox-border-primary"
          >
            {avatar?.type === 'storage-key' ? (
              <ImageInStorage storageKey={avatar.storageKey} className="object-cover object-center w-full h-full" />
            ) : (
              name?.charAt(0)?.toUpperCase()
            )}
          </Avatar>
        ) : (
          <Stack
            w={isSmallScreen ? 20 : 24}
            h={isSmallScreen ? 20 : 24}
            align="center"
            justify="center"
            className="flex-shrink-0 rounded-full bg-chatbox-background-brand-secondary"
          >
            <ScalableIcon icon={IconMessageCircle2Filled} size={24} className="text-chatbox-tint-brand" />
          </Stack>
        ))}
      <Text fw="600" c={selected ? 'chatbox-brand' : 'chatbox-primary'} lineClamp={1}>
        {name}
      </Text>
    </Flex>
  )
}
