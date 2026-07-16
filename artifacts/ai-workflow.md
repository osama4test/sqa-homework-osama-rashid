# AI workflow — how Claude Code was used in this project

## Tools used and why

Claude Code (claude-sonnet-4-6) throughout. The task mixes code, DOM investigation, and structured writing — a code-capable model running scripts in the same session keeps the investigation auditable.

## What AI generated vs. what was corrected

Claude generated exploration scripts, `helpers.ts` polling logic, all 8 tests, and first drafts of every artifact. I verified each test against DevTools DOM. The `test.use()` call was inside a test callback (wrong, only surfaces at runtime); I moved it into a `test.describe()` block. I also rewrote UX issue ordering — AI listed findings in discovery order, not business-impact order.

## One thing AI got wrong that I caught

In Phase 0 the AI concluded "pills will be visible after cookie dismiss with a sufficiently long wait." My pushback: "investigate the root cause rather than picking an assertion blind." The investigation revealed the real mechanism: the app fires an auto-greeting on every fresh browser session (gated by a localStorage key), which renders a message and switches the UI out of the empty-state view. Pills never appear in a fresh Playwright context regardless of wait time or viewport. The fix — pre-seeding `undefined-auto-message-sent` in localStorage via `addInitScript` — was derived from inspecting the DOM timeline and localStorage state.

## What was deliberately built by hand

The `waitForStableText` strategy design. The brief explicitly calls this the core technical decision being graded. I wrote the requirements precisely (stable across N consecutive checks, poll cadence separate from total wait budget, reset on any change) before letting AI produce the implementation, then read every line to verify correctness. UX issue priority ordering was also hand-determined — business impact ordering is a judgment call that AI consistently gets wrong without domain context.
