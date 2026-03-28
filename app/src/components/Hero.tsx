import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Mascot from './Mascot'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-brand-200/30 blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-lavender-200/25 blur-[100px]" />
        <div className="absolute top-[30%] left-[50%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-sage-200/20 blur-[80px]" />
      </div>

      <div className="relative z-10 section-pad flex flex-col items-center text-center pt-24 pb-20">
        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <Mascot mood="happy" size={120} />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-semibold text-warm-800 mb-6 shadow-soft"
        >
          <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
          Your financial safety net
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-800 text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05] tracking-tight text-warm-900 max-w-3xl mb-5"
        >
          Stop wondering if you{' '}
          <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-lavender-500 bg-clip-text text-transparent">
            can afford
          </span>{' '}
          that
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-warm-800/60 text-lg md:text-xl leading-relaxed max-w-xl mb-10 font-body"
        >
          Make It to Payday predicts your danger days before they happen —
          so you never accidentally run out before rent, bills, or your next paycheck.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <motion.a
            href="#demo"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group px-8 py-4 rounded-2xl bg-warm-900 text-white font-display font-700 text-base tracking-tight shadow-lg shadow-warm-900/20 hover:shadow-xl hover:shadow-warm-900/25 transition-shadow"
          >
            Try the Demo
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </motion.a>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-2xl glass text-warm-800 font-display font-600 text-base tracking-tight hover:bg-white/80 transition-colors"
          >
            How it works
          </motion.a>
        </motion.div>

        {/* Social proof hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-10 text-warm-800/35 text-sm font-medium"
        >
          Built for students who avoid budgeting apps
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={22} className="text-warm-800/25" />
        </motion.div>
      </motion.div>
    </section>
  )
}
