# E2E Testing Quick Reference

## Quick Commands

```bash
# Run all tests (headless)
npm run e2e

# Run with visible browser
npm run e2e:headed

# Interactive UI mode
npm run e2e:ui

# Debug specific test
npm run e2e:debug

# View test report
npm run e2e:report

# Run specific test file
npx playwright test e2e/home.spec.ts

# Run tests matching pattern
npx playwright test --grep "video player"

# List all tests
npx playwright test --list
```

## Common Test Selectors

### Home Page
```typescript
page.getByTestId('home-page')           // Main container
page.getByTestId('video-grid')          // Video grid
page.getByTestId('video-card-1')        // Video card by ID
page.getByTestId('video-title-1')       // Video title
```

### Video Page
```typescript
page.getByTestId('video-page')          // Main container
page.getByTestId('play-button')         // Play button
page.getByTestId('pause-button')        // Pause button
page.getByTestId('seek-forward-button') // Seek +10s
page.getByTestId('seek-backward-button')// Seek -10s
page.getByTestId('back-button')         // Back to home
page.getByTestId('video-time')          // Time display
```

## Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.getByTestId('my-element');
    
    // Act
    await element.click();
    
    // Assert
    await expect(element).toBeVisible();
  });
});
```

## Common Assertions

```typescript
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toBeFocused()
await expect(element).toHaveText('text')
await expect(element).toContainText('text')
await expect(page).toHaveURL('/expected-path')
await expect(page).toHaveTitle('Title')
```

## Debugging Tips

1. **Run in headed mode**: See what's happening
   ```bash
   npm run e2e:headed
   ```

2. **Use Playwright Inspector**:
   ```bash
   npm run e2e:debug
   ```

3. **Add pause in test**:
   ```typescript
   await page.pause(); // Opens inspector
   ```

4. **Take screenshot**:
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

5. **Check page content**:
   ```typescript
   console.log(await page.content());
   ```

## Adding New Tests

1. Create file in `e2e/` directory: `my-feature.spec.ts`
2. Add `data-testid` to HTML elements
3. Write tests following existing patterns
4. Run tests: `npx playwright test e2e/my-feature.spec.ts`
5. Verify all pass
6. Commit changes

## Test Structure

```
examples/sample-app/
├── e2e/
│   ├── home.spec.ts              # Home page tests
│   ├── video-player.spec.ts      # Video player tests
│   ├── navigation.spec.ts        # Navigation tests
│   └── analytics.spec.ts         # Analytics tests
├── playwright.config.ts          # Configuration
└── playwright-report/            # Generated reports
```

## Documentation

- **Full Guide**: [E2E-TESTING.md](./E2E-TESTING.md)
- **Coverage Report**: [E2E-TEST-COVERAGE.md](./E2E-TEST-COVERAGE.md)
- **Directory README**: [e2e/README.md](./e2e/README.md)

## CI/CD

Tests run automatically on:
- Push to main/develop
- Pull requests
- Via GitHub Actions

See: `.github/workflows/e2e-tests.yml`

## Troubleshooting

**Browser not installed?**
```bash
npx playwright install chromium
```

**Port 4200 in use?**
```bash
# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

**Tests timing out?**
- Increase timeout in `playwright.config.ts`
- Check network speed
- Verify app builds correctly

**Need help?**
- Check [E2E-TESTING.md](./E2E-TESTING.md) troubleshooting section
- Review Playwright docs: https://playwright.dev
- Check test examples in `e2e/` directory
