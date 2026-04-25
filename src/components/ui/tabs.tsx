import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsCtx {
  value: string
  setValue: (v: string) => void
}

const Ctx = React.createContext<TabsCtx | null>(null)

function useTabs() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>')
  return ctx
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (v: string) => void
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  className,
  children,
  ...rest
}) => (
  <Ctx.Provider value={{ value, setValue: onValueChange }}>
    <div className={cn('flex flex-col w-full h-full', className)} {...rest}>
      {children}
    </div>
  </Ctx.Provider>
)

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => (
  <div
    role="tablist"
    className={cn(
      'flex items-center gap-1 px-1 py-1 rounded-md bg-zinc-900/70 border border-zinc-800',
      className,
    )}
    {...rest}
  />
)

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
  ...rest
}) => {
  const ctx = useTabs()
  const active = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'relative inline-flex items-center gap-1.5 px-3 h-7 text-xs rounded-[5px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/60',
        active
          ? 'bg-zinc-800 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(0,255,157,0.25)]'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
  ...rest
}) => {
  const ctx = useTabs()
  if (ctx.value !== value) return null
  return (
    <div role="tabpanel" className={cn('flex-1 min-h-0', className)} {...rest}>
      {children}
    </div>
  )
}
