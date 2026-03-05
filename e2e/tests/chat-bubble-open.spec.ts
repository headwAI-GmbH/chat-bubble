import { test, expect } from '@playwright/test';
import { prepareDatabase } from '../utils/setup';

test.beforeEach(async ({ page }) => {
  await prepareDatabase();
});

test('Creates initial new and responds successfully', async ({ page }) => {
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

test('Create new chat with button', async ({ page }) => {
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

  await page.getByRole('button', { name: 'Start new chat' }).click();
  await page
    .getByRole('textbox', { name: 'Enter your questions here' })
    .click();
  await page
    .getByRole('textbox', { name: 'Enter your questions here' })
    .fill('Another question');

  await page.locator('#input').getByRole('button').click();

  await expect(page.locator('#messages')).toMatchAriaSnapshot(`
    - paragraph: Hey, how can I help you?
    - paragraph: Another question
    - paragraph: Another question
    `);
});

test('Feedback works for response', async ({ page }) => {
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

  // Click thumbs-up and verify the feedback API call succeeds
  const goodFeedbackResponse = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/v1/evaluations/feedback') &&
      resp.request().method() === 'POST',
  );

  await page.getByTitle('Good response').locator('svg').click();
  expect((await goodFeedbackResponse).status()).toBe(200);

  // Click thumbs-down and verify
  const poorFeedbackResponse = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/v1/evaluations/feedback') &&
      resp.request().method() === 'POST',
  );
  await page.getByTitle('Poor response').locator('svg').click();
  expect((await poorFeedbackResponse).status()).toBe(200);
});

test('Information button shows information', async ({ page }) => {
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

  await page.getByRole('button', { name: 'Show information' }).click();

  await expect(page.locator('html').getByRole('document')).toMatchAriaSnapshot(`
    - document:
      - heading "Information" [level=3]
      - button "Close information":
        - img
      - heading "Privacy Notice" [level=4]
      - paragraph:
        - text: This chat uses
        - strong: AI technology
        - text: ". Key points:"
      - list:
        - listitem:
          - text: Messages are processed for
          - emphasis: AI responses
        - listitem:
          - text: See our
          - link "privacy policy":
            - /url: /privacy
        - listitem:
          - text: Use
          - code: secure connections
          - text: only
      - blockquote: Your privacy is our priority
    `);
  await page.getByRole('button', { name: 'Close information' }).click();
});

test('Download button works', async ({ page }) => {
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
    .fill('Another question');

  await page.locator('#input').getByRole('button').click();

  await expect(page.locator('#messages')).toMatchAriaSnapshot(`
    - paragraph: Hey, how can I help you?
    - paragraph: Another question
    - paragraph: Another question
    `);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download chat history' }).click();
  const download = await downloadPromise;

  // Basic assertions about the downloaded file
  const suggestedFilename = download.suggestedFilename();
  await expect(suggestedFilename).toBeTruthy();

  const stream = await download.createReadStream();
  let totalBytes = 0;
  for await (const chunk of stream) {
    totalBytes += chunk.length;
  }
  await expect(totalBytes).toBeGreaterThan(0);
});

test('Closing chat bubble keeps conversation', async ({ page }) => {
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
    .fill('Another question');

  await page.locator('#input').getByRole('button').click();

  await expect(page.locator('#messages')).toMatchAriaSnapshot(`
    - paragraph: Hey, how can I help you?
    - paragraph: Another question
    - paragraph: Another question
    `);

  await page.getByRole('button', { name: 'Close chat' }).click();
  await page.getByRole('button', { name: 'HeadwAI Chat Bubble' }).click();

  await expect(page.locator('#messages')).toMatchAriaSnapshot(`
  - paragraph: Hey, how can I help you?
  - paragraph: Another question
  - paragraph: Another question
  `);
});
