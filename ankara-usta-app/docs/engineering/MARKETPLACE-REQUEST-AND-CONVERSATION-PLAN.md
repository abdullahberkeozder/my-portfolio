# Marketplace requests, conversations and negotiation

Date: 2026-09-02
Status: M0–M3 and the first M4 revision slice have source implementations; release remains gated. See [M0/M1 evidence](DIRECTED-REQUESTS-M0-M1.md), [M3 evidence](PREJOB-CONVERSATIONS-M3.md) and [M4 evidence](QUOTE-REVISIONS-M4.md).
Scope: Orkestra, currently located in `ankara-usta-app`.

## 1. Product decision

Use one request lifecycle with two entry paths, not two separate products:

- **Find a professional:** directory → profile → directed request → private discussion → quote → acceptance → job.
- **Find offers for my task:** wizard → targeted open request → separate professional conversations and quotes → comparison → acceptance → job.

A request describes a need. A quote describes a professional's proposed agreement. A job exists only after a quote is accepted. Selecting or messaging a professional does not create a job or reserve an appointment.

Add conversation-first contact later: profile → short inquiry → private discussion → prefilled wizard → directed request. This must not block shipping the request-first vertical slice.

## 2. Baseline and evidence limits

Existing code provides a foundation, not proof that the proposed journeys work:

| Area | Existing evidence | Remaining work |
| --- | --- | --- |
| Professional directory | `app/ustalar/page.tsx` reads approved profiles and services | Real service/location filters, pagination and directed entry |
| Professional profile | `app/ustalar/[id]/page.tsx` reads services, areas, moderated reviews, district metrics and verification | Directed request and contextual contact actions |
| Quote creation | `app/api/quotes/route.ts` invokes `create_quote_version` | Directed authorization, negotiation UX and version conflict handling |
| Draft ownership | [Draft ownership](DRAFT-OWNERSHIP.md) | Preserve target professional and routing on every restore path |
| Auth return | [Wizard auth return](WIZARD-AUTH-RETURN.md) | Verify selected professional survives login and account switching |
| Job lifecycle | Existing job-room/RPC foundation | Explicit handoff from the winning pre-job conversation |

Device-local account-scoped drafts are not cross-device cloud synchronization. Component tests with mocked authentication do not establish real multi-account RLS or Realtime correctness. Remote production state was not re-audited for this planning document.

## 3. Identity, audience and distribution

Keep these independent:

1. **Owner:** an authenticated customer owns every published request.
2. **Routing:** `open` or `direct`; a direct request has exactly one target professional in the MVP.
3. **Visibility:** which fields each audience may read.

“Anonymous” means identity-protected, not ownerless. Visitors may draft without signing in. Publishing, sending a message and accepting an offer require authentication. Avoid presenting an account requirement only after the final button is pressed.

Open requests are distributed to eligible, approved professionals matching the service and working area. “Open” does not mean a publicly indexed page with the customer's name, photos and address. Prefer UI wording **Uygun ustalardan teklif al** over **Herkese yayınla**.

Direct requests are visible only to the customer, selected professional and authorized operations staff. If declined or unanswered, offer **Diğer uygun ustalardan teklif al**; never widen visibility automatically. Show a preview of the newly shared fields and obtain explicit customer confirmation. Existing direct conversations remain private.

Reveal only the location granularity needed for eligibility before acceptance. Exact address sharing must use the existing job-stage authorization policy; do not assume that sending a quote grants access. Review free text and media for accidental personal-data exposure as well as structured fields.

## 4. Proposed UX

### Customer

- Home wizard defaults to open matching without an extra mandatory routing decision.
- Profile primary CTA: **Bu ustadan teklif al**. Carry the selected professional into the same wizard.
- Wizard summary clearly says **Yalnızca [professional] görecek** or **Uygun ustalar teklif verebilir**.
- Login return restores service, answers, step, routing and target. Switching account must not silently transfer another customer's draft.
- **Taleplerim** groups drafts and active requests; every card shows audience, status and the next action.
- Request detail contains scope, offers and a separate conversation per professional. Select at most three quotes for side-by-side comparison; this is not a limit of three received offers.
- A quote exposes labor, materials, duration, warranty, exclusions, version and validity. Missing values are explicit, not treated as zero or a promise.
- **Değişiklik iste** sends structured feedback. The professional publishes a new quote version. Ordinary messages never silently change the binding agreement.
- Acceptance confirmation shows the exact professional, version, price and scope. No payment or guaranteed appointment claim unless those capabilities actually exist.

### Professional

- **İş fırsatları:** eligible open requests and private invitations, visibly distinguished.
- **Tekliflerim:** drafts, sent versions, requested revisions, accepted and closed items.
- **Mesajlar:** conversation list with request context and unread state.
- A direct invitation can be declined. Professional approval, suspension, service and area eligibility are rechecked server-side when quoting or accepting an invitation.

### Conversation-first contact (later slice)

Use **İşim hakkında sor** with a service and short topic, rather than unlimited blank direct messages. Create a private inquiry for the authenticated customer and professional. When ready, **Talebe dönüştür** opens the wizard with agreed context for explicit customer review. Do not infer a contract or copy an entire chat into public request text. Preserve an explicit link from the inquiry to its resulting request.

## 5. Domain and authorization contract

Proposed names are conceptual; reconcile them with existing types before writing migrations.

| Concept | Responsibility / invariant |
| --- | --- |
| Request | Customer ownership, routing, target, validated scope, canonical timing and state |
| Invitation | Directed professional response and expiry; separate from request completion state |
| Inquiry | Optional pre-request contact with one professional; introduced later |
| Conversation | Customer + one professional; tied to request or inquiry; never a shared bidding room |
| Quote version | Immutable published terms; explicit current/superseded/expired/withdrawn status |
| Job | Exactly one accepted quote snapshot for a request |

Do not add a second conflicting request state machine. Model invitations, conversation lifecycle and quote revisions separately, reusing existing request/job transitions.

Required boundaries:

- Enforce owner/participant and role checks in the database/RPC layer, not just hidden buttons.
- Customer A cannot read customer B's request, draft, quote, conversation or attachment.
- Professional A cannot read professional B's quote or conversation, even when both bid on the same open request.
- Open discovery exposes an explicitly limited projection; clients must not receive full private rows and hide fields in React.
- Admin access is authorized and purpose-scoped; moderation decisions include actor, time and reason. Avoid blanket access for every staff role.
- Attachments use private storage and authorized access; retry/finalize must not create accessible orphan files.
- Rate-limit publishing, invitations and first contact. Provide report/block actions; blocked and suspended actors cannot bypass restrictions through direct IDs.
- Expiry and eligibility are enforced by the server. Client countdowns are informational only.

## 6. Negotiation, acceptance and Realtime

MVP negotiation is customer revision request → professional replacement quote. Defer a fully bidirectional counteroffer engine.

Acceptance must atomically validate owner, request status, professional eligibility, current quote version and expiry; accept one version; close competing acceptance paths; and create one job. A simultaneous second acceptance must fail with a recoverable conflict message. Accepted terms cannot be edited afterwards; changes use the existing bilateral job-scope-change mechanism.

Pre-job messages and job messages remain distinct. After acceptance link the winning conversation to the job for context; do not import losing bidders' conversations or expose them to the winner. Define a clear closed/read-only state for unsuccessful negotiations and an explicit retention policy before release.

Persist messages before broadcasting; use stable IDs, server ordering and retry deduplication. On reconnect, fetch authoritative state rather than trusting event delivery. Realtime is a UX update mechanism, never the authority for acceptance. Notification failures must not roll back accepted quotes or persisted messages; use the existing outbox/retry foundation where applicable.

## 7. Sequenced delivery backlog

M0/M1 now have a local source implementation; their verification gates are tracked in [implementation evidence](DIRECTED-REQUESTS-M0-M1.md). M2 also has a local implementation, tracked in [M2 evidence](REQUEST-INVITATIONS-M2.md). M3 text conversations are implemented with local application checks passing; database and multi-account verification remain pending in [M3 evidence](PREJOB-CONVERSATIONS-M3.md). The first M4 slice (revision request, new version and change summary) is implemented with local application checks in [M4 evidence](QUOTE-REVISIONS-M4.md). Remaining M4 acceptance work and M5 remain planned. No item is production-verified by this document.

| Slice | Deliverable | Exit evidence |
| --- | --- | --- |
| M0 — Contracts | Reconcile existing states; define routing, visibility, participant matrix and direct→open transition | Domain tests reject invalid targets, ownerless publication and unauthorized audience changes |
| M1 — Directed requests | Directory filters, profile CTA, target-aware wizard, auth return and customer summary | Selected professional and answers survive login/refresh; other professionals cannot access a direct request |
| M2 — Open distribution | Reuse matching for eligible opportunities; invitations, decline, expiry and consented fallback | Eligibility enforced on read/write; no automatic publication; empty supply has a truthful next action |
| M3 — Pre-job conversations | Request-bound private text rooms, unread/error/retry states; attachments deferred | Customer and professional exchange messages; another bidder cannot read them; retries deduplicate |
| M4 — Negotiation and acceptance | Revision request, version history, max-three comparison and job handoff | Stale version rejected; parallel acceptance creates one job; accepted terms immutable |
| M5 — Inquiry and operations | Conversation-first contact, inquiry conversion, reporting/blocking, operational inbox | Conversion preserves participants and context without duplicate requests; abuse controls and audit coverage |

M1 and M2 should produce usable request flows before adding another navigation section. M3 and M4 complete the core commercial journey. M5 is an enhancement, not an MVP prerequisite. Estimate calendar time after the M0 code/schema inventory rather than assuming all existing RPCs cover new authorization rules.

## 8. Validation and rollout

Run targeted tests after coherent changes, not the entire suite after every edit. Run lint, type-check, relevant regression tests and build before merge.

Required acceptance scenarios:

1. Guest chooses a professional → drafts → logs in → explicitly claims draft → returns to the same target and step → publishes once.
2. Customer A saves; customer B signs in on the same browser → no A content is shown or submitted.
3. An unrelated professional attempts a directed request URL/API/media path → access denied.
4. Two eligible professionals bid on one open request → customer can compare; bidders cannot see each other's terms or messages.
5. Customer requests a revision → professional publishes v2 → accepting v1 is rejected with a refresh action.
6. Two sessions accept different offers concurrently → exactly one accepted quote and one job.
7. Simultaneous messages/reconnect/retry → no duplicate messages, stable server ordering, both sessions converge.
8. Professional declines or invitation expires → customer explicitly chooses broaden visibility; private history remains private.
9. Professional becomes suspended before acceptance → server rejects acceptance and provides a safe next action.
10. Completed job → only authorized customer can leave a job-linked review; no review before completion.

Validate 320 px and 390 px mobile layouts, tablet and desktop; keyboard focus, readable comparisons, reachable actions, error announcements and reduced motion. Do not make the customer use horizontal tables to read essential quote terms on mobile.

Real multi-account Auth/RLS/Realtime tests require an explicitly approved isolated environment and test identities. That environment is currently deferred. Keep these tests marked **not run**, never replace their evidence with mocked tests or page reloads. No production test jobs, paid resources or test accounts are authorized by this plan.

Before release: review migrations and access policies, run the real acceptance suite, verify operational reporting/retention rules, and document rollout/rollback. Keep direct/open features gated until their authorization boundaries pass.

## 9. Success measures and exclusions

Measure request publication, eligible supply, time to first valid quote, quote response rate, revision-to-acceptance, acceptance conflicts, unanswered invitations and abandonment by step. Separate conversation starts from actual requests and jobs. Establish baselines before setting targets; do not collect raw messages, addresses or photos in analytics. Use consent for optional behavioral tracking and minimize operational telemetry.

Out of scope for the first release: ownerless anonymous publication, publicly indexed personal requests, mass direct messages, automatic direct→open conversion, auctions exposing competitors' prices, payment/escrow/refunds, guaranteed appointment slots, and treating chat text as an accepted contract.

## 10. Next implementation instruction

Start with **M0 + M1**, bounded to the directed-request contract and vertical UI path. Inspect existing migrations before changing the schema. Preserve the current open-request path and draft ownership rules. Do not implement a second wizard. Add the target professional to validation, scoped draft persistence, auth return and final visibility summary together; shipping only a profile button would leave the journey incomplete.

Track each slice as Planned → Implemented → Locally verified → Multi-account verified → Released. Record commit, tests, migration and known limits at each transition. This document is a planning artifact only; no application or database changes were made as part of its creation.

Implementation began subsequently on 2026-09-02. The original creation statement above describes the planning turn, not the subsequent code changes. Follow the linked evidence log for current delivery status.

### Scheduling decision — 2026-09-02

The user chose to continue product development and defer the six outstanding M0/M1 database, real-browser and release checks to the final validation stage. Follow [Deferred pre-release validation](PRE-RELEASE-VALIDATION-BACKLOG.md) as the single checklist. Do not provision test infrastructure now or treat the deferred checks as completed. Activation and release remain conditional on passing them; targeted development checks are not removed by this decision.
