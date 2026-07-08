import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
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
import { useSectionNavigation } from '@/hooks/useSectionNavigation'

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
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const sectionIds = React.useMemo(() => sections.map((section) => section.id), [sections])
  const initialSection = sectionIds[0] || ''
  const { activeSection: activeSectionId, jumpToSection } = useSectionNavigation<string>({
    open,
    rootRef: contentRef,
    sections: sectionIds,
    initialSection,
    resolveElementId: (section) => section,
  })

  const markdownComponents: Components = {
    h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-100 mt-4 mb-2">{children}</h3>,
    p: ({ children }) => <p className="text-xs text-zinc-400 leading-relaxed mb-2">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1 mb-2">{children}</ul>,
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 rounded-r mb-3">
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre className="text-[11px] font-mono rounded-md bg-black/40 border border-zinc-800 px-2 py-1.5 overflow-x-auto text-zinc-200 mb-2">
        {children}
      </pre>
    ),
    code: ({ children, className }) => (
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
