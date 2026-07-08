import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import guideMarkdown from '@/content/data-integration-guide.md?raw'
import { BookOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export interface DataIntegrationGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type GuideSection = {
  id: string
  title: string
  body: string
}

function toId(title: string, index: number) {
  return `guide-${index}-${title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')}`
}

function parseGuide(markdown: string): { intro: string; sections: GuideSection[] } {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const sections: GuideSection[] = []
  const introLines: string[] = []

  let current: { title: string; lines: string[] } | null = null

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (current) {
        sections.push({
          id: toId(current.title, sections.length + 1),
          title: current.title,
          body: current.lines.join('\n').trim(),
        })
      }
      current = { title: line.replace(/^###\s+/, '').trim(), lines: [] }
      continue
    }
    if (current) current.lines.push(line)
    else introLines.push(line)
  }

  if (current) {
    sections.push({
      id: toId(current.title, sections.length + 1),
      title: current.title,
      body: current.lines.join('\n').trim(),
    })
  }

  return { intro: introLines.join('\n').trim(), sections }
}

export const DataIntegrationGuideModal: React.FC<DataIntegrationGuideModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { intro, sections } = React.useMemo(() => parseGuide(guideMarkdown), [])
  const [activeSectionId, setActiveSectionId] = React.useState<string>(sections[0]?.id || '')
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    setActiveSectionId(sections[0]?.id || '')
  }, [open, sections])

  React.useEffect(() => {
    if (!open) return
    const root = contentRef.current
    if (!root) return
    const elements = sections
      .map((s) => root.querySelector(`#${s.id}`) as HTMLElement | null)
      .filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (top) setActiveSectionId(top.target.id)
      },
      { root, threshold: [0.2, 0.5, 0.8], rootMargin: '-8% 0px -55% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [open, sections])

  const jumpToSection = (id: string) => {
    setActiveSectionId(id)
    const target = contentRef.current?.querySelector(`#${id}`) as HTMLElement | null
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const markdownComponents = {
    h3: ({ children }: any) => <h3 className="text-sm font-semibold text-zinc-100 mt-4 mb-2">{children}</h3>,
    p: ({ children }: any) => <p className="text-xs text-zinc-400 leading-relaxed mb-2">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1 mb-2">{children}</ul>,
    li: ({ children }: any) => <li>{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 rounded-r mb-3">
        {children}
      </blockquote>
    ),
    pre: ({ children }: any) => (
      <pre className="text-[11px] font-mono rounded-md bg-black/40 border border-zinc-800 px-2 py-1.5 overflow-x-auto text-zinc-200 mb-2">
        {children}
      </pre>
    ),
    code: ({ children, className }: any) => (
      <code
        className={
          className
            ? className
            : 'px-1 py-0.5 rounded bg-zinc-800/80 text-zinc-200 text-[11px] font-mono'
        }
      >
        {children}
      </code>
    ),
    hr: () => <hr className="border-zinc-800 my-3" />,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(1200px,96vw)] h-[min(860px,calc(100vh-2rem))] flex flex-col"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>数据接入向导</DialogTitle>
            <Badge variant="cyan">Route A</Badge>
          </div>
          <DialogDescription>
            前端可同时运行在 Web 与桌面版；微信数据只允许本地后端接入，不走远程托管。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
          <aside className="col-span-4 md:col-span-3 h-full overflow-hidden pr-1">
            <div className="space-y-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpToSection(section.id)}
                  className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors ${
                    activeSectionId === section.id
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : 'hover:bg-zinc-800/70 border border-transparent'
                  }`}
                >
                  <div className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    {section.title}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div ref={contentRef} className="col-span-8 md:col-span-9 h-full space-y-4 overflow-y-auto pr-1">
            {intro && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <ReactMarkdown components={markdownComponents}>{intro}</ReactMarkdown>
              </div>
            )}
            {sections.map((section) => (
              <section id={section.id} key={section.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <h3 className="text-xs font-semibold text-zinc-100 mb-2">{section.title}</h3>
                <ReactMarkdown components={markdownComponents}>{section.body}</ReactMarkdown>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
