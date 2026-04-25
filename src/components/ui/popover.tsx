import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor: React.RefObject<HTMLElement | null>
  align?: 'start' | 'center' | 'end'
  side?: 'bottom' | 'top'
  sideOffset?: number
  className?: string
  children: React.ReactNode
}

export const Popover: React.FC<PopoverProps> = ({
  open,
  onOpenChange,
  anchor,
  align = 'end',
  side = 'bottom',
  sideOffset = 6,
  className,
  children,
}) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null)

  React.useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const a = anchor.current
      const c = contentRef.current
      if (!a) return
      const r = a.getBoundingClientRect()
      const cw = c?.offsetWidth ?? 260
      const ch = c?.offsetHeight ?? 0

      let left: number
      if (align === 'start') left = r.left
      else if (align === 'center') left = r.left + r.width / 2 - cw / 2
      else left = r.right - cw

      const top = side === 'bottom' ? r.bottom + sideOffset : r.top - ch - sideOffset

      const margin = 8
      const maxLeft = window.innerWidth - cw - margin
      const maxTop = window.innerHeight - ch - margin
      setPos({
        top: Math.max(margin, Math.min(top, maxTop)),
        left: Math.max(margin, Math.min(left, maxLeft)),
      })
    }
    update()
    const raf = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchor, align, side, sideOffset])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (contentRef.current?.contains(t)) return
      if (anchor.current?.contains(t)) return
      onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  }, [open, onOpenChange, anchor])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: 'fixed',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        opacity: pos ? 1 : 0,
        transition: 'opacity 80ms linear',
      }}
      className={cn(
        'z-50 rounded-lg border border-zinc-800 bg-zinc-950/95 backdrop-blur-sm shadow-2xl shadow-black/60',
        className,
      )}
      role="dialog"
    >
      {children}
    </div>,
    document.body,
  )
}
