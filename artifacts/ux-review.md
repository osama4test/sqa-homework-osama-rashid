# UX Review — ask.permission.ai

Desktop (1280×800) and mobile (375×667) tested in Chrome via Playwright headless and Chrome DevTools responsive mode. Post-signup exploration done manually with a real account. Mobile testing used responsive mode, not a physical device.

## What works well

The streaming UI is polished: the send button is immediately replaced by a red stop button, the textarea disables and changes placeholder to "Agent is responding…", and three animated dots with "Permission is typing…" appear in the agent bubble. Users get continuous, unambiguous feedback during generation. The send button is correctly gated — disabled on empty AND whitespace-only input, with no need for an error message because the button state is self-explanatory.

## Issues, prioritised

**1. Cookie banner physically covers the pills and input on first visit (highest impact)**
The OneTrust banner sits over the bottom third of the viewport on desktop and over the textarea on mobile. A first-time visitor cannot interact with the page at all until they engage with the banner. The fix is straightforward: make the banner a top-of-page bar rather than a bottom overlay, or reduce its z-index so it doesn't obscure interactive UI. Business impact: any user who abandons rather than dismissing the banner is lost before they see the product.

**2. Pills are invisible to genuinely new users**
The auto-greeting fires on every new browser session and replaces the empty-state (pills) with a conversation view before the user sees the pills. Pills only appear on return visits (localStorage `undefined-auto-message-sent` flag present). The key name itself (`undefined-auto-message-sent`) suggests a code bug — the conversation ID is resolving as `undefined` instead of an actual ID. Fix: either delay the greeting until after the user's first input, or render the pills alongside the greeting rather than as a mutually exclusive state.

**3. Mobile: cookie banner footer text overflows and wraps badly**
At 375×667 the footer copyright line inside the cookie banner breaks across three visual rows in a layout that looks unfinished. It does not affect functionality but creates a poor first impression precisely when the user is deciding whether to trust the site with their data.

**4. No visual affordance for the Shift+Enter shortcut on mobile**
The hint "Press Shift + Enter for new line" is shown below the textarea on desktop but on a physical mobile keyboard there is no Shift key in the standard position. The hint text is also `text-xs` (10px), which is below the 12px WCAG minimum for body text. Fix: hide or replace this hint on mobile viewports with a more relevant instruction (e.g., "Tap return to send").

**5. Authenticated sidebar navigation has no loading state**
Post-signup, clicking between Wallet, Referrals, and Interests in the sidebar triggers a visible blank-flash between renders — there is no skeleton screen or spinner. This is less critical than the above items but erodes confidence in a product that is asking users to trust it with their data.
