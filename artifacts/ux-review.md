# UX Review — ask.permission.ai

Desktop (1280×800) and mobile (375×667) tested in Chrome via Playwright headless and DevTools responsive mode. Post-signup exploration done manually with a real account. Mobile testing used responsive mode, not a physical device.

## What works well

The streaming UI is polished: the send button becomes a red stop button, the textarea disables with "Agent is responding…", and "Permission is typing…" dots appear. Users get clear feedback. The send button is correctly gated — disabled on empty and whitespace-only input, no error needed.

## Issues, prioritised

Ordered by how many users are affected and how much trust is at stake.

**1. Cookie banner blocks the input on every visit, and pills on return visits**
The OneTrust banner sits over the bottom third of the viewport on desktop and obscures the textarea on mobile. A first-time visitor cannot interact with the page until engaging with the banner. Fix: make the banner a top-bar or reduce its z-index. Business impact: every user who abandons instead of dismissing is lost before they see the product value.

**2. Shift+Enter hint is inaccessible on mobile**
"Press Shift + Enter for new line" is shown at `text-xs` (10px — below WCAG 12px minimum) and references a key that doesn't exist on most mobile keyboards. Mobile users lose a documented feature with no visible replacement. Fix: hide or replace it with a mobile-relevant instruction on small viewports.

**3. Authenticated sidebar has no loading state between sections**
Post-signup, clicking between Wallet, Referrals, and Interests causes a visible blank-flash — no skeleton or spinner. Erodes confidence in a product asking users to trust it with their data.

**4. Mobile: cookie banner footer text overflows visually**
At 375×667 the copyright line in the banner wraps across three rows in an unfinished layout. Poor first impression exactly when the user is deciding whether to trust the site with their data.

**5. Suggested-topic pills absent on a browser's very first home visit**
`undefined-auto-message-sent` is written to localStorage on the first-ever home mount; every subsequent visit — including after login or logout — finds it present and shows pills. The gap is a single first-visit impression, self-correcting on return. It still costs the product its clearest onboarding path on the one visit that matters most. Fix: render pills alongside the greeting on first visit rather than as a mutually exclusive state.
