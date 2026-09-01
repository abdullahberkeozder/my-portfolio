namespace AnkaraUsta.NotificationWorker;

public sealed class NotificationWorkerOptions
{
    public const string SectionName = "NotificationWorker";

    public string SupabaseUrl { get; init; } = string.Empty;
    public string SupabaseServiceRoleKey { get; init; } = string.Empty;
    public string ResendApiKey { get; init; } = string.Empty;
    public string FromEmail { get; init; } = string.Empty;
    public int BatchSize { get; init; } = 25;
    public int PollIntervalSeconds { get; init; } = 15;

    public bool IsConfigured =>
        Uri.TryCreate(SupabaseUrl, UriKind.Absolute, out _) &&
        !string.IsNullOrWhiteSpace(SupabaseServiceRoleKey) &&
        !string.IsNullOrWhiteSpace(ResendApiKey) &&
        !string.IsNullOrWhiteSpace(FromEmail);
}
