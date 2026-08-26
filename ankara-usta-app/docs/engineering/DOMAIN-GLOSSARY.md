# Ankara Usta Domain Glossary

Version: 1.1
Date: 26 August 2026

This glossary is the shared language for product requirements, source code, analytics, operations, and tests. English terms are canonical in code; Turkish labels remain the customer-facing language.

| Canonical term | Turkish UI term | Definition |
| --- | --- | --- |
| Customer | Müşteri | A person who describes a need, creates a request, compares offers, and accepts completed work. |
| User Role | Kullanıcı rolü | One of customer, tradesperson, moderator, or administrator; it expresses marketplace authorization independently of the identity provider. |
| Tradesperson | Usta | A verified individual or business that serves one or more service and geographic areas. |
| Administrator | Yönetici | A privileged operator who manages taxonomy, users, applications, requests, and disputes. |
| Moderator | Moderatör | An operator with limited authority to review evidence, content, complaints, and disputes. |
| Service Category | Hizmet kategorisi | A stable top-level grouping used for navigation and reporting. |
| Service | Hizmet | A specific job type with aliases, delivery model, scope rules, and a request-question definition. |
| Delivery Model | Hizmet modeli | The commercial route for a service: package, quote, or on-site assessment. |
| Package | Paket hizmet | A standardized job that can be booked within explicit scope and price boundaries. |
| Quote | Teklif | A versioned commercial proposal containing labor, materials, duration, exclusions, and warranty terms. |
| On-site Assessment | Keşif | A visit required before the final method, scope, or price can be determined. |
| Classification | Sınıflandırma | Converting a natural-language problem statement into ranked service candidates. |
| Classification Confidence | Eşleşme güveni | A high, medium, or low indication derived from the leading candidate score and its margin. |
| Request Draft | Talep taslağı | An incomplete, customer-owned request that can be resumed and edited. |
| Service Request | Talep | A submitted description of work including structured scope, approximate location, timing, and media references. |
| Request Status | Talep durumu | The request lifecycle state: draft, submitted, matching, quotes received, provider selected, cancelled, or expired. |
| Match | Eşleşme | A recorded decision that a tradesperson is eligible to receive a request. |
| Job | İş | The accepted customer–tradesperson engagement created from one quote or package booking. |
| Job Status | İş durumu | The controlled lifecycle state of a job from scheduling or assessment through work, customer approval, completion, dispute, or cancellation. |
| Scope | Kapsam | The agreed included work, exclusions, materials, preparation, and constraints. |
| Scope Change | Kapsam değişikliği | A versioned change that becomes active only after both parties approve it. |
| Work Journal | İş günlüğü | Time-ordered evidence covering before, during, materials, changes, and after completion. |
| Customer Acceptance | Müşteri kabulü | The customer's explicit confirmation that the agreed work is complete. |
| Verification | Doğrulama | Evidence-backed confirmation of phone, address, professional documents, or references. |
| Review | Değerlendirme | Feedback that can only be created for a completed platform job. |
| Warranty Record | Dijital işçilik belgesi | A platform record of the agreed workmanship coverage; it is not automatically a commercial guarantee. |
| Complaint | Şikâyet | A reported service, conduct, content, or safety problem that may require moderation. |
| Dispute | Uyuşmazlık | A case with evidence, review states, decisions, and an appeal path. |
| Audit Event | Denetim kaydı | An immutable record of a significant actor, action, subject, timestamp, and reason. |
| Service Area | Hizmet bölgesi | The district and neighborhood coverage in which a tradesperson accepts work. |

## Naming rules

- Identifiers and database columns use the canonical English term.
- Customer-facing copy uses clear Turkish and avoids internal engineering terminology.
- `Request` means a submitted or draft customer request; it must not be used as a synonym for an HTTP request in domain modules.
- `Match` is an eligibility record, not a completed booking.
- `Verification` must always name the evidence type; a single generic verified flag is not sufficient.
