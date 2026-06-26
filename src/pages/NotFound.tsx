import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Home, SearchX } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation('errors')

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-testid="not-found-page"
    >
      <div className="h-20 w-20 rounded-2xl bg-bg-tertiary border border-border-subtle flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-text-tertiary" />
      </div>
      <h1 className="text-5xl font-bold font-display text-text-primary tracking-tight">404</h1>
      <p className="mt-3 text-text-secondary text-lg">{t('not_found')}</p>
      <Button asChild className="mt-8" iconLeft={<Home className="w-4 h-4" />}>
        <Link to="/">{t('home', { ns: 'navigation' })}</Link>
      </Button>
    </motion.div>
  )
}
