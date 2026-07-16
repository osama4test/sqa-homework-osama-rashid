import type { Locator, Page } from '@playwright/test';

export async function dismissCookieBanner(page: Page): Promise<void> {
  await page.locator('#onetrust-reject-all-handler').click();
}

/**
 * Polls locator text content until it has been unchanged for `stableChecks`
 * consecutive intervals. The waitForTimeout calls are the poll interval —
 * NOT the mechanism that waits for streaming to finish. Stability across
 * multiple checks is what signals completion.
 */
export async function waitForStableText(
  locator: Locator,
  { minLength = 50, stableChecks = 3, intervalMs = 500 } = {},
): Promise<string> {
  let stable = 0;
  let last = '';
  while (stable < stableChecks) {
    await locator.page().waitForTimeout(intervalMs); // poll interval, not a fixed sleep
    const text = (await locator.textContent()) ?? '';
    if (text.length >= minLength && text === last) {
      stable++;
    } else {
      stable = 0;
      last = text;
    }
  }
  return last;
}

/**
 * Pre-seeds the localStorage flag that suppresses the auto-greeting.
 * Must be called with page.addInitScript BEFORE page.goto.
 * Replicates the returning-user state where the greeting has already fired
 * and the empty-conversation view (pills) is shown instead.
 */
export function seedEmptyConversation(): () => void {
  return () => {
    localStorage.setItem(
      'undefined-auto-message-sent',
      JSON.stringify({ timestamp: Date.now() }),
    );
  };
}
