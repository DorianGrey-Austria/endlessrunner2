import { create } from 'zustand'

export interface GameState {
  isPlaying: boolean
  isGameOver: boolean
  score: number
  speed: number
  playerPosition: { x: number; y: number; z: number }
  playerLane: number // -1, 0, 1 for left, center, right
  playerAction: 'running' | 'jumping' | 'ducking'
  obstacles: Array<{
    id: string
    type: 'barrier' | 'spike' | 'wall' | 'block' | 'tunnel'
    position: { x: number; y: number; z: number }
    lane: number
    height: number
  }>
  powerups: Array<{
    id: string
    type: 'coin' | 'magnet' | 'shield'
    position: { x: number; y: number; z: number }
    lane: number
  }>
}

export interface GameActions {
  startGame: () => void
  endGame: () => void
  resetGame: () => void
  updateScore: (points: number) => void
  movePlayer: (direction: 'left' | 'right') => void
  jumpPlayer: () => void
  duckPlayer: () => void
  resetPlayerAction: () => void
  updatePlayerPosition: (position: { x: number; y: number; z: number }) => void
  addObstacle: (obstacle: GameState['obstacles'][0]) => void
  removeObstacle: (id: string) => void
  updateObstacles: () => void
  addPowerup: (powerup: GameState['powerups'][0]) => void
  removePowerup: (id: string) => void
  updateSpeed: () => void
}

const LANE_POSITIONS = [-2, 0, 2] // x positions for left, center, right lanes
const INITIAL_SPEED = 0.1
const SPEED_INCREMENT = 0.005 // Increased for more noticeable acceleration
const MAX_SPEED = 0.5

export const useGameStore = create<GameState & GameActions>((set) => ({
  // Initial state
  isPlaying: false,
  isGameOver: false,
  score: 0,
  speed: INITIAL_SPEED,
  playerPosition: { x: 0, y: 0, z: 0 },
  playerLane: 1, // start in center lane
  playerAction: 'running',
  obstacles: [],
  powerups: [],

  // Actions
  startGame: () => set({ isPlaying: true, isGameOver: false }),
  
  endGame: () => set({ isPlaying: false, isGameOver: true }),
  
  resetGame: () => set({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    speed: INITIAL_SPEED,
    playerPosition: { x: 0, y: 0, z: 0 },
    playerLane: 1,
    playerAction: 'running',
    obstacles: [],
    powerups: []
  }),
  
  updateScore: (points: number) => set(state => ({ 
    score: state.score + points 
  })),
  
  movePlayer: (direction: 'left' | 'right') => set(state => {
    const newLane = direction === 'left' 
      ? Math.max(0, state.playerLane - 1)
      : Math.min(2, state.playerLane + 1)
    
    return {
      playerLane: newLane,
      playerPosition: {
        ...state.playerPosition,
        x: LANE_POSITIONS[newLane]
      }
    }
  }),
  
  jumpPlayer: () => set(state => 
    state.playerAction === 'running' ? { playerAction: 'jumping' } : {}
  ),
  
  duckPlayer: () => set(state => 
    state.playerAction === 'running' ? { playerAction: 'ducking' } : {}
  ),
  
  resetPlayerAction: () => set({ playerAction: 'running' }),
  
  updatePlayerPosition: (position: { x: number; y: number; z: number }) => 
    set({ playerPosition: position }),
  
  addObstacle: (obstacle: GameState['obstacles'][0]) => set(state => ({
    obstacles: [...state.obstacles, obstacle]
  })),
  
  removeObstacle: (id: string) => set(state => ({
    obstacles: state.obstacles.filter(obs => obs.id !== id)
  })),
  
  updateObstacles: () => set(state => {
    const speed = state.speed
    return {
      obstacles: state.obstacles
        .map(obs => ({
          ...obs,
          position: {
            ...obs.position,
            z: obs.position.z + speed
          }
        }))
        .filter(obs => obs.position.z < 10) // Remove obstacles that are behind player
    }
  }),
  
  addPowerup: (powerup: GameState['powerups'][0]) => set(state => ({
    powerups: [...state.powerups, powerup]
  })),
  
  removePowerup: (id: string) => set(state => ({
    powerups: state.powerups.filter(pwup => pwup.id !== id)
  })),
  
  updateSpeed: () => set(state => ({
    speed: Math.min(state.speed + SPEED_INCREMENT, MAX_SPEED)
  }))
}))