/**
 * Obstacle Detector
 *
 * Analyzes obstacles in the game scene and recommends actions.
 * Used for intelligent gameplay testing.
 */

/**
 * Obstacle type to action mapping
 */
export const OBSTACLE_ACTIONS = {
  // Low obstacles - must jump over
  lowbarrier: 'JUMP',
  jumpblock: 'JUMP',
  hurdleset: 'JUMP',
  hurdle: 'JUMP',
  barrier_low: 'JUMP',

  // High obstacles - must duck under
  highbarrier: 'DUCK',
  duckbeam: 'DUCK',
  wallgap: 'DUCK',
  barrier_high: 'DUCK',
  beam: 'DUCK',

  // Special obstacles
  spikes: 'JUMP', // Can also duck, but jump is safer
  train: 'LANE_CHANGE',
  wall: 'LANE_CHANGE',
};

/**
 * Lane positions (approximate X coordinates)
 */
export const LANES = {
  LEFT: -2,
  CENTER: 0,
  RIGHT: 2,
};

/**
 * Convert X position to lane index (0, 1, 2)
 * @param {number} x - X position
 * @returns {number} Lane index
 */
export function xToLane(x) {
  if (x < -1) return 0; // Left
  if (x > 1) return 2;  // Right
  return 1;             // Center
}

/**
 * Get all obstacles from the game scene
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Obstacle[]>}
 */
export async function getObstacles(page) {
  return page.evaluate(() => {
    if (typeof scene === 'undefined' || typeof gameState === 'undefined') {
      return [];
    }

    const result = [];
    const playerZ = gameState.playerZ || 0;

    // Obstacle detection patterns
    const obstaclePatterns = {
      low: ['lowbarrier', 'jumpblock', 'hurdle', 'barrier_low'],
      high: ['highbarrier', 'duckbeam', 'wallgap', 'barrier_high', 'beam'],
      spike: ['spike'],
      train: ['train'],
      wall: ['wall'],
    };

    scene.traverse(obj => {
      if (!obj.isMesh || !obj.name) return;

      const name = obj.name.toLowerCase();
      const distance = obj.position.z - playerZ;

      // Only consider obstacles ahead of player (within 80 units)
      if (distance < 0 || distance > 80) return;

      let type = 'unknown';
      let action = 'NONE';

      // Check each pattern category
      for (const [category, patterns] of Object.entries(obstaclePatterns)) {
        if (patterns.some(p => name.includes(p))) {
          type = category;
          break;
        }
      }

      // Map type to action
      switch (type) {
        case 'low':
          action = 'JUMP';
          break;
        case 'high':
          action = 'DUCK';
          break;
        case 'spike':
          action = 'JUMP'; // Safer choice
          break;
        case 'train':
        case 'wall':
          action = 'LANE_CHANGE';
          break;
        default:
          // Check if it looks like a collectible (apples, broccoli)
          if (name.includes('apple') || name.includes('broccoli') || name.includes('coin')) {
            return; // Skip collectibles
          }
          // Unknown obstacle - might need investigation
          if (obj.geometry && obj.geometry.boundingBox) {
            const height = obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y;
            action = height > 1.5 ? 'DUCK' : 'JUMP';
            type = height > 1.5 ? 'high_guess' : 'low_guess';
          }
          break;
      }

      if (type !== 'unknown') {
        result.push({
          name: obj.name,
          type,
          action,
          lane: Math.round((obj.position.x + 2) / 2), // 0, 1, or 2
          position: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
          },
          distance,
        });
      }
    });

    // Sort by distance (closest first)
    return result.sort((a, b) => a.distance - b.distance);
  }).catch(() => []);
}

/**
 * Get the recommended action based on obstacles and player state
 * @param {Obstacle[]} obstacles - List of obstacles
 * @param {number} playerLane - Current player lane (0, 1, 2)
 * @param {boolean} isJumping - Is player currently jumping
 * @param {boolean} isDucking - Is player currently ducking
 * @returns {RecommendedAction}
 */
export function getRecommendedAction(obstacles, playerLane, isJumping = false, isDucking = false) {
  // No obstacles - maybe move randomly
  if (!obstacles || obstacles.length === 0) {
    return { action: 'NONE', reason: 'No obstacles detected', urgency: 0 };
  }

  // Find the closest obstacle in player's lane
  const immediateThreat = obstacles.find(o =>
    o.lane === playerLane && o.distance < 20
  );

  if (immediateThreat) {
    // Immediate threat - must react!
    if (immediateThreat.action === 'LANE_CHANGE') {
      // Find safe lane
      const leftSafe = !obstacles.some(o => o.lane === 0 && o.distance < 15);
      const rightSafe = !obstacles.some(o => o.lane === 2 && o.distance < 15);

      if (playerLane === 1) {
        // In center - go to safe side
        if (leftSafe) return { action: 'MOVE_LEFT', reason: 'Avoid train/wall', urgency: 1 };
        if (rightSafe) return { action: 'MOVE_RIGHT', reason: 'Avoid train/wall', urgency: 1 };
      } else if (playerLane === 0 && rightSafe) {
        return { action: 'MOVE_RIGHT', reason: 'Escape from left', urgency: 1 };
      } else if (playerLane === 2 && leftSafe) {
        return { action: 'MOVE_LEFT', reason: 'Escape from right', urgency: 1 };
      }
    }

    // Can't lane change - jump or duck
    if (immediateThreat.action === 'JUMP' && !isJumping) {
      return { action: 'JUMP', reason: `Jump over ${immediateThreat.type}`, urgency: 1 };
    }
    if (immediateThreat.action === 'DUCK' && !isDucking) {
      return { action: 'DUCK', reason: `Duck under ${immediateThreat.type}`, urgency: 1 };
    }
  }

  // Check for upcoming threats (20-50 units ahead)
  const upcomingThreat = obstacles.find(o =>
    o.lane === playerLane && o.distance >= 20 && o.distance < 50
  );

  if (upcomingThreat) {
    // Prepare for upcoming obstacle
    if (upcomingThreat.action === 'LANE_CHANGE') {
      // Pre-emptive lane change
      const leftSafe = !obstacles.some(o => o.lane === 0 && o.distance < 50);
      const rightSafe = !obstacles.some(o => o.lane === 2 && o.distance < 50);

      if (playerLane === 1) {
        if (leftSafe) return { action: 'MOVE_LEFT', reason: 'Prepare for obstacle', urgency: 0.5 };
        if (rightSafe) return { action: 'MOVE_RIGHT', reason: 'Prepare for obstacle', urgency: 0.5 };
      }
    }

    return {
      action: 'NONE',
      reason: `Preparing for ${upcomingThreat.type} at ${Math.round(upcomingThreat.distance)}m`,
      urgency: 0.3,
    };
  }

  // No immediate threats - maybe collect items or move around
  return { action: 'NONE', reason: 'Path clear', urgency: 0 };
}

/**
 * @typedef {Object} Obstacle
 * @property {string} name - Mesh name
 * @property {string} type - Obstacle type (low, high, spike, train, wall)
 * @property {string} action - Recommended action (JUMP, DUCK, LANE_CHANGE)
 * @property {number} lane - Lane index (0, 1, 2)
 * @property {{x: number, y: number, z: number}} position
 * @property {number} distance - Distance from player
 */

/**
 * @typedef {Object} RecommendedAction
 * @property {'JUMP'|'DUCK'|'MOVE_LEFT'|'MOVE_RIGHT'|'NONE'} action
 * @property {string} reason
 * @property {number} urgency - 0 to 1
 */
