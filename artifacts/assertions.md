# Response validation assertions (Part 2)

Test: `suite.spec.ts:32` — "clicking 'What is Permission' pill produces an agent response"

## What IS asserted

**Structural count** (`suite.spec.ts:39`): the `.flex.justify-start` locator count increases by exactly 1 after the pill click. This confirms a new agent bubble was added to the DOM, not that existing content changed.

**Minimum length** (`suite.spec.ts:44`): `text.length >= 50`. The 50-char floor is also the `minLength` threshold inside `waitForStableText` — one number, two roles: polling doesn't stop until text is at least 50 chars AND stable across 3 consecutive 500ms checks.

**Topical relevance** (`suite.spec.ts:45`): case-insensitive regex `/permission|data|ask|earn/`. "What is Permission" is about the platform; any genuine response will contain at least one of these terms. This is a loose signal, not a semantic check.

**No error strings** (`suite.spec.ts:46`): `/\bundefined\b|\bnull\b|\berror\b/` must be absent. This catches rendering bugs (unresolved template variables, thrown exceptions serialised into the UI) without constraining legitimate content.

## What is deliberately NOT asserted

- **Exact wording** — the response is LLM-generated and non-deterministic. Asserting a sentence would make the test brittle to model updates and prompt changes.
- **Sentence count, paragraph structure, tone** — layout is the agent's concern, not the test's.
- **Exact length** — a longer-than-50-char bar is a floor, not a target. A 200-word response and a 2-sentence response are both valid.
- **Grammar or factual accuracy** — outside the scope of a structural test.

## Why the polling helper, not a fixed sleep

`waitForStableText` polls every 500ms and requires 3 consecutive stable reads before returning. A fixed `waitForTimeout` would either under-wait (fast network) or over-wait (slow network). The stop button (`agent-chat-input-stop-button`) disappearing is a secondary DOM signal that streaming ended; stable text content is the primary signal.

## Bonus — extending with LLM-eval (DeepEval)

To add semantic validation, the stabilised response string can be passed to a DeepEval `AnswerRelevancyMetric` with the original question as context. The metric scores 0–1; a threshold of 0.7 would flag incoherent or off-topic responses. This adds ~200ms per test and requires an OpenAI/Anthropic API key in CI — worth enabling on a nightly schedule, not every PR run.
