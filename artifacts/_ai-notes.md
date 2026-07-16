# AI mistake log (scratch — delete before final commit)

<!-- Format: - [tag] what was wrong and what fixed it -->
<!-- [self-caught] = AI noticed it | [user-caught] = Osama corrected it -->

- [user-caught] AI assumed pills would be visible in headless sessions after cookie dismiss with a longer wait — Osama pushed back ("investigate the root cause rather than picking an assertion blind"). Investigation revealed pills are the empty-conversation state; the auto-greeting fires immediately on every fresh session and suppresses them. Fix: pre-seed localStorage `undefined-auto-message-sent` via addInitScript before navigation.
- [user-caught] Phase 0 report proposed `minLength=30` in polling helper and `50 chars` in test assertion — two different thresholds with no explanation. Osama flagged the inconsistency; reconciled to 50 everywhere.
- [user-caught] Poll-interval comment missing from waitForStableText — Osama noted the waitForTimeout call could be misread as a fixed sleep strategy. Added inline comment clarifying it is the poll cadence.

