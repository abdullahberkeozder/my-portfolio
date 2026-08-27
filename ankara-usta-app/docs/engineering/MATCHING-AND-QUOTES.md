# Matching and Quote Rules

Version: 1.0  
Date: 27 August 2026

## Mandatory eligibility filters

A tradesperson is eligible only when all four conditions are true:

1. The selected service matches the request.
2. The tradesperson serves the request district.
3. An active availability window overlaps the customer's timing horizon; urgent requests additionally require urgent availability.
4. The application is approved and a professional certificate is verified and current.

Bonus points never compensate for a failed mandatory condition.

## Explainable score

| Component | Points | Meaning |
| --- | ---: | --- |
| Exact service | 35 | Mandatory service match |
| District | 25 | Mandatory Ankara district match |
| Availability | 20 | Mandatory timing overlap |
| Verification | 10 | Approved application and current professional evidence |
| Neighborhood | 5 | Optional exact neighborhood coverage |
| Verified reference | 5 | Optional evidence-backed reference |

The database stores the component object and Turkish explanation strings with every decision. Ties are ordered by stable tradesperson ID so the same inputs produce the same order.

## Supply behavior

| Eligible providers | State | Product behavior |
| ---: | --- | --- |
| 0 | `no_supply` | Explain that no provider meets all filters and suggest expanding time or area. |
| 1–2 | `limited_supply` | Continue while clearly communicating limited supply. |
| 3+ | `healthy` | Invite the highest-ranked eligible providers. |

## Quote versioning

- Submitted quotes are immutable records.
- A commercial change creates the next monotonically increasing version and links to the superseded version.
- Previous submitted versions become expired but remain readable for history.
- Comparison uses common fields: labor, material, duration, warranty, included scope, excluded scope, and note.
- Only the latest submitted version from a tradesperson can be accepted.

## Atomic acceptance

`accept_quote` locks the customer request row, checks ownership and current request state, accepts one quote, rejects other open quotes, and moves the request to `provider_selected` inside one database transaction. A partial unique index independently enforces one accepted quote per request. A parallel second call waits for the lock and then fails because the request is no longer open.

