using System.Net;
using System.Text;
using System.Text.Json;
using AnkaraUsta.NotificationWorker;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;

if (args.Contains("--postgrest-smoke", StringComparer.Ordinal))
{
    await VerifyPostgrestSmokeAsync();
    return;
}

await VerifyBatchDeliveryAsync();
await VerifyResendIdempotencyAsync();
await VerifyHealthEndpointsAsync();
await VerifyFailureAndCancellationAsync();
await VerifyLeaseAcknowledgementAsync();
await VerifySecretKeyHeaderAsync();
Console.WriteLine("Notification worker contract tests passed.");

static async Task VerifyPostgrestSmokeAsync()
{
    const string stagingUrl = "https://hyuijuafuayzultbjvjb.supabase.co";
    var url = Environment.GetEnvironmentVariable("NotificationWorker__SupabaseUrl") ?? stagingUrl;
    var secretKey = Environment.GetEnvironmentVariable("NotificationWorker__SupabaseSecretKey");
    if (!Uri.TryCreate(url, UriKind.Absolute, out var target)
        || !string.Equals(target.Host, new Uri(stagingUrl).Host, StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException("The read-only smoke test is restricted to the isolated staging project.");
    }
    if (string.IsNullOrWhiteSpace(secretKey))
    {
        Console.Write("Staging Secret API key (input hidden; never paste into chat): ");
        secretKey = ReadSecretFromConsole();
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException("No key was entered. No network request was made.");
        }
    }
    if (!secretKey.StartsWith("sb_secret_", StringComparison.Ordinal))
    {
        throw new InvalidOperationException("The supplied value is not a modern Secret API key. No network request was made.");
    }

    using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
    var outbox = new SupabaseOutboxClient(client, new NotificationWorkerOptions
    {
        SupabaseUrl = url,
        SupabaseSecretKey = secretKey
    });
    try
    {
        await outbox.ProbeAsync(CancellationToken.None);
        Console.WriteLine("Read-only Supabase REST endpoint probe passed. No RPC was called and no email was sent.");
    }
    catch (HttpRequestException error)
    {
        var status = error.StatusCode is { } code ? $"HTTP {(int)code} ({code})" : "network/protocol error";
        throw new InvalidOperationException($"Read-only Supabase REST endpoint probe failed: {status}. Credential and response body were suppressed.");
    }
    catch
    {
        throw new InvalidOperationException("Read-only Supabase REST endpoint probe failed: unexpected error. Credential and response body were suppressed.");
    }
}

static string ReadSecretFromConsole()
{
    var characters = new List<char>();
    while (true)
    {
        var key = Console.ReadKey(intercept: true);
        if (key.Key == ConsoleKey.Enter)
        {
            Console.WriteLine();
            return new string(characters.ToArray());
        }
        if (key.Key == ConsoleKey.Backspace)
        {
            if (characters.Count > 0) characters.RemoveAt(characters.Count - 1);
            continue;
        }
        if (!char.IsControl(key.KeyChar)) characters.Add(key.KeyChar);
    }
}

static async Task VerifyHealthEndpointsAsync()
{
    NotificationWorkerOptions Config(string url = "https://example.supabase.co", string serviceKey = "secret-test-key",
        string providerKey = "provider-test-key", string from = "Orkestra <sender@example.com>") =>
        new() { SupabaseUrl = url, SupabaseSecretKey = serviceKey, ResendApiKey = providerKey, FromEmail = from };

    var cases = new (NotificationWorkerOptions Options, bool Ready)[]
    {
        (new(), false), (Config(), true),
        (Config(url: "not-a-url"), false), (Config(url: "file:///tmp/test"), false),
        (Config(url: "https://secret@example.com"), false),
        (Config(serviceKey: " "), false), (Config(providerKey: ""), false),
        (Config(from: "not-an-email"), false),
    };

    foreach (var (options, ready) in cases)
    {
        var builder = WebApplication.CreateBuilder(Array.Empty<string>());
        builder.Logging.ClearProviders();
        await using var app = builder.Build();
        // Only the production endpoint mapping is hosted: no delivery worker,
        // Supabase client or email provider is registered in this HTTP contract test.
        app.Urls.Add("http://127.0.0.1:0");
        app.MapNotificationHealthEndpoints(options);
        await app.StartAsync();
        try
        {
            using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()), Timeout = TimeSpan.FromSeconds(5) };
            foreach (var path in new[] { "/health", "/health/live" })
            {
                using var live = await client.GetAsync(path);
                Assert(live.StatusCode == HttpStatusCode.OK, "Liveness must not depend on configuration.");
            }
            using var response = await client.GetAsync("/health/ready");
            Assert(response.StatusCode == (ready ? HttpStatusCode.OK : HttpStatusCode.ServiceUnavailable), "Readiness HTTP status mismatch.");
            var body = await response.Content.ReadAsStringAsync();
            using var json = JsonDocument.Parse(body);
            Assert(json.RootElement.GetProperty("configured").GetBoolean() == ready, "Configuration state mismatch.");
            Assert(json.RootElement.GetProperty("status").GetString() == (ready ? "ready" : "not_ready"), "Readiness state mismatch.");
            Assert(json.RootElement.GetProperty("scope").GetString() == "configuration", "Must not imply delivery readiness.");
            Assert(!body.Contains("secret-test-key") && !body.Contains("provider-test-key") && !body.Contains("sender@example.com"), "Health must not expose configuration secrets or addresses.");
        }
        finally { await app.StopAsync(); }
    }
    Console.WriteLine("Health HTTP contracts passed: 8 configuration cases; liveness, readiness and redaction.");
}

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

static async Task VerifyFailureAndCancellationAsync()
{
    using var payload = JsonDocument.Parse("""{"event_type":"message_sent"}""");
    var notification = new OutboxNotification(77, Guid.NewGuid(), Guid.NewGuid(), "email", payload.RootElement.Clone(), 1);
    foreach (var missingRecipient in new[] { false, true })
    {
        var outbox = new FakeOutboxClient(notification) { Recipient = missingRecipient ? null : "recipient@example.com" };
        var sender = new FakeEmailSender { Failure = new HttpRequestException("provider unavailable") };
        var processor = new NotificationBatchProcessor(outbox, sender, new NotificationTemplateRenderer(), NullLogger<NotificationBatchProcessor>.Instance);
        await processor.ProcessOnceAsync("failure-test", 10, CancellationToken.None);
        Assert(outbox.Result == (77L, false), "Failure must be recorded, never acknowledged as delivered.");
        Assert(outbox.ResultCalls == 1, "Failure must be recorded exactly once.");
        Assert(!string.IsNullOrWhiteSpace(outbox.Error), "Expected failure reason.");
        Assert(sender.NotificationId == (missingRecipient ? null : 77L), "Missing recipient must never reach the provider.");
    }

    using var cancellation = new CancellationTokenSource();
    var cancelledOutbox = new FakeOutboxClient(notification);
    var cancelledSender = new FakeEmailSender { BeforeSend = cancellation.Cancel };
    var cancelledProcessor = new NotificationBatchProcessor(cancelledOutbox, cancelledSender, new NotificationTemplateRenderer(), NullLogger<NotificationBatchProcessor>.Instance);
    var cancelled = false;
    try { await cancelledProcessor.ProcessOnceAsync("cancel-test", 10, cancellation.Token); }
    catch (OperationCanceledException) { cancelled = true; }
    Assert(cancelled, "Shutdown cancellation must propagate.");
    Assert(cancelledOutbox.ResultCalls == 0, "Shutdown must leave the lease for recovery, not record a delivery failure.");
    Console.WriteLine("Failure contracts passed: provider error, absent recipient, shutdown cancellation.");
}

static void Assert(bool condition, string message)
{
    if (!condition)
    {
        throw new InvalidOperationException(message);
    }
}

static async Task VerifyLeaseAcknowledgementAsync()
{
    using var payload = JsonDocument.Parse("{}");
    var notification = new OutboxNotification(88, Guid.NewGuid(), Guid.NewGuid(), "email", payload.RootElement.Clone(), 3);
    foreach (var deliveryFails in new[] { false, true })
    {
        var outbox = new FakeOutboxClient(notification) { ResultFailure = new HttpRequestException("lease rejected") };
        var sender = new FakeEmailSender { Failure = deliveryFails ? new HttpRequestException("provider failure") : null };
        var processor = new NotificationBatchProcessor(outbox, sender, new NotificationTemplateRenderer(), NullLogger<NotificationBatchProcessor>.Instance);
        var rejected = false;
        try { await processor.ProcessOnceAsync("lease-worker", 1, CancellationToken.None); }
        catch (HttpRequestException) { rejected = true; }
        Assert(rejected && outbox.ResultCalls == 1, "Rejected acknowledgement must propagate without a second write.");
        Assert(outbox.Lease == ("lease-worker", 3), "Result must carry the original claimed generation and worker.");
        Assert(outbox.Result == (88L, !deliveryFails), "Acknowledgement must retain the actual delivery outcome.");
    }
    var handler = new ResultRecordingHandler();
    var client = new SupabaseOutboxClient(new HttpClient(handler), new NotificationWorkerOptions
    { SupabaseUrl = "https://example.supabase.co", SupabaseSecretKey = "test-key" });
    await client.MarkResultAsync(88, "lease-worker", 3, true, null, CancellationToken.None);
    using var body = JsonDocument.Parse(handler.Body!);
    Assert(body.RootElement.GetProperty("p_worker_id").GetString() == "lease-worker"
        && body.RootElement.GetProperty("p_attempt").GetInt32() == 3
        && body.RootElement.GetProperty("p_id").GetInt64() == 88, "RPC payload must serialize fencing fields.");
    Console.WriteLine("Lease contracts passed: generation forwarding, RPC payload, single acknowledgement on success/failure.");
}

static async Task VerifySecretKeyHeaderAsync()
{
    var handler = new ProbeRecordingHandler();
    var client = new SupabaseOutboxClient(
        new HttpClient(handler),
        new NotificationWorkerOptions { SupabaseUrl = "https://example.supabase.co", SupabaseSecretKey = "sb_secret_test" });
    await client.ProbeAsync(CancellationToken.None);
    Assert(handler.Method == HttpMethod.Get && handler.Path == "/rest/v1/", "Connection probe must be a read-only REST GET.");
    Assert(handler.ApiKey == "sb_secret_test" && handler.Authorization is null, "Opaque secret keys must use apikey without a Bearer JWT header.");
    Console.WriteLine("Secret API key contract passed: apikey-only header and read-only REST probe.");
}

sealed class ResultRecordingHandler : HttpMessageHandler
{
    public string? Body { get; private set; }
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Body = await request.Content!.ReadAsStringAsync(cancellationToken);
        return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{}") };
    }
}

sealed class ProbeRecordingHandler : HttpMessageHandler
{
    public HttpMethod? Method { get; private set; }
    public string? Path { get; private set; }
    public string? ApiKey { get; private set; }
    public string? Authorization { get; private set; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Method = request.Method;
        Path = request.RequestUri?.AbsolutePath;
        ApiKey = request.Headers.GetValues("apikey").Single();
        Authorization = request.Headers.Authorization?.ToString();
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
    }
}

sealed class FakeOutboxClient(OutboxNotification notification) : ISupabaseOutboxClient
{
    public (long Id, bool Succeeded)? Result { get; private set; }
    public string? Recipient { get; init; } = "recipient@example.com";
    public int ResultCalls { get; private set; }
    public string? Error { get; private set; }
    public (string WorkerId, int Attempt)? Lease { get; private set; }
    public Exception? ResultFailure { get; init; }

    public Task<IReadOnlyList<OutboxNotification>> ClaimEmailBatchAsync(string workerId, int limit, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<OutboxNotification>>([notification]);

    public Task<string?> ResolveRecipientEmailAsync(Guid recipientId, CancellationToken cancellationToken) =>
        Task.FromResult(Recipient);

    public Task ProbeAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    public Task MarkResultAsync(long notificationId, string workerId, int attempt, bool succeeded, string? error, CancellationToken cancellationToken)
    {
        Result = (notificationId, succeeded);
        ResultCalls++;
        Error = error;
        Lease = (workerId, attempt);
        if (ResultFailure is not null) throw ResultFailure;
        return Task.CompletedTask;
    }
}

sealed class FakeEmailSender : IEmailSender
{
    public Exception? Failure { get; init; }
    public Action? BeforeSend { get; init; }
    public long? NotificationId { get; private set; }
    public RenderedEmail? Email { get; private set; }

    public Task<string> SendAsync(long notificationId, string recipient, RenderedEmail email, CancellationToken cancellationToken)
    {
        NotificationId = notificationId;
        Email = email;
        BeforeSend?.Invoke();
        cancellationToken.ThrowIfCancellationRequested();
        if (Failure is not null) throw Failure;
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
