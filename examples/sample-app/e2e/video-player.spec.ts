import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Video Player Page
 * Tests video player functionality and controls
 */
test.describe('Video Player Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page first
    await page.goto('/');
    
    // Click on the first video to go to the video page
    const videoCard1 = page.getByTestId('video-card-1');
    await videoCard1.click();
    
    // Wait for the video page to load
    await page.waitForURL(/\/video\/1/);
  });

  test('should display video player page with correct title', async ({ page }) => {
    // Check if video page is displayed
    const videoPage = page.getByTestId('video-page');
    await expect(videoPage).toBeVisible();

    // Check if video title is displayed
    const videoTitle = page.getByTestId('video-title');
    await expect(videoTitle).toBeVisible();
    await expect(videoTitle).toContainText('Video de Ejemplo 1');
  });

  test('should display all player controls', async ({ page }) => {
    // Check if all control buttons are present
    const playButton = page.getByTestId('play-button');
    const pauseButton = page.getByTestId('pause-button');
    const seekBackwardButton = page.getByTestId('seek-backward-button');
    const seekForwardButton = page.getByTestId('seek-forward-button');
    const completeButton = page.getByTestId('complete-button');
    const backButton = page.getByTestId('back-button');

    await expect(playButton).toBeVisible();
    await expect(pauseButton).toBeVisible();
    await expect(seekBackwardButton).toBeVisible();
    await expect(seekForwardButton).toBeVisible();
    await expect(completeButton).toBeVisible();
    await expect(backButton).toBeVisible();
  });

  test('should show paused icon initially', async ({ page }) => {
    // Video should be paused initially
    const pausedIcon = page.getByTestId('player-icon-paused');
    await expect(pausedIcon).toBeVisible();
  });

  test('should play video when play button is clicked', async ({ page }) => {
    // Click play button
    const playButton = page.getByTestId('play-button');
    await playButton.click();

    // Check if playing icon is now visible
    const playingIcon = page.getByTestId('player-icon-playing');
    await expect(playingIcon).toBeVisible();

    // Check if play button is disabled
    await expect(playButton).toBeDisabled();

    // Check if pause button is enabled
    const pauseButton = page.getByTestId('pause-button');
    await expect(pauseButton).toBeEnabled();
  });

  test('should pause video when pause button is clicked', async ({ page }) => {
    // First play the video
    const playButton = page.getByTestId('play-button');
    await playButton.click();

    // Wait for playing state
    await expect(page.getByTestId('player-icon-playing')).toBeVisible();

    // Then pause it
    const pauseButton = page.getByTestId('pause-button');
    await pauseButton.click();

    // Check if paused icon is now visible
    const pausedIcon = page.getByTestId('player-icon-paused');
    await expect(pausedIcon).toBeVisible();

    // Check if pause button is disabled
    await expect(pauseButton).toBeDisabled();

    // Check if play button is enabled
    await expect(playButton).toBeEnabled();
  });

  test('should allow seeking forward and backward', async ({ page }) => {
    // Click seek forward button
    const seekForwardButton = page.getByTestId('seek-forward-button');
    await seekForwardButton.click();

    // Click seek backward button
    const seekBackwardButton = page.getByTestId('seek-backward-button');
    await seekBackwardButton.click();

    // No errors should occur - we're just testing the buttons work
    // The actual time change would require inspecting component state
  });

  test('should navigate back to home when back button is clicked', async ({ page }) => {
    // Click back button
    const backButton = page.getByTestId('back-button');
    await backButton.click();

    // Wait for navigation
    await page.waitForURL('/');

    // Check if we're back on the home page
    const homePage = page.getByTestId('home-page');
    await expect(homePage).toBeVisible();
  });

  test('should display video time information', async ({ page }) => {
    // Check if video time is displayed
    const videoTime = page.getByTestId('video-time');
    await expect(videoTime).toBeVisible();
    
    // Should show time in format "MM:SS / MM:SS"
    await expect(videoTime).toContainText('/');
  });

  test('should handle complete button click', async ({ page }) => {
    // Click complete button
    const completeButton = page.getByTestId('complete-button');
    await completeButton.click();

    // The complete button should trigger the complete event
    // We can verify by checking if video is paused (based on component logic)
    const pausedIcon = page.getByTestId('player-icon-paused');
    await expect(pausedIcon).toBeVisible();
  });
});
