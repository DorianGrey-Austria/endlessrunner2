import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

// Obstacle types designed for Blender MCP integration
const OBSTACLE_TYPES = {
  barrier: { height: 1.5, color: '#8B0000', canJump: false, canDuck: true },
  spike: { height: 0.8, color: '#FF4500', canJump: true, canDuck: true },
  wall: { height: 2.5, color: '#708090', canJump: false, canDuck: false },
  block: { height: 1.0, color: '#8B4513', canJump: true, canDuck: false },
  tunnel: { height: 1.2, color: '#4682B4', canJump: false, canDuck: true }
}

export default function Obstacles() {
  const { 
    obstacles, 
    isPlaying, 
    addObstacle, 
    removeObstacle, 
    updateObstacles,
    playerPosition,
    playerAction,
    endGame,
    updateScore
  } = useGameStore()
  
  const lastSpawnTime = useRef(0)
  const spawnInterval = 2000 // milliseconds
  
  useFrame((state) => {
    if (!isPlaying) return
    
    // Update obstacle positions
    updateObstacles()
    
    // Spawn new obstacles
    const now = state.clock.elapsedTime * 1000
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnObstacle()
      lastSpawnTime.current = now
    }
    
    // Check collisions
    checkCollisions()
    
    // Clean up obstacles that are too far behind
    obstacles.forEach(obstacle => {
      if (obstacle.position.z > 5) {
        removeObstacle(obstacle.id)
        updateScore(10) // Points for avoiding obstacle
      }
    })
  })
  
  const spawnObstacle = () => {
    const types = Object.keys(OBSTACLE_TYPES) as Array<keyof typeof OBSTACLE_TYPES>
    const type = types[Math.floor(Math.random() * types.length)]
    const lane = Math.floor(Math.random() * 3) // 0, 1, or 2
    
    const obstacle = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: { 
        x: [-2, 0, 2][lane], 
        y: 0, 
        z: -30 
      },
      lane,
      height: OBSTACLE_TYPES[type].height
    }
    
    addObstacle(obstacle)
  }
  
  const checkCollisions = () => {
    obstacles.forEach(obstacle => {
      const distance = Math.abs(obstacle.position.z - playerPosition.z)
      const laneMatch = Math.abs(obstacle.position.x - playerPosition.x) < 0.5
      
      if (distance < 1 && laneMatch) {
        const obstacleType = OBSTACLE_TYPES[obstacle.type]
        
        // Check if player can avoid this obstacle
        let canAvoid = false
        
        if (playerAction === 'jumping' && obstacleType.canJump) {
          if (playerPosition.y > obstacleType.height * 0.7) {
            canAvoid = true
          }
        } else if (playerAction === 'ducking' && obstacleType.canDuck) {
          canAvoid = true
        }
        
        if (!canAvoid) {
          endGame()
        } else {
          // Successful avoidance
          removeObstacle(obstacle.id)
          updateScore(50) // Bonus points for skillful avoidance
        }
      }
    })
  }

  return (
    <group>
      {obstacles.map(obstacle => {
        const obstacleType = OBSTACLE_TYPES[obstacle.type]
        return (
          <ObstacleComponent
            key={obstacle.id}
            obstacle={obstacle}
            obstacleType={obstacleType}
          />
        )
      })}
    </group>
  )
}

function ObstacleComponent({ 
  obstacle, 
  obstacleType 
}: { 
  obstacle: any, 
  obstacleType: any 
}) {
  return (
    <group position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
      {/* Different obstacle shapes for each type */}
      {obstacle.type === 'barrier' && (
        <mesh castShadow>
          <boxGeometry args={[1.5, obstacleType.height, 0.3]} />
          <meshLambertMaterial color={obstacleType.color} />
        </mesh>
      )}
      
      {obstacle.type === 'spike' && (
        <group>
          <mesh castShadow position={[0, obstacleType.height/2, 0]}>
            <coneGeometry args={[0.3, obstacleType.height, 8]} />
            <meshLambertMaterial color={obstacleType.color} />
          </mesh>
          <mesh castShadow position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
            <meshLambertMaterial color="#333333" />
          </mesh>
        </group>
      )}
      
      {obstacle.type === 'wall' && (
        <mesh castShadow>
          <boxGeometry args={[1.8, obstacleType.height, 0.5]} />
          <meshLambertMaterial color={obstacleType.color} />
        </mesh>
      )}
      
      {obstacle.type === 'block' && (
        <mesh castShadow>
          <boxGeometry args={[1.2, obstacleType.height, 1.2]} />
          <meshLambertMaterial color={obstacleType.color} />
        </mesh>
      )}
      
      {obstacle.type === 'tunnel' && (
        <group>
          <mesh castShadow position={[0, obstacleType.height, 0]}>
            <boxGeometry args={[2, 0.3, 1]} />
            <meshLambertMaterial color={obstacleType.color} />
          </mesh>
          <mesh castShadow position={[-0.9, obstacleType.height/2, 0]}>
            <boxGeometry args={[0.3, obstacleType.height, 1]} />
            <meshLambertMaterial color={obstacleType.color} />
          </mesh>
          <mesh castShadow position={[0.9, obstacleType.height/2, 0]}>
            <boxGeometry args={[0.3, obstacleType.height, 1]} />
            <meshLambertMaterial color={obstacleType.color} />
          </mesh>
        </group>
      )}
    </group>
  )
}