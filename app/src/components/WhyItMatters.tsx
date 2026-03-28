import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const reasons = [
  { emoji: '😰', title: 'Budgeting feels like homework', description: 'Students already have enough obligations. Traditional finance apps ask you to categorize, plan, and review — it feels like another class.' },
  { emoji: '📊', title: 'Dashboards cause more anxiety', description: "Seeing red numbers, pie charts, and overspending alerts makes people shut the app and pretend the problem doesn't exist." },
  { emoji: '🤖', title: 'Finance apps talk like banks', description: '"Your discretionary spending exceeded your allocated budget." Cool. What does that even mean when I just want coffee?' },
]

const differences = [{
  left: 'Traditional finance apps', right: 'Gooblet',
  pairs: [
    ['Track every dollar', 'One number: safe to spend'],
    ['"You overspent on food"', '"Maybe skip Uber — rent hits Thursday"'],
    ['Charts, graphs, categories', 'A friendly companion that mirrors your mood'],
    ['Weekly budget reviews', 'Real-time danger day predictions'],
    ['Guilt and shame', 'Calm confidence'],
  ],
}]

export default function WhyItMatters() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="section-pad relative z-10" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-sage-50 text-sage-600 text-xs font-bold tracking-wider uppercase mb-4">Why this exists</span>
          <h2 className="font-display font-800 text-3xl md:text-4xl tracking-tight text-warm-900 mb-3">Students don't need another budget app</h2>
          <p className="text-warm-800/50 text-base md:text-lg max-w-lg mx-auto">They need something that actually works with how they think and feel about money.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {reasons.map((reason, i) => (
            <motion.div key={reason.title} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl bg-white border border-warm-200/60 p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <span className="text-3xl mb-4 block">{reason.emoji}</span>
              <h3 className="font-display font-700 text-base text-warm-900 tracking-tight mb-2">{reason.title}</h3>
              <p className="text-warm-800/50 text-sm leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 }} className="max-w-2xl mx-auto">
          <div className="rounded-3xl border border-warm-200/60 bg-white shadow-card overflow-hidden">
            <div className="grid grid-cols-2 border-b border-warm-100">
              <div className="px-6 py-4 text-center"><span className="text-warm-800/40 text-xs font-bold tracking-wider uppercase">{differences[0].left}</span></div>
              <div className="px-6 py-4 text-center bg-sage-50/50"><span className="text-sage-700 text-xs font-bold tracking-wider uppercase">{differences[0].right}</span></div>
            </div>
            {differences[0].pairs.map(([left, right], i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.4 + i * 0.08 }} className="grid grid-cols-2 border-b border-warm-50 last:border-0">
                <div className="px-6 py-3.5 text-sm text-warm-800/40 line-through decoration-warm-300/40">{left}</div>
                <div className="px-6 py-3.5 text-sm text-warm-900 font-medium bg-sage-50/30">{right}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
