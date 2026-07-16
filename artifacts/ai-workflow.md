# AI workflow — how Claude Code was used in this project

## Tools used and why

Claude Code (claude-sonnet-4-6) throughout. Considered Cursor and Copilot but the task spans DOM investigation, test authoring, and artifact writing in one session — switching tools mid-investigation would have broken this write-up's audit trail.

## What AI generated vs. what was corrected

Claude generated exploration scripts, `helpers.ts` polling logic, all 8 tests, and first drafts of every artifact. I verified each test against DevTools DOM. The `test.use()` call was inside a test callback (wrong, only surfaces at runtime); I moved it into a `test.describe()` block. I also rewrote UX issue ordering — AI listed findings in discovery order, not business-impact order.

## One thing AI got wrong that I caught

After 8 clean-context trials the AI concluded pills were deterministically absent for new users — greeting always wins. I tested manually: login → logout → home showed all 6 pills. The AI re-investigated with controlled path A/B trials; I required raw per-run localStorage snapshots at every step, not a narrative summary. Real mechanism: `undefined-auto-message-sent` is written on the first-ever home mount and never cleared by login or logout — pills appear on every subsequent visit. The original conclusion had to be corrected in ux-review.md: what looked like a persistent product gap is first-visit-only.

## What was deliberately built by hand

The `waitForStableText` strategy design. The brief explicitly calls this the core technical decision being graded. I wrote the requirements precisely (stable across N consecutive checks, poll cadence separate from total wait budget, reset on any change) before letting AI produce the implementation, then read every line to verify correctness. UX issue priority ordering was also hand-determined — business impact ordering is a judgment call that AI consistently gets wrong without domain context.
