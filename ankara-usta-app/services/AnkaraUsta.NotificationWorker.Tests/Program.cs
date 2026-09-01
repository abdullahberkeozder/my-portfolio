using System.Net;
using System.Text;
using System.Text.Json;
using AnkaraUsta.NotificationWorker;
using Microsoft.Extensions.Logging.Abstractions;

await VerifyBatchDeliveryAsync();
await VerifyResendIdempotencyAsync();
Console.WriteLine("Notification worker contract tests passed.");

static async Task VerifyBatchDeliveryAsync()
{
    using var payload = JsonDocument.Parse("""{"job_id":"job-42","sequence":7,"event_type":"message_sent"}""");
    var notification = new OutboxNotification(42, Guid.NewGuid(), Guid.NewGuid(), "email", payload.RootElement.Clone(), 1);
    var outbox = new FakeOutboxClient(notification);
    var sender = new FakeEmailSender();
    var processor = new NotificationBatchProcessor(
        outbox,
        sender,
        new NotificationTemplateRenderer(),
        NullLogger<NotificationBatchProcessor>.Instance);

    var processed = await processor.ProcessOnceAsync("test-worker", 10, CancellationToken.None);
    Assert(processed == 1, "Expected one claimed notification.");
    Assert(sender.NotificationId == 42, "Expected the outbox ID to become the provider idempotency source.");
    Assert(sender.Email?.Subject.Contains("Yeni mesaj", StringComparison.Ordinal) == true, "Expected the message template.");
    Assert(outbox.Result == (42L, true), "Expected a successful outbox result.");
}

static async Task VerifyResendIdempotencyAsync()
{
    var handler = new RecordingHandler();
    var sender = new ResendEmailSender(
        new HttpClient(handler),
        new NotificationWorkerOptions { ResendApiKey = "test-key", FromEmail = "test@example.com" });

    var providerId = await sender.SendAsync(
        99,
        "recipient@example.com",
        new RenderedEmail("Subject", "<p>Body</p>", "Body"),
        CancellationToken.None);

    Assert(providerId == "provider-1", "Expected the provider response ID.");
    Assert(handler.IdempotencyKey == "ankara_usta_notification_99", "Expected a stable Resend idempotency key.");
    Assert(handler.Authorization == "Bearer test-key", "Expected bearer authentication.");
}

static void Assert(bool condition, string message)
{
    if (!condition)
    {
        throw new InvalidOperationException(message);
    }
}

sealed class FakeOutboxClient(OutboxNotification notification) : ISupabaseOutboxClient
{
    public (long Id, bool Succeeded)? Result { get; private set; }

    public Task<IReadOnlyList<OutboxNotification>> ClaimEmailBatchAsync(string workerId, int limit, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<OutboxNotification>>([notification]);

    public Task<string?> ResolveRecipientEmailAsync(Guid recipientId, CancellationToken cancellationToken) =>
        Task.FromResult<string?>("recipient@example.com");

    public Task MarkResultAsync(long notificationId, bool succeeded, string? error, CancellationToken cancellationToken)
    {
        Result = (notificationId, succeeded);
        return Task.CompletedTask;
    }
}

sealed class FakeEmailSender : IEmailSender
{
    public long? NotificationId { get; private set; }
    public RenderedEmail? Email { get; private set; }

    public Task<string> SendAsync(long notificationId, string recipient, RenderedEmail email, CancellationToken cancellationToken)
    {
        NotificationId = notificationId;
        Email = email;
        return Task.FromResult("provider-1");
    }
}

sealed class RecordingHandler : HttpMessageHandler
{
    public string? IdempotencyKey { get; private set; }
    public string? Authorization { get; private set; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        IdempotencyKey = request.Headers.GetValues("Idempotency-Key").Single();
        Authorization = request.Headers.Authorization?.ToString();
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("""{"id":"provider-1"}""", Encoding.UTF8, "application/json")
        });
    }
}
