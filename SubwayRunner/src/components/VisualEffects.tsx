import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

export default function VisualEffects() {
  const { speed, isPlaying } = useGameStore()
  const particlesRef = useRef<THREE.Points>(null)
  const [particles, setParticles] = useState<THREE.BufferGeometry | null>(null)
  const [velocities, setVelocities] = useState<Float32Array | null>(null)
  
  // Initialize particle system for speed lines
  useEffect(() => {
    const particleCount = 100
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocitiesArray = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 20     // x
      positions[i3 + 1] = (Math.random() - 0.5) * 10 // y
      positions[i3 + 2] = Math.random() * -50         // z
      
      velocitiesArray[i3] = 0     // x velocity
      velocitiesArray[i3 + 1] = 0 // y velocity  
      velocitiesArray[i3 + 2] = 1 + Math.random() * 2 // z velocity
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    setParticles(geometry)
    setVelocities(velocitiesArray)
  }, [])
  
  useFrame((_, delta) => {
    if (!isPlaying || !particlesRef.current || !particles || !velocities) return
    
    const positions = particles.attributes.position.array as Float32Array
    const speedMultiplier = 1 + speed * 20 // Speed lines get faster with game speed
    
    for (let i = 0; i < positions.length; i += 3) {
      // Move particles forward
      positions[i + 2] += velocities[i + 2] * speedMultiplier * delta * 60
      
      // Reset particles that have passed the player
      if (positions[i + 2] > 10) {
        positions[i] = (Math.random() - 0.5) * 20
        positions[i + 1] = (Math.random() - 0.5) * 10
        positions[i + 2] = -50
      }
    }
    
    particles.attributes.position.needsUpdate = true
  })
  
  return (
    <group>
      {/* Speed line particles */}
      {particles && (
        <points ref={particlesRef}>
          <bufferGeometry attach="geometry" {...particles} />
          <pointsMaterial
            attach="material"
            color="#ffffff"
            size={0.1}
            transparent
            opacity={Math.min(speed * 5, 0.8)} // More visible at higher speeds
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Dynamic fog that intensifies with speed */}
      <fog
        attach="fog"
        args={[
          '#87CEEB', // Sky blue color
          10,        // Near distance
          Math.max(50 - speed * 30, 20) // Far distance - decreases with speed
        ]}
      />
    </group>
  )
}