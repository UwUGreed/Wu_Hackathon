import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import Mascot from './Mascot'

export default function Hero() {
  return (
		<section className="relative min-h-dvh flex flex-col overflow-hidden noise">
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute -top-[20%] -right-[15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-brand-200/30 blur-[100px]" />
				<div className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-lavender-200/25 blur-[100px]" />
				<div className="absolute top-[30%] left-[50%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-sage-200/20 blur-[80px]" />
			</div>
			<div className="relative z-10 flex flex-1 flex-col items-center justify-center section-pad px-4 sm:px-6 lg:px-8 pt-[5.5rem] pb-16 md:pb-20">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
					className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 lg:gap-14 w-full max-w-5xl mx-auto mt-12"
				>
					<div className="text-center md:text-left shrink-0 max-w-md md:max-w-none">
						<p className="text-xs font-bold tracking-[0.2em] uppercase text-warm-800/45 mb-2">
							Introducing
						</p>
						<p className="font-display font-800 text-[clamp(3.5rem,10vw,6.25rem)] leading-[0.95] tracking-tight text-warm-900">
							Gooblet
						</p>
					</div>
					<motion.div
						initial={{ opacity: 0, scale: 0.88, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{
							duration: 0.7,
							delay: 0.08,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="shrink-0"
					>
						<Mascot mood="happy" size={180} />
					</motion.div>
				</motion.div>
				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.3,
						duration: 0.6,
						ease: [0.22, 1, 0.36, 1],
					}}
					className="font-display font-800 text-[2rem] text-center leading-[1.12] tracking-tight text-warm-900 max-w-2xl mb-5"
				>
					Stop wondering if you{' '}
					<span className="bg-gradient-to-r from-brand-500 via-brand-400 to-lavender-500 bg-clip-text text-[2.5rem] text-transparent">
						can afford
					</span>{' '}
					that
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.45, duration: 0.5 }}
					className="text-warm-800/60 text-lg md:text-xl leading-relaxed text-center max-w-xl mb-10 font-body"
				>
					Gooblet predicts your danger days before they happen — so
					you never accidentally run out before rent, bills, or your
					next paycheck.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.5 }}
					className="flex flex-col sm:flex-row gap-3"
				>
					<Link to="/login">
						<motion.div
							whileHover={{ scale: 1.04 }}
							whileTap={{ scale: 0.97 }}
							className="group px-8 py-4 rounded-2xl bg-warm-900 text-white font-display font-700 text-base tracking-tight shadow-lg shadow-warm-900/20 hover:shadow-xl hover:shadow-warm-900/25 transition-shadow"
						>
							Try the Demo
							<span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
								→
							</span>
						</motion.div>
					</Link>
					<motion.a
						href="#how-it-works"
						whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.97 }}
						className="px-8 py-4 rounded-2xl glass text-warm-800 font-display font-600 text-base tracking-tight hover:bg-white/80 transition-colors"
					>
						How it works
					</motion.a>
				</motion.div>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.9, duration: 0.5 }}
					className="mt-10 text-warm-800/35 text-sm font-medium"
				>
					Built for students who avoid budgeting apps
				</motion.p>
			</div>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.2 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
			>
				<motion.div
					animate={{ y: [0, 6, 0] }}
					transition={{
						duration: 1.8,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				>
					<ChevronDown size={22} className="text-warm-800/25" />
				</motion.div>
			</motion.div>
		</section>
  );
}
