# UX Review — ask.permission.ai

Desktop (1280×800) and mobile (375×667) tested in Chrome via Playwright headless and DevTools responsive mode. Post-signup exploration done manually with a real account. Mobile testing used responsive mode, not a physical device.

## What works well

The streaming UI is polished: the send button instantly becomes a red stop button, the textarea disables with placeholder "Agent is responding…", and three animated dots with "Permission is typing…" appear. Users get clear, continuous feedback. The send button is correctly gated — disabled on empty and whitespace-only input, no error message needed.

## Issues, prioritised

**1. Cookie banner physically covers pills and the input on first visit**
The OneTrust banner sits over the bottom third of the viewport on desktop and obscures the textarea on mobile. A first-time visitor cannot interact with the page until engaging with the banner. Fix: make the banner a top-bar or reduce its z-index. Business impact: every user who abandons instead of dismissing is lost before they see the product value.

**2. Pills are never rendered for new users**
Confirmed by 8 clean-context trials: the chat container is absent from the DOM until the greeting arrives (~2.8–3.4 s after navigation). There is no transient empty state — the app takes one of two code paths at mount based on a localStorage key (`undefined-auto-message-sent`): key present → empty state with pills; no key → greeting path, container never initialises until the API responds. Both the `/api/agent/suggestions-unauthenticated` and `/api/agent/ask-unauthenticated` calls fire simultaneously; the greeting wins. The key name is itself a code bug — the conversation ID resolves as `undefined` instead of a real ID. Fix: delay the auto-greeting until after the user's first input, or render pills as a persistent quick-start panel alongside the greeting.

**3. Mobile: cookie banner footer text overflows visually**
At 375×667 the copyright line in the banner wraps across three rows in an unfinished layout. Not a blocker but a poor first impression exactly when the user is deciding whether to trust the site with their data.

**4. Shift+Enter hint is inaccessible on mobile**
"Press Shift + Enter for new line" is shown at `text-xs` (10px — below WCAG 12px minimum) and references a key that doesn't exist on most mobile keyboards. Fix: hide or replace it with a mobile-relevant instruction on small viewports.

**5. Authenticated sidebar has no loading state between sections**
Post-signup, clicking between Wallet, Referrals, and Interests causes a visible blank-flash — no skeleton or spinner. Lower priority than the above but erodes confidence in a product asking users to trust it with their data.
