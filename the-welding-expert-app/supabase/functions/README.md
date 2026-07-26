# Appointment attachment function

Deploy the anonymous upload endpoint after applying
`sprint_9_appointment_attachments.sql`:

```sh
supabase functions deploy upload-appointment-attachment --no-verify-jwt
```

The endpoint does not trust an anonymous storage policy. It verifies the
appointment id and its unpredictable public token, validates file size, MIME
type and image signature, then writes through the service role to the private
`appointment-attachments` bucket.

Attachment objects and metadata should be removed by a scheduled cleanup job
90 days after the related appointment is archived.

Deploy the cleanup endpoint with JWT verification enabled:

```sh
supabase functions deploy cleanup-appointment-attachments
```

Schedule a daily `POST` request with the Supabase service-role bearer token.
The endpoint removes both private storage objects and their metadata for
requests archived at least 90 days earlier.
