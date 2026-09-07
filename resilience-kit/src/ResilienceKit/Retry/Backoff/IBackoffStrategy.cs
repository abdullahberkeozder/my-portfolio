namespace ResilienceKit.Retry.Backoff;

// Defines how long to wait before a retry attempt.
public interface IBackoffStrategy
{
    // attempt is 1-based (1 = first retry after the initial failure).
    TimeSpan GetDelay(int attempt);
}
