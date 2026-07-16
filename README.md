# sqa-homework-osama-rashid

## Setup

```bash
git clone https://github.com/OsamaR/sqa-homework-osama-rashid.git
cd sqa-homework-osama-rashid
npm install
npx playwright install chromium
npm test
```

`npm test` runs all 8 tests headless and writes an HTML report to `artifacts/report/`.
Open `artifacts/report/index.html` in a browser to view results.

## Test strategy (TL;DR)

**Covered:** pill visibility (empty-state), pill-click agent response with structural Part 2 assertions, free-text submission response, Shift+Enter newline, Enter submit, empty/whitespace disabled-button gate, mobile 375×667 no overflow + reachability, Log in/Sign Up route navigation.

**Skipped:** post-login authenticated flows (wallet, referrals, interests) — can't automate past email verification. Exact response text — non-deterministic by design; see `artifacts/assertions.md`. Cross-browser (Firefox, Safari) — within budget, Chromium covers the core behaviors.

**Key constraint:** pills are the empty-conversation state, suppressed whenever an agent greeting is present. Tests 1, 2, and 7 pre-seed a localStorage flag (`undefined-auto-message-sent`) via `page.addInitScript` to reproduce the returning-user state. This is documented in `artifacts/assertions.md`.

## Key decisions

- **Playwright + TypeScript** over Cypress or Selenium: native auto-wait, first-class TypeScript, built-in HTML reporter, no separate server process. Cypress was rejected because its iframe restrictions and global install requirement add friction for a reviewer doing a clean clone.

- **Built-in HTML reporter** over Allure or custom dashboards: zero config, self-contained, readable in any browser. Allure requires a separate Java process; overkill for 8 tests.

- **`waitForStableText` polling** over `waitForSelector` on the stop button alone: the stop button disappearing signals the network stream ended, not that React has finished rendering the full text. Content stability across 3 consecutive 500ms checks is the actual done signal. Fixed `waitForTimeout` was rejected — it over-waits on fast networks and under-waits on slow ones.

- **50-char minimum, keyword regex, no-error-string assertions** over exact text or semantic scoring: exact text is brittle to model changes; LLM-eval (DeepEval) adds infrastructure cost better suited to a nightly schedule. The three checks together are sufficient to catch rendering failures, empty responses, and gross off-topic replies.

- **`page.addInitScript` localStorage pre-seed** over network interception or timing tricks to show pills: blocking the greeting endpoint doesn't suppress the greeting (it's rendered from React's initial state, gated by the localStorage flag). Pre-seeding the flag is the only reliable mechanism, and it accurately reproduces the returning-user state.

- **Flat file structure** (no page-object model) over `pages/` or `fixtures/` directories: 8 tests don't justify the indirection. One `helpers.ts` with two exported functions keeps locator logic close to the tests that use them.

- **Single `test.describe` for mobile** over a second Playwright project: a second project would double the total run time and make the test count ambiguous. One `describe` with `test.use({ viewport })` keeps the count unambiguously at 8.

- **`getByRole('button', { name })` for pills** over class-based selectors: pills have no `data-testid`; role + accessible name is the most semantically stable locator and survives CSS class changes.

## AI disclosure

See [artifacts/ai-workflow.md](artifacts/ai-workflow.md).

## Next steps

With 1–2 more days: wire the suite into GitHub Actions (push-triggered, Chromium only, artifact upload for the HTML report); add a DeepEval `AnswerRelevancyMetric` check on a nightly schedule for the Part 2 response; automate a post-login smoke test for wallet balance display using a seeded test account that bypasses email verification; and add an accessibility audit pass with `@axe-core/playwright` focused on the cookie banner and input hint text.

## Submission checklist

- [x] Repo named `sqa-homework-osama-rashid` and default branch is `main`
- [x] README includes exact Setup + run commands (verified from a clean clone)
- [x] README word count ≤ 500 (excluding commands/checkboxes)
- [x] Max 8 tests; all 4 required behaviors covered
- [x] artifacts/assertions.md included (≤ 300 words)
- [x] artifacts/ux-review.md included (≤ 400 words, desktop + mobile, post-signup exploration, 3–5 prioritised improvements)
- [x] artifacts/data-checks.md included (≤ 300 words + SQL)
- [x] artifacts/ai-workflow.md included (≤ 300 words, all 4 questions answered)
- [x] artifacts/report/ included (generated on `npm test`)
- [ ] artifacts/demo.mp4 included (60–90 sec narrated — record manually)
- [x] Commit history shows how the work evolved
