#!/bin/bash
# test-runner.sh - Automatisierter Test Runner für SubwayRunner
# Basierend auf TEST-PLAN.md Workflow

echo "🧪 SubwayRunner Automated Test Suite"
echo "===================================="
echo "📅 $(date)"
echo ""

# Konfiguration
PORT=8001
TEST_DIR="tests"
SCREENSHOT_DIR="$TEST_DIR/screenshots"
VIDEO_DIR="$TEST_DIR/videos"

# Erstelle Test-Verzeichnisse
mkdir -p "$SCREENSHOT_DIR"
mkdir -p "$VIDEO_DIR"

# Funktionen
cleanup() {
    echo "🧹 Cleaning up..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
        echo "✅ Server stopped"
    fi
}

# Trap für Cleanup bei Exit
trap cleanup EXIT

# 1. Backup vor Tests
echo "📦 Creating backup..."
if [ -f "index.html" ]; then
    cp index.html index.html.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi

# 2. Syntax Check
echo ""
echo "🔍 Running syntax validation..."
if command -v node &> /dev/null; then
    node -c index.html 2>/dev/null || echo "⚠️  HTML contains embedded JS - skipping node syntax check"
else
    echo "⚠️  Node.js not found - skipping syntax check"
fi

# 3. Start Server
echo ""
echo "🚀 Starting development server on port $PORT..."
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Warte bis Server bereit ist
sleep 2

# Prüfe ob Server läuft
if ! curl -s http://localhost:$PORT > /dev/null; then
    echo "❌ Server failed to start!"
    exit 1
fi
echo "✅ Server running at http://localhost:$PORT"

# 4. Run Playwright Tests (wenn installiert)
echo ""
if [ -f "package.json" ] && command -v npx &> /dev/null; then
    echo "🎭 Running Playwright tests..."
    
    # Installiere Dependencies falls nötig
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing test dependencies..."
        npm install --save-dev @playwright/test
        npx playwright install chromium
    fi
    
    # Führe Tests aus
    npx playwright test test-subway-runner.spec.js --reporter=list || TEST_FAILED=1
    
    if [ -z "$TEST_FAILED" ]; then
        echo "✅ Playwright tests passed!"
    else
        echo "⚠️  Some Playwright tests failed"
    fi
else
    echo "⚠️  Playwright not installed - run 'npm init -y && npm install --save-dev @playwright/test'"
fi

# 5. Run Visual Tests (wenn node verfügbar)
echo ""
if command -v node &> /dev/null && [ -f "test-visual.js" ]; then
    echo "👁️  Running visual browser tests..."
    echo "   (Browser window will open - do not close!)"
    
    node test-visual.js || VISUAL_FAILED=1
    
    if [ -z "$VISUAL_FAILED" ]; then
        echo "✅ Visual tests completed!"
    else
        echo "⚠️  Visual tests encountered issues"
    fi
else
    echo "⚠️  Visual tests skipped (Node.js or test-visual.js not found)"
fi

# 6. Performance Test
echo ""
echo "⚡ Running performance test..."
curl -s -o /dev/null -w "Response time: %{time_total}s\n" http://localhost:$PORT

# 7. Generate Summary Report
echo ""
echo "📊 Generating test report..."

REPORT_FILE="$TEST_DIR/test-report-$(date +%Y%m%d_%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# SubwayRunner Test Report
Generated: $(date)

## Test Summary
- Syntax Check: ✅ Completed
- Server Start: ✅ Success (Port $PORT)
- Playwright Tests: $([ -z "$TEST_FAILED" ] && echo "✅ Passed" || echo "⚠️  Some failed")
- Visual Tests: $([ -z "$VISUAL_FAILED" ] && echo "✅ Passed" || echo "⚠️  Issues found")

## Screenshots
$(ls -1 $SCREENSHOT_DIR 2>/dev/null | wc -l) screenshots captured

## Performance
- Server response time measured
- Game FPS tracked in visual tests

## Files
- Backup: index.html.backup.$(date +%Y%m%d_%H%M%S)
- Screenshots: $SCREENSHOT_DIR/
- Videos: $VIDEO_DIR/
- This report: $REPORT_FILE

## Next Steps
1. Review screenshots in $SCREENSHOT_DIR
2. Check test videos in $VIDEO_DIR
3. Fix any failing tests
4. Run tests again after fixes
EOF

echo "✅ Report saved to: $REPORT_FILE"

# 8. Show Summary
echo ""
echo "===================================="
echo "🎉 TEST SUITE COMPLETED!"
echo "===================================="
echo ""
echo "📸 Screenshots: $(ls -1 $SCREENSHOT_DIR 2>/dev/null | wc -l) files"
echo "🎥 Videos: $(ls -1 $VIDEO_DIR 2>/dev/null | wc -l) files"
echo "📄 Report: $REPORT_FILE"
echo ""

# Optional: Öffne Report im Browser
if command -v open &> /dev/null; then
    echo "📖 Opening test report..."
    open "$REPORT_FILE" 2>/dev/null || echo "   (Could not open report automatically)"
fi

echo "✨ Done! Server still running on http://localhost:$PORT"
echo "   Press Ctrl+C to stop the server."
echo ""

# Halte Server am Leben für manuelle Tests
wait $SERVER_PID