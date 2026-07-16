# UX Review — ask.permission.ai

Desktop (1280×800) and mobile (375×667) tested in Chrome via Playwright headless and DevTools responsive mode. Post-signup exploration done manually with a real account. Mobile testing used responsive mode, not a physical device.

## What works well

The streaming UI is polished: the send button instantly becomes a red stop button, the textarea disables with placeholder "Agent is responding…", and three animated dots with "Permission is typing…" appear. Users get clear, continuous feedback. The send button is correctly gated — disabled on empty and whitespace-only input, no error message needed.

## Issues, prioritised

**1. Cookie banner physically covers pills and the input on first visit**
The OneTrust banner sits over the bottom third of the viewport on desktop and obscures the textarea on mobile. A first-time visitor cannot interact with the page until engaging with the banner. Fix: make the banner a top-bar or reduce its z-index. Business impact: every user who abandons instead of dismissing is lost before they see the product value.

**2. Pills are invisible to new users**
The auto-greeting fires on every new browser session and replaces the empty-state (pills) with a conversation view before users see the pills. Pills only appear on return visits. The localStorage key that controls this (`undefined-auto-message-sent`) has a code bug — the conversation ID resolves as `undefined` instead of an actual ID. Fix: delay the greeting until after the user's first input, or render pills alongside the greeting rather than as a mutually exclusive state.

**3. Mobile: cookie banner footer text overflows visually**
At 375×667 the copyright line in the banner wraps across three rows in an unfinished layout. Not a blocker but a poor first impression exactly when the user is deciding whether to trust the site with their data.

**4. Shift+Enter hint is inaccessible on mobile**
"Press Shift + Enter for new line" is shown at `text-xs` (10px — below WCAG 12px minimum) and references a key that doesn't exist on most mobile keyboards. Fix: hide or replace it with a mobile-relevant instruction on small viewports.

**5. Authenticated sidebar has no loading state between sections**
Post-signup, clicking between Wallet, Referrals, and Interests causes a visible blank-flash — no skeleton or spinner. Lower priority than the above but erodes confidence in a product asking users to trust it with their data.
