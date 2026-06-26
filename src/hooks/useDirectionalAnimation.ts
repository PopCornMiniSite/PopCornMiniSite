import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Variants } from 'motion/react'

interface PageTransitionProps {
  initial: { opacity: number; x: number }
  animate: { opacity: number; x: number; transition: { duration: number } }
  exit: { opacity: number; x: number; transition: { duration: number } }
}

export function useDirectionalAnimation() {
  const { i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  const slideInFrom: Variants = useMemo(
    () => ({
      hidden: {
        x: isRTL ? 100 : -100,
        opacity: 0,
      },
      visible: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100, damping: 20 },
      },
      exit: {
        x: isRTL ? -100 : 100,
        opacity: 0,
      },
    }),
    [isRTL]
  )

  const pageTransition: PageTransitionProps = useMemo(
    () => ({
      initial: {
        opacity: 0,
        x: isRTL ? 50 : -50,
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.2 },
      },
      exit: {
        opacity: 0,
        x: isRTL ? -50 : 50,
        transition: { duration: 0.15 },
      },
    }),
    [isRTL]
  )

  return { slideInFrom, pageTransition, isRTL }
}
