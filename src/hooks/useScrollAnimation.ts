import { useRef, useEffect, useState } from 'react'

interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  onEnter?: () => void
  onExit?: () => void
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true, onEnter, onExit } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry?.isIntersecting ?? false
        setIsInView(inView)
        if (inView && onEnter) onEnter()
        if (!inView && onExit) onExit()
        if (inView && triggerOnce) observer.unobserve(element)
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce, onEnter, onExit])

  return { ref, isInView }
}

export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleScroll = () => {
      const scrolled = window.scrollY
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + scrolled
      const offset = (scrolled - elementTop) * speed
      element.style.transform = `translate3d(0, ${offset}px, 0)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return ref
}

export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave }
}
