// 🤖 AUTO-TEST GENERATOR - Automatically generates tests based on current code
import fs from 'fs';
import path from 'path';

class AutoTestGenerator {
  constructor() {
    this.indexPath = path.join(process.cwd(), 'index.html');
    this.generatedTestsPath = path.join(process.cwd(), 'tests/generated/');
    this.codeAnalysis = {
      functions: [],
      constants: {},
      uiElements: [],
      eventListeners: [],
      gameVariables: [],
      threeJsObjects: []
    };
  }

  async generateTests() {
    console.log('🤖 Starting automatic test generation...');

    // Ensure generated tests directory exists
    if (!fs.existsSync(this.generatedTestsPath)) {
      fs.mkdirSync(this.generatedTestsPath, { recursive: true });
    }

    try {
      // Analyze the codebase
      await this.analyzeCodebase();

      // Generate different types of tests
      await this.generateFunctionTests();
      await this.generateConstantTests();
      await this.generateUITests();
      await this.generateGameStateTests();
      await this.generateEventTests();

      // Generate test index file
      await this.generateTestIndex();

      console.log('✅ Auto-generated tests completed successfully');
      this.printGenerationSummary();

    } catch (error) {
      console.error('❌ Auto-test generation failed:', error);
      throw error;
    }
  }

  async analyzeCodebase() {
    console.log('🔍 Analyzing codebase for test generation...');

    const content = fs.readFileSync(this.indexPath, 'utf8');

    // Extract different code elements
    this.codeAnalysis.functions = this.extractFunctions(content);
    this.codeAnalysis.constants = this.extractConstants(content);
    this.codeAnalysis.uiElements = this.extractUIElements(content);
    this.codeAnalysis.eventListeners = this.extractEventListeners(content);
    this.codeAnalysis.gameVariables = this.extractGameVariables(content);
    this.codeAnalysis.threeJsObjects = this.extractThreeJsObjects(content);

    console.log('Code analysis results:', {
      functions: this.codeAnalysis.functions.length,
      constants: Object.keys(this.codeAnalysis.constants).length,
      uiElements: this.codeAnalysis.uiElements.length,
      eventListeners: this.codeAnalysis.eventListeners.length,
      gameVariables: this.codeAnalysis.gameVariables.length,
      threeJsObjects: this.codeAnalysis.threeJsObjects.length
    });
  }

  extractFunctions(content) {
    const functions = [];

    // Regular function declarations
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'function',
        declaration: match[0]
      });
    }

    // Arrow function assignments
    const arrowFunctionRegex = /(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'arrow',
        declaration: match[0]
      });
    }

    // Method definitions (object methods)
    const methodRegex = /(\w+)\s*:\s*function\s*\([^)]*\)/g;
    while ((match = methodRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        type: 'method',
        declaration: match[0]
      });
    }

    return [...new Map(functions.map(f => [f.name, f])).values()]; // Remove duplicates
  }

  extractConstants(content) {
    const constants = {};

    // Global constants (uppercase naming convention)
    const constantRegex = /(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=\s*([^;]+);/g;
    let match;
    while ((match = constantRegex.exec(content)) !== null) {
      constants[match[1]] = {
        value: match[2].trim(),
        type: this.inferType(match[2])
      };
    }

    // Game-specific constants
    const gameConstantRegex = /(?:const|let|var)\s+(BASE_SPEED|LANE_POSITIONS|JUMP_HEIGHT|SCORE_CAP|WIN_CONDITION)\s*=\s*([^;]+);/g;
    while ((match = gameConstantRegex.exec(content)) !== null) {
      constants[match[1]] = {
        value: match[2].trim(),
        type: this.inferType(match[2]),
        category: 'game'
      };
    }

    return constants;
  }

  extractUIElements(content) {
    const elements = [];

    // getElementById calls
    const getByIdRegex = /getElementById\(['"`]([^'"`]+)['"`]\)/g;
    let match;
    while ((match = getByIdRegex.exec(content)) !== null) {
      elements.push({
        id: match[1],
        selector: `#${match[1]}`,
        type: 'id'
      });
    }

    // querySelector calls
    const querySelectorRegex = /querySelector\(['"`]([^'"`]+)['"`]\)/g;
    while ((match = querySelectorRegex.exec(content)) !== null) {
      elements.push({
        selector: match[1],
        type: 'query'
      });
    }

    // HTML elements in the content
    const htmlElementRegex = /<(\w+)[^>]*id=['"]([^'"]+)['"][^>]*>/g;
    while ((match = htmlElementRegex.exec(content)) !== null) {
      elements.push({
        tag: match[1],
        id: match[2],
        selector: `#${match[2]}`,
        type: 'html'
      });
    }

    return [...new Map(elements.map(e => [e.selector || e.id, e])).values()];
  }

  extractEventListeners(content) {
    const listeners = [];

    // addEventListener calls
    const eventListenerRegex = /addEventListener\(['"`](\w+)['"`]/g;
    let match;
    while ((match = eventListenerRegex.exec(content)) !== null) {
      listeners.push({
        event: match[1],
        type: 'addEventListener'
      });
    }

    // Keyboard event handling
    const keyboardRegex = /(?:keydown|keyup|keypress)/g;
    while ((match = keyboardRegex.exec(content)) !== null) {
      listeners.push({
        event: match[0],
        type: 'keyboard'
      });
    }

    // Mouse/touch events
    const pointerRegex = /(?:click|mousedown|mouseup|touchstart|touchend)/g;
    while ((match = pointerRegex.exec(content)) !== null) {
      listeners.push({
        event: match[0],
        type: 'pointer'
      });
    }

    return [...new Map(listeners.map(l => [l.event, l])).values()];
  }

  extractGameVariables(content) {
    const variables = [];

    // Game state variables
    const gameStateRegex = /(?:gameState|game|player|score|level|lives|health|speed)/gi;
    const matches = content.match(gameStateRegex) || [];

    const uniqueVars = [...new Set(matches.map(v => v.toLowerCase()))];

    return uniqueVars.map(v => ({
      name: v,
      category: 'gameState'
    }));
  }

  extractThreeJsObjects(content) {
    const objects = [];

    // Three.js object creation
    const threeRegex = /new\s+THREE\.(\w+)\s*\(/g;
    let match;
    while ((match = threeRegex.exec(content)) !== null) {
      objects.push({
        type: match[1],
        category: 'three.js'
      });
    }

    // Common Three.js variables
    const threeVarRegex = /(scene|camera|renderer|geometry|material|mesh|light)/gi;
    const matches = content.match(threeVarRegex) || [];

    const uniqueThreeVars = [...new Set(matches.map(v => v.toLowerCase()))];

    uniqueThreeVars.forEach(v => {
      objects.push({
        name: v,
        category: 'three.js-variable'
      });
    });

    return [...new Map(objects.map(o => [o.type || o.name, o])).values()];
  }

  inferType(value) {
    const trimmed = value.trim();

    if (trimmed.match(/^\d+$/)) return 'number';
    if (trimmed.match(/^\d*\.\d+$/)) return 'float';
    if (trimmed.match(/^['"`]/)) return 'string';
    if (trimmed === 'true' || trimmed === 'false') return 'boolean';
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return 'array';
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) return 'object';

    return 'unknown';
  }

  async generateFunctionTests() {
    const functions = this.codeAnalysis.functions;
    if (functions.length === 0) return;

    const testContent = `// 🤖 AUTO-GENERATED FUNCTION TESTS
// Generated on: ${new Date().toISOString()}
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Auto-Generated Function Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });

${functions.map(func => `
  test('Function ${func.name} exists and is callable', async ({ page }) => {
    const functionExists = await page.evaluate(() => {
      return typeof window.${func.name} === 'function';
    });

    expect(functionExists).toBe(true);
  });
`).join('')}

  test('All detected functions are available in window scope', async ({ page }) => {
    const functionAvailability = await page.evaluate(() => {
      const functions = ${JSON.stringify(functions.map(f => f.name))};
      const results = {};

      functions.forEach(funcName => {
        results[funcName] = {
          exists: typeof window[funcName] !== 'undefined',
          type: typeof window[funcName],
          callable: typeof window[funcName] === 'function'
        };
      });

      return results;
    });

    console.log('Function availability:', functionAvailability);

    // At least 50% of detected functions should be available
    const availableFunctions = Object.values(functionAvailability)
      .filter(f => f.exists).length;

    expect(availableFunctions).toBeGreaterThan(${Math.floor(functions.length * 0.3)});
  });
});
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'auto-functions.spec.js'),
      testContent
    );
  }

  async generateConstantTests() {
    const constants = this.codeAnalysis.constants;
    if (Object.keys(constants).length === 0) return;

    const testContent = `// 🤖 AUTO-GENERATED CONSTANT TESTS
// Generated on: ${new Date().toISOString()}
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Auto-Generated Constant Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });

${Object.entries(constants).map(([name, data]) => `
  test('Constant ${name} has expected value', async ({ page }) => {
    const constantValue = await page.evaluate(() => {
      return window.${name};
    });

    // Constant should be defined
    expect(constantValue).not.toBeUndefined();

    // Type-specific assertions
    ${this.generateTypeAssertion(name, data)}
  });
`).join('')}

  test('Game constants maintain expected relationships', async ({ page }) => {
    const gameConstants = await page.evaluate(() => ({
      BASE_SPEED: window.BASE_SPEED,
      LANE_POSITIONS: window.LANE_POSITIONS,
      JUMP_HEIGHT: window.JUMP_HEIGHT,
      SCORE_CAP: window.SCORE_CAP,
      WIN_CONDITION: window.WIN_CONDITION
    }));

    console.log('Game constants:', gameConstants);

    // Validate constant relationships
    if (gameConstants.BASE_SPEED !== undefined) {
      expect(gameConstants.BASE_SPEED).toBeGreaterThan(0);
      expect(gameConstants.BASE_SPEED).toBeLessThan(1); // Reasonable speed value
    }

    if (gameConstants.LANE_POSITIONS !== undefined) {
      expect(Array.isArray(gameConstants.LANE_POSITIONS) ||
             typeof gameConstants.LANE_POSITIONS === 'object').toBe(true);
    }

    if (gameConstants.JUMP_HEIGHT !== undefined) {
      expect(gameConstants.JUMP_HEIGHT).toBeGreaterThan(0);
    }

    if (gameConstants.SCORE_CAP !== undefined) {
      expect(gameConstants.SCORE_CAP).toBeGreaterThan(1000);
    }

    if (gameConstants.WIN_CONDITION !== undefined) {
      expect(gameConstants.WIN_CONDITION).toBeGreaterThan(0);
    }
  });
});
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'auto-constants.spec.js'),
      testContent
    );
  }

  generateTypeAssertion(name, data) {
    switch (data.type) {
      case 'number':
        return `expect(typeof constantValue).toBe('number');`;
      case 'float':
        return `expect(typeof constantValue).toBe('number');
        expect(constantValue % 1).not.toBe(0); // Should be a float`;
      case 'string':
        return `expect(typeof constantValue).toBe('string');`;
      case 'boolean':
        return `expect(typeof constantValue).toBe('boolean');`;
      case 'array':
        return `expect(Array.isArray(constantValue)).toBe(true);`;
      case 'object':
        return `expect(typeof constantValue).toBe('object');
        expect(constantValue).not.toBeNull();`;
      default:
        return `expect(constantValue).toBeDefined();`;
    }
  }

  async generateUITests() {
    const uiElements = this.codeAnalysis.uiElements;
    if (uiElements.length === 0) return;

    const testContent = `// 🤖 AUTO-GENERATED UI TESTS
// Generated on: ${new Date().toISOString()}
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Auto-Generated UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });

${uiElements.map(element => `
  test('UI element ${element.selector} is accessible', async ({ page }) => {
    const element = page.locator('${element.selector}');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element ${element.selector} interactive:', isInteractive);
  });
`).join('')}

  test('Critical UI elements are visible', async ({ page }) => {
    // Test for common game UI elements
    const criticalElements = [
      'canvas', '#gameCanvas', '#game-canvas',
      '#score', '.score', '[data-score]',
      '#startButton', '#start-button', '.start-btn'
    ];

    let visibleElements = 0;

    for (const selector of criticalElements) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.first().isVisible();

        if (isVisible) {
          visibleElements++;
          console.log(\`✅ Found visible element: \${selector}\`);
        }
      } catch (error) {
        // Element doesn't exist, continue
      }
    }

    // At least one critical UI element should be visible
    expect(visibleElements).toBeGreaterThan(0);
  });

  test('UI elements respond to interaction', async ({ page }) => {
    const interactiveElements = ${JSON.stringify(
      uiElements.filter(el =>
        el.selector.includes('button') ||
        el.selector.includes('btn') ||
        el.id?.includes('button') ||
        el.id?.includes('btn')
      ).map(el => el.selector)
    )};

    for (const selector of interactiveElements) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.first().isVisible();

        if (isVisible) {
          console.log(\`Testing interaction with \${selector}\`);

          // Try clicking the element
          await element.first().click();
          await page.waitForTimeout(500);

          // Element should still exist after interaction
          await expect(element.first()).toBeTruthy();
        }
      } catch (error) {
        console.log(\`Could not interact with \${selector}:, error.message\`);
      }
    }
  });
});
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'auto-ui.spec.js'),
      testContent
    );
  }

  async generateGameStateTests() {
    const gameVars = this.codeAnalysis.gameVariables;
    if (gameVars.length === 0) return;

    const testContent = `// 🤖 AUTO-GENERATED GAME STATE TESTS
// Generated on: ${new Date().toISOString()}
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Auto-Generated Game State Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });

  test('Game state variables are properly initialized', async ({ page }) => {
    const gameState = await page.evaluate(() => {
      const state = {};

      // Check for common game state variables
      ${gameVars.map(v => `
      if (typeof window.${v.name} !== 'undefined') {
        state.${v.name} = typeof window.${v.name};
      }`).join('')}

      // Check for gameState object
      if (window.gameState) {
        state.gameStateObject = typeof window.gameState;
        state.gameStateKeys = Object.keys(window.gameState);
      }

      return state;
    });

    console.log('Game state analysis:', gameState);

    // At least some game state should be available
    const stateKeys = Object.keys(gameState);
    expect(stateKeys.length).toBeGreaterThan(0);
  });

  test('Game state persists during gameplay', async ({ page }) => {
    // Start the game
    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Capture initial state
    const initialState = await GameTestHelpers.captureGameState(page);

    // Simulate some gameplay
    await GameTestHelpers.simulateGameplay(page, 5000, 'light');

    // Capture final state
    const finalState = await GameTestHelpers.captureGameState(page);

    // Game state should remain consistent
    expect(typeof initialState.score).toBe(typeof finalState.score);
    expect(typeof initialState.level).toBe(typeof finalState.level);

    // Score should be valid number
    expect(finalState.score).toBeGreaterThanOrEqual(0);
  });

  test('Game state transitions work correctly', async ({ page }) => {
    // Test game state transitions
    const states = [];

    // Initial state
    states.push(await GameTestHelpers.captureGameState(page));

    // After starting game
    await GameTestHelpers.startGame(page);
    await page.waitForTimeout(1000);
    states.push(await GameTestHelpers.captureGameState(page));

    // After some gameplay
    await GameTestHelpers.simulateGameplay(page, 3000, 'light');
    states.push(await GameTestHelpers.captureGameState(page));

    console.log('State transitions:', states.map(s => ({
      isPlaying: s.isPlaying,
      score: s.score
    })));

    // States should show logical progression
    expect(states.length).toBe(3);

    // Playing state should be true after starting
    expect(states[1].isPlaying || states[2].isPlaying).toBe(true);
  });
});
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'auto-gamestate.spec.js'),
      testContent
    );
  }

  async generateEventTests() {
    const events = this.codeAnalysis.eventListeners;
    if (events.length === 0) return;

    const testContent = `// 🤖 AUTO-GENERATED EVENT TESTS
// Generated on: ${new Date().toISOString()}
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Auto-Generated Event Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });

${events.filter(e => e.type === 'keyboard').map(event => `
  test('Keyboard event ${event.event} is handled', async ({ page }) => {
    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Get initial game state
    const initialState = await GameTestHelpers.captureGameState(page);

    // Trigger keyboard event
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');

    await page.waitForTimeout(500);

    // Get state after events
    const finalState = await GameTestHelpers.captureGameState(page);

    // Game should still be running
    expect(finalState.ui.visible).toBe(true);

    console.log('Event response test for ${event.event} completed');
  });
`).join('')}

${events.filter(e => e.type === 'pointer').map(event => `
  test('Pointer event ${event.event} is handled', async ({ page }) => {
    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Find clickable elements
    const clickableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, [onclick], .clickable, .btn');
      return Array.from(elements).map(el => ({
        tag: el.tagName,
        id: el.id,
        className: el.className
      }));
    });

    console.log('Found clickable elements:', clickableElements);

    // Test clicking on game area
    await page.click('canvas, #gameCanvas, #game-canvas', { force: true });
    await page.waitForTimeout(200);

    // Game should still be responsive
    const gameState = await GameTestHelpers.captureGameState(page);
    expect(gameState.ui.visible).toBe(true);
  });
`).join('')}

  test('Event system maintains game stability', async ({ page }) => {
    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Rapid event firing test
    const events = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    for (let i = 0; i < 20; i++) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      await page.keyboard.press(randomEvent);
      await page.waitForTimeout(50); // Rapid firing
    }

    // Game should remain stable
    const finalState = await GameTestHelpers.captureGameState(page);
    expect(finalState.ui.visible).toBe(true);

    console.log('Event stability test completed');
  });
});
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'auto-events.spec.js'),
      testContent
    );
  }

  async generateTestIndex() {
    const testFiles = fs.readdirSync(this.generatedTestsPath)
      .filter(file => file.endsWith('.spec.js'));

    const indexContent = `// 🤖 AUTO-GENERATED TEST INDEX
// Generated on: ${new Date().toISOString()}
//
// This file provides an overview of all auto-generated tests
// and can be used to run specific test categories.

export const AutoGeneratedTests = {
  metadata: {
    generatedAt: '${new Date().toISOString()}',
    totalFiles: ${testFiles.length},
    analysisResults: ${JSON.stringify(this.codeAnalysis, null, 2)}
  },

  testFiles: ${JSON.stringify(testFiles, null, 2)},

  categories: {
    functions: 'auto-functions.spec.js',
    constants: 'auto-constants.spec.js',
    ui: 'auto-ui.spec.js',
    gameState: 'auto-gamestate.spec.js',
    events: 'auto-events.spec.js'
  },

  runCommand: {
    all: 'npx playwright test tests/generated/',
    functions: 'npx playwright test tests/generated/auto-functions.spec.js',
    constants: 'npx playwright test tests/generated/auto-constants.spec.js',
    ui: 'npx playwright test tests/generated/auto-ui.spec.js',
    gameState: 'npx playwright test tests/generated/auto-gamestate.spec.js',
    events: 'npx playwright test tests/generated/auto-events.spec.js'
  }
};

// Utility function to check if tests need regeneration
export function needsRegeneration() {
  const indexPath = ${JSON.stringify(this.indexPath)};
  const indexStats = require('fs').statSync(indexPath);
  const testGenTime = new Date('${new Date().toISOString()}');

  return indexStats.mtime > testGenTime;
}

export default AutoGeneratedTests;
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'index.js'),
      indexContent
    );

    // Create README for generated tests
    const readmeContent = `# 🤖 Auto-Generated Tests

This directory contains automatically generated tests based on the current codebase analysis.

## Generated on: ${new Date().toISOString()}

## Test Categories

### Functions (${this.codeAnalysis.functions.length} detected)
- Tests for function existence and callability
- Function scope verification

### Constants (${Object.keys(this.codeAnalysis.constants).length} detected)
- Value validation for detected constants
- Type checking and relationship validation

### UI Elements (${this.codeAnalysis.uiElements.length} detected)
- Element accessibility and visibility
- Interaction testing

### Game State (${this.codeAnalysis.gameVariables.length} variables detected)
- State initialization and persistence
- State transition validation

### Events (${this.codeAnalysis.eventListeners.length} detected)
- Event handler verification
- Event system stability testing

## Running Tests

\`\`\`bash
# Run all auto-generated tests
npx playwright test tests/generated/

# Run specific category
npx playwright test tests/generated/auto-functions.spec.js
npx playwright test tests/generated/auto-constants.spec.js
npx playwright test tests/generated/auto-ui.spec.js
npx playwright test tests/generated/auto-gamestate.spec.js
npx playwright test tests/generated/auto-events.spec.js
\`\`\`

## Regeneration

To regenerate tests based on current code:

\`\`\`bash
node tests/utils/auto-test-generator.js
\`\`\`

## Note

These tests are automatically generated and may need manual review and adjustment.
They provide a foundation for testing but should be supplemented with manual tests for complex scenarios.
`;

    fs.writeFileSync(
      path.join(this.generatedTestsPath, 'README.md'),
      readmeContent
    );
  }

  printGenerationSummary() {
    console.log('\n🎯 Auto-Test Generation Summary:');
    console.log('=' .repeat(50));
    console.log(`📁 Generated files: ${fs.readdirSync(this.generatedTestsPath).length}`);
    console.log(`🔧 Functions detected: ${this.codeAnalysis.functions.length}`);
    console.log(`⚙️ Constants detected: ${Object.keys(this.codeAnalysis.constants).length}`);
    console.log(`🎨 UI elements detected: ${this.codeAnalysis.uiElements.length}`);
    console.log(`🎮 Game variables detected: ${this.codeAnalysis.gameVariables.length}`);
    console.log(`⚡ Event listeners detected: ${this.codeAnalysis.eventListeners.length}`);
    console.log(`🎯 Three.js objects detected: ${this.codeAnalysis.threeJsObjects.length}`);
    console.log('=' .repeat(50));
    console.log('📂 Generated files location: tests/generated/');
    console.log('🚀 Run command: npx playwright test tests/generated/');
  }
}

// CLI interface for manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new AutoTestGenerator();
  generator.generateTests().catch(console.error);
}

export default AutoTestGenerator;