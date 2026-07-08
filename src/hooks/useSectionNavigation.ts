import * as React from 'react'

interface UseSectionNavigationOptions<T extends string> {
  open: boolean
  rootRef: React.RefObject<HTMLElement | null>
  sections: readonly T[]
  initialSection: T
  resolveElementId: (section: T) => string
  threshold?: readonly number[]
  rootMargin?: string
}

const DEFAULT_THRESHOLD = [0.2, 0.5, 0.8] as const
const DEFAULT_ROOT_MARGIN = '-8% 0px -55% 0px'

export function useSectionNavigation<T extends string>({
  open,
  rootRef,
  sections,
  initialSection,
  resolveElementId,
  threshold = DEFAULT_THRESHOLD,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseSectionNavigationOptions<T>) {
  const [activeSection, setActiveSection] = React.useState<T>(initialSection)

  React.useEffect(() => {
    if (!open) return
    setActiveSection(initialSection)
  }, [open, initialSection])

  React.useEffect(() => {
    if (!open) return
    const root = rootRef.current
    if (!root) return

    const elements = sections
      .map((section) => root.querySelector(`#${resolveElementId(section)}`) as HTMLElement | null)
      .filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (!top) return
        const matched = sections.find((section) => resolveElementId(section) === top.target.id)
        if (matched) setActiveSection(matched)
      },
      { root, threshold: Array.from(threshold), rootMargin },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [open, rootRef, sections, resolveElementId, threshold, rootMargin])

  const jumpToSection = React.useCallback(
    (section: T) => {
      setActiveSection(section)
      const target = rootRef.current?.querySelector(`#${resolveElementId(section)}`) as HTMLElement | null
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [rootRef, resolveElementId],
  )

  return {
    activeSection,
    setActiveSection,
    jumpToSection,
  }
}
