/* eslint-disable react-refresh/only-export-components */
import { motion, AnimatePresence, type Variants } from 'motion/react'

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const cardHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  tap: { scale: 0.98 },
}

export const fadeInOut: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideFrom = (direction: 'left' | 'right' | 'up' | 'down'): Variants => {
  const offsets = {
    left: { x: -30 },
    right: { x: 30 },
    up: { y: -30 },
    down: { y: 30 },
  }
  return {
    initial: { ...offsets[direction], opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { ...offsets[direction], opacity: 0 },
  }
}

export const MotionDiv = motion.div
export const MotionButton = motion.button
export const MotionSpan = motion.span
export const MotionImg = motion.img
export const MotionSection = motion.section
export const MotionArticle = motion.article

export { AnimatePresence }
