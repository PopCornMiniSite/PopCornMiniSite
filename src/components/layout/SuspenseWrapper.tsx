import { motion } from 'motion/react'

export function SuspenseWrapper() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary" data-testid="suspense-fallback">
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export default SuspenseWrapper
