import { useRef, useState, useCallback, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
// import { createRadialAlphaTexture } from './radialAlphaTexture'
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
    // No alpha map: cheeks are fully opaque
  const groupRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const leftEyeRef = useRef<THREE.Group>(null!)
  const rightEyeRef = useRef<THREE.Group>(null!)
  const mouthRef = useRef<THREE.Mesh>(null!)
  const leftLegRef = useRef<THREE.Mesh>(null!)
  const rightLegRef = useRef<THREE.Mesh>(null!)
  const sproutRef = useRef<THREE.Group>(null!)
  const leftCheekRef = useRef<THREE.Mesh>(null!)
  const rightCheekRef = useRef<THREE.Mesh>(null!)
  const buttHighlightLRef = useRef<THREE.Mesh>(null!)
  const buttHighlightRRef = useRef<THREE.Mesh>(null!)
  const buttCreaseRef = useRef<THREE.Mesh>(null!)

  const anim = useRef({
    bodyY: 0, bodyScaleX: 1, bodyScaleY: 1, bodyScaleZ: 1,
    bodyRotX: 0, bodyRotY: 0, bodyRotZ: 0,
    eyeScaleY: 1, mouthScaleX: 1, mouthScaleY: 1, mouthY: -0.25,
    legRotL: 0, legRotR: 0, sproutRot: 0,
    buttBounce: 0, buttSpread: 0,
  })

  // Spring-based jiggle physics for the cheeks
  const jiggle = useRef({
    velL: 0, posL: 0,   // left cheek vertical offset + velocity
    velR: 0, posR: 0,   // right cheek
    scaleL: 1, scaleVelL: 0,
    scaleR: 1, scaleVelR: 0,
    prevBodyY: 0,
    // Drag tracking
    prevCamAzimuth: 0,
    prevCamPolar: 0,
    dragVelH: 0,         // horizontal drag velocity
    dragVelV: 0,         // vertical drag velocity
    // Horizontal sway (alternating L/R)
    swayL: 0, swayVelL: 0,
    swayR: 0, swayVelR: 0,
    // Rotation wiggle
    rotL: 0, rotVelL: 0,
    rotR: 0, rotVelR: 0,
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
        a.buttBounce = Math.sin(t * 1.2) * 0.04
        a.buttSpread = Math.sin(t * 0.9) * 0.01
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
        a.buttBounce = Math.abs(Math.sin(t * 4.5)) * 0.12
        a.buttSpread = Math.sin(t * 4.5) * 0.04
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
        a.buttBounce = Math.sin(t * 1.5) * 0.03
        a.buttSpread = 0.01
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
        a.buttBounce = Math.sin(t * 0.5) * 0.01
        a.buttSpread = 0
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
        a.buttBounce = Math.abs(Math.sin(t * 5)) * 0.15
        a.buttSpread = Math.sin(t * 5) * 0.05
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
        a.buttBounce = Math.sin(t * 1.2) * 0.01
        a.buttSpread = 0
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
        a.buttBounce = Math.abs(Math.sin(t * 3)) * 0.08
        a.buttSpread = Math.sin(t * 3) * 0.03
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
        a.buttBounce = Math.sin(t * 0.7) * 0.012
        a.buttSpread = 0
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

    // Jiggle physics — spring simulation driven by body movement + DRAG
    const j = jiggle.current
    const bodyYNow = groupRef.current ? groupRef.current.position.y : 0
    const bodyAccel = (bodyYNow - j.prevBodyY) / Math.max(delta, 0.001)
    j.prevBodyY = bodyYNow

    // Track camera rotation to detect drag
    const cam = state.camera
    const azimuth = Math.atan2(cam.position.x, cam.position.z)
    const polar = Math.atan2(cam.position.y, Math.sqrt(cam.position.x ** 2 + cam.position.z ** 2))
    const rawDragH = (azimuth - j.prevCamAzimuth) / Math.max(delta, 0.001)
    const rawDragV = (polar - j.prevCamPolar) / Math.max(delta, 0.001)
    // Smooth drag velocity to avoid single-frame spikes
    j.dragVelH = j.dragVelH * 0.7 + rawDragH * 0.3
    j.dragVelV = j.dragVelV * 0.7 + rawDragV * 0.3
    j.prevCamAzimuth = azimuth
    j.prevCamPolar = polar

    const dragIntensity = Math.min(Math.abs(j.dragVelH) + Math.abs(j.dragVelV), 12)

    const stiffness = 22
    const damping = 0.68
    const jiggleAmount = 0.5

    // Vertical jiggle — driven by body bounce + drag
    const dragForceV = (j.dragVelV * 0.8 + j.dragVelH * 0.3) * jiggleAmount
    const forceL = (-j.posL * stiffness - bodyAccel * jiggleAmount - dragForceV) * delta
    j.velL = (j.velL + forceL) * damping
    j.posL += j.velL * delta

    const forceR = (-j.posR * stiffness - bodyAccel * jiggleAmount + dragForceV * 0.6) * delta
    j.velR = (j.velR + forceR + Math.sin(t * 3.5) * 0.005) * damping
    j.posR += j.velR * delta

    // Horizontal sway — alternating L/R cheek, driven by drag
    const swayForce = j.dragVelH * 1.2
    const swayStiffness = 20
    const swayDamping = 0.65
    j.swayVelL = (j.swayVelL + (-j.swayL * swayStiffness + swayForce) * delta) * swayDamping
    j.swayL += j.swayVelL * delta
    j.swayVelR = (j.swayVelR + (-j.swayR * swayStiffness - swayForce * 0.8) * delta) * swayDamping  // opposite direction
    j.swayR += j.swayVelR * delta

    // Rotation wiggle on each cheek
    const rotForce = j.dragVelH * 0.6
    j.rotVelL = (j.rotVelL + (-j.rotL * 15 + rotForce) * delta) * 0.7
    j.rotL += j.rotVelL * delta
    j.rotVelR = (j.rotVelR + (-j.rotR * 15 - rotForce * 0.7) * delta) * 0.7
    j.rotR += j.rotVelR * delta

    // Scale jiggle — squash & stretch, amplified by drag
    const dragScaleBoost = dragIntensity * 0.04
    const sForceL = (1 - j.scaleL) * stiffness * delta - (bodyAccel * 0.2 + dragForceV * 0.1) * delta
    j.scaleVelL = (j.scaleVelL + sForceL) * damping
    j.scaleL += j.scaleVelL + Math.sin(t * 6 + dragIntensity) * dragScaleBoost * delta

    const sForceR = (1 - j.scaleR) * stiffness * delta - (bodyAccel * 0.2 - dragForceV * 0.08) * delta
    j.scaleVelR = (j.scaleVelR + sForceR) * damping
    j.scaleR += j.scaleVelR + Math.sin(t * 6.5 + dragIntensity) * dragScaleBoost * delta

    const clamp = THREE.MathUtils.clamp

    // View-angle-based visibility: 0 from front, 1 from back
    // azimuth=0 means camera is at front (+Z). azimuth=±PI means camera is at back (-Z).
    const absAzimuth = Math.abs(azimuth)
    // backness: 0 when viewing front, 1 when viewing back
    const backness = clamp((absAzimuth - 0.6) / 1.2, 0, 1)
    // Smooth power curve so they pop more dramatically
    const visibility = backness * backness

    // Apply jiggle + animation targets, scaled by visibility
    // Raise cheeks so they never go below shadow
    const baseY = -0.13
    const baseXL = -0.38
    const baseXR = 0.38
    const cheekScale = visibility  // 0 to 1
    if (leftCheekRef.current) {
      const jiggleY = clamp(j.posL * 0.35, -0.2, 0.2) * visibility
      const jiggleSway = clamp(j.swayL * 0.12, -0.18, 0.18) * visibility
      leftCheekRef.current.position.y = lerp(leftCheekRef.current.position.y, baseY + a.buttBounce * visibility + jiggleY, speed)
      leftCheekRef.current.position.x = lerp(leftCheekRef.current.position.x, baseXL - a.buttSpread * visibility + jiggleSway, speed)
      const sy = clamp(j.scaleL, 0.7, 1.35) * cheekScale
      const sx = clamp(2 - j.scaleL, 0.75, 1.3) * cheekScale
      leftCheekRef.current.scale.set(
        lerp(leftCheekRef.current.scale.x, sx, speed),
        lerp(leftCheekRef.current.scale.y, sy, speed),
        lerp(leftCheekRef.current.scale.z, sx, speed)
      )
      leftCheekRef.current.rotation.z = lerp(leftCheekRef.current.rotation.z, clamp(j.rotL * 0.2, -0.4, 0.4) * visibility, speed)
    }
    if (rightCheekRef.current) {
      const jiggleY = clamp(j.posR * 0.35, -0.2, 0.2) * visibility
      const jiggleSway = clamp(j.swayR * 0.12, -0.18, 0.18) * visibility
      rightCheekRef.current.position.y = lerp(rightCheekRef.current.position.y, baseY + a.buttBounce * visibility + jiggleY, speed)
      rightCheekRef.current.position.x = lerp(rightCheekRef.current.position.x, baseXR + a.buttSpread * visibility + jiggleSway, speed)
      const sy = clamp(j.scaleR, 0.7, 1.35) * cheekScale
      const sx = clamp(2 - j.scaleR, 0.75, 1.3) * cheekScale
      rightCheekRef.current.scale.set(
        lerp(rightCheekRef.current.scale.x, sx, speed),
        lerp(rightCheekRef.current.scale.y, sy, speed),
        lerp(rightCheekRef.current.scale.z, sx, speed)
      )
      rightCheekRef.current.rotation.z = lerp(rightCheekRef.current.rotation.z, clamp(j.rotR * 0.2, -0.4, 0.4) * visibility, speed)
    }
    // Scale highlight + crease with visibility too
    if (buttHighlightLRef.current) buttHighlightLRef.current.scale.setScalar(lerp(buttHighlightLRef.current.scale.x, visibility, speed))
    if (buttHighlightRRef.current) buttHighlightRRef.current.scale.setScalar(lerp(buttHighlightRRef.current.scale.x, visibility, speed))
    if (buttCreaseRef.current) buttCreaseRef.current.scale.setScalar(lerp(buttCreaseRef.current.scale.x, visibility, speed))
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
      {/* BBL cheeks — MASSIVE, scale controlled by view angle in useFrame */}
      <mesh ref={leftCheekRef} position={[-0.38, -0.25, -0.38]} scale={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.25} />
      </mesh>
      <mesh ref={rightCheekRef} position={[0.38, -0.25, -0.38]} scale={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.25} />
      </mesh>
      {/* Highlight on each cheek for roundness */}
      <mesh ref={buttHighlightLRef} position={[-0.45, -0.18, -0.75]} scale={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={BODY_COLOR_LIGHT} transparent opacity={0.22} roughness={0.5} />
      </mesh>
      <mesh ref={buttHighlightRRef} position={[0.45, -0.18, -0.75]} scale={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={BODY_COLOR_LIGHT} transparent opacity={0.22} roughness={0.5} />
      </mesh>
      {/* Butt crease — curved seam */}
      <mesh ref={buttCreaseRef} position={[0, -0.25, -0.72]} scale={[0, 0, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.02, 0.45, 4, 8]} />
        <meshStandardMaterial color="#D96828" roughness={0.5} />
      </mesh>

      {/* Arms */}
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
      <ContactShadows position={[0, -0.73, 0]} opacity={0.45} scale={4} blur={2.8} far={2} />
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

  // Expand internal render space (not widget size)
  const canvasStyle = useMemo(() => ({ width: size, height: size * 1.55 }), [size])

  return (
    <div className={`inline-block relative ${className}`} style={canvasStyle}>
      <Canvas shadows camera={{ position: [0, 0.1, 4.5], fov: 42 }} style={{ background: 'transparent' }} gl={{ alpha: true, antialias: true }}>
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
