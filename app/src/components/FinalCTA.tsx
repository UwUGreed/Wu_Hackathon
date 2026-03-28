import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import Mascot from './Mascot'

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] rounded-full bg-brand-100/20 blur-[120px]" />
      </div>
      <div className="section-pad relative z-10" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6"><Mascot mood="happy" size={100} /></div>
          <h2 className="font-display font-800 text-3xl md:text-5xl tracking-tight text-warm-900 mb-4 leading-tight">Money stress shouldn't be part of the college experience</h2>
          <p className="text-warm-800/50 text-lg md:text-xl leading-relaxed max-w-lg mx-auto mb-10">Make It to Payday is the financial companion you actually want to open. No lectures, no spreadsheets — just peace of mind.</p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.5 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-warm-900 text-white font-display font-700 text-base tracking-tight shadow-lg shadow-warm-900/20">
                Try the Demo Again<span className="group-hover:translate-x-1 transition-transform">→</span>
              </motion.div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="mt-16 pt-8 border-t border-warm-200/50">
            <p className="text-warm-800/30 text-sm font-medium">Interactive prototype · No real data · Built with care for a hackathon demo</p>
            <p className="text-warm-800/20 text-xs mt-2">Make It to Payday © 2026</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
