import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { howItWorksSteps } from '../data'
import { ChevronRight } from 'lucide-react'

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-warm-100/50 to-transparent pointer-events-none" />
      <div className="section-pad relative z-10" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold tracking-wider uppercase mb-4">How it works</span>
          <h2 className="font-display font-800 text-3xl md:text-4xl tracking-tight text-warm-900 mb-3">Five steps to peace of mind</h2>
          <p className="text-warm-800/50 text-base md:text-lg max-w-md mx-auto">No spreadsheets. No guilt trips. Just clarity.</p>
        </motion.div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 md:grid md:grid-cols-5 md:overflow-visible">
            {howItWorksSteps.map((step, i) => (
              <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-shrink-0 w-[75vw] max-w-[280px] md:w-auto md:max-w-none snap-center">
                <div className={`h-full rounded-3xl bg-gradient-to-br ${step.color} border ${step.border} p-6 flex flex-col transition-shadow hover:shadow-card-hover`}>
                  <span className="text-3xl mb-4">{step.icon}</span>
                  <span className="text-xs font-bold text-warm-800/30 tracking-wider uppercase mb-2">Step {step.number}</span>
                  <h3 className="font-display font-700 text-lg text-warm-900 tracking-tight mb-2">{step.title}</h3>
                  <p className="text-warm-800/55 text-sm leading-relaxed flex-1">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4 md:hidden text-warm-800/30 text-xs font-medium">
            <span>Swipe</span><ChevronRight size={14} className="animate-swipe-hint" />
          </div>
        </div>
      </div>
    </section>
  )
}
