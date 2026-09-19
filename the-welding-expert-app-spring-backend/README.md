# The Welding Expert App - Spring Backend Showcase

This folder is the independent backend showcase for **The Welding Expert App**. It demonstrates how the appointment domain can be implemented with Spring Boot while keeping the live React and Supabase application in [`the-welding-expert-app/`](../the-welding-expert-app/).

The showcase includes Spring Boot, JPA/Hibernate, PostgreSQL integration, JWT resource-server validation, transaction boundaries, slot-locking tests, read/write privilege separation, and administrator workflow acceptance tests. Database writes remain disabled in this showcase.

This is a portfolio and engineering demonstration package, not a second product. It shares the appointment domain and business rules of The Welding Expert App, but it is intentionally kept separate from the live frontend deployment.

## Hosting status

The Vercel Hobby project was evaluated as a possible host but did not process `backend/Dockerfile.vercel` as a container image. The deployment completed without Maven or container build steps, and `/api/v1/services` returned `NOT_FOUND`.

The Spring service is therefore not promoted to production. The live application remains at [umut-usta.vercel.app](https://umut-usta.vercel.app/appointment), and its current Supabase integration is unaffected. A Java/container-capable host or explicitly enabled Vercel Container Images capability is required before a real backend deployment.

## Safety boundary

Do not enable write endpoints, apply production schema changes, or expose customer data until the hosting path, database grants, and staging acceptance results are verified. Changes here must not be treated as a production release of The Welding Expert App.
