import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

export default function Environment() {
  const buildingsRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Group>(null)
  const { speed, isPlaying } = useGameStore()
  const [visualSpeed, setVisualSpeed] = useState(0.1)
  
  // Lerp function for smooth speed transitions
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor
  }
  
  useFrame((_, delta) => {
    if (!isPlaying) return
    
    // Smooth speed interpolation
    const targetSpeed = speed * 10 // Scale for visual effect
    setVisualSpeed(prev => lerp(prev, targetSpeed, 0.05))
    
    // Move buildings with parallax effect
    if (buildingsRef.current) {
      buildingsRef.current.children.forEach((building, index) => {
        const parallaxFactor = 0.3 + (index % 3) * 0.1 // Varying depths
        building.position.z += visualSpeed * parallaxFactor * delta * 60
        
        if (building.position.z > 15) {
          building.position.z -= 80
        }
      })
    }
    
    // Move clouds slowly for background parallax
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud) => {
        cloud.position.z += visualSpeed * 0.1 * delta * 60
        
        if (cloud.position.z > 20) {
          cloud.position.z -= 100
        }
      })
    }
  })

  return (
    <group>
      {/* Ground plane */}
      <mesh receiveShadow position={[0, -1, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 80]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
      
      {/* Simple city buildings */}
      <group ref={buildingsRef}>
        {/* Left side buildings */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh 
            key={`left-${i}`}
            position={[-15 - Math.random() * 5, 2 + Math.random() * 4, -i * 12]}
            castShadow
          >
            <boxGeometry args={[3, 4 + Math.random() * 6, 3]} />
            <meshLambertMaterial color={`hsl(${200 + Math.random() * 60}, 30%, ${40 + Math.random() * 20}%)`} />
          </mesh>
        ))}
        
        {/* Right side buildings */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh 
            key={`right-${i}`}
            position={[15 + Math.random() * 5, 2 + Math.random() * 4, -i * 12]}
            castShadow
          >
            <boxGeometry args={[3, 4 + Math.random() * 6, 3]} />
            <meshLambertMaterial color={`hsl(${200 + Math.random() * 60}, 30%, ${40 + Math.random() * 20}%)`} />
          </mesh>
        ))}
      </group>
      
      {/* Simple clouds with parallax */}
      <group ref={cloudsRef}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh 
            key={`cloud-${i}`}
            position={[
              (Math.random() - 0.5) * 60,
              8 + Math.random() * 4,
              -10 - i * 20
            ]}
          >
            <sphereGeometry args={[1.5 + Math.random() * 0.5, 8, 6]} />
            <meshBasicMaterial color="white" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}