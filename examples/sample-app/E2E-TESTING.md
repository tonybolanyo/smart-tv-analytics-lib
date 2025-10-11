# End-to-End Testing Guide

This guide covers how to use, run, and extend the Playwright end-to-end tests for the Smart TV Analytics sample application.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing New Tests](#writing-new-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The E2E tests are built using [Playwright](https://playwright.dev/), a modern end-to-end testing framework that provides:

- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-waiting for elements
- Built-in test reports and traces
- Screenshot and video capture on failures
- Network interception and mocking

### Test Coverage

The test suite covers the following critical paths:

1. **Home Page** (`e2e/home.spec.ts`)
   - Page load and display
   - Video catalog rendering
   - Video card information
   - Navigation to video pages
   - Accessibility (focus management)

2. **Video Player** (`e2e/video-player.spec.ts`)
   - Player UI rendering
   - Play/pause functionality
   - Seek controls
   - Video completion
   - Time display

3. **Navigation Flow** (`e2e/navigation.spec.ts`)
   - Complete user journeys
   - Page state management
   - Browser navigation (back/forward)
   - Multi-page workflows

4. **Analytics Integration** (`e2e/analytics.spec.ts`)
   - Event tracking verification
   - User interaction analytics
   - Session tracking
   - Network request monitoring

## Setup

### Prerequisites

- Node.js 14 or higher
- npm 6 or higher

### Installation

1. **Install dependencies** (if not already done):

```bash
cd examples/sample-app
npm install
```

2. **Install Playwright browsers**:

```bash
npx playwright install chromium
```

For additional browsers:

```bash
npx playwright install  # Installs all browsers
```

### Build the Library

Before running E2E tests, ensure the main library is built:

```bash
# From the repository root
cd /path/to/smart-tv-analytics-lib
npm install
npm run build
```

Then install dependencies in the sample app:

```bash
cd examples/sample-app
npm install
```

## Running Tests

### Run All Tests

```bash
npm run e2e
```

This runs all tests in headless mode (no browser UI).

### Run Tests with UI

```bash
npm run e2e:headed
```

Opens a browser window so you can see tests executing.

### Interactive UI Mode

```bash
npm run e2e:ui
```

Opens Playwright's interactive UI for running and debugging tests.

### Debug Mode

```bash
npm run e2e:debug
```

Runs tests in debug mode with Playwright Inspector.

### Run Specific Test File

```bash
npx playwright test e2e/home.spec.ts
```

### Run Tests Matching a Pattern

```bash
npx playwright test --grep "video player"
```

### View Test Report

After running tests, view the HTML report:

```bash
npm run e2e:report
```

## Test Structure

### Directory Layout

```
examples/sample-app/
├── e2e/                          # E2E test directory
│   ├── home.spec.ts              # Home page tests
│   ├── video-player.spec.ts      # Video player tests
│   ├── navigation.spec.ts        # Navigation flow tests
│   └── analytics.spec.ts         # Analytics integration tests
├── playwright.config.ts          # Playwright configuration
├── playwright-report/            # Generated test reports
└── test-results/                 # Test artifacts (screenshots, videos)
```

### Configuration

The `playwright.config.ts` file configures:

- Test directory location
- Timeouts
- Retries
- Reporters
- Browser settings
- Web server (auto-starts Angular dev server)

### Test Data Attributes

Components use `data-testid` attributes for reliable element selection:

**Home Component:**
- `home-page` - Main container
- `home-title` - Page title
- `video-grid` - Video catalog grid
- `video-card-{id}` - Individual video cards
- `video-title-{id}` - Video titles
- `video-duration-{id}` - Video durations

**Video Component:**
- `video-page` - Main container
- `video-title` - Video title
- `video-player` - Player container
- `player-icon-paused` - Paused state icon
- `player-icon-playing` - Playing state icon
- `play-button` - Play control
- `pause-button` - Pause control
- `seek-forward-button` - Seek forward (+10s)
- `seek-backward-button` - Seek backward (-10s)
- `complete-button` - Complete video
- `back-button` - Back navigation
- `video-time` - Time display

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code that runs before each test
    await page.goto('/');
  });

  test('should do something specific', async ({ page }) => {
    // Test code
    const element = page.getByTestId('my-element');
    await expect(element).toBeVisible();
  });
});
```

### Example: Testing a New Feature

Let's say you add a search feature to the home page:

1. **Add data-testid to the component:**

```html
<!-- home.component.html -->
<input 
  type="text" 
  data-testid="search-input"
  [(ngModel)]="searchQuery"
  placeholder="Buscar videos..."
/>
<button data-testid="search-button" (click)="search()">
  Buscar
</button>
```

2. **Create a test:**

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should filter videos by search query', async ({ page }) => {
    // Type in search box
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('Video 1');

    // Click search button
    const searchButton = page.getByTestId('search-button');
    await searchButton.click();

    // Verify results
    await expect(page.getByTestId('video-card-1')).toBeVisible();
    await expect(page.getByTestId('video-card-2')).not.toBeVisible();
  });
});
```

### Common Patterns

#### Waiting for Navigation

```typescript
await page.getByTestId('link').click();
await page.waitForURL('/expected-path');
```

#### Checking Element State

```typescript
const button = page.getByTestId('my-button');
await expect(button).toBeVisible();
await expect(button).toBeEnabled();
await expect(button).toHaveText('Expected Text');
```

#### Interacting with Forms

```typescript
await page.getByTestId('input-field').fill('value');
await page.getByTestId('checkbox').check();
await page.getByTestId('select').selectOption('option-value');
```

#### Network Mocking

```typescript
await page.route('**/api/analytics', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true })
  });
});
```

#### Taking Screenshots

```typescript
await page.screenshot({ path: 'screenshot.png' });
await page.getByTestId('element').screenshot({ path: 'element.png' });
```

## Best Practices

### 1. Use data-testid Attributes

Always use `data-testid` for selecting elements instead of CSS classes or XPath:

```typescript
// Good
page.getByTestId('submit-button')

// Avoid
page.locator('.btn.btn-primary.submit')
```

### 2. Write Descriptive Test Names

```typescript
// Good
test('should display error message when form is submitted with empty fields', ...)

// Avoid
test('test form validation', ...)
```

### 3. Keep Tests Independent

Each test should be able to run independently:

```typescript
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto('/');
});
```

### 4. Use Assertions Liberally

Verify expected behavior explicitly:

```typescript
await expect(page.getByTestId('video-page')).toBeVisible();
await expect(page).toHaveURL(/\/video\/1/);
```

### 5. Handle Async Properly

Playwright auto-waits, but be explicit when needed:

```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="loaded"]');
```

### 6. Group Related Tests

```typescript
test.describe('Video Player Controls', () => {
  test.describe('Play/Pause', () => {
    // Play/pause tests
  });
  
  test.describe('Seek Controls', () => {
    // Seek tests
  });
});
```

### 7. Smart TV Specific Testing

For Smart TV applications, test keyboard navigation:

```typescript
test('should navigate with arrow keys', async ({ page }) => {
  await page.goto('/');
  
  const firstCard = page.getByTestId('video-card-1');
  await firstCard.focus();
  
  // Simulate TV remote arrow key
  await page.keyboard.press('ArrowRight');
  
  const secondCard = page.getByTestId('video-card-2');
  await expect(secondCard).toBeFocused();
});
```

## Troubleshooting

### Tests Fail to Start

**Issue:** `Error: browserType.launch: Executable doesn't exist`

**Solution:** Install browsers:
```bash
npx playwright install
```

### Port Already in Use

**Issue:** `Error: listen EADDRINUSE: address already in use :::4200`

**Solution:** Kill the process using port 4200:
```bash
# Linux/Mac
lsof -ti:4200 | xargs kill -9

# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Tests Timeout

**Issue:** Tests timeout waiting for elements

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

### Flaky Tests

**Issue:** Tests pass sometimes and fail other times

**Solutions:**
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use auto-retries: Configure `retries: 2` in config
- Check for race conditions in component code

### Debugging Tips

1. **Run in headed mode:**
   ```bash
   npm run e2e:headed
   ```

2. **Use debug mode:**
   ```bash
   npm run e2e:debug
   ```

3. **Add console logs:**
   ```typescript
   test('my test', async ({ page }) => {
     console.log(await page.title());
     console.log(await page.content());
   });
   ```

4. **Pause execution:**
   ```typescript
   await page.pause(); // Opens Playwright Inspector
   ```

5. **View trace files:**
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd examples/sample-app && npm install
      
      - name: Install Playwright browsers
        run: cd examples/sample-app && npx playwright install --with-deps chromium
      
      - name: Build library
        run: npm run build
      
      - name: Run E2E tests
        run: cd examples/sample-app && npm run e2e
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: examples/sample-app/playwright-report/
```

## Coverage Reports

Playwright generates detailed test reports automatically:

- **HTML Report:** Visual report with test results, screenshots, and videos
- **JSON Report:** Machine-readable results for CI/CD integration

View the HTML report:
```bash
npm run e2e:report
```

The report shows:
- Test execution time
- Pass/fail status
- Error messages and stack traces
- Screenshots of failures
- Video recordings (if enabled)
- Trace files for debugging

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Smart TV Analytics Library](../../README.md)
- [Sample App README](./README.md)

## Support

For issues or questions:
- Open an issue on GitHub
- Check the Playwright documentation
- Review existing test examples in the `e2e/` directory
