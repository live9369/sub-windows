import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export const DialogContent: React.FC<{
  className?: string
  children: React.ReactNode
  onClose?: () => void
}> = ({ className, children, onClose }) => (
  <div
    className={cn(
      'relative rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl',
      'p-5 m-4',
      className,
    )}
  >
    {onClose && (
      <button
        onClick={onClose}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    )}
    {children}
  </div>
)

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => <div className={cn('mb-4', className)} {...rest} />

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...rest
}) => (
  <h2
    className={cn(
      'text-base font-semibold tracking-tight text-zinc-100',
      className,
    )}
    {...rest}
  />
)

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...rest
}) => (
  <p className={cn('mt-1 text-xs text-zinc-400', className)} {...rest} />
)

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => (
  <div
    className={cn(
      'mt-5 flex justify-end gap-2 border-t border-zinc-800 pt-4',
      className,
    )}
    {...rest}
  />
)
