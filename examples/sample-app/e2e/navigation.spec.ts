import { test, expect } from '@playwright/test';

/**
 * E2E tests for Navigation flow
 * Tests the complete user journey through the application
 */
test.describe('Navigation Flow', () => {
  test('should complete full user journey: home -> video -> back -> another video', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    
    // Verify home page loaded
    const homePage = page.getByTestId('home-page');
    await expect(homePage).toBeVisible();

    // Click on first video
    const videoCard1 = page.getByTestId('video-card-1');
    await expect(videoCard1).toBeVisible();
    await videoCard1.click();

    // Verify we're on video page
    await page.waitForURL(/\/video\/1/);
    const videoPage = page.getByTestId('video-page');
    await expect(videoPage).toBeVisible();
    
    // Verify video title
    const videoTitle = page.getByTestId('video-title');
    await expect(videoTitle).toContainText('Video de Ejemplo 1');

    // Interact with player - play video
    const playButton = page.getByTestId('play-button');
    await playButton.click();
    await expect(page.getByTestId('player-icon-playing')).toBeVisible();

    // Pause video
    const pauseButton = page.getByTestId('pause-button');
    await pauseButton.click();
    await expect(page.getByTestId('player-icon-paused')).toBeVisible();

    // Go back to home
    const backButton = page.getByTestId('back-button');
    await backButton.click();

    // Verify we're back on home page
    await page.waitForURL('/');
    await expect(homePage).toBeVisible();

    // Click on a different video
    const videoCard2 = page.getByTestId('video-card-2');
    await videoCard2.click();

    // Verify we're on the second video page
    await page.waitForURL(/\/video\/2/);
    await expect(videoPage).toBeVisible();
    
    const videoTitle2 = page.getByTestId('video-title');
    await expect(videoTitle2).toContainText('Video de Ejemplo 2');
  });

  test('should maintain correct page state after navigation', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    
    // Navigate to video
    await page.getByTestId('video-card-1').click();
    await page.waitForURL(/\/video\/1/);
    
    // Start playing
    await page.getByTestId('play-button').click();
    
    // Go back (this should trigger onPause in component)
    await page.getByTestId('back-button').click();
    await page.waitForURL('/');
    
    // Navigate to video again - should be in paused state initially
    await page.getByTestId('video-card-1').click();
    await page.waitForURL(/\/video\/1/);
    
    // Should show paused icon
    await expect(page.getByTestId('player-icon-paused')).toBeVisible();
  });

  test('should navigate through multiple videos using URL', async ({ page }) => {
    // Direct navigation to video 1
    await page.goto('/video/1');
    await expect(page.getByTestId('video-title')).toContainText('Video de Ejemplo 1');

    // Direct navigation to video 2
    await page.goto('/video/2');
    await expect(page.getByTestId('video-title')).toContainText('Video de Ejemplo 2');

    // Direct navigation to video 3
    await page.goto('/video/3');
    await expect(page.getByTestId('video-title')).toContainText('Video de Ejemplo 3');

    // Navigate back to home
    await page.goto('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('should handle browser back button correctly', async ({ page }) => {
    // Start at home
    await page.goto('/');
    
    // Navigate to video
    await page.getByTestId('video-card-1').click();
    await page.waitForURL(/\/video\/1/);
    
    // Use browser back button
    await page.goBack();
    await page.waitForURL('/');
    
    // Should be back on home page
    await expect(page.getByTestId('home-page')).toBeVisible();
    
    // Use browser forward button
    await page.goForward();
    await page.waitForURL(/\/video\/1/);
    
    // Should be back on video page
    await expect(page.getByTestId('video-page')).toBeVisible();
  });
});
