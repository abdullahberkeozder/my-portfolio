# Device-local draft ownership

Request and tradesperson application forms now resolve the current Supabase user before mounting. Network/auth lookup failures fail closed. Account drafts use `orkestra:draft:v2:<user-id>:<kind>` in localStorage; anonymous drafts use sessionStorage, not a shared persistent guest key. Request TTL is seven days; application TTL is two hours.

Saved content is not mounted until the user chooses Continue. Delete removes only the current local draft, not database requests or another account's draft. Existing unscoped legacy keys are not read or automatically assigned; their contents remain untouched on disk.

A same-tab anonymous request can be transferred only after the wizard's explicit auth handoff and a second explicit transfer choice on return. The remote request ID is removed when transferring. Existing account and incoming guest drafts are offered separately, not merged. On account changes the previous form is unmounted immediately, then the page reloads after identity verification to discard in-memory fields, Files and stale remote props.

This is UI/data-lifecycle isolation, not encryption against someone with access to browser storage. Server ownership is still enforced by API authentication and RLS. Media File objects still need re-selection after navigation. Anonymous application drafts are session-local and are not automatically claimed by signed-in accounts.

Tests cover account A/B isolation, ignored legacy data, explicit continuation, scoped deletion, explicit guest transfer, auth-network failure and immediate unmount on account switch. Wizard tests separately cover question/summary recovery and idempotency preservation. Auth is mocked; real cross-tab Supabase sessions remain unverified.
