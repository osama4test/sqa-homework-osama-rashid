# Response validation assertions (Part 2)

Test: `suite.spec.ts:32` — "clicking 'What is Permission' pill produces an agent response"

## What IS asserted

**Structural count** (`line 39`): `.flex.justify-start` count increases by exactly 1 after pill click. Confirms a new agent bubble was added to the DOM.

**Minimum length** (`line 44`): `text.length >= 50`. The 50-char floor is the same threshold used in `waitForStableText` — one number, two roles: polling doesn't stop until the text is at least 50 chars AND stable across 3 consecutive 500ms checks.

**Topical relevance** (`line 45`): case-insensitive `/permission|data|ask|earn/`. Any genuine response to "What is Permission" will contain at least one of these terms. Loose signal, not a semantic check.

**No error strings** (`line 46`): `/\bundefined\b|\bnull\b|\berror\b/` must be absent. Catches rendering bugs (unresolved template variables, thrown exceptions serialised into the UI) without constraining legitimate content.

## What is deliberately NOT asserted

- **Exact wording** — the response is LLM-generated and non-deterministic. Any exact-string assertion would break on model or prompt updates.
- **Sentence count, paragraph structure, tone** — layout is the agent's concern, not the test's.
- **Exact length** — 50 chars is a floor, not a target.
- **Grammar or factual accuracy** — outside the scope of a structural test.

## Why polling, not a fixed sleep

`waitForStableText` polls every 500ms and requires 3 consecutive identical reads above 50 chars. A fixed `waitForTimeout` over-waits on fast networks and under-waits on slow ones. The stop-button disappearing (`agent-chat-input-stop-button`) is a secondary signal; stable text content is the primary.

## Extending with LLM-eval (optional)

The stabilised string can be passed to a DeepEval `AnswerRelevancyMetric` with the original question as context. A 0–1 score with threshold 0.7 would flag incoherent or off-topic responses. Best run nightly, not on every PR, due to API latency and cost.
