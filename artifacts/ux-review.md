# UX Review — ask.permission.ai

Desktop (1280×800) and mobile (375×667) tested in Chrome via Playwright headless and DevTools responsive mode. Post-signup exploration done manually with a real account. Mobile testing used responsive mode, not a physical device.

## What works well

The streaming UI is polished: the send button instantly becomes a red stop button, the textarea disables with placeholder "Agent is responding…", and three animated dots with "Permission is typing…" appear. Users get clear, continuous feedback. The send button is correctly gated — disabled on empty and whitespace-only input, no error message needed.

## Issues, prioritised

**1. Cookie banner blocks the input on every visit, and pills on return visits**
The OneTrust banner sits over the bottom third of the viewport on desktop and obscures the textarea on mobile. A first-time visitor cannot interact with the page until engaging with the banner. Fix: make the banner a top-bar or reduce its z-index. Business impact: every user who abandons instead of dismissing is lost before they see the product value.

**2. Pills invisible on first visit; appear on all return visits including post-logout**
On first visit the app writes `undefined-auto-message-sent` to localStorage synchronously at mount and immediately fires the greeting — pills are never rendered that session (confirmed: 8 clean-context trials, chat container absent from DOM until greeting arrives at ~2.8–3.4 s). On any return visit the key is already present and the component takes the empty-state path: pills appear. Login and logout do not clear the key. Confirmed: if home was visited before login, the key survives both login and logout intact and pills appear immediately after logout. If the user went directly to `/login` without a prior home visit, the post-logout home page fires a new greeting instead (key not yet present), writing it for the first time — no pills that visit, pills on the next. The `undefined` prefix is likely an oversight: the logged-in state uses the real UUID as prefix. Fix: delay the auto-greeting until after first user input, or render pills as a persistent quick-start panel.

**3. Mobile: cookie banner footer text overflows visually**
At 375×667 the copyright line in the banner wraps across three rows in an unfinished layout. Not a blocker but a poor first impression exactly when the user is deciding whether to trust the site with their data.

**4. Shift+Enter hint is inaccessible on mobile**
"Press Shift + Enter for new line" is shown at `text-xs` (10px — below WCAG 12px minimum) and references a key that doesn't exist on most mobile keyboards. Fix: hide or replace it with a mobile-relevant instruction on small viewports.

**5. Authenticated sidebar has no loading state between sections**
Post-signup, clicking between Wallet, Referrals, and Interests causes a visible blank-flash — no skeleton or spinner. Lower priority than the above but erodes confidence in a product asking users to trust it with their data.
