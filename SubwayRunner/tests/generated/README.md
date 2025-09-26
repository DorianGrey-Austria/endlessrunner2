# 🤖 Auto-Generated Tests

This directory contains automatically generated tests based on the current codebase analysis.

## Generated on: 2025-09-26T15:11:52.780Z

## Test Categories

### Functions (93 detected)
- Tests for function existence and callability
- Function scope verification

### Constants (10 detected)
- Value validation for detected constants
- Type checking and relationship validation

### UI Elements (39 detected)
- Element accessibility and visibility
- Interaction testing

### Game State (8 variables detected)
- State initialization and persistence
- State transition validation

### Events (10 detected)
- Event handler verification
- Event system stability testing

## Running Tests

```bash
# Run all auto-generated tests
npx playwright test tests/generated/

# Run specific category
npx playwright test tests/generated/auto-functions.spec.js
npx playwright test tests/generated/auto-constants.spec.js
npx playwright test tests/generated/auto-ui.spec.js
npx playwright test tests/generated/auto-gamestate.spec.js
npx playwright test tests/generated/auto-events.spec.js
```

## Regeneration

To regenerate tests based on current code:

```bash
node tests/utils/auto-test-generator.js
```

## Note

These tests are automatically generated and may need manual review and adjustment.
They provide a foundation for testing but should be supplemented with manual tests for complex scenarios.
