import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Popcorn } from 'lucide-react'

interface Particle {
  id: string
  angle: number
  distance: number
  delay: number
}

interface EarningBurstProps {
  amount: number
  x?: number
  y?: number
  onComplete?: () => void
}

function computeParticles(amount: number): Particle[] {
  const count = Math.min(Math.ceil(amount / 5), 12)
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i}-${Math.random().toString(36).substring(2)}`,
    angle: (360 / count) * i + Math.random() * 30 - 15,
    distance: 40 + Math.random() * 60,
    delay: Math.random() * 0.15,
  }))
}

export function EarningBurst({ amount, x = 50, y = 50, onComplete }: EarningBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [showLabel, setShowLabel] = useState(false)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true
    setParticles(computeParticles(amount))
    setShowLabel(true)

    const timer = setTimeout(() => {
      setParticles([])
      setShowLabel(false)
      onComplete?.()
    }, 1200)

    return () => clearTimeout(timer)
  }, [amount, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50" data-testid="earning-burst">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x,
              y,
              opacity: 1,
              scale: 0.5,
            }}
            animate={{
              x: x + Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: y + Math.sin((p.angle * Math.PI) / 180) * p.distance,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute"
          >
            <Popcorn className="w-4 h-4 text-brand-primary drop-shadow-[0_0_6px_rgba(255,107,53,0.6)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-primary/90 text-white text-sm font-bold shadow-[0_4px_20px_rgba(255,107,53,0.5)] backdrop-blur-sm"
            style={{ left: x, top: y - 40 }}
          >
            <Popcorn className="w-3.5 h-3.5" />
            +{amount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
