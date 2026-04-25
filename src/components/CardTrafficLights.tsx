import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardTrafficLightsProps {
  /** 红色 — 关闭/移除卡片 */
  onClose?: () => void
  /** 黄色 — 折叠/展开 */
  onMinimize?: () => void
  /** 绿色 — 进入/退出 Focus（最大化） */
  onMaximize?: () => void
  /** 当前是否处于 Focus 模式（影响绿色按钮图标语义） */
  isMaximized?: boolean
  /** 当前是否折叠（影响黄色按钮图标语义） */
  isCollapsed?: boolean
  closeTitle?: string
  minimizeTitle?: string
  maximizeTitle?: string
  className?: string
}

/**
 * Mac 风格卡片红绿灯 — 用于每张 GroupCard 头部。
 * 整组 hover 才会同时显示三按钮内嵌图标，平时是干净的彩色圆点。
 */
export const CardTrafficLights: React.FC<CardTrafficLightsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
  isCollapsed,
  closeTitle = '关闭',
  minimizeTitle = '折叠',
  maximizeTitle = '最大化',
  className,
}) => {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      className={cn('flex items-center gap-1.5 select-none', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Light
        kind="close"
        showIcon={hovered}
        onClick={onClose}
        title={closeTitle}
        disabled={!onClose}
      />
      <Light
        kind="minimize"
        showIcon={hovered}
        onClick={onMinimize}
        title={isCollapsed ? '展开' : minimizeTitle}
        collapsed={isCollapsed}
        disabled={!onMinimize}
      />
      <Light
        kind="maximize"
        showIcon={hovered}
        onClick={onMaximize}
        title={isMaximized ? '退出 Focus' : maximizeTitle}
        max={isMaximized}
        disabled={!onMaximize}
      />
    </div>
  )
}

interface LightProps {
  kind: 'close' | 'minimize' | 'maximize'
  showIcon: boolean
  onClick?: () => void
  title: string
  max?: boolean
  collapsed?: boolean
  disabled?: boolean
}

const COLORS: Record<LightProps['kind'], { bg: string; ring: string; icon: string }> = {
  close: {
    bg:   'bg-[#ff5f57]',
    ring: 'ring-[#e0443e]/70',
    icon: 'text-[#4d0000]',
  },
  minimize: {
    bg:   'bg-[#febc2e]',
    ring: 'ring-[#dea123]/70',
    icon: 'text-[#5b4400]',
  },
  maximize: {
    bg:   'bg-[#28c840]',
    ring: 'ring-[#1aab2c]/70',
    icon: 'text-[#003d10]',
  },
}

const Light: React.FC<LightProps> = ({
  kind,
  showIcon,
  onClick,
  title,
  max,
  collapsed,
  disabled,
}) => {
  const c = COLORS[kind]
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn(
        'relative w-2.5 h-2.5 rounded-full ring-1 ring-inset',
        'transition-[box-shadow,filter] duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60',
        c.bg,
        c.ring,
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'transition-opacity duration-75',
          showIcon && !disabled ? 'opacity-100' : 'opacity-0',
        )}
      >
        <LightIcon kind={kind} max={max} collapsed={collapsed} className={c.icon} />
      </span>
    </button>
  )
}

const LightIcon: React.FC<{
  kind: LightProps['kind']
  max?: boolean
  collapsed?: boolean
  className?: string
}> = ({ kind, max, collapsed, className }) => {
  if (kind === 'close') {
    return (
      <svg viewBox="0 0 8 8" width="6" height="6" className={className}>
        <path
          d="M1.6 1.6 L6.4 6.4 M6.4 1.6 L1.6 6.4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (kind === 'minimize') {
    if (collapsed) {
      return (
        <svg viewBox="0 0 8 8" width="6" height="6" className={className}>
          <path
            d="M4 1.5 L4 6.5 M1.5 4 L6.5 4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )
    }
    return (
      <svg viewBox="0 0 8 8" width="6" height="6" className={className}>
        <path
          d="M1.5 4 L6.5 4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  // maximize / restore
  if (max) {
    return (
      <svg viewBox="0 0 8 8" width="6" height="6" className={className}>
        <path
          d="M2 4.5 L4.5 4.5 L4.5 2 M5.5 3.5 L3.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 8 8" width="6" height="6" className={className}>
      <path
        d="M2 6 L2 2 L6 2 M6 2 L6 6 L2 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
