import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Home Page
 * Tests the video catalog page functionality
 */
test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display the home page with title and welcome message', async ({ page }) => {
    // Check if the page title is displayed
    const title = page.getByTestId('home-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Catálogo de Videos');

    // Check if the welcome message is displayed
    const welcome = page.getByTestId('home-welcome');
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText('Bienvenido a la aplicación de ejemplo');
  });

  test('should display video grid with multiple videos', async ({ page }) => {
    // Check if the video grid is present
    const videoGrid = page.getByTestId('video-grid');
    await expect(videoGrid).toBeVisible();

    // Check if video cards are displayed
    const videoCard1 = page.getByTestId('video-card-1');
    const videoCard2 = page.getByTestId('video-card-2');
    const videoCard3 = page.getByTestId('video-card-3');
    
    await expect(videoCard1).toBeVisible();
    await expect(videoCard2).toBeVisible();
    await expect(videoCard3).toBeVisible();
  });

  test('should display video information correctly', async ({ page }) => {
    // Check video titles
    const videoTitle1 = page.getByTestId('video-title-1');
    await expect(videoTitle1).toBeVisible();
    await expect(videoTitle1).toContainText('Video de Ejemplo 1');

    // Check video duration
    const videoDuration1 = page.getByTestId('video-duration-1');
    await expect(videoDuration1).toBeVisible();
  });

  test('should navigate to video page when clicking a video card', async ({ page }) => {
    // Click on the first video card
    const videoCard1 = page.getByTestId('video-card-1');
    await videoCard1.click();

    // Wait for navigation and check URL
    await expect(page).toHaveURL(/\/video\/1/);

    // Check if we're on the video page
    const videoPage = page.getByTestId('video-page');
    await expect(videoPage).toBeVisible();
  });

  test('should have focusable video cards for accessibility', async ({ page }) => {
    // Check if video card can receive focus (important for Smart TV navigation)
    const videoCard1 = page.getByTestId('video-card-1');
    await videoCard1.focus();
    
    // Verify the element is focused (will be useful for keyboard navigation)
    await expect(videoCard1).toBeFocused();
  });
});
