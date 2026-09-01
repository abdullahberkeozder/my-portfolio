using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace AnkaraUsta.NotificationWorker;

public interface ISupabaseOutboxClient
{
    Task<IReadOnlyList<OutboxNotification>> ClaimEmailBatchAsync(string workerId, int limit, CancellationToken cancellationToken);
    Task<string?> ResolveRecipientEmailAsync(Guid recipientId, CancellationToken cancellationToken);
    Task MarkResultAsync(long notificationId, bool succeeded, string? error, CancellationToken cancellationToken);
}

public interface IEmailSender
{
    Task<string> SendAsync(long notificationId, string recipient, RenderedEmail email, CancellationToken cancellationToken);
}

public sealed class SupabaseOutboxClient(HttpClient httpClient, NotificationWorkerOptions options) : ISupabaseOutboxClient
{
    private readonly Uri _baseUri = new(options.SupabaseUrl.TrimEnd('/') + "/");

    public async Task<IReadOnlyList<OutboxNotification>> ClaimEmailBatchAsync(
        string workerId,
        int limit,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Post, "rest/v1/rpc/claim_email_notification_batch");
        request.Content = JsonContent.Create(new
        {
            p_worker_id = workerId,
            p_limit = Math.Clamp(limit, 1, 100)
        });
        using var response = await httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<List<OutboxNotification>>(cancellationToken)
            ?? [];
    }

    public async Task<string?> ResolveRecipientEmailAsync(Guid recipientId, CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Get, $"auth/v1/admin/users/{recipientId:D}");
        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        await EnsureSuccessAsync(response, cancellationToken);
        return (await response.Content.ReadFromJsonAsync<SupabaseUser>(cancellationToken))?.Email;
    }

    public async Task MarkResultAsync(
        long notificationId,
        bool succeeded,
        string? error,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Post, "rest/v1/rpc/mark_notification_result");
        request.Content = JsonContent.Create(new
        {
            p_id = notificationId,
            p_succeeded = succeeded,
            p_error = error
        });
        using var response = await httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string relativePath)
    {
        var request = new HttpRequestMessage(method, new Uri(_baseUri, relativePath));
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.SupabaseServiceRoleKey);
        request.Headers.Add("apikey", options.SupabaseServiceRoleKey);
        return request;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new HttpRequestException(
            $"Supabase request failed with status {(int)response.StatusCode}: {body[..Math.Min(body.Length, 500)]}",
            null,
            response.StatusCode);
    }
}

public sealed class ResendEmailSender(HttpClient httpClient, NotificationWorkerOptions options) : IEmailSender
{
    private static readonly Uri EmailsEndpoint = new("https://api.resend.com/emails");

    public async Task<string> SendAsync(
        long notificationId,
        string recipient,
        RenderedEmail email,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, EmailsEndpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ResendApiKey);
        request.Headers.Add("Idempotency-Key", $"ankara_usta_notification_{notificationId}");
        request.Content = JsonContent.Create(new
        {
            from = options.FromEmail,
            to = new[] { recipient },
            subject = email.Subject,
            html = email.Html,
            text = email.Text
        });

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException(
                $"Resend request failed with status {(int)response.StatusCode}: {body[..Math.Min(body.Length, 500)]}",
                null,
                response.StatusCode);
        }

        var result = await response.Content.ReadFromJsonAsync<ResendResponse>(cancellationToken);
        return result?.Id ?? throw new InvalidOperationException("Resend did not return a delivery identifier.");
    }
}

public sealed class NotificationTemplateRenderer
{
    public RenderedEmail Render(OutboxNotification notification)
    {
        var eventType = ReadString(notification.Payload, "event_type") ?? "job_updated";
        var jobId = ReadString(notification.Payload, "job_id") ?? "unknown";
        var sequence = ReadString(notification.Payload, "sequence") ?? "-";
        var safeJobId = HtmlEncoder.Default.Encode(jobId);
        var safeEvent = HtmlEncoder.Default.Encode(EventLabel(eventType));

        return new RenderedEmail(
            $"Ankara Usta iş güncellemesi: {EventLabel(eventType)}",
            $"<h1>İşinizde yeni bir gelişme var</h1><p>{safeEvent}</p><p>İş kaydı: <strong>{safeJobId}</strong></p><p>Akış sırası: {HtmlEncoder.Default.Encode(sequence)}</p>",
            $"İşinizde yeni bir gelişme var\n{EventLabel(eventType)}\nİş kaydı: {jobId}\nAkış sırası: {sequence}");
    }

    private static string? ReadString(JsonElement payload, string propertyName)
    {
        if (!payload.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind == JsonValueKind.String ? property.GetString() : property.ToString();
    }

    private static string EventLabel(string eventType) => eventType switch
    {
        "message_sent" => "Yeni mesaj gönderildi",
        "inspection_proposed" => "Yeni keşif randevusu önerildi",
        "inspection_responded" => "Keşif randevusu yanıtlandı",
        "scope_change_proposed" => "Kapsam değişikliği önerildi",
        "scope_change_responded" => "Kapsam değişikliği yanıtlandı",
        "status_changed" => "İş durumu güncellendi",
        "address_shared" => "İş adresi paylaşıldı",
        _ => "İş kaydı güncellendi"
    };
}
