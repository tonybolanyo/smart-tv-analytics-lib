#!/bin/bash

# Script to run E2E tests for the Smart TV Analytics sample app
# This script ensures the environment is properly set up before running tests

set -e

echo "=== Smart TV Analytics E2E Test Runner ==="
echo ""

# Navigate to sample app directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SAMPLE_APP_DIR="$SCRIPT_DIR"

echo "1. Checking environment..."
cd "$SAMPLE_APP_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo "   ✓ Dependencies already installed"
fi

# Check if Playwright browsers are installed
echo ""
echo "2. Setting up Playwright browsers..."
if npx playwright install chromium --dry-run 2>&1 | grep -q "browser is already installed"; then
    echo "   ✓ Chromium browser already installed"
else
    echo "   Installing Chromium browser..."
    npx playwright install chromium 2>/dev/null || true
fi

echo ""
echo "3. Checking if library is built..."
if [ ! -d "../../dist" ]; then
    echo "   Building library..."
    cd ../..
    npm run build
    cd "$SAMPLE_APP_DIR"
else
    echo "   ✓ Library already built"
fi

echo ""
echo "4. Running E2E tests..."
echo ""

# Run the tests
npx playwright test "$@"

echo ""
echo "=== Test run complete ==="
echo ""
echo "To view the HTML report, run: npm run e2e:report"
