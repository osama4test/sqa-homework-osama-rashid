import { test, expect } from '@playwright/test';
import { dismissCookieBanner, waitForStableText, seedEmptyConversation } from './helpers';

const URL = 'https://ask.permission.ai';

// ─── Test 1 ──────────────────────────────────────────────────────────────────
// Pills appear when `undefined-auto-message-sent` is present in localStorage
// at home page mount. The key is written on the very first mount in a fresh
// browser context — absent only on the literal first-ever home visit; every
// subsequent visit (including after login or logout, which do not touch the key)
// shows pills instead. Fresh Playwright contexts always start with empty
// localStorage, so without seeding every run is the first-ever-visit scenario.
// Seeding before navigation accurately represents the state nearly all real
// users are in — not an artificial workaround but the correct default state.
// See helpers.ts:seedEmptyConversation for implementation.
test('page loads with suggested-topic pills visible after cookie banner dismissed', async ({ page }) => {
  await page.addInitScript(seedEmptyConversation());
  await page.goto(URL);
  await dismissCookieBanner(page);

  await expect(page.locator('h3', { hasText: 'Suggested topics:' })).toBeVisible();
  for (const pill of [
    'What is Permission',
    'Best way to earn ASK',
    'How permission uses my data',
    'What is passive earning',
    'What is data ownership',
    'Permission Wallet',
  ]) {
    await expect(page.getByRole('button', { name: pill })).toBeVisible();
  }
});

// ─── Test 2 ──────────────────────────────────────────────────────────────────
// Part 2: clicking the "What is Permission" pill produces a non-deterministic
// agent response. Assertions are structural/behavioral — see assertions.md.
test('clicking "What is Permission" pill produces an agent response', async ({ page }) => {
  await page.addInitScript(seedEmptyConversation());
  await page.goto(URL);
  await dismissCookieBanner(page);

  const responsesBefore = await page.locator('.flex.justify-start').count();

  await page.getByRole('button', { name: 'What is Permission' }).click();

  // Wait for a new agent bubble to appear
  await expect(page.locator('.flex.justify-start')).toHaveCount(responsesBefore + 1, {
    timeout: 30_000,
  });

  const responseBubble = page.locator('.flex.justify-start').last();
  const text = await waitForStableText(responseBubble);

  // Structural assertions — see assertions.md for what is deliberately NOT asserted
  expect(text.length).toBeGreaterThanOrEqual(50);
  expect(text.toLowerCase()).toMatch(/permission|data|ask|earn/);
  expect(text.toLowerCase()).not.toMatch(/\bundefined\b|\bnull\b|\berror\b/);
});

// ─── Test 3 ──────────────────────────────────────────────────────────────────
test('submitting free-text via ASK input produces an agent response', async ({ page }) => {
  await page.goto(URL);
  await dismissCookieBanner(page);

  const responsesBefore = await page.locator('.flex.justify-start').count();

  await page.locator('[data-testid="agent-chat-input"]').fill('What is the ASK token?');
  await page.keyboard.press('Enter');

  await expect(page.locator('.flex.justify-start')).toHaveCount(responsesBefore + 1, {
    timeout: 30_000,
  });

  const responseBubble = page.locator('.flex.justify-start').last();
  const text = await waitForStableText(responseBubble);

  expect(text.length).toBeGreaterThanOrEqual(50);
  expect(text.toLowerCase()).not.toMatch(/\bundefined\b|\bnull\b|\berror\b/);
});

// ─── Test 4 ──────────────────────────────────────────────────────────────────
test('Shift+Enter inserts a newline instead of sending', async ({ page }) => {
  await page.goto(URL);
  await dismissCookieBanner(page);

  const responsesBefore = await page.locator('.flex.justify-start').count();

  const input = page.locator('[data-testid="agent-chat-input"]');
  await input.fill('Line 1');
  await page.keyboard.press('Shift+Enter');

  const value = await input.inputValue();
  expect(value).toContain('\n');

  // No message was sent
  await expect(page.locator('.flex.justify-start')).toHaveCount(responsesBefore);
});

// ─── Test 5 ──────────────────────────────────────────────────────────────────
test('Enter (without Shift) submits the message', async ({ page }) => {
  await page.goto(URL);
  await dismissCookieBanner(page);

  const userBubblesBefore = await page.locator('.flex.justify-end').count();

  await page.locator('[data-testid="agent-chat-input"]').fill('Hello');
  await page.keyboard.press('Enter');

  // A new user bubble should appear
  await expect(page.locator('.flex.justify-end')).toHaveCount(userBubblesBefore + 1, {
    timeout: 10_000,
  });
});

// ─── Test 6 ──────────────────────────────────────────────────────────────────
test('empty and whitespace-only input does not submit', async ({ page }) => {
  await page.goto(URL);
  await dismissCookieBanner(page);

  const input = page.locator('[data-testid="agent-chat-input"]');
  const sendBtn = page.locator('[data-testid="agent-chat-input-send-button"]');
  const responsesBefore = await page.locator('.flex.justify-start').count();

  // Empty — button must be disabled
  await expect(sendBtn).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect(page.locator('.flex.justify-start')).toHaveCount(responsesBefore);

  // Whitespace-only — button must stay disabled
  await input.fill('   ');
  await expect(sendBtn).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect(page.locator('.flex.justify-start')).toHaveCount(responsesBefore);
});

// ─── Test 7 ──────────────────────────────────────────────────────────────────
test.describe('mobile 375×667', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('pills wrap without horizontal overflow, input is reachable', async ({ page }) => {
    await page.addInitScript(seedEmptyConversation());
    await page.goto(URL);
    await dismissCookieBanner(page);

    // No horizontal overflow
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Pills visible (single-column layout, no horizontal scroll needed)
    await expect(page.getByRole('button', { name: 'What is Permission' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Permission Wallet' })).toBeVisible();

    // Input reachable
    await expect(page.locator('[data-testid="agent-chat-input"]')).toBeVisible();
  });
});

// ─── Test 8 ──────────────────────────────────────────────────────────────────
test('Log in and Sign Up header buttons navigate to correct routes', async ({ page }) => {
  await page.goto(URL);
  await dismissCookieBanner(page);

  await page.locator('[data-testid="log-in-button"]').click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goBack();
  await dismissCookieBanner(page);

  await page.locator('[data-testid="sign-up-button"]').click();
  await expect(page).toHaveURL(/\/register$/);
});
