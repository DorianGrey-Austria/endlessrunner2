import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import Player from './Player'
import Track from './Track'
import Obstacles from './Obstacles'
import Environment from './Environment'
import VisualEffects from './VisualEffects'
import * as THREE from 'three'

export default function GameScene() {
  const { isPlaying, playerPosition, speed } = useGameStore()

  useFrame((state, delta) => {
    if (!isPlaying) return

    // Dynamic camera movement following player with speed influence
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x, 
      playerPosition.x * 0.3, 
      delta * 5
    )
    
    // Dynamic camera shake and bob based on speed
    const speedIntensity = speed * 2
    state.camera.position.y = 3 + Math.sin(state.clock.elapsedTime * 2) * (0.05 + speedIntensity * 0.1)
    state.camera.position.z = 8 + Math.sin(state.clock.elapsedTime * 3) * speedIntensity * 0.2
    
    // Dynamic FOV based on speed for motion blur effect
    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 60 + speed * 20, delta * 2)
      state.camera.updateProjectionMatrix()
    }
    
    // Look ahead of player with speed influence
    state.camera.lookAt(playerPosition.x * 0.2, 1, -3 - speed * 2)
  })

  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8}
        castShadow
      />
      
      {/* Game world */}
      <Track />
      <Player />
      <Obstacles />
      <Environment />
      <VisualEffects />
    </>
  )
}