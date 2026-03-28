import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-warm-50/80 backdrop-blur-xl border-b border-warm-200/40 shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="section-pad flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow">
            <Shield size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {scrolled && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display font-700 text-sm text-warm-900 tracking-tight whitespace-nowrap overflow-hidden"
              >
                Make It to Payday
              </motion.span>
            )}
          </AnimatePresence>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Demo', href: '#demo' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-warm-800/50 hover:text-warm-800 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#demo"
          className="px-5 py-2 rounded-xl bg-warm-900 text-white text-sm font-display font-600 tracking-tight hover:bg-warm-800 transition-colors shadow-sm"
        >
          Try Demo
        </a>
      </div>
    </motion.header>
  )
}
