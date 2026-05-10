/// <reference types="vite/client" />

import { Image, useComputedColorScheme } from '@mantine/core'
import KimiColor from '@lobehub/icons/es/Kimi/components/Color'
import MinimaxColor from '@lobehub/icons/es/Minimax/components/Color'
import MoonshotMono from '@lobehub/icons/es/Moonshot/components/Mono'
import QwenColor from '@lobehub/icons/es/Qwen/components/Color'
import type { ModelProvider } from '@shared/types'
import type { ComponentType } from 'react'
import { useProviders } from '@/hooks/useProviders'
import CustomProviderIcon from '../CustomProviderIcon'

type LobehubIcon = ComponentType<{ size?: number | string; style?: React.CSSProperties; className?: string }>

const providerSvgFallback: Record<string, { icon: LobehubIcon; darkModeColor?: string }> = {
  qwen: { icon: QwenColor },
  'qwen-portal': { icon: QwenColor },
  moonshot: { icon: MoonshotMono, darkModeColor: '#fff' },
  'moonshot-cn': { icon: KimiColor },
  minimax: { icon: MinimaxColor },
  'minimax-cn': { icon: MinimaxColor },
}

// Use Vite's import.meta.glob to dynamically import all PNG files
// Vite handles import.meta.glob at build time, even though TypeScript doesn't recognize it with commonjs module setting
// @ts-ignore - import.meta.glob is a Vite feature
const iconsModules = import.meta.glob<{ default: string }>('../../static/icons/providers/*.png', { eager: true })

const icons: { name: string; src: string }[] = Object.entries(iconsModules).map(([path, module]) => {
  const filename = path.split('/').pop() || ''
  const name = filename.replace('.png', '') // 获取图片名称（不含扩展名）
  return {
    name,
    src: (module as { default: string }).default, // 获取图片路径
  }
})

export default function ProviderImageIcon(props: {
  className?: string
  size?: number
  provider: ModelProvider | string
  providerName?: string
}) {
  const { className, size = 24, provider, providerName } = props

  const {providers} = useProviders()
  const providerInfo = providers.find((p) => p.id === provider)
  const colorScheme = useComputedColorScheme('light')

  if(providerInfo?.isCustom){
    return providerInfo.iconUrl ? (
      <Image w={size} h={size} src={providerInfo.iconUrl} alt={providerInfo.name} />
    ) : (
      <CustomProviderIcon providerId={providerInfo.id} providerName={providerInfo.name} size={size} />
    )
  }

  const iconSrc = icons.find((icon) => icon.name === provider)?.src

  if (iconSrc) {
    return (
      <Image w={size} h={size} src={iconSrc} className={className} alt={`${providerName || provider} image icon`} />
    )
  }

  const svgFallback = providerSvgFallback[provider]
  if (svgFallback) {
    const { icon: Svg, darkModeColor } = svgFallback
    const style = darkModeColor && colorScheme === 'dark' ? { color: darkModeColor } : undefined
    return <Svg size={size} className={className} style={style} />
  }

  return providerName ? (
    <CustomProviderIcon providerId={provider} providerName={providerName} size={size} />
  ) : null
}
