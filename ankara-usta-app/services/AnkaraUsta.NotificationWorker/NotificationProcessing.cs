namespace AnkaraUsta.NotificationWorker;

public sealed class NotificationBatchProcessor(
    ISupabaseOutboxClient outbox,
    IEmailSender emailSender,
    NotificationTemplateRenderer renderer,
    ILogger<NotificationBatchProcessor> logger)
{
    public async Task<int> ProcessOnceAsync(string workerId, int batchSize, CancellationToken cancellationToken)
    {
        var notifications = await outbox.ClaimEmailBatchAsync(workerId, batchSize, cancellationToken);

        foreach (var notification in notifications)
        {
            try
            {
                var recipient = await outbox.ResolveRecipientEmailAsync(notification.RecipientId, cancellationToken);
                if (string.IsNullOrWhiteSpace(recipient))
                {
                    throw new InvalidOperationException("Recipient does not have a deliverable email address.");
                }

                var providerId = await emailSender.SendAsync(
                    notification.Id,
                    recipient,
                    renderer.Render(notification),
                    cancellationToken);
                await outbox.MarkResultAsync(notification.Id, true, null, cancellationToken);
                logger.LogInformation(
                    "Delivered notification {NotificationId} through provider message {ProviderId}",
                    notification.Id,
                    providerId);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                logger.LogWarning(exception, "Notification {NotificationId} will be retried", notification.Id);
                await outbox.MarkResultAsync(notification.Id, false, exception.Message, cancellationToken);
            }
        }

        return notifications.Count;
    }
}

public sealed class NotificationDeliveryWorker(
    IServiceScopeFactory scopeFactory,
    NotificationWorkerOptions options,
    ILogger<NotificationDeliveryWorker> logger) : BackgroundService
{
    private readonly string _workerId = $"notification-worker-{Environment.MachineName}-{Guid.NewGuid():N}";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.IsConfigured)
        {
            logger.LogWarning("Notification worker is disabled because required server-side configuration is missing.");
            return;
        }

        var pollInterval = TimeSpan.FromSeconds(Math.Clamp(options.PollIntervalSeconds, 5, 300));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var processor = scope.ServiceProvider.GetRequiredService<NotificationBatchProcessor>();
                var count = await processor.ProcessOnceAsync(_workerId, options.BatchSize, stoppingToken);
                if (count == 0)
                {
                    await Task.Delay(pollInterval, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Notification batch failed before delivery completion.");
                await Task.Delay(pollInterval, stoppingToken);
            }
        }
    }
}
