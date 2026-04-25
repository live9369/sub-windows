import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultLeftRatio?: number
  minLeftRatio?: number
  maxLeftRatio?: number
  className?: string
}

/**
 * 简单两栏分割面板，中间分隔条可水平拖动。
 */
export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  defaultLeftRatio = 0.65,
  minLeftRatio = 0.35,
  maxLeftRatio = 0.85,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [ratio, setRatio] = React.useState(defaultLeftRatio)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const r = (e.clientX - rect.left) / rect.width
      setRatio(Math.min(maxLeftRatio, Math.max(minLeftRatio, r)))
    }
    const onUp = () => setDragging(false)

    document.body.style.cursor = 'col-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, maxLeftRatio, minLeftRatio])

  return (
    <div
      ref={containerRef}
      className={cn('flex w-full h-full min-h-0', className)}
    >
      <div
        className="min-w-0 h-full"
        style={{ width: `${ratio * 100}%` }}
      >
        {left}
      </div>
      <div
        onMouseDown={() => setDragging(true)}
        onDoubleClick={() => setRatio(defaultLeftRatio)}
        className={cn(
          'group relative w-1 shrink-0 cursor-col-resize bg-zinc-800/80',
          'hover:bg-emerald-500/40 transition-colors',
          dragging && 'bg-emerald-500/60',
        )}
        title="拖动调整分屏 / 双击复位"
      >
        <div
          className={cn(
            'absolute inset-y-0 -left-1 -right-1',
            'pointer-events-none',
          )}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-10 rounded-full bg-zinc-600 group-hover:bg-emerald-300 transition-colors" />
      </div>
      <div
        className="min-w-0 h-full flex-1"
      >
        {right}
      </div>
    </div>
  )
}
