# Project brief: Permission.ai QA take-home

Senior QA Engineer take-home for Permission.io. Target: https://ask.permission.ai
Repo name: `sqa-homework-osama-rashid` · default branch `main` · public repo.

This is a graded evaluation of judgment, not code volume. Read every constraint
below before writing anything. When in doubt, do less and explain the decision
rather than adding more.

## Hard limits (do not exceed)

- Max 8 automated tests, total. Not per-file, not per-project — 8 `test()` blocks max.
- README.md ≤ 500 words (excluding commands/checkboxes)
- artifacts/assertions.md ≤ 300 words
- artifacts/ux-review.md ≤ 400 words
- artifacts/data-checks.md ≤ 300 words (+ SQL, SQL doesn't count toward the limit)
- artifacts/ai-workflow.md ≤ 300 words
- demo.mp4 ≤ 90 seconds, ≥ 60 seconds, narrated with voice

## Time-box and review gate (non-negotiable)

- Target ~6 hours of focused work total. No hard deadline, but don't gold-plate —
  small and polished beats broad and shallow. If something is taking
  disproportionately long, flag it to Osama rather than pushing through.
- **Review gate**: they will not review past README Setup if a clean clone
  can't be installed and running within ~5 minutes. Keep dependencies
  minimal (Playwright + TS only, nothing extra), and the Setup commands in
  README must be the literal exact commands that work — test this for real,
  don't assume.

## Phase 0 — Explore before planning or building

Before writing any code or any artifact file, explore the live product and
report back findings. Do not implement anything in this phase.

1. Pre-login: `ask.permission.ai`, desktop viewport. Dismiss cookie banner,
   note pills, try a pill click, try free-text, check Shift+Enter/Enter,
   check empty-input behavior, check Log in / Sign Up buttons.
2. Pre-login: same, at a mobile viewport (e.g. 375×667). Note anything that
   breaks, overflows, or behaves differently than desktop.
3. Post-signup: sign up with a real email (verification required — do this
   manually, it's outside the automated suite), then explore the
   authenticated product on desktop: interests-selection onboarding, wallet,
   referrals, any other sections in the sidebar. Compare against pre-login.
4. Post-signup: same, at mobile viewport if practical.
5. While exploring, actively note: real DOM structure for the response
   bubble and pills (button vs div, any stable data-testid/aria attributes),
   what actually happens on empty-input submit, what the response-streaming
   DOM state looks like start to finish, anything resembling a bug or rough
   edge worth flagging in ux-review.md.

After exploring, report back a summary and a proposed plan before writing
any test or artifact: which 4 tests to fill the open slots with (see Part 1
below) and why, and a rough list of what stood out for Part 3/Part 4. Wait
for confirmation on that plan before implementing.

## Confirmed findings from manual exploration (use these, don't guess)

- Pre-login page has a cookie consent banner ("Accept All" / "Reject All" /
  "Manage Settings") that visually covers the suggested-topic pills until
  dismissed. Every test that needs the pills must dismiss it first
  (default to "Reject All" — privacy-preserving choice).
- Suggested-topic pills, exact text, under heading "Suggested topics:":
  "What is Permission", "Best way to earn ASK", "How permission uses my data",
  "What is passive earning", "What is data ownership", "Permission Wallet"
- ASK input placeholder: `"ASK anything..."`. Hint text below it:
  `"Press Shift + Enter for new line."`
- Header (pre-login) has `Log in` and `Sign Up` buttons.
- `/register` requires email verification before an account is usable — don't
  try to automate past that in the test suite. Manual signup for Part 3 is fine.
- Agent response streams with no fixed-duration or fixed-text signal to hook
  into — do not assert on exact response text anywhere, do not use fixed
  `waitForTimeout` as the wait strategy for a response settling.
- Verify real DOM structure (button vs div role, actual response-bubble
  selector) yourself in devtools before finalizing locators — the above is
  confirmed content/copy, not confirmed markup.

## Stack decisions (already made, don't relitigate)

- Playwright + TypeScript, built-in HTML reporter to `artifacts/report/`.
- No page-object model / page-object cathedral for 8 tests. One small
  `tests/helpers.ts` with two functions: cookie-banner dismissal, and a
  streaming-response wait that polls the response locator's text content
  until it's unchanged across N consecutive checks (not a fixed sleep).
  This IS the core technical decision being graded — get it right, and be
  ready to explain it in the demo.
- Mobile: viewport override inside a single test (`test.use({ viewport })`)
  rather than a second Playwright project — keeps total test count
  unambiguous at 8.

## Part 1 — Automated suite (tests/, max 8 tests)

Must include, verbatim:
1. Page loads with suggested-topic pills visible (after dismissing cookie banner)
2. Clicking a suggested topic produces an agent response
3. Submitting free-text via the ASK input produces an agent response
4. Shift+Enter creates a newline instead of sending

Remaining ≤4 tests are our judgment call. Current picks — change only with a
reason:
5. Enter (no shift) submits the message
6. Empty/whitespace-only input does not submit (button disabled or no-op)
7. Mobile viewport (e.g. 375×667): pills wrap without horizontal overflow,
   input remains reachable and usable
8. `Log in` / `Sign Up` header buttons navigate to the correct routes

## Part 2 — Non-deterministic response validation

Pick "What is Permission" pill. Implement within the suite (can reuse test #2
or add explicit assertions there — doesn't need a separate test slot).

Assert (structural/behavioral, not content-exact):
- New response message appears (locator count increases by 1)
- Response text stabilizes (via the polling helper) and is non-empty, above
  a minimum length threshold
- Response is topically relevant via loose case-insensitive keyword match
  (e.g. contains "permission" or "data" — NOT a full-sentence match)
- No visible error state / no literal "undefined", "error", "null" in the
  rendered text

Deliberately do NOT assert: exact wording, exact sentence count, exact
length, tone, or grammar — call this out explicitly in assertions.md.

Write `artifacts/assertions.md` (≤300 words): what's asserted, what's
deliberately not, why. Point to the actual test file/line. Bonus (optional,
not required): 3–4 sentences on wiring one check into an LLM-eval framework
(e.g. DeepEval) — describe, don't necessarily implement.

## Part 3 — UX review (desktop + mobile, pre-login + post-signup)

Automation stays pre-login. This review goes further: sign up for a real
account (any email), explore the authenticated product, compare against
pre-login, and compare desktop vs mobile (state whether mobile testing used
a real device or responsive mode).

Write `artifacts/ux-review.md` (≤400 words):
- What works, what's rough, where desktop/mobile or pre/post-login diverge
  or break — must be specific to THIS product (cookie-banner/pill overlap is
  a good example of the specificity bar; "add dark mode" is not)
- Prioritized list of 3–5 improvements, each with: observation, why it
  matters (user or business impact), rough fix. Priority order is graded —
  order them deliberately, don't just list.

## Part 4 — Data-layer reasoning (no DB access)

Write `artifacts/data-checks.md` (≤300 words + SQL):
- Expected data written when (a) a user messages the agent, (b) a user signs up
- Sketch tables/columns (name them reasonably — reasoning is graded, not the
  exact schema)
- 2–3 SQL queries verifying those writes happened and are consistent
  (orphaned records, populated required fields, sane timestamp ordering)
- One data-integrity check worth adding to a downstream analytics pipeline

Ground this in what was actually observed (email verification step, ASK
wallet balance, referral link, interests-selection onboarding step) — not
generic ecommerce/SaaS schema boilerplate.

## Part 5 — Narrated demo

60–90 seconds, voice narration, `artifacts/demo.mp4`. Show: suite running →
report opening → walk through ONE Part 2 assertion, explaining what it
checks and why it isn't asserting exact response text. This is recorded by
Osama directly (screen recorder + mic), not generated — flag this as a
manual step, don't attempt to script/automate it.

## artifacts/ai-workflow.md (≤300 words) — required, written by Osama

Must answer, specifically, with real examples from this session — not
generic AI-tool-usage prose:
- AI tools used, and why chosen over alternatives
- What AI generated vs. what was rewritten/corrected
- One specific thing the AI got wrong that was caught (e.g. an incorrect
  assumption about suggested-topic pills based on a screenshot taken while
  logged in, corrected after checking incognito — real example from this
  build if it holds up, otherwise use whatever actually happened)
- What was deliberately built by hand / not trusted to AI, and why

## README.md — required sections, in this order

`# Setup` (exact clone-to-run commands, verified from a clean clone)
`# Test strategy (TL;DR)` (max 10 lines: covered, skipped, why)
`# Key decisions` (max 8 bullets — each one names the choice made AND 1–2
alternatives considered and rejected, with the reason. This is an explicit
requirement from the brief: "Clear decisions ('I chose X because…'), with
1–2 alternatives you rejected" — not optional framing, a graded element.
Applies most to framework/reporting choice and wait-strategy choice, but use
it anywhere a real alternative existed, e.g. keyword-match vs. length-only
assertion, or single-project vs. inline-viewport-override for mobile.

Write these decisions to also hold up in a debrief — they've told us
directly what they'll ask about afterward: framework/reporting tradeoffs,
how to extend response validation at scale (evals, golden datasets,
regression detection), folding this into CI/GitHub Actions, verifying the
data layer with real DB access, and what you'd measure to prove your top UX
improvement worked. None of that needs answering now, but decisions and
artifacts should be defensible against those questions, not just correct on
paper.)
`# AI disclosure` (one line linking to artifacts/ai-workflow.md)
`# Next steps` (what you'd do with 1–2 more days)
`# Submission checklist` (paste the checklist from the brief, checked off)

## Things that get this rejected — avoid explicitly

- Any exact-text assertion on agent response content
- Vague assertion descriptions with no pointer to actual code
- Generic "best practices" paragraphs with no product-specific detail
- UX suggestions that could apply to any chat app
- Boilerplate SQL disconnected from what was actually observed
- Padding to 8 tests with shallow duplicate smoke tests
- ai-workflow.md without a real, specific caught mistake
- ai-workflow.md without a real answer for what was deliberately built by
  hand or not trusted to AI (this is a separate named rejection trigger from
  the mistake one — both are required, don't let one substitute for the other)

## If something blocks or is genuinely unclear

Don't guess silently past a real ambiguity, and don't attempt to contact the
client directly (email is sjacobson@permission.io — that's Osama's
decision, not something to act on autonomously). If something blocks
progress (site down, a requirement that's genuinely ambiguous even after
Phase 0 exploration) or if there's a design choice you're not confident is
correct, surface it to Osama in your response and propose your best
interpretation rather than stalling — he decides whether it's worth
emailing or just proceeding.

## Running mistake log (maintain continuously, don't backfill at the end)

Keep `artifacts/_ai-notes.md` (underscore prefix — scratch file, delete
before final commit, not a deliverable). Append one line, as it happens,
any time either of these occurs:

- **[self-caught]** — you notice your own earlier assumption, selector, or
  wait strategy was wrong and fix it before Osama says anything
- **[user-caught]** — Osama corrects, rejects, or pushes back on something
  you did

Format: `- [tag] one-line description of what was wrong and what fixed it`

Example:
```
- [self-caught] assumed response bubble was a <p>, was actually nested in a div with no stable selector — switched to text-content polling on the parent container
- [user-caught] I wrote an "empty input disabled" test assuming the button greys out; Osama confirmed it actually just no-ops silently, corrected assertion
```

This matters because `artifacts/ai-workflow.md` specifically requires "one
thing the AI got wrong that **you** caught" — that's asking whether Osama is
supervising critically, not whether mistakes happened. When ai-workflow.md
is written, only `[user-caught]` entries are valid source material for that
section — `[self-caught]` entries are useful context but don't satisfy the
requirement, since Osama needs to be the one who caught it, not the AI
catching itself. Don't conflate the two when drafting that file.

## Final phase — pre-submission verification (do not skip, do not self-mark done)

Run through this as an actual pass over the repo, not from memory. Report
back status on every line — don't just say "done," show what was checked.

**Their official submission checklist (from the brief, verbatim):**
- [ ] Repo named `sqa-homework-osama-rashid` and default branch is `main`
- [ ] README includes exact Setup + run commands (verified from a clean clone)
- [ ] README word count ≤ 500 (excluding commands/checkboxes)
- [ ] Max 8 tests; all 4 required behaviors covered
- [ ] artifacts/assertions.md included (≤ 300 words)
- [ ] artifacts/ux-review.md included (≤ 400 words, desktop + mobile, post-signup exploration, 3–5 prioritized improvements)
- [ ] artifacts/data-checks.md included (≤ 300 words + SQL: expected data, verification queries, one pipeline integrity check)
- [ ] artifacts/ai-workflow.md included (≤ 300 words, all 4 questions answered)
- [ ] artifacts/report/ included (or hosted link + screenshot)
- [ ] artifacts/demo.mp4 included (60–90 sec, narrated: suite + report + one Part 2 assertion explained)
- [ ] Commit history shows how the work evolved

**Additional checks specific to how we built this (not on their list, but
we're accountable for them):**
- [ ] `artifacts/_ai-notes.md` scratch file deleted, not committed in final state
- [ ] No test anywhere asserts exact/full agent response text — grep for
      literal strings being compared against response content
- [ ] No page-object files exist (`pages/`, `fixtures/`, `utils/` folders) —
      structure is still flat per Phase 0/Key decisions
- [ ] No fixed `waitForTimeout` used as the mechanism for waiting on a
      streaming response to complete
- [ ] Every artifact `.md` file re-read once, specifically checking for any
      sentence that could apply to a generic chat product rather than this one
- [ ] `ai-workflow.md`'s "mistake AI got wrong" is sourced from a
      `[user-caught]` entry in the notes, not `[self-caught]`
- [ ] Word counts actually counted (not eyeballed) for every capped file
- [ ] Clean clone + `npm install` + `npm test` run through once, exactly as
      README's Setup section instructs, to confirm it works from scratch
- [ ] No secrets, API keys, or `.env` values committed anywhere in history

Only after this full pass is confirmed clean is the repo ready to submit.

## Commit hygiene

Commit incrementally as work progresses (setup → test 1 → test 2 → ... →
artifacts → README) — not one giant initial commit. History is reviewed.