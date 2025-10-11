# E2E Tests

This directory contains end-to-end tests for the Smart TV Analytics sample application using Playwright.

## Test Files

- **`home.spec.ts`** - Tests for the home page and video catalog
- **`video-player.spec.ts`** - Tests for the video player functionality
- **`navigation.spec.ts`** - Tests for navigation flows and user journeys
- **`analytics.spec.ts`** - Tests for analytics event tracking

## Running Tests

From the `examples/sample-app` directory:

```bash
# Run all tests
npm run e2e

# Run with UI
npm run e2e:headed

# Run specific test file
npx playwright test e2e/home.spec.ts

# Debug tests
npm run e2e:debug
```

## Test Structure

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

## Writing New Tests

1. Create a new `.spec.ts` file in this directory
2. Use `data-testid` attributes to select elements
3. Follow the existing patterns in other test files
4. Run tests to verify they pass

For detailed guidance, see [E2E-TESTING.md](../E2E-TESTING.md)

## Test Data IDs

Components use the following `data-testid` attributes:

### Home Page
- `home-page` - Main container
- `video-grid` - Video grid
- `video-card-{id}` - Video cards
- `video-title-{id}` - Video titles

### Video Page
- `video-page` - Main container
- `play-button` - Play button
- `pause-button` - Pause button
- `seek-forward-button` - Seek forward
- `seek-backward-button` - Seek backward
- `back-button` - Back to home

See component HTML files for complete list of test IDs.
