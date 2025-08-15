import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register-secure');
  });

  test('should complete multi-step registration successfully', async ({ page }) => {
    // Step 1: Personal Information
    await page.fill('[name="fullName"]', 'John Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');

    // Verify password strength indicator
    await expect(page.locator('.password-strength')).toContainText('Strong');

    // Click Next to go to Step 2
    await page.click('button:has-text("Next")');

    // Step 2: Journey & Role Selection
    await expect(page.locator('h2')).toContainText('Your Journey');

    // Select user type
    await page.click('[data-testid="user-type-aspiring_entrepreneur"]');

    // Select business stage
    await page.click('[data-testid="business-stage-just_an_idea"]');

    // Click Next to go to Step 3
    await page.click('button:has-text("Next")');

    // Step 3: Products & Business
    await expect(page.locator('h2')).toContainText('Your Products');

    // Select product category
    await page.click('[data-testid="category-fashion"]');

    // Enter business name
    await page.fill('[name="businessName"]', "John's Fashion Store");

    // Complete registration
    await page.click('button:has-text("Create Account")');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should validate email format and reject disposable emails', async ({ page }) => {
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');

    await page.click('button:has-text("Next")');

    // Should show email validation error
    await expect(page.locator('.error-message')).toContainText('valid email');

    // Try disposable email
    await page.fill('[name="email"]', 'test@10minutemail.com');
    await page.click('button:has-text("Next")');

    // Should reject disposable email
    await expect(page.locator('.error-message')).toContainText('disposable');
  });

  test('should enforce password strength requirements', async ({ page }) => {
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');

    // Test weak password
    await page.fill('[name="password"]', 'weak');
    await expect(page.locator('.password-strength')).toContainText('Weak');

    // Test medium password
    await page.fill('[name="password"]', 'MediumPass123');
    await expect(page.locator('.password-strength')).toContainText('Medium');

    // Test strong password
    await page.fill('[name="password"]', 'StrongPass123!');
    await expect(page.locator('.password-strength')).toContainText('Strong');
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Attempt multiple rapid registrations to trigger rate limit
    for (let i = 0; i < 6; i++) {
      await page.fill('[name="fullName"]', `User ${i}`);
      await page.fill('[name="email"]', `user${i}@example.com`);
      await page.fill('[name="password"]', 'SecurePass123!');
      await page.fill('[name="confirmPassword"]', 'SecurePass123!');
      await page.click('button:has-text("Next")');

      if (i >= 5) {
        // Should show rate limit error on 6th attempt
        await expect(page.locator('.error-message')).toContainText('rate limit');
      }
    }
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify responsive design
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Test touch interactions
    await page.fill('[name="fullName"]', 'Mobile User');
    await page.fill('[name="email"]', 'mobile@example.com');
    await page.fill('[name="password"]', 'MobilePass123!');
    await page.fill('[name="confirmPassword"]', 'MobilePass123!');

    // Tap Next button
    await page.tap('button:has-text("Next")');

    // Verify step 2 loads correctly on mobile
    await expect(page.locator('h2')).toContainText('Your Journey');
  });

  test('should maintain form state during navigation', async ({ page }) => {
    // Fill Step 1
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button:has-text("Next")');

    // Fill Step 2
    await page.click('[data-testid="user-type-small_business_owner"]');
    await page.click('[data-testid="business-stage-have_products"]');
    await page.click('button:has-text("Next")');

    // Go back to Step 2
    await page.click('button:has-text("Back")');

    // Verify selections are maintained
    await expect(page.locator('[data-testid="user-type-small_business_owner"]')).toBeChecked();
    await expect(page.locator('[data-testid="business-stage-have_products"]')).toBeChecked();

    // Go back to Step 1
    await page.click('button:has-text("Back")');

    // Verify form data is maintained
    await expect(page.locator('[name="fullName"]')).toHaveValue('Test User');
    await expect(page.locator('[name="email"]')).toHaveValue('test@example.com');
  });
});
