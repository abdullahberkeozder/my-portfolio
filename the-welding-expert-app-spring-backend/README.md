# Umut Usta Spring Backend

This folder contains the isolated Spring backend preparation for the Umut Usta appointment application.

It includes the read-only deployment configuration, PostgreSQL integration migration, CI acceptance tests, and administrator workflow test assets. Database writes remain disabled.

## Hosting status

The Vercel Hobby project was evaluated but did not process `backend/Dockerfile.vercel` as a container image. The deployment completed without Maven or container build steps, and `/api/v1/services` returned `NOT_FOUND`.

The Spring service is therefore not promoted to production. The live frontend remains at [umut-usta.vercel.app](https://umut-usta.vercel.app/appointment). A Java/container-capable host or explicitly enabled Vercel Container Images capability is required before deployment.

## Safety boundary

Do not enable write endpoints, apply production schema changes, or expose customer data until the hosting path, database grants, and staging acceptance results are verified.
