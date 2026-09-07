namespace ResilienceKit.Retry.Backoff;

/// <summary>Defines how long to wait before a retry attempt.</summary>
public interface IBackoffStrategy
{
    /// <param name="attempt">1-based attempt number (1 = first retry).</param>
    TimeSpan GetDelay(int attempt);
}
