using System.Text.Json;
using System.Text.Json.Serialization;

namespace AnkaraUsta.NotificationWorker;

public sealed record OutboxNotification(
    [property: JsonPropertyName("id")] long Id,
    [property: JsonPropertyName("event_id")] Guid EventId,
    [property: JsonPropertyName("recipient_id")] Guid RecipientId,
    [property: JsonPropertyName("channel")] string Channel,
    [property: JsonPropertyName("payload")] JsonElement Payload,
    [property: JsonPropertyName("attempts")] int Attempts);

public sealed record RenderedEmail(string Subject, string Html, string Text);

internal sealed record SupabaseUser([property: JsonPropertyName("email")] string? Email);

internal sealed record ResendResponse([property: JsonPropertyName("id")] string Id);
