import { motion } from 'framer-motion'
import type { MascotMood } from '../data'

const bodyColors: Record<MascotMood, string> = {
  happy: '#68D391',
  calm: '#63B3ED',
  worried: '#F6AD55',
  alert: '#FC8181',
  sleepy: '#B794F6',
}

const cheekColors: Record<MascotMood, string> = {
  happy: '#F687B3',
  calm: '#D6BCFA',
  worried: '#FBD38D',
  alert: '#FEB2B2',
  sleepy: '#E9D8FD',
}

interface MascotProps {
  mood: MascotMood
  size?: number
  className?: string
}

export default function Mascot({ mood, size = 140, className = '' }: MascotProps) {
  const bodyColor = bodyColors[mood]
  const cheekColor = cheekColors[mood]

  // Eye shapes per mood
  const renderEyes = () => {
    switch (mood) {
      case 'happy':
        return (
          <>
            {/* Happy eyes - curved arcs (closed-happy) */}
            <motion.path
              d="M38 72 Q44 65 50 72"
              fill="none"
              stroke="#2D3748"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M70 72 Q76 65 82 72"
              fill="none"
              stroke="#2D3748"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          </>
        )
      case 'sleepy':
        return (
          <>
            {/* Sleepy eyes - droopy lines */}
            <motion.path
              d="M37 72 Q44 74 51 72"
              fill="none"
              stroke="#2D3748"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <motion.path
              d="M69 72 Q76 74 83 72"
              fill="none"
              stroke="#2D3748"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Zzz */}
            <motion.text
              x="90"
              y="50"
              fontSize="10"
              fill="#9F7AEA"
              fontFamily="Outfit"
              fontWeight="700"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: [5, -5, -15] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
            >
              z
            </motion.text>
            <motion.text
              x="98"
              y="42"
              fontSize="8"
              fill="#B794F6"
              fontFamily="Outfit"
              fontWeight="700"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: [5, -5, -15] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            >
              z
            </motion.text>
          </>
        )
      case 'alert':
        return (
          <>
            {/* Alert eyes - big and wide */}
            <circle cx="44" cy="70" r="8" fill="white" />
            <circle cx="76" cy="70" r="8" fill="white" />
            <motion.circle
              cx="44"
              cy="70"
              r="5"
              fill="#2D3748"
              animate={{ cy: [70, 68, 70] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <motion.circle
              cx="76"
              cy="70"
              r="5"
              fill="#2D3748"
              animate={{ cy: [70, 68, 70] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            {/* Highlight dots */}
            <circle cx="41" cy="67" r="1.5" fill="white" />
            <circle cx="73" cy="67" r="1.5" fill="white" />
          </>
        )
      case 'worried':
        return (
          <>
            {/* Worried eyes - wide with raised brows */}
            <circle cx="44" cy="71" r="7" fill="white" />
            <circle cx="76" cy="71" r="7" fill="white" />
            <circle cx="44" cy="72" r="4" fill="#2D3748" />
            <circle cx="76" cy="72" r="4" fill="#2D3748" />
            <circle cx="42" cy="69" r="1.2" fill="white" />
            <circle cx="74" cy="69" r="1.2" fill="white" />
            {/* Worried brows */}
            <motion.path
              d="M36 62 Q44 58 52 62"
              fill="none"
              stroke="#2D3748"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.path
              d="M68 62 Q76 58 84 62"
              fill="none"
              stroke="#2D3748"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )
      default: // calm
        return (
          <>
            {/* Calm eyes - normal soft */}
            <circle cx="44" cy="71" r="7" fill="white" />
            <circle cx="76" cy="71" r="7" fill="white" />
            <motion.circle
              cx="44"
              cy="72"
              r="4"
              fill="#2D3748"
              animate={{ cy: [72, 71, 72] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="76"
              cy="72"
              r="4"
              fill="#2D3748"
              animate={{ cy: [72, 71, 72] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="42" cy="69" r="1.2" fill="white" />
            <circle cx="74" cy="69" r="1.2" fill="white" />
          </>
        )
    }
  }

  // Mouth shapes per mood
  const renderMouth = () => {
    switch (mood) {
      case 'happy':
        return (
          <motion.path
            d="M49 87 Q60 97 71 87"
            fill="none"
            stroke="#2D3748"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ d: 'M49 87 Q60 89 71 87' }}
            animate={{ d: 'M49 87 Q60 97 71 87' }}
            transition={{ duration: 0.4 }}
          />
        )
      case 'calm':
        return (
          <motion.path
            d="M51 88 Q60 93 69 88"
            fill="none"
            stroke="#2D3748"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      case 'worried':
        return (
          <motion.path
            d="M50 91 Q55 88 60 91 Q65 94 70 91"
            fill="none"
            stroke="#2D3748"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              d: [
                'M50 91 Q55 88 60 91 Q65 94 70 91',
                'M50 91 Q55 89 60 91 Q65 93 70 91',
                'M50 91 Q55 88 60 91 Q65 94 70 91',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )
      case 'alert':
        return (
          <motion.ellipse
            cx="60"
            cy="90"
            rx="5"
            ry="6"
            fill="#2D3748"
            initial={{ ry: 3 }}
            animate={{ ry: 6 }}
            transition={{ duration: 0.3 }}
          />
        )
      case 'sleepy':
        return (
          <motion.path
            d="M53 88 Q60 91 67 88"
            fill="none"
            stroke="#2D3748"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
    }
  }

  const floatAnim = mood === 'sleepy'
    ? { y: [0, -3, 0] }
    : mood === 'alert'
      ? { y: [0, -2, 0, -1, 0], x: [0, -2, 2, -1, 0] }
      : { y: [0, -6, 0] }

  const floatDuration = mood === 'sleepy' ? 5 : mood === 'alert' ? 0.6 : 3

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size * (140 / 120) }}
    >
      <motion.svg
        viewBox="0 0 120 140"
        width={size}
        height={size * (140 / 120)}
        animate={floatAnim}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Sprout */}
        <motion.g
          animate={{ rotate: mood === 'happy' ? [0, 5, -5, 0] : [0, 2, -2, 0] }}
          transition={{ duration: mood === 'happy' ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '60px 38px' }}
        >
          <motion.path
            d="M60 40 L60 28"
            stroke={bodyColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <motion.path
            d="M60 30 Q50 20 48 12"
            stroke={bodyColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <motion.ellipse
            cx="46"
            cy="11"
            rx="5"
            ry="3.5"
            fill={bodyColor}
            style={{ transform: 'rotate(-30deg)', transformOrigin: '46px 11px' }}
          />
          <motion.path
            d="M60 32 Q70 22 74 16"
            stroke={bodyColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <motion.ellipse
            cx="76"
            cy="14"
            rx="4.5"
            ry="3"
            fill={bodyColor}
            style={{ transform: 'rotate(25deg)', transformOrigin: '76px 14px' }}
          />
        </motion.g>

        {/* Body shadow */}
        <ellipse cx="60" cy="130" rx="30" ry="5" fill="black" opacity="0.06" />

        {/* Body */}
        <motion.ellipse
          cx="60"
          cy="82"
          rx="40"
          ry="48"
          animate={{ fill: bodyColor }}
          transition={{ duration: 0.5 }}
        />

        {/* Body highlight */}
        <ellipse cx="52" cy="65" rx="18" ry="22" fill="white" opacity="0.15" />

        {/* Cheeks */}
        <motion.circle cx="30" cy="84" r="7" animate={{ fill: cheekColor }} transition={{ duration: 0.5 }} opacity="0.4" />
        <motion.circle cx="90" cy="84" r="7" animate={{ fill: cheekColor }} transition={{ duration: 0.5 }} opacity="0.4" />

        {/* Eyes */}
        {renderEyes()}

        {/* Mouth */}
        {renderMouth()}
      </motion.svg>
    </motion.div>
  )
}
