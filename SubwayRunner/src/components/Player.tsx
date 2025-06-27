import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

export default function Player() {
  const playerRef = useRef<THREE.Group>(null)
  const { 
    playerPosition, 
    playerLane, 
    playerAction, 
    updatePlayerPosition, 
    resetPlayerAction,
    isPlaying 
  } = useGameStore()

  const lanePositions = [-2, 0, 2]
  let jumpHeight = 0
  let jumpVelocity = 0
  let duckScale = 1

  useFrame((state, delta) => {
    if (!isPlaying || !playerRef.current) return

    const targetX = lanePositions[playerLane]
    
    // Smooth lane switching
    const currentX = THREE.MathUtils.lerp(playerPosition.x, targetX, delta * 10)
    
    // Jumping physics
    if (playerAction === 'jumping') {
      if (jumpHeight === 0) {
        jumpVelocity = 8 // Initial jump velocity
      }
      jumpHeight += jumpVelocity * delta
      jumpVelocity -= 25 * delta // Gravity
      
      if (jumpHeight <= 0) {
        jumpHeight = 0
        jumpVelocity = 0
        resetPlayerAction()
      }
    }
    
    // Ducking animation
    if (playerAction === 'ducking') {
      duckScale = THREE.MathUtils.lerp(duckScale, 0.5, delta * 15)
    } else {
      duckScale = THREE.MathUtils.lerp(duckScale, 1, delta * 15)
    }
    
    // Update player position
    const newPosition = {
      x: currentX,
      y: jumpHeight,
      z: 0
    }
    
    updatePlayerPosition(newPosition)
    
    // Apply transforms to player mesh
    playerRef.current.position.set(newPosition.x, newPosition.y, newPosition.z)
    playerRef.current.scale.set(1, duckScale, 1)
    
    // Running animation
    if (playerAction === 'running') {
      playerRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.1
    }
  })

  return (
    <group ref={playerRef}>
      {/* Player body - simplified character */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.3, 1]} />
        <meshLambertMaterial color="#4A90E2" />
      </mesh>
      
      {/* Player head */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshLambertMaterial color="#F5B041" />
      </mesh>
      
      {/* Player arms */}
      <mesh castShadow position={[-0.4, 0.7, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.1, 0.6]} />
        <meshLambertMaterial color="#F5B041" />
      </mesh>
      <mesh castShadow position={[0.4, 0.7, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.1, 0.6]} />
        <meshLambertMaterial color="#F5B041" />
      </mesh>
      
      {/* Player legs */}
      <mesh castShadow position={[-0.15, -0.3, 0]}>
        <capsuleGeometry args={[0.12, 0.7]} />
        <meshLambertMaterial color="#2C3E50" />
      </mesh>
      <mesh castShadow position={[0.15, -0.3, 0]}>
        <capsuleGeometry args={[0.12, 0.7]} />
        <meshLambertMaterial color="#2C3E50" />
      </mesh>
    </group>
  )
}