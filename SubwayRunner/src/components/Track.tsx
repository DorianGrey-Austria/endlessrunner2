import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

export default function Track() {
  const trackRef = useRef<THREE.Group>(null)
  const { speed, isPlaying } = useGameStore()
  const [visualSpeed, setVisualSpeed] = useState(0.1)
  
  // Lerp function for smooth speed transitions
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }
  
  const segmentLength = 10
  const numSegments = 8

  useFrame((_, delta) => {
    if (!isPlaying || !trackRef.current) return

    // Smooth speed interpolation
    const targetSpeed = speed * 10 // Scale for visual effect
    setVisualSpeed(prev => lerp(prev, targetSpeed, 0.05))

    trackRef.current.children.forEach((segment) => {
      // Move track segments toward the player with delta time
      segment.position.z += visualSpeed * delta * 60
      
      // Reset segments that have passed the player
      if (segment.position.z > 10) {
        segment.position.z -= numSegments * segmentLength
      }
    })
  })

  // Generate track segments
  const generateTrackSegments = () => {
    const segments = []
    
    for (let i = 0; i < numSegments; i++) {
      const z = -i * segmentLength
      segments.push(
        <group key={i} position={[0, 0, z]}>
          {/* Main track surface */}
          <mesh receiveShadow position={[0, -0.01, 0]}>
            <boxGeometry args={[8, 0.1, segmentLength]} />
            <meshLambertMaterial color="#444444" />
          </mesh>
          
          {/* Lane dividers */}
          <mesh position={[-1, 0, 0]}>
            <boxGeometry args={[0.1, 0.05, segmentLength]} />
            <meshLambertMaterial color="#FFFF00" />
          </mesh>
          <mesh position={[1, 0, 0]}>
            <boxGeometry args={[0.1, 0.05, segmentLength]} />
            <meshLambertMaterial color="#FFFF00" />
          </mesh>
          
          {/* Side barriers */}
          <mesh position={[-4, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, segmentLength]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[4, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, segmentLength]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          
          {/* Railway ties for visual effect */}
          {Array.from({ length: 10 }, (_, tieIndex) => (
            <mesh 
              key={tieIndex} 
              position={[0, -0.05, -segmentLength/2 + (tieIndex * segmentLength/10)]}
            >
              <boxGeometry args={[6, 0.1, 0.2]} />
              <meshLambertMaterial color="#654321" />
            </mesh>
          ))}
        </group>
      )
    }
    
    return segments
  }

  return (
    <group ref={trackRef}>
      {generateTrackSegments()}
      
      {/* Ground beneath track */}
      <mesh receiveShadow position={[0, -1, -40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  )
}