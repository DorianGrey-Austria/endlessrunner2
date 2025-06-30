import { useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from './store/gameStore'
import GameScene from './components/GameScene'
import GameUI from './components/GameUI'

function App() {
  const { 
    isPlaying, 
    isGameOver, 
    score,
    movePlayer, 
    jumpPlayer, 
    duckPlayer, 
    resetPlayerAction,
    startGame,
    resetGame 
  } = useGameStore()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isPlaying) return

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        event.preventDefault()
        movePlayer('left')
        break
      case 'ArrowRight':
      case 'KeyD':
        event.preventDefault()
        movePlayer('right')
        break
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        event.preventDefault()
        jumpPlayer()
        break
      case 'ArrowDown':
      case 'KeyS':
        event.preventDefault()
        duckPlayer()
        break
    }
  }, [isPlaying, movePlayer, jumpPlayer, duckPlayer])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isPlaying) return

    switch (event.code) {
      case 'ArrowDown':
      case 'KeyS':
        event.preventDefault()
        resetPlayerAction()
        break
    }
  }, [isPlaying, resetPlayerAction])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  if (isLoading) {
    return (
      <div className="game-container">
        <div style={{ 
          color: 'white', 
          fontSize: '24px', 
          textAlign: 'center' 
        }}>
          Loading Subway Runner 3D...
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-canvas">
        <Canvas
          camera={{
            position: [0, 3, 8],
            fov: 60,
            aspect: 4/3
          }}
          gl={{ antialias: true }}
          onCreated={() => console.log('Canvas created successfully')}
        >
          <GameScene />
        </Canvas>
      </div>
      
      <GameUI />
      
      {isGameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
      
      {!isPlaying && !isGameOver && (
        <div className="game-over">
          <h2>🚇 Subway Runner 3D</h2>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Controls:</strong></p>
            <p>🎮 WASD or Arrow Keys to move</p>
            <p>🦘 Space/W to jump</p> 
            <p>🦆 S to duck</p>
          </div>
          <button onClick={startGame}>
            🎮 Start Game
          </button>
        </div>
      )}
    </div>
  )
}

export default App