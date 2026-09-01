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
| Match Score | Eşleşme puanı | A reproducible 0–100 score whose components and human-readable reasons are stored with the matching decision. |
| Supply State | Arz durumu | `no_supply`, `limited_supply`, or `healthy`, derived from the number of eligible tradespeople. |
| Quote Version | Teklif sürümü | An immutable commercial proposal that supersedes, rather than edits, an earlier proposal from the same tradesperson. |
| Job | İş | The accepted customer–tradesperson engagement created from one quote or package booking. |
| Job Status | İş durumu | The controlled lifecycle state of a job from scheduling or assessment through work, customer approval, completion, dispute, or cancellation. |
| Job Event | İş olayı | An immutable, monotonically sequenced timeline record for a message or workflow change. |
| Message Room | Mesaj odası | The private conversation shared only by the customer and selected tradesperson of one job. |
| Inspection Appointment | Keşif randevusu | A proposed and counterparty-confirmed appointment attached to a job. |
| Scope | Kapsam | The agreed included work, exclusions, materials, preparation, and constraints. |
| Scope Change | Kapsam değişikliği | A versioned change that becomes active only after both parties approve it. |
| Work Journal | İş günlüğü | Time-ordered evidence covering before, during, materials, changes, and after completion. |
| Customer Acceptance | Müşteri kabulü | The customer's explicit confirmation that the agreed work is complete. |
| Verification | Doğrulama | Evidence-backed confirmation of phone, address, professional documents, or references. |
| Tradesperson Application | Usta başvurusu | The controlled review process through which a tradesperson declares services and areas and submits evidence. |
| Verification Document | Doğrulama belgesi | Private evidence with an explicit type, review status, reviewer, and optional expiry date. |
| Reassessment | Yeniden değerlendirme | A new review required because evidence expired, changed, or was invalidated. |
| Verification Badge | Doğrulama rozeti | A derived public signal shown only while the required evidence is verified and current. |
| Review | Değerlendirme | Feedback that can only be created for a completed platform job. |
| Warranty Record | Dijital işçilik belgesi | A platform record of the agreed workmanship coverage; it is not automatically a commercial guarantee. |
| Complaint | Şikâyet | A reported service, conduct, content, or safety problem that may require moderation. |
| Dispute | Uyuşmazlık | A case with evidence, review states, decisions, and an appeal path. |
| Audit Event | Denetim kaydı | An immutable record of a significant actor, action, subject, timestamp, and reason. |
| Notification Outbox | Bildirim kuyruğu | Durable delivery work created with the domain event and processed later without coupling external delivery to the main transaction. |
| Service Area | Hizmet bölgesi | The district and neighborhood coverage in which a tradesperson accepts work. |

## Naming rules

- Identifiers and database columns use the canonical English term.
- Customer-facing copy uses clear Turkish and avoids internal engineering terminology.
- `Request` means a submitted or draft customer request; it must not be used as a synonym for an HTTP request in domain modules.
- `Match` is an eligibility record, not a completed booking.
- Mandatory matching filters cannot be compensated for by bonus points.
- An accepted quote is immutable; every commercial change before acceptance creates another version.
- Exact address is unavailable during matching and quoting and becomes readable by the selected tradesperson only after a job exists.
- Message and workflow order is defined by the job-event sequence, not client timestamps.
- `Verification` must always name the evidence type; a single generic verified flag is not sufficient.
- Roles and badges are database-owned facts; client metadata and browser input are never authorization sources.
