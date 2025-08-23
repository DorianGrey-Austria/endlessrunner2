# 🤖 SELF-TESTING GUIDE for SubwayRunner

## 🎯 PURPOSE
Enable automated testing to catch errors BEFORE deployment.

---

## 📋 AVAILABLE TEST COMMANDS

### 1. **Static Code Tests** (WORKS!)
```bash
npm run test
```
- ✅ Syntax checking
- ✅ Structure validation
- ✅ Performance metrics
- ✅ Game logic verification

### 2. **Browser Automation Test** (NEW!)
```bash
npm run test:browser
```
- Starts local server automatically
- Opens real browser
- Clicks buttons
- Captures errors
- Takes screenshots

### 3. **Playwright Test Suite**
```bash
npm run test:playwright
```
- Runs all tests in `tests/` folder
- Headless by default
- Good for CI/CD

---

## 🚀 HOW TO USE AUTOMATED TESTING

### Quick Test Before Deployment:
```bash
# 1. Run static tests
npm run test

# 2. Run browser test
npm run test:browser

# 3. If all pass, deploy
git add . && git commit -m "message" && git push
```

### Manual Browser Test:
```bash
# Start server in one terminal
cd SubwayRunner
python3 -m http.server 8001

# Run test in another terminal
node test-live-game.js
```

---

## 🔍 WHAT THE TESTS CHECK

### Static Tests (`npm run test`):
- JavaScript syntax errors
- Missing functions
- Duplicate declarations
- File size limits
- Basic game structure

### Browser Tests (`npm run test:browser`):
- Three.js loads correctly
- Scene creates successfully
- Canvas renders
- Start button works
- Game state changes
- Console errors captured
- Face tracking status

---

## 📸 TEST OUTPUTS

After running `npm run test:browser`:
- `before-click.png` - Game before clicking start
- `after-click.png` - Game after clicking start
- Console output with all errors
- Test summary with pass/fail status

---

## ⚠️ CURRENT LIMITATIONS

### What Claude Code CAN do:
- ✅ Run npm scripts
- ✅ Execute node scripts
- ✅ Read test results
- ✅ Parse error messages

### What Claude Code CANNOT do:
- ❌ Click buttons in browser (needs Playwright)
- ❌ See visual output (needs screenshots)
- ❌ Interact with live website
- ❌ Debug runtime JavaScript in browser

---

## 🎯 BEST PRACTICES

1. **ALWAYS test before deploying:**
   ```bash
   npm run test && npm run test:browser
   ```

2. **Check for these common issues:**
   - Three.js deprecation warnings
   - WebGL errors
   - Undefined functions
   - Console errors

3. **If tests fail:**
   - Check screenshots
   - Read error messages
   - Fix issues
   - Test again

---

## 🔧 TROUBLESHOOTING TEST FAILURES

### "Cannot find module '@playwright/test'"
```bash
npm install @playwright/test
npx playwright install chromium
```

### "Server already running on port 8001"
```bash
# Find and kill process
lsof -i :8001
kill -9 [PID]
```

### "Three.js not loaded"
- Check CDN URL in index.html
- Clear browser cache
- Check network tab

---

## 📊 TEST METRICS TO WATCH

### Good Signs:
- ✅ 0 console errors
- ✅ Three.js loads < 2 seconds
- ✅ Game starts < 3 seconds
- ✅ FPS > 30

### Warning Signs:
- ⚠️ WebGL warnings
- ⚠️ Deprecation notices
- ⚠️ Slow load times
- ⚠️ Low FPS

### Critical Issues:
- ❌ Console errors
- ❌ Game won't start
- ❌ Black screen
- ❌ Crashes

---

## 🚦 DEPLOYMENT CHECKLIST

Before EVERY deployment:

- [ ] Run `npm run test`
- [ ] Run `npm run test:browser`
- [ ] Check screenshots
- [ ] No console errors
- [ ] Game starts properly
- [ ] Face tracking works
- [ ] Commit with version bump
- [ ] Push to GitHub

---

## 💡 PRO TIPS

1. **Add to pre-commit hook:**
   ```bash
   # In .git/hooks/pre-commit
   npm run test || exit 1
   ```

2. **Continuous testing:**
   ```bash
   npm run test:watch
   ```

3. **Debug specific issues:**
   ```javascript
   // In test-live-game.js
   await page.pause(); // Stops for debugging
   ```

---

**REMEMBER:** Tests are your safety net! Never skip them.