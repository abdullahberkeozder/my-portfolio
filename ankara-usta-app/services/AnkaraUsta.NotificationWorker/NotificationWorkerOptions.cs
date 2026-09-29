namespace AnkaraUsta.NotificationWorker;

public sealed class NotificationWorkerOptions
{
    public const string SectionName = "NotificationWorker";

    public string SupabaseUrl { get; init; } = string.Empty;
    public string SupabaseSecretKey { get; init; } = string.Empty;
    public string ResendApiKey { get; init; } = string.Empty;
    public string FromEmail { get; init; } = string.Empty;
    public int BatchSize { get; init; } = 25;
    public int PollIntervalSeconds { get; init; } = 15;

    public bool IsConfigured =>
        Uri.TryCreate(SupabaseUrl, UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp) &&
        string.IsNullOrEmpty(uri.UserInfo) &&
        string.IsNullOrEmpty(uri.Query) &&
        string.IsNullOrEmpty(uri.Fragment) &&
        !string.IsNullOrWhiteSpace(SupabaseSecretKey) &&
        !string.IsNullOrWhiteSpace(ResendApiKey) &&
        System.Net.Mail.MailAddress.TryCreate(FromEmail, out _);
}
