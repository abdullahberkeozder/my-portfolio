# Role and Permission Matrix

Version: 1.0  
Date: 26 August 2026

Roles are stored in `public.user_roles` and evaluated by database policies and server routes. Supabase `user_metadata`, form values, and client-side navigation are not authorization sources.

| Capability | Anonymous | Customer | Tradesperson | Moderator | Administrator |
| --- | --- | --- | --- | --- | --- |
| Browse public taxonomy and eligible directory | Yes | Yes | Yes | Yes | Yes |
| Create and read own requests/media | No | Yes | Yes, as customer | Yes, as customer | Yes, as customer |
| Create or edit own tradesperson application | No | No | Yes | No | No |
| Upload/read own verification evidence | No | No | Yes | No | No |
| Review applications and evidence | No | No | No | Yes | Yes |
| Approve, reject, suspend, or require reassessment | No | No | No | Yes | Yes |
| Create a quote | No | No | Approved and currently verified only | No | No |
| Read matched request scope | No | Own requests | Matched requests only | Yes | Yes |
| Maintain availability | No | No | Own availability only | No | Yes |
| Compare and accept quotes | No | Own requests only | No | No | No |
| Read job room and timeline | No | Own jobs | Own jobs | Yes | Yes |
| Send job messages | No | Own active/history rooms | Own active/history rooms | No | No |
| Share exact address | No | Own job only | Read after selection | No | Read for support |
| Propose scope/inspection | No | Own non-terminal jobs | Own non-terminal jobs | No | Yes |
| Complete a job | No | Customer approval only | No | No | Yes |
| Read administrator audit events | No | No | No | Yes | Yes |
| Assign or revoke operator roles | No | No | No | No | Database bootstrap only |

## Enforcement rules

- A user may hold more than one role; permissions are additive except where a resource requires ownership.
- Application and document review transitions are enforced again by PostgreSQL triggers, not only by the API.
- Public directory verification is derived from current evidence. It is never accepted as a client-provided Boolean.
- Moderator and administrator mutations include an operation reason and are written to `admin_audit_log` by database triggers.
- Quote creation additionally requires a recorded match; direct table insertion and updates are not granted to authenticated clients.
- Job mutations are available only through narrowly scoped lifecycle functions; timeline and message tables are read-only through the Data API.
- Initial operator assignment is deliberately unavailable in the public UI.
