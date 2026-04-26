import * as React from 'react'
import {
  Terminal,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Shield,
  Play,
  Settings,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  desc: string
  icon: React.ReactNode
  commands?: string[]
  action?: string
}

const STEPS: Step[] = [
  {
    id: 1,
    title: '解除签名保护',
    desc: '微信有 Hardened Runtime 保护，需要先移除才能扫描内存。',
    icon: <Shield className="w-4 h-4" />,
    commands: [
      'sudo codesign --force --deep --sign - --options "" /Applications/WeChat.app',
    ],
  },
  {
    id: 2,
    title: '扫描加密密钥',
    desc: '保持微信运行，用扫描器从内存提取各数据库的密钥。',
    icon: <Terminal className="w-4 h-4" />,
    commands: [
      'cd /Users/live/Desktop/learning/sub-windows',
      'sudo ./vendor/wechat-decrypt/find_all_keys_macos',
    ],
  },
  {
    id: 3,
    title: '启动 Python 服务',
    desc: '在另一个终端保持运行，监听 localhost:5678。',
    icon: <Play className="w-4 h-4" />,
    commands: [
      'cd /Users/live/Desktop/learning/sub-windows/vendor/wechat-decrypt',
      'python3 main.py',
    ],
  },
  {
    id: 4,
    title: '连接测试',
    desc: '打开设置 → 启用微信监控 → 点击「测试连接」。',
    icon: <Settings className="w-4 h-4" />,
    action: '打开设置',
  },
  {
    id: 5,
    title: '添加群卡片',
    desc: '切到 WX Tab → 点「加卡片」→ 选择要监控的微信群。',
    icon: <Plus className="w-4 h-4" />,
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 inline-flex items-center text-zinc-500 hover:text-emerald-300 transition-colors"
      title="复制"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  )
}

export interface WechatOnboardingProps {
  wxStatus?: string
  wxError?: string | null
  onOpenSettings?: () => void
  onRetry?: () => void
}

export const WechatOnboarding: React.FC<WechatOnboardingProps> = ({
  wxStatus,
  wxError,
  onOpenSettings,
  onRetry,
}) => {
  const [expanded, setExpanded] = React.useState<number[]>([1])
  const [dismissed, setDismissed] = React.useState(() => {
    try {
      return localStorage.getItem('wechat-onboarding-dismissed') === '1'
    } catch {
      return false
    }
  })

  const isConnected = wxStatus === 'connected'

  const toggleStep = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem('wechat-onboarding-dismissed', '1')
    } catch {
      // ignore
    }
  }

  const handleRestore = () => {
    setDismissed(false)
    try {
      localStorage.removeItem('wechat-onboarding-dismissed')
    } catch {
      // ignore
    }
  }

  // Dismissed mini state panel — never returns null so WX tab never goes blank
  if (dismissed) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-[11px] border',
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : wxError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400',
            )}
          >
            {isConnected ? (
              <Check className="w-3.5 h-3.5" />
            ) : wxError ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            <span>
              {isConnected
                ? '已连接到 localhost:5678'
                : wxError
                  ? `连接异常: ${wxError}`
                  : '等待连接…'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              >
                <Settings className="w-3.5 h-3.5" />
                打开设置
              </button>
            )}
            {!isConnected && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
              >
                重试连接
              </button>
            )}
            <button
              onClick={handleRestore}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] text-zinc-500 hover:text-zinc-300"
            >
              显示引导
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full items-center justify-start pt-6 px-4 overflow-y-auto">
      <div className="w-full max-w-md space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">微信接入引导</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              首次使用需完成以下步骤，之后服务会自动保持连接。
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="收起引导"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connection status */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-[11px] border',
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : wxError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400',
          )}
        >
          {isConnected ? (
            <Check className="w-3.5 h-3.5" />
          ) : wxError ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
          <span>
            {isConnected
              ? '已连接到 localhost:5678'
              : wxError
                ? `连接异常: ${wxError}`
                : '等待连接…'}
          </span>
          {!isConnected && onRetry && (
            <button
              onClick={onRetry}
              className="ml-auto text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
            >
              重试
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-1.5">
          {STEPS.map((step) => {
            const isOpen = expanded.includes(step.id)
            return (
              <div
                key={step.id}
                className={cn(
                  'rounded-md border overflow-hidden transition-colors',
                  isOpen ? 'border-zinc-700 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-900/30',
                )}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0',
                      isConnected && step.id === 5
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400',
                    )}
                  >
                    {step.id}
                  </span>
                  <span className="flex-1 text-[12px] font-medium text-zinc-200">
                    {step.title}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-2">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {step.desc}
                    </p>
                    {step.commands && (
                      <div className="space-y-1">
                        {step.commands.map((cmd, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-300"
                          >
                            <span className="flex-1 truncate">{cmd}</span>
                            <CopyButton text={cmd} />
                          </div>
                        ))}
                      </div>
                    )}
                    {step.action === '打开设置' && onOpenSettings && (
                      <button
                        onClick={onOpenSettings}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        打开设置
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <p className="text-[10px] text-zinc-600 text-center">
          遇到问题？按 Cmd+R 刷新页面，或在外部终端检查 python main.py 是否正常运行。
        </p>
      </div>
    </div>
  )
}
