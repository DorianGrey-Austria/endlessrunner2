import { useGameStore } from '../store/gameStore'

export default function GameUI() {
  const { score, speed, isPlaying } = useGameStore()

  if (!isPlaying) return null

  return (
    <>
      <div className="game-ui">
        <div>Score: {score}</div>
        <div>Speed: {(speed * 1000).toFixed(0)}</div>
      </div>
      
      <div className="game-instructions">
        <div>WASD / Arrow Keys: Move</div>
        <div>Space/W: Jump</div>
        <div>S: Duck</div>
      </div>
    </>
  )
}