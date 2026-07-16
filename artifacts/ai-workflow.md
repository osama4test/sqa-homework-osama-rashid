# AI workflow — how Claude Code was used in this project

## Tools used and why

Claude Code (claude-sonnet-4-6) was the primary tool throughout. It was chosen because the task is a mix of automated test writing, DOM investigation, and structured technical writing — work that benefits from a code-capable model that can run scripts and read output in the same session. No separate tools (Cursor, Copilot, ChatGPT) were used; keeping a single tool reduces context-switching and keeps the investigation chain auditable in one place.

## What AI generated vs. what was rewritten or corrected

Claude generated the initial exploration scripts (Node.js Playwright probes), the `helpers.ts` polling logic, all 8 tests, and first drafts of the artifact markdown files. I reviewed each test for selector accuracy against the DevTools-verified DOM and adjusted the `test.use()` placement (moved from inside the test callback into a `test.describe()` block — the generated code was syntactically wrong in a way that only surfaces at runtime, not compile time). I also tightened the UX review language to cut anything that could apply to a generic chat app.

## One specific thing AI got wrong that I caught

The initial test plan assumed the suggested-topic pills would be visible in every headless Playwright session after dismissing the cookie banner. They never were — not at any viewport width, not after any wait duration. The AI's Phase 0 assumption ("pills are visible once cookie is dismissed") was wrong. The actual mechanism: the app fires an auto-greeting on every fresh browser session, which renders a message into the chat and switches the UI out of the empty-state (pills) view. Pills are only shown when no messages exist. I caught this by running the timeline investigation script and observing `greeting=1` at 0.25s — before the cookie was even dismissed. The fix (pre-seeding `undefined-auto-message-sent` in localStorage via `addInitScript`) was derived from inspecting the localStorage state and confirmed by the investigation script.

## What was deliberately built by hand and not trusted to AI

The `waitForStableText` polling strategy design. The CLAUDE.md brief names this as the core technical decision being graded and specifies it must be content-stable-across-N-checks rather than a fixed sleep. I wrote the logic requirements precisely first, then let AI produce the implementation, then read every line of the helper to verify it matches the spec (stable count resets to zero on any change, `intervalMs` is the poll cadence not the total wait budget). I also wrote the UX issue priorities by hand — AI drafts tend to list items in discovery order rather than business-impact order, and the ordering here is graded.
