import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled,
  className,
  id,
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/60',
      'disabled:cursor-not-allowed disabled:opacity-50',
      checked
        ? 'bg-emerald-500/80 shadow-[0_0_10px_rgba(0,255,157,0.35)]'
        : 'bg-zinc-700',
      className,
    )}
  >
    <span
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-zinc-100 shadow ring-0 transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0.5',
      )}
    />
  </button>
)
