/**
 * Gameplay Simulator
 *
 * Intelligent gameplay simulation for E2E testing.
 * Simulates human-like player behavior with reactive obstacle avoidance.
 */

import { getGameState, performAction, humanDelay } from './game-test-utils.js';
import { getObstacles, getRecommendedAction } from './obstacle-detector.js';

/**
 * Movement patterns for variety
 */
export const MOVEMENT_PATTERNS = {
  // Reactive pattern - only react to obstacles
  reactive: {
    name: 'reactive',
    description: 'Only react to obstacles, minimal random movement',
    randomMoveChance: 0.05,
    multiJumpChance: 0.3,
  },

  // Zigzag pattern - frequent lane changes
  zigzag: {
    name: 'zigzag',
    description: 'Frequent lane changes for coin collection',
    randomMoveChance: 0.3,
    multiJumpChance: 0.2,
  },

  // Jump combo pattern - lots of jumping
  jumpCombo: {
    name: 'jumpCombo',
    description: 'Frequent multi-jumps',
    randomMoveChance: 0.1,
    multiJumpChance: 0.7,
  },

  // Defensive pattern - stay in center
  defensive: {
    name: 'defensive',
    description: 'Stay in center, minimal risk-taking',
    randomMoveChance: 0.02,
    multiJumpChance: 0.1,
  },

  // Stress test pattern - maximum chaos
  stressTest: {
    name: 'stressTest',
    description: 'Maximum inputs to stress-test the game',
    randomMoveChance: 0.5,
    multiJumpChance: 0.8,
  },
};

/**
 * Gameplay Simulator class
 */
export class GameplaySimulator {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {Object} options
   */
  constructor(page, options = {}) {
    this.page = page;
    this.pattern = options.pattern || MOVEMENT_PATTERNS.reactive;
    this.maxMultiJumps = options.maxMultiJumps || 4;
    this.logActions = options.logActions || false;

    // Stats
    this.stats = {
      jumps: 0,
      ducks: 0,
      laneChanges: 0,
      obstaclesAvoided: 0,
      totalActions: 0,
      startTime: null,
      endTime: null,
    };
  }

  /**
   * Log an action (if logging enabled)
   * @param {string} message
   */
  log(message) {
    if (this.logActions) {
      console.log(`    [Simulator] ${message}`);
    }
  }

  /**
   * Simulate gameplay for a duration
   * @param {number} durationSeconds - How long to play
   * @param {Object} options
   * @returns {Promise<SimulationResult>}
   */
  async simulate(durationSeconds, options = {}) {
    const tickInterval = options.tickInterval || 200; // ms between checks
    const maxTicks = Math.floor((durationSeconds * 1000) / tickInterval);

    this.stats.startTime = Date.now();

    let tick = 0;
    let lastState = null;
    let errors = [];

    while (tick < maxTicks) {
      tick++;

      // Get current game state
      const state = await getGameState(this.page);

      if (!state) {
        errors.push(`Tick ${tick}: Could not get game state`);
        await this.page.waitForTimeout(tickInterval);
        continue;
      }

      // Game over?
      if (state.isGameOver || !state.isPlaying) {
        this.log(`Game ended at tick ${tick} (${state.isGameOver ? 'Game Over' : 'Paused'})`);
        break;
      }

      // Get obstacles and decide action
      const obstacles = await getObstacles(this.page);
      const recommendation = getRecommendedAction(
        obstacles,
        state.currentLane,
        state.isJumping,
        state.isDucking
      );

      let actionTaken = false;

      // Urgent action required?
      if (recommendation.urgency >= 0.8) {
        await this.executeAction(recommendation.action, recommendation.reason);
        actionTaken = true;
      }
      // Medium urgency - take action with some probability
      else if (recommendation.urgency >= 0.3 && Math.random() < 0.7) {
        await this.executeAction(recommendation.action, recommendation.reason);
        actionTaken = true;
      }
      // Low/no urgency - random actions based on pattern
      else if (recommendation.action === 'NONE') {
        // Random movement based on pattern
        if (Math.random() < this.pattern.randomMoveChance) {
          const randomAction = Math.random() < 0.5 ? 'MOVE_LEFT' : 'MOVE_RIGHT';
          await this.executeAction(randomAction, 'Random movement');
          actionTaken = true;
        }
        // Random multi-jump based on pattern
        else if (Math.random() < this.pattern.multiJumpChance && !state.isJumping) {
          await this.executeMultiJump();
          actionTaken = true;
        }
      }

      // Human-like delay
      if (actionTaken) {
        await humanDelay(100, 300);
      } else {
        await this.page.waitForTimeout(tickInterval);
      }

      lastState = state;
    }

    this.stats.endTime = Date.now();

    // Get final state
    const finalState = await getGameState(this.page);

    return {
      success: true,
      duration: (this.stats.endTime - this.stats.startTime) / 1000,
      finalState,
      stats: { ...this.stats },
      errors,
    };
  }

  /**
   * Execute a single action
   * @param {string} action
   * @param {string} reason
   */
  async executeAction(action, reason) {
    await performAction(this.page, action);
    this.stats.totalActions++;

    switch (action) {
      case 'JUMP':
        this.stats.jumps++;
        break;
      case 'DUCK':
        this.stats.ducks++;
        break;
      case 'MOVE_LEFT':
      case 'MOVE_RIGHT':
        this.stats.laneChanges++;
        break;
    }

    this.log(`${action}: ${reason}`);
  }

  /**
   * Execute a multi-jump sequence
   * @param {number} count - Number of jumps (random if not specified)
   */
  async executeMultiJump(count) {
    const numJumps = count || Math.floor(Math.random() * this.maxMultiJumps) + 1;

    for (let i = 0; i < numJumps; i++) {
      await performAction(this.page, 'JUMP');
      this.stats.jumps++;
      this.stats.totalActions++;

      // Short delay between jumps
      await humanDelay(50, 150);

      // Check if still in the air
      const state = await getGameState(this.page);
      if (!state || !state.isJumping) {
        break;
      }
    }

    this.log(`Multi-jump: ${numJumps} jumps`);
  }

  /**
   * Wait for game over
   * @param {number} maxWaitSeconds
   * @returns {Promise<GameState|null>}
   */
  async waitForGameOver(maxWaitSeconds = 120) {
    const startTime = Date.now();
    const maxWaitMs = maxWaitSeconds * 1000;

    while (Date.now() - startTime < maxWaitMs) {
      const state = await getGameState(this.page);

      if (!state || state.isGameOver || !state.isPlaying) {
        return state;
      }

      await this.page.waitForTimeout(1000);
    }

    return null;
  }

  /**
   * Get simulation statistics
   */
  getStats() {
    return {
      ...this.stats,
      pattern: this.pattern.name,
      actionsPerSecond: this.stats.endTime && this.stats.startTime
        ? this.stats.totalActions / ((this.stats.endTime - this.stats.startTime) / 1000)
        : 0,
    };
  }
}

/**
 * Quick gameplay simulation helper
 * @param {import('@playwright/test').Page} page
 * @param {number} durationSeconds
 * @param {string} patternName
 */
export async function quickSimulate(page, durationSeconds, patternName = 'reactive') {
  const pattern = MOVEMENT_PATTERNS[patternName] || MOVEMENT_PATTERNS.reactive;
  const simulator = new GameplaySimulator(page, { pattern, logActions: false });
  return simulator.simulate(durationSeconds);
}

/**
 * @typedef {Object} SimulationResult
 * @property {boolean} success
 * @property {number} duration
 * @property {Object} finalState
 * @property {Object} stats
 * @property {string[]} errors
 */
