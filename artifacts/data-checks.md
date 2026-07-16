# Data layer reasoning — ask.permission.ai

No database access; schema inferred from observed behaviour.

## Expected writes

**User signs up** (`/register` + email verification flow):

| Table | Columns written |
|---|---|
| `users` | `id`, `email`, `password_hash`, `created_at`, `email_verified` (false), `referral_code` |
| `wallets` | `id`, `user_id`, `balance` (0), `created_at` |
| `email_verifications` | `id`, `user_id`, `token`, `expires_at`, `used_at` (null) |

After clicking the verification link: `email_verified = true`, `used_at` set.

After interests-selection onboarding: `user_interests(user_id, category_id, selected_at)` rows.

**User messages the agent** (`POST /api/agent/ask-unauthenticated` or authenticated equivalent):

| Table | Columns written |
|---|---|
| `conversations` | `id`, `user_id` (nullable for unauthenticated), `started_at` |
| `messages` | `id`, `conversation_id`, `role` (`user`/`agent`), `content`, `created_at` |

The unauthenticated auto-greeting writes a `user_id = null` `agent` message. After signup, subsequent conversations link to the real `user_id`.

## Verification queries

```sql
-- 1. Confirm user row exists and email is verified after sign-up flow
SELECT id, email, email_verified, created_at
FROM users
WHERE email = 'user@example.com'
  AND email_verified = true
  AND created_at > NOW() - INTERVAL '1 hour';

-- 2. Confirm wallet was created alongside the user (no orphaned users)
SELECT u.id, u.email, w.balance, w.created_at AS wallet_created
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
WHERE w.id IS NULL   -- orphaned: user has no wallet
   OR w.created_at < u.created_at;  -- wallet predates user (clock skew / ordering bug)

-- 3. Confirm a message exchange was recorded with correct role ordering
SELECT m.role, m.created_at, m.content
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE c.user_id = (SELECT id FROM users WHERE email = 'user@example.com')
ORDER BY m.created_at ASC;
-- Expect: first row role='user', second role='agent', timestamps ascending
```

## Pipeline integrity check worth adding

A downstream analytics pipeline should assert that every `messages` row where `role = 'agent'` is preceded (by `created_at`) by a `role = 'user'` row in the same conversation, and that no conversation contains an agent message with a `created_at` before its `conversation.started_at`. Orphaned agent messages or reversed timestamps indicate a write-order race condition in the streaming response handler.
