#!/bin/bash
# verify-deployment.sh - Senior Developer Deployment Verification
# CRITICAL: This script MUST pass before any deployment is considered successful

echo "🔍 DEPLOYMENT VERIFICATION STARTING..."
echo "================================================"

# Configuration
URL="https://ki-revolution.at/"
EXPECTED_VERSION="MONOLITHIC-V3.12.0-NUCLEAR-STABLE"

# Download the deployed version
echo "📥 Downloading deployed version..."
DEPLOYED_CONTENT=$(curl -s "$URL" | head -500)

# Check 1: Module references
echo -n "🔎 Checking for module references... "
if echo "$DEPLOYED_CONTENT" | grep -q "ModuleLoader\|GameEngine\|import \|export \|src/core\|src/modules"; then
    echo "❌ FAILED!"
    echo "   ERROR: Module references found in production!"
    echo "   Found:"
    echo "$DEPLOYED_CONTENT" | grep -n "ModuleLoader\|GameEngine\|import \|export \|src/core\|src/modules" | head -5
    exit 1
else
    echo "✅ PASSED"
fi

# Check 2: Version tag
echo -n "🔎 Checking for correct version tag... "
if echo "$DEPLOYED_CONTENT" | grep -q "$EXPECTED_VERSION"; then
    echo "✅ PASSED"
else
    echo "❌ FAILED!"
    echo "   ERROR: Expected version $EXPECTED_VERSION not found!"
    exit 1
fi

# Check 3: Monolithic indicators
echo -n "🔎 Checking for monolithic structure... "
if echo "$DEPLOYED_CONTENT" | grep -q "UniversalCollectibleManager.*function"; then
    echo "✅ PASSED"
else
    echo "❌ FAILED!"
    echo "   ERROR: Core game functions not found inline!"
    exit 1
fi

# Check 4: No external JS files
echo -n "🔎 Checking for external JS references... "
EXTERNAL_JS=$(echo "$DEPLOYED_CONTENT" | grep -E '<script.*src=.*\.js' | grep -v "three.min.js\|supabase-js")
if [ -z "$EXTERNAL_JS" ]; then
    echo "✅ PASSED"
else
    echo "❌ FAILED!"
    echo "   ERROR: External JS files detected:"
    echo "$EXTERNAL_JS"
    exit 1
fi

# Check 5: File size sanity check
echo -n "🔎 Checking file size... "
CONTENT_LENGTH=$(echo "$DEPLOYED_CONTENT" | wc -c)
if [ $CONTENT_LENGTH -gt 100000 ]; then
    echo "✅ PASSED (Size: $CONTENT_LENGTH bytes)"
else
    echo "❌ FAILED!"
    echo "   ERROR: File too small ($CONTENT_LENGTH bytes) - likely wrong version!"
    exit 1
fi

echo "================================================"
echo "✅ ALL CHECKS PASSED - DEPLOYMENT VERIFIED!"
echo "🔒 Version: $EXPECTED_VERSION"
echo "🌐 URL: $URL"
echo "================================================"

exit 0