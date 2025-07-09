# 🧪 SubwayRunner Testing Guide

## Overview
This guide outlines the comprehensive testing strategy for SubwayRunner, ensuring quality and reliability before deployment.

## Testing Strategy

### 1. Static Code Analysis
```bash
# Run syntax and structure tests
npm run test
```

**What it tests:**
- Syntax errors (unclosed tags, braces)
- Three.js loading verification
- GameCore system initialization
- Essential game functions presence
- File size and performance metrics

### 2. Browser Automation Tests
```bash
# Run full browser tests
npx playwright test

# Run specific test
npx playwright test --grep "Level progression"

# Run with UI
npx playwright test --ui
```

**What it tests:**
- Game loading and initialization
- Level progression (1→2 at 1000 points)
- Control responsiveness
- Performance (minimum 30 FPS)
- Game over functionality
- Mobile responsiveness
- Error handling

### 3. Cross-Browser Testing
```bash
# Test on all browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Supported browsers:**
- Chrome (Desktop)
- Firefox (Desktop)
- Safari (Desktop)
- Chrome Mobile
- Safari Mobile

### 4. Performance Testing
```bash
# Monitor performance during tests
npx playwright test --reporter=html
```

**Performance metrics:**
- FPS (minimum 30)
- Memory usage
- Loading times
- File size analysis

## Local Testing Workflow

### Quick Test (30 seconds)
```bash
cd SubwayRunner
npm run test
```

### Full Test Suite (2-3 minutes)
```bash
cd SubwayRunner
npm install
npm run test
npx playwright test
```

### Development Testing (continuous)
```bash
# Terminal 1: Live server
npm run serve

# Terminal 2: Watch tests
npm run test:watch
```

## Test Categories

### 🔍 Static Tests
- **Syntax validation**: Checks for JavaScript/HTML errors
- **Structure validation**: Verifies game components exist
- **Performance checks**: File size and complexity analysis
- **Game logic validation**: Ensures core systems are present

### 🌐 Browser Tests
- **Initialization**: Game loads correctly
- **Gameplay**: Controls and mechanics work
- **Level progression**: Transitions function properly
- **Error handling**: Graceful failure modes
- **Performance**: Meets FPS requirements

### 📱 Mobile Tests
- **Responsive design**: Works on mobile screens
- **Touch controls**: Mobile-specific interactions
- **Performance**: Optimized for mobile devices

## Test Results

### Success Criteria
- All static tests pass
- Browser tests pass on Chrome, Firefox, Safari
- Performance >= 30 FPS
- Mobile tests pass on iOS/Android
- No critical errors in console

### Failure Handling
- Tests automatically run before deployment
- Deployment blocked if tests fail
- Detailed error reports generated
- Screenshots captured for debugging

## Debugging Failed Tests

### Static Test Failures
```bash
# Check specific issues
node test-runner.js

# Common fixes:
# - Fix syntax errors in index.html
# - Ensure Three.js is loaded
# - Check GameCore initialization
```

### Browser Test Failures
```bash
# Run with debug info
npx playwright test --debug

# View test report
npx playwright show-report

# Common fixes:
# - Check console errors
# - Verify element selectors
# - Ensure timing is correct
```

## Continuous Integration

### Pre-commit Hook
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
cd SubwayRunner
npm run test
exit_code=$?
if [ $exit_code -ne 0 ]; then
  echo "❌ Tests failed. Commit blocked."
  exit 1
fi
```

### GitHub Actions
- Tests run automatically on push
- Deployment only happens if tests pass
- Test results uploaded as artifacts
- Screenshots saved for failed tests

## Performance Benchmarks

### Target Metrics
- **FPS**: >= 30 (target: 60)
- **Load time**: < 3 seconds
- **File size**: < 1MB
- **Memory usage**: < 100MB

### Monitoring
- FPS tracked during gameplay
- Memory usage monitored
- Network requests logged
- Performance regressions detected

## Test Environment Setup

### Local Development
```bash
# Install dependencies
npm install

# Setup Playwright
npx playwright install

# Start local server
npm run serve
```

### CI/CD Environment
- Ubuntu latest
- Node.js 18
- Playwright browsers
- Automated deployment

## Best Practices

### Writing New Tests
1. **Follow existing patterns**
2. **Test one thing at a time**
3. **Use descriptive test names**
4. **Include error scenarios**
5. **Add performance checks**

### Maintaining Tests
1. **Update tests with new features**
2. **Remove obsolete tests**
3. **Keep tests fast and reliable**
4. **Document test purposes**
5. **Review test coverage**

## Troubleshooting

### Common Issues
- **Port conflicts**: Kill process using port 8001
- **Browser timeouts**: Increase timeout values
- **Test flakiness**: Add proper wait conditions
- **Memory leaks**: Check cleanup functions

### Debug Commands
```bash
# Kill processes on port 8001
lsof -ti:8001 | xargs kill

# Check test output
npx playwright test --reporter=list

# View browser during test
npx playwright test --headed
```

## Integration with Development

### Before Coding
```bash
# Ensure current state is stable
npm run test
```

### During Development
```bash
# Run specific tests
npx playwright test --grep "Level progression"
```

### Before Deployment
```bash
# Full test suite
npm run test && npx playwright test
```

This testing strategy ensures that every deployment is thoroughly validated, reducing bugs and improving user experience.