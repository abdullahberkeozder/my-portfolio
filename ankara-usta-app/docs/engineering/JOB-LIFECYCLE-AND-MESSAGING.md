# Job Lifecycle and Messaging

Version: 1.0  
Date: 27 August 2026

## Lifecycle boundary

A job is created only inside the atomic quote-acceptance transaction. It records the accepted quote, request, customer, and selected tradesperson. Direct authenticated inserts or updates are not granted.

## Ordered event stream

Every job carries `next_event_sequence`. Messages and workflow operations lock or atomically update the job row, increment this counter, and append one immutable `job_events` record. `(job_id, sequence)` is unique, so concurrent operations cannot receive the same position.

The event stream covers job creation, messages, status changes, inspection decisions, scope decisions, and address disclosure. Message bodies remain in the private message table; timeline payloads contain only the minimum event context.

## Scope changes

- Either participant can propose a change while the job is non-terminal.
- The proposer approves their own side automatically.
- The counterparty must approve before the change becomes `approved`.
- Rejection is final, and only one pending scope change is allowed per job.
- Commercial deltas and included/excluded scope remain immutable history.

## Address disclosure

Matching and quote records contain only district and neighborhood. The exact address belongs to the job, can be written only by its customer, and becomes readable only to that customer, the selected tradesperson, and authorized support operators.

## Notification reliability

Domain events enqueue durable notification rows in the same database transaction. No email, SMS, or push network request occurs while the job transaction is open.

Workers claim ready rows with `FOR UPDATE SKIP LOCKED`, deliver outside the domain transaction, and report success or failure separately. Failures use capped exponential retry from 30 seconds to one hour. A scheduled lease-recovery job returns abandoned work to the queue and moves exhausted items to `dead` after eight attempts.

