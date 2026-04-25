import * as React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'neon' | 'orange' | 'cyan' | 'red' | 'amber' | 'muted'

const VARIANT: Record<Variant, string> = {
  default: 'bg-zinc-800 text-zinc-200 border border-zinc-700',
  neon:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
  orange:  'bg-orange-500/15 text-orange-300 border border-orange-500/40',
  cyan:    'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40',
  red:     'bg-red-500/15 text-red-300 border border-red-500/40',
  amber:   'bg-amber-500/15 text-amber-300 border border-amber-500/40',
  muted:   'bg-zinc-900 text-zinc-400 border border-zinc-800',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  ...rest
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md px-1.5 h-5 text-[10px] font-medium tracking-wide uppercase',
      VARIANT[variant],
      className,
    )}
    {...rest}
  />
)
