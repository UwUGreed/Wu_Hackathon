import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Mascot from './Mascot'
import { demoDays } from '../data'

const moodColor = {
  happy: 'text-sage-600',
  calm: 'text-blue-500',
  worried: 'text-amber-500',
  alert: 'text-brand-500',
  sleepy: 'text-lavender-500',
}

const moodBg = {
  happy: 'from-sage-50 to-sage-100/50',
  calm: 'from-blue-50 to-indigo-50/50',
  worried: 'from-amber-50 to-orange-50/50',
  alert: 'from-brand-50 to-red-50/50',
  sleepy: 'from-lavender-50 to-lavender-100/50',
}

const moodBadgeBg = {
  happy: 'bg-sage-100 text-sage-700',
  calm: 'bg-blue-100 text-blue-700',
  worried: 'bg-amber-100 text-amber-700',
  alert: 'bg-red-100 text-red-700',
  sleepy: 'bg-lavender-100 text-lavender-700',
}

export default function InteractiveDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const current = demoDays[currentIndex]
  const canPrev = currentIndex > 0
  const canNext = currentIndex < demoDays.length - 1

  const goNext = () => canNext && setCurrentIndex((i) => i + 1)
  const goPrev = () => canPrev && setCurrentIndex((i) => i - 1)

  // Direction for animation
  const [direction, setDirection] = useState(1)

  const handleNext = () => {
    setDirection(1)
    goNext()
  }
  const handlePrev = () => {
    setDirection(-1)
    goPrev()
  }

  return (
    <section id="demo" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-100/40 via-warm-50 to-warm-100/40 pointer-events-none" />

      <div className="section-pad relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-warm-200 text-warm-800 text-xs font-bold tracking-wider uppercase mb-4">
            Interactive Demo
          </span>
          <h2 className="font-display font-800 text-3xl md:text-4xl tracking-tight text-warm-900 mb-3">
            Two weeks in a student's life
          </h2>
          <p className="text-warm-800/50 text-base md:text-lg max-w-lg mx-auto">
            Swipe through a simulated pay period. Watch how danger days appear — and how we'd help.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="flex gap-1">
            {demoDays.map((day, i) => (
              <button
                key={day.day}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1)
                  setCurrentIndex(i)
                }}
                className="flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  background:
                    i <= currentIndex
                      ? i === currentIndex
                        ? moodColor[current.mood].includes('sage')
                          ? '#52955e'
                          : moodColor[current.mood].includes('blue')
                            ? '#3B82F6'
                            : moodColor[current.mood].includes('amber')
                              ? '#F59E0B'
                              : moodColor[current.mood].includes('brand')
                                ? '#ee6a4d'
                                : '#9466ed'
                        : '#d6d3d1'
                      : '#e7e5e4',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-warm-800/35 font-medium">
            <span>Day {demoDays[0].day}</span>
            <span>Day {demoDays[demoDays.length - 1].day}</span>
          </div>
        </motion.div>

        {/* Demo card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="max-w-xl mx-auto"
        >
          <div
            className={`rounded-[2rem] bg-gradient-to-br ${moodBg[current.mood]} border border-white/70 shadow-glass overflow-hidden transition-all duration-500`}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 md:p-8"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -50 && canNext) handleNext()
                  else if (info.offset.x > 50 && canPrev) handlePrev()
                }}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-warm-800/40 text-xs font-bold tracking-wider uppercase">
                      Day {current.day}
                    </span>
                    <h3 className="font-display font-700 text-xl text-warm-900 tracking-tight">
                      {current.label}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${moodBadgeBg[current.mood]}`}>
                    {current.mood.charAt(0).toUpperCase() + current.mood.slice(1)}
                  </span>
                </div>

                {/* Event & balance */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 rounded-2xl bg-white/60 border border-white/80 p-4">
                    <span className="text-warm-800/40 text-[11px] font-bold tracking-wider uppercase block mb-1">
                      What happened
                    </span>
                    <p className="font-display font-600 text-base text-warm-900">{current.event}</p>
                    <p className={`font-display font-700 text-lg mt-1 ${current.amount >= 0 ? 'text-sage-600' : 'text-brand-600'}`}>
                      {current.amount >= 0 ? '+' : ''}{current.amount < 0 ? '−' : ''}${Math.abs(current.amount)}
                    </p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-white/60 border border-white/80 p-4">
                    <span className="text-warm-800/40 text-[11px] font-bold tracking-wider uppercase block mb-1">
                      Balance
                    </span>
                    <p className={`font-display font-800 text-3xl tracking-tight ${moodColor[current.mood]}`}>
                      ${current.balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mascot & message */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <Mascot mood={current.mood} size={64} />
                  </div>
                  <div className="flex-1 rounded-2xl bg-white/70 border border-white/90 p-4">
                    <p className="text-warm-800/70 text-sm leading-relaxed font-medium">
                      {current.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 md:px-8 pb-6">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/50 text-warm-800/60 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/70 transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <span className="text-warm-800/35 text-xs font-bold">
                {currentIndex + 1} / {demoDays.length}
              </span>

              <button
                onClick={handleNext}
                disabled={!canNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warm-900 text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-warm-800 transition-all active:scale-95"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Swipe hint */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-warm-800/30 text-xs font-medium md:hidden">
            <span>Swipe to navigate</span>
            <ChevronRight size={14} className="animate-swipe-hint" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
