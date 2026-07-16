# sqa-homework-osama-rashid

## Setup

```bash
git clone https://github.com/osama4test/sqa-homework-osama-rashid.git
cd sqa-homework-osama-rashid
npm install
npx playwright install chromium
npm test
```

`npm test` runs all 8 tests headless and writes an HTML report to `artifacts/report/index.html`.

## Test strategy (TL;DR)

**Covered:** pill visibility (empty-state), pill-click agent response with Part 2 structural assertions, free-text submission response, Shift+Enter newline, Enter submit, empty/whitespace button-disabled gate, mobile 375×667 no overflow + input reachability, Log in/Sign Up route navigation.

**Skipped:** post-login authenticated flows (can't automate past email verification). Exact response text (non-deterministic by design; see `artifacts/assertions.md`). Cross-browser (Chromium covers core behaviors within budget).

**Key constraint:** tests 1, 2, and 7 pre-seed `undefined-auto-message-sent` in localStorage via `page.addInitScript`. The key is written on the very first home page mount in a fresh browser context, so pills are absent only on that one first-ever visit; every subsequent visit finds the key and shows pills. Fresh Playwright contexts always start with empty localStorage, making every unseed run the first-ever-visit scenario. Seeding accurately represents the state nearly all real users are in. Documented in `artifacts/assertions.md`.

## Key decisions

- **Playwright + TypeScript** over Cypress or Selenium: native auto-wait, first-class TS, built-in HTML reporter, no separate server. Cypress rejected for iframe restrictions and global install requirement.

- **Built-in HTML reporter** over Allure: zero config, self-contained output. Allure requires a separate Java process — overkill for 8 tests.

- **`waitForStableText` polling** over `waitForSelector` on the stop button alone: the stop button disappearing signals stream end, not render completion. Content stability across 3 × 500ms checks is the actual done signal. Fixed `waitForTimeout` rejected — over-waits on fast networks, under-waits on slow.

- **50-char floor + keyword regex + no-error-string** over exact text or LLM-eval: exact text breaks on model updates; DeepEval adds infrastructure cost better suited to a nightly schedule.

- **`page.addInitScript` localStorage pre-seed** over network interception or longer waits: `undefined-auto-message-sent` is absent only on a browser's literal first-ever home visit — every subsequent visit finds it and shows pills. Fresh Playwright contexts start with empty localStorage, so every unseeded run is the first-ever-visit scenario. Seeding is the only mechanism that puts the app in the state nearly all real users are actually in.

- **Flat file structure** over page-object model: 8 tests don't justify the indirection. One `helpers.ts` with two functions keeps locators close to the tests that use them.

- **Single `test.describe` for mobile** over a second Playwright project: a second project doubles run time and makes the test count ambiguous.

- **`getByRole('button', { name })` for pills** over class-based selectors: pills have no `data-testid`; role + name survives CSS changes.

## AI disclosure

See [artifacts/ai-workflow.md](artifacts/ai-workflow.md).

## Next steps

Wire into GitHub Actions (push-triggered, Chromium, artifact upload); add DeepEval `AnswerRelevancyMetric` on a nightly schedule; automate a post-login smoke test for wallet display using a seeded test account; add an `@axe-core/playwright` accessibility audit on the cookie banner and input hint text.

## Submission checklist

- [x] Repo named `sqa-homework-osama-rashid` and default branch is `main`
- [x] README includes exact Setup + run commands (verified from a clean clone)
- [x] README word count ≤ 500 (excluding commands/checkboxes)
- [x] Max 8 tests; all 4 required behaviors covered
- [x] artifacts/assertions.md included (≤ 300 words)
- [x] artifacts/ux-review.md included (≤ 400 words, desktop + mobile, post-signup, 3–5 prioritised improvements)
- [x] artifacts/data-checks.md included (≤ 300 words + SQL)
- [x] artifacts/ai-workflow.md included (≤ 300 words, all 4 questions answered)
- [x] artifacts/report/ included
- [ ] artifacts/demo.mp4 included (60–90 sec narrated — record manually)
- [x] Commit history shows how the work evolved
