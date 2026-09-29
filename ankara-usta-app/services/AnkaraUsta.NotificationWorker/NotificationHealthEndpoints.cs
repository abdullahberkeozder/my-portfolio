namespace AnkaraUsta.NotificationWorker;

public static class NotificationHealthEndpoints
{
    public static void MapNotificationHealthEndpoints(this WebApplication app, NotificationWorkerOptions options)
    {
        // Preserve the existing endpoint as a liveness alias, not a delivery probe.
        app.MapGet("/health", () => Results.Ok(new
        {
            status = "ok",
            integration = "supabase-outbox-to-resend",
            configured = options.IsConfigured,
            scope = "process"
        }));
        app.MapGet("/health/live", () => Results.Ok(new { status = "ok", scope = "process" }));
        app.MapGet("/health/ready", () => Results.Json(new
        {
            status = options.IsConfigured ? "ready" : "not_ready",
            scope = "configuration",
            configured = options.IsConfigured
        }, statusCode: options.IsConfigured ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable));
    }
}
