import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Mascot from './Mascot'
import { companionStates } from '../data'
import type { MascotMood } from '../data'

export default function CompanionShowcase() {
  const [activeMood, setActiveMood] = useState<MascotMood>('calm')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const active = companionStates.find((s) => s.mood === activeMood)!

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="section-pad relative z-10" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-lavender-50 text-lavender-600 text-xs font-bold tracking-wider uppercase mb-4">Meet your companion</span>
          <h2 className="font-display font-800 text-3xl md:text-4xl tracking-tight text-warm-900 mb-3">It feels what your wallet feels</h2>
          <p className="text-warm-800/50 text-base md:text-lg max-w-md mx-auto">A little friend that mirrors your financial state — no numbers needed.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.15 }} className="max-w-lg mx-auto">
          <div className={`rounded-[2rem] bg-gradient-to-br ${active.bgClass} border border-white/60 p-8 md:p-10 shadow-glass transition-all duration-500`}>
            <div className="flex justify-center mb-6"><Mascot mood={activeMood} size={160} /></div>
            <motion.div key={activeMood} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-white/50 text-warm-800 text-xs font-bold tracking-wider uppercase mb-3">{active.label}</span>
              <p className="font-display font-600 text-lg text-warm-900 tracking-tight">{active.tagline}</p>
            </motion.div>
          </div>
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {companionStates.map((state) => (
              <motion.button key={state.mood} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveMood(state.mood)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeMood === state.mood ? 'bg-warm-900 text-white shadow-md' : 'bg-white text-warm-800/60 border border-warm-200 hover:border-warm-300'}`}>
                {state.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
