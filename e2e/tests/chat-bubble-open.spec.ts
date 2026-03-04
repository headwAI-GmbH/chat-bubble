import { test, expect } from '@playwright/test';
import { prepareDatabase } from '../utils/setup';

test.beforeEach(async ({ page }) => {
  await prepareDatabase();
});

test.describe('Chat Bubble Basic Test', () => {
  test('Chat bubble creates new chat and responds successfully', async ({
    page,
  }) => {
    // Navigate to the test page
    await page.goto('');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for the chat bubble icon to be visible
    const chatIcon = page.locator('.chat-icon-container');
    await expect(chatIcon).toBeVisible({ timeout: 10000 });

    // Click the chat bubble to open it
    await chatIcon.click();

    console.log('✅ Chat bubble opened successfully with Open WebUI backend');

    await page.getByRole('button', { name: 'Accept terms' }).click();

    await page
      .getByRole('textbox', { name: 'Enter your questions here' })
      .click();
    await page
      .getByRole('textbox', { name: 'Enter your questions here' })
      .fill('What is the first name of Mozart?');

    await page.locator('#input').getByRole('button').click();

    await expect(
      page.locator('.feedback-icon > svg > path').first(),
    ).toBeVisible();
  });
});
