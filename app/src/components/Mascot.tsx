import { useRef, useState, useCallback, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { MascotMood } from '../data'

export type MascotAnimation =
  | 'idle'
  | 'happy'
  | 'curious'
  | 'sleepy'
  | 'celebrate'
  | 'shy'
  | 'greet'
  | 'thinking'

interface MascotProps {
  mood?: MascotMood
  initialAnimation?: MascotAnimation
  size?: number
  autoRotate?: boolean
  showControls?: boolean
  interactive?: boolean
  className?: string
}

const moodToAnimation: Record<MascotMood, MascotAnimation> = {
  happy: 'happy',
  calm: 'idle',
  worried: 'curious',
  alert: 'thinking',
  sleepy: 'sleepy',
}

const BODY_COLOR = '#FF8C42'
const BODY_COLOR_LIGHT = '#FFB07A'
const CHEEK_COLOR = '#FF6B8A'
const EYE_COLOR = '#2D2D3D'
const EYE_WHITE = '#FFFFFF'
const MOUTH_COLOR = '#2D2D3D'
const LEG_COLOR = '#E5723A'

interface ModelProps {
  animation: MascotAnimation
  interactive: boolean
}

function MascotModel({ animation, interactive }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const leftEyeRef = useRef<THREE.Group>(null!)
  const rightEyeRef = useRef<THREE.Group>(null!)
  const mouthRef = useRef<THREE.Mesh>(null!)
  const leftLegRef = useRef<THREE.Mesh>(null!)
  const rightLegRef = useRef<THREE.Mesh>(null!)
  const sproutRef = useRef<THREE.Group>(null!)

  const anim = useRef({
    bodyY: 0, bodyScaleX: 1, bodyScaleY: 1, bodyScaleZ: 1,
    bodyRotX: 0, bodyRotY: 0, bodyRotZ: 0,
    eyeScaleY: 1, mouthScaleX: 1, mouthScaleY: 1, mouthY: -0.25,
    legRotL: 0, legRotR: 0, sproutRot: 0,
  })

  const blinkTimer = useRef(0)
  const isBlinking = useRef(false)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const a = anim.current
    const lerp = THREE.MathUtils.lerp
    const speed = Math.min(delta * 10, 1)

    blinkTimer.current -= delta
    if (blinkTimer.current <= 0 && !isBlinking.current) {
      isBlinking.current = true
      blinkTimer.current = 0.15
    }
    if (isBlinking.current) {
      blinkTimer.current -= delta
      if (blinkTimer.current <= 0) {
        isBlinking.current = false
        blinkTimer.current = 1.5 + Math.random() * 2
      }
    }
    const blinkScale = isBlinking.current ? 0.05 : 1

    switch (animation) {
      case 'idle': {
        a.bodyY = Math.sin(t * 1.2) * 0.12
        a.bodyScaleX = 1 + Math.sin(t * 1.5) * 0.035
        a.bodyScaleY = 1 + Math.cos(t * 1.5) * 0.035
        a.bodyScaleZ = 1 + Math.sin(t * 1.5) * 0.035
        a.bodyRotX = Math.sin(t * 0.8) * 0.03
        a.bodyRotY = Math.sin(t * 0.5) * 0.1
        a.bodyRotZ = Math.sin(t * 0.7) * 0.03
        a.eyeScaleY = blinkScale
        a.mouthScaleX = 0.9; a.mouthScaleY = 0.6; a.mouthY = -0.18
        a.legRotL = Math.sin(t * 1.2) * 0.08
        a.legRotR = Math.sin(t * 1.2 + 0.5) * 0.08
        a.sproutRot = Math.sin(t * 1.8) * 0.25
        break
      }
      case 'happy': {
        const hBounce = Math.abs(Math.sin(t * 4.5))
        a.bodyY = hBounce * 0.3
        a.bodyScaleX = 1 + Math.sin(t * 4.5) * 0.1
        a.bodyScaleY = 1 - Math.sin(t * 4.5) * 0.08
        a.bodyScaleZ = 1 + Math.sin(t * 4.5) * 0.1
        a.bodyRotX = Math.sin(t * 3) * 0.08
        a.bodyRotY = Math.sin(t * 3) * 0.3
        a.bodyRotZ = Math.sin(t * 3.5) * 0.15
        a.eyeScaleY = 0.35
        a.mouthScaleX = 1.6; a.mouthScaleY = 1.4; a.mouthY = -0.15
        a.legRotL = Math.sin(t * 4.5) * 0.3
        a.legRotR = Math.sin(t * 4.5 + 1) * 0.3
        a.sproutRot = Math.sin(t * 6) * 0.5
        break
      }
      case 'curious': {
        a.bodyY = Math.sin(t * 1.5) * 0.08
        a.bodyScaleX = 1.02; a.bodyScaleY = 1.02; a.bodyScaleZ = 1.02
        a.bodyRotX = -0.25 + Math.sin(t * 1.2) * 0.05
        a.bodyRotY = Math.sin(t * 0.8) * 0.15
        a.bodyRotZ = Math.sin(t * 0.6) * 0.2 + 0.18
        a.eyeScaleY = blinkScale * 1.4
        a.mouthScaleX = 0.7; a.mouthScaleY = 0.9; a.mouthY = -0.2
        a.legRotL = 0.1 + Math.sin(t * 1.5) * 0.05
        a.legRotR = -0.1
        a.sproutRot = Math.sin(t * 1.2) * 0.35 + 0.25
        break
      }
      case 'sleepy': {
        a.bodyY = Math.sin(t * 0.5) * 0.04 - 0.06
        a.bodyScaleX = 1.05; a.bodyScaleY = 0.93; a.bodyScaleZ = 1.05
        a.bodyRotX = 0.18 + Math.sin(t * 0.4) * 0.06
        a.bodyRotY = Math.sin(t * 0.25) * 0.06
        a.bodyRotZ = Math.sin(t * 0.3) * 0.08 + 0.05
        a.eyeScaleY = 0.08
        a.mouthScaleX = 0.7; a.mouthScaleY = 0.35; a.mouthY = -0.19
        a.legRotL = 0.06; a.legRotR = 0.06
        a.sproutRot = Math.sin(t * 0.4) * 0.12 + 0.08
        break
      }
      case 'celebrate': {
        const jump = Math.abs(Math.sin(t * 5))
        a.bodyY = jump * 0.45
        a.bodyScaleX = 1 - jump * 0.15
        a.bodyScaleY = 1 + jump * 0.22
        a.bodyScaleZ = 1 - jump * 0.15
        a.bodyRotX = Math.sin(t * 4) * 0.12
        a.bodyRotY = t * 3
        a.bodyRotZ = Math.sin(t * 6) * 0.2
        a.eyeScaleY = 0.3
        a.mouthScaleX = 1.8; a.mouthScaleY = 1.6; a.mouthY = -0.12
        a.legRotL = Math.sin(t * 5) * 0.45
        a.legRotR = Math.sin(t * 5 + Math.PI) * 0.45
        a.sproutRot = Math.sin(t * 8) * 0.6
        break
      }
      case 'shy': {
        a.bodyY = Math.sin(t * 1.2) * 0.03 - 0.04
        a.bodyScaleX = 0.88; a.bodyScaleY = 0.9; a.bodyScaleZ = 0.88
        a.bodyRotX = 0.2; a.bodyRotY = -0.35 + Math.sin(t * 0.6) * 0.08; a.bodyRotZ = -0.1
        a.eyeScaleY = blinkScale * 0.5
        a.mouthScaleX = 0.45; a.mouthScaleY = 0.35; a.mouthY = -0.2
        a.legRotL = -0.1; a.legRotR = -0.08
        a.sproutRot = Math.sin(t * 0.8) * 0.08 - 0.15
        break
      }
      case 'greet': {
        a.bodyY = Math.abs(Math.sin(t * 3)) * 0.18
        a.bodyScaleX = 1 + Math.sin(t * 3) * 0.04
        a.bodyScaleY = 1 - Math.abs(Math.sin(t * 3)) * 0.04
        a.bodyScaleZ = 1 + Math.sin(t * 3) * 0.04
        a.bodyRotX = -0.1; a.bodyRotY = Math.sin(t * 2.5) * 0.35; a.bodyRotZ = Math.sin(t * 3) * 0.18
        a.eyeScaleY = blinkScale
        a.mouthScaleX = 1.3; a.mouthScaleY = 1.1; a.mouthY = -0.15
        a.legRotL = Math.sin(t * 3) * 0.2; a.legRotR = Math.sin(t * 3 + 1.5) * 0.2
        a.sproutRot = Math.sin(t * 4) * 0.45
        break
      }
      case 'thinking': {
        a.bodyY = Math.sin(t * 0.7) * 0.06
        a.bodyScaleX = 1; a.bodyScaleY = 1.02; a.bodyScaleZ = 1
        a.bodyRotX = -0.32; a.bodyRotY = 0.25 + Math.sin(t * 0.4) * 0.08; a.bodyRotZ = 0.08
        a.eyeScaleY = blinkScale * 0.75
        a.mouthScaleX = 0.5; a.mouthScaleY = 0.5; a.mouthY = -0.16
        a.legRotL = Math.sin(t * 0.5) * 0.03; a.legRotR = Math.sin(t * 0.5 + 1) * 0.03
        a.sproutRot = Math.sin(t * 0.6) * 0.15 + 0.15
        break
      }
    }

    if (groupRef.current) {
      groupRef.current.position.y = lerp(groupRef.current.position.y, a.bodyY, speed)
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, a.bodyRotX, speed)
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, a.bodyRotY, speed)
      groupRef.current.rotation.z = lerp(groupRef.current.rotation.z, a.bodyRotZ, speed)
    }
    if (bodyRef.current) {
      bodyRef.current.scale.x = lerp(bodyRef.current.scale.x, a.bodyScaleX, speed)
      bodyRef.current.scale.y = lerp(bodyRef.current.scale.y, a.bodyScaleY, speed)
      bodyRef.current.scale.z = lerp(bodyRef.current.scale.z, a.bodyScaleZ, speed)
    }
    if (leftEyeRef.current) leftEyeRef.current.scale.y = lerp(leftEyeRef.current.scale.y, a.eyeScaleY, speed * 2)
    if (rightEyeRef.current) rightEyeRef.current.scale.y = lerp(rightEyeRef.current.scale.y, a.eyeScaleY, speed * 2)
    if (mouthRef.current) {
      mouthRef.current.scale.x = lerp(mouthRef.current.scale.x, a.mouthScaleX, speed)
      mouthRef.current.scale.y = lerp(mouthRef.current.scale.y, a.mouthScaleY, speed)
      mouthRef.current.position.y = lerp(mouthRef.current.position.y, a.mouthY, speed)
    }
    if (leftLegRef.current) leftLegRef.current.rotation.x = lerp(leftLegRef.current.rotation.x, a.legRotL, speed)
    if (rightLegRef.current) rightLegRef.current.rotation.x = lerp(rightLegRef.current.rotation.x, a.legRotR, speed)
    if (sproutRef.current) sproutRef.current.rotation.z = lerp(sproutRef.current.rotation.z, a.sproutRot, speed)
  })

  const handleClick = useCallback(() => {
    if (!interactive) return
    const a = anim.current
    a.bodyY = 0.35; a.bodyScaleY = 1.3; a.bodyScaleX = 0.8; a.bodyScaleZ = 0.8
  }, [interactive])

  return (
    <group ref={groupRef} onClick={handleClick} dispose={null}>
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.7, 64, 64]} />
        <MeshDistortMaterial color={BODY_COLOR} roughness={0.3} metalness={0.0} distort={0.1} speed={2} />
      </mesh>
      <mesh position={[-0.12, 0.24, 0.5]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={BODY_COLOR_LIGHT} transparent opacity={0.3} roughness={0.5} />
      </mesh>
      <group ref={leftEyeRef} position={[-0.22, 0.1, 0.6]}>
        <mesh><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color={EYE_WHITE} roughness={0.3} /></mesh>
        <mesh position={[0.01, -0.01, 0.06]}><sphereGeometry args={[0.08, 32, 32]} /><meshStandardMaterial color={EYE_COLOR} roughness={0.2} /></mesh>
        <mesh position={[-0.025, 0.035, 0.1]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color={EYE_WHITE} emissive={EYE_WHITE} emissiveIntensity={0.6} /></mesh>
      </group>
      <group ref={rightEyeRef} position={[0.22, 0.1, 0.6]}>
        <mesh><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color={EYE_WHITE} roughness={0.3} /></mesh>
        <mesh position={[-0.01, -0.01, 0.06]}><sphereGeometry args={[0.08, 32, 32]} /><meshStandardMaterial color={EYE_COLOR} roughness={0.2} /></mesh>
        <mesh position={[-0.025, 0.035, 0.1]}><sphereGeometry args={[0.03, 16, 16]} /><meshStandardMaterial color={EYE_WHITE} emissive={EYE_WHITE} emissiveIntensity={0.6} /></mesh>
      </group>
      <mesh position={[-0.42, -0.06, 0.42]}><sphereGeometry args={[0.11, 16, 16]} /><meshStandardMaterial color={CHEEK_COLOR} transparent opacity={0.4} roughness={0.6} /></mesh>
      <mesh position={[0.42, -0.06, 0.42]}><sphereGeometry args={[0.11, 16, 16]} /><meshStandardMaterial color={CHEEK_COLOR} transparent opacity={0.4} roughness={0.6} /></mesh>
      <mesh ref={mouthRef} position={[0, -0.18, 0.65]}><sphereGeometry args={[0.08, 32, 16]} /><meshStandardMaterial color={MOUTH_COLOR} roughness={0.4} /></mesh>
      <mesh position={[0, -0.05, 0.71]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color={LEG_COLOR} roughness={0.5} /></mesh>
      <mesh ref={leftLegRef} position={[-0.24, -0.65, 0.05]} castShadow><capsuleGeometry args={[0.12, 0.15, 8, 16]} /><meshStandardMaterial color={LEG_COLOR} roughness={0.4} /></mesh>
      <mesh ref={rightLegRef} position={[0.24, -0.65, 0.05]} castShadow><capsuleGeometry args={[0.12, 0.15, 8, 16]} /><meshStandardMaterial color={LEG_COLOR} roughness={0.4} /></mesh>
      <group ref={sproutRef} position={[0, 0.7, 0]}>
        <mesh position={[0, 0.1, 0]}><capsuleGeometry args={[0.03, 0.18, 4, 8]} /><meshStandardMaterial color="#5BA65B" roughness={0.4} /></mesh>
        <mesh position={[-0.08, 0.24, 0]} rotation={[0, 0, 0.5]}><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#6BC26B" roughness={0.4} /></mesh>
        <mesh position={[0.08, 0.24, 0]} rotation={[0, 0, -0.5]}><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#6BC26B" roughness={0.4} /></mesh>
      </group>
      <mesh position={[-0.6, 0.25, 0]} rotation={[0, 0, 0.3]}><sphereGeometry args={[0.13, 16, 16]} /><meshStandardMaterial color={BODY_COLOR} roughness={0.35} /></mesh>
      <mesh position={[0.6, 0.25, 0]} rotation={[0, 0, -0.3]}><sphereGeometry args={[0.13, 16, 16]} /><meshStandardMaterial color={BODY_COLOR} roughness={0.35} /></mesh>
    </group>
  )
}

interface SceneProps {
  animation: MascotAnimation
  autoRotate: boolean
  interactive: boolean
  controlsRef: React.MutableRefObject<{ reset: () => void } | null>
}

function Scene({ animation, autoRotate, interactive, controlsRef }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />
      <pointLight position={[0, 2, 3]} intensity={0.4} color="#ffd4a3" />
      <Environment preset="apartment" />
      <MascotModel animation={animation} interactive={interactive} />
      <ContactShadows position={[0, -0.85, 0]} opacity={0.45} scale={4} blur={2.8} far={2} />
      <OrbitControls
        ref={controlsRef as React.Ref<never>}
        enablePan={false} enableZoom={false}
        autoRotate={autoRotate} autoRotateSpeed={1.5}
        minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.9}
        dampingFactor={0.06} enableDamping
        target={[0, -0.05, 0]}
      />
    </>
  )
}

const animationList: { key: MascotAnimation; label: string; emoji: string }[] = [
  { key: 'idle', label: 'Idle', emoji: '😌' },
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'curious', label: 'Curious', emoji: '🤔' },
  { key: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { key: 'celebrate', label: 'Celebrate', emoji: '🎉' },
  { key: 'shy', label: 'Shy', emoji: '🫣' },
  { key: 'greet', label: 'Greet', emoji: '👋' },
  { key: 'thinking', label: 'Thinking', emoji: '💭' },
]

export default function Mascot({
  mood, initialAnimation, size = 300,
  autoRotate: autoRotateProp = false, showControls = false,
  interactive = true, className = '',
}: MascotProps) {
  const resolvedInitial = initialAnimation ?? (mood ? moodToAnimation[mood] : 'idle')
  const [currentAnimation, setCurrentAnimation] = useState<MascotAnimation>(resolvedInitial)
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotateProp)
  const controlsRef = useRef<{ reset: () => void } | null>(null)

  useEffect(() => {
    if (mood && !initialAnimation) setCurrentAnimation(moodToAnimation[mood])
  }, [mood, initialAnimation])

  const resetCamera = useCallback(() => { controlsRef.current?.reset() }, [])
  const randomAnimation = useCallback(() => {
    const options = animationList.filter((a) => a.key !== currentAnimation)
    const pick = options[Math.floor(Math.random() * options.length)]
    setCurrentAnimation(pick.key)
  }, [currentAnimation])
  const petMascot = useCallback(() => { setCurrentAnimation('happy') }, [])

  const canvasStyle = useMemo(() => ({ width: size, height: size * 1.35 }), [size])

  return (
    <div className={`inline-block relative ${className}`} style={canvasStyle}>
      <Canvas shadows camera={{ position: [0, 0.1, 3.8], fov: 42 }} style={{ background: 'transparent' }} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}>
          <Scene animation={currentAnimation} autoRotate={isAutoRotating} interactive={interactive} controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 translate-y-full pt-4 flex flex-col gap-3 items-center">
          <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
            {animationList.map((a) => (
              <button key={a.key} onClick={() => setCurrentAnimation(a.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentAnimation === a.key ? 'bg-warm-900 text-white shadow-sm' : 'bg-warm-100 text-warm-700 hover:bg-warm-200'}`}>
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsAutoRotating((r) => !r)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isAutoRotating ? 'bg-sage-600 text-white' : 'bg-warm-100 text-warm-700 hover:bg-warm-200'}`}>
              {isAutoRotating ? '⏸ Stop Spin' : '🔄 Auto Spin'}
            </button>
            <button onClick={resetCamera} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-warm-100 text-warm-700 hover:bg-warm-200 transition-all">🎯 Reset</button>
            <button onClick={randomAnimation} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-warm-100 text-warm-700 hover:bg-warm-200 transition-all">🎲 Random</button>
            <button onClick={petMascot} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-100 text-brand-700 hover:bg-brand-200 transition-all">🧡 Pet</button>
          </div>
        </div>
      )}
    </div>
  )
}
