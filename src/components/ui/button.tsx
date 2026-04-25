import * as React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'ghost' | 'outline' | 'neon' | 'danger'
type Size = 'sm' | 'md' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT: Record<Variant, string> = {
  default:
    'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
  ghost:
    'bg-transparent hover:bg-zinc-800/70 text-zinc-300',
  outline:
    'bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-200',
  neon:
    'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/70 shadow-[0_0_12px_rgba(0,255,157,0.15)]',
  danger:
    'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40',
}

const SIZE: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-md',
  icon: 'h-8 w-8 rounded-md',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/50',
        'disabled:opacity-50 disabled:pointer-events-none select-none',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
