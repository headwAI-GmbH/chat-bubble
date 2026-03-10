import { test, expect, type Page } from '@playwright/test';
import { prepareDatabase } from '../utils/setup';

// ---------------------------------------------------------------------------
// Helpers – centralise repeated UI interactions so selector/text changes only
// need updating in one place.
// ---------------------------------------------------------------------------

/** Navigate to the app and wait until the page is idle. */
async function navigateToApp(page: Page) {
  await page.goto('');
  await page.waitForLoadState('networkidle');
}

/** Wait for the floating chat icon and click it to open the chat window. */
async function openChatBubble(page: Page) {
  const chatIcon = page.locator('.chat-icon-container');
  await expect(chatIcon).toBeVisible({ timeout: 10000 });
  await chatIcon.click();
}

/** Accept the disclaimer / terms dialog. */
async function acceptTerms(page: Page) {
  await page.getByRole('button', { name: 'Accept terms' }).click();
}

/** Type a message into the input field and press the send button. */
async function sendMessage(page: Page, message: string) {
  const input = page.getByRole('textbox', {
    name: 'Enter your questions here',
  });
  await input.click();
  await input.fill(message);
  await page.locator('#input').getByRole('button').click();
}

/** Shortcut that opens the chat, accepts terms, and sends a message. */
async function openAndSendMessage(page: Page, message: string) {
  await navigateToApp(page);
  await openChatBubble(page);
  await acceptTerms(page);
  await sendMessage(page, message);
}

/** Wait until the feedback icons are visible (indicates the response arrived). */
async function waitForResponse(page: Page) {
  await expect(
    page.locator('.feedback-icon > svg > path').first(),
  ).toBeVisible();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  await prepareDatabase();
});

test('Creates initial new and responds successfully', async ({ page }) => {
  await openAndSendMessage(page, 'What is the first name of Mozart?');
  await waitForResponse(page);
});

test('Create new chat with button', async ({ page }) => {
  await openAndSendMessage(page, 'What is the first name of Mozart?');
  await waitForResponse(page);

  await page.getByRole('button', { name: 'Start new chat' }).click();
  await sendMessage(page, 'Another question');

  await expect(page.locator('#messages')).toMatchAriaSnapshot(`
    - paragraph: Hey, how can I help you?
    - paragraph: Another question
    - paragraph: Another question
    `);
});

test('Feedback works for response', async ({ page }) => {
  await openAndSendMessage(page, 'What is the first name of Mozart?');

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
  await navigateToApp(page);
  await openChatBubble(page);
  await acceptTerms(page);

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
  await openAndSendMessage(page, 'Another question');

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
  await openAndSendMessage(page, 'Another question');

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
