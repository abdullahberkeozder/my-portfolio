using ResilienceKit.Retry.Backoff;

namespace ResilienceKit.Retry;

/// <summary>
/// Configuration for a <see cref="RetryPolicy"/>.
/// All properties are immutable after construction — safe to share across threads.
/// </summary>
public sealed class RetryOptions
{
    /// <summary>Total number of attempts, including the first call. Default: 3.</summary>
    public int MaxAttempts { get; init; } = 3;

    /// <summary>
    /// Returns true if this exception should trigger a retry.
    /// By default every exception retries. Override to ignore exceptions that are not transient.
    /// </summary>
    public Func<Exception, bool> ShouldRetry { get; init; } = _ => true;

    /// <summary>
    /// How long to wait before each retry attempt.
    /// Defaults to exponential backoff with jitter starting at 200 ms.
    /// </summary>
    public IBackoffStrategy Backoff { get; init; } =
        ExponentialBackoffWithJitter.Starting(TimeSpan.FromMilliseconds(200));

    /// <summary>
    /// Called after each failed attempt, just before the delay.
    /// Use this for logging or metrics — not for retry logic itself.
    /// </summary>
    public Action<Exception, int, TimeSpan>? OnRetry { get; init; }

    public static RetryOptions Default => new();

    /// <summary>Retries only on <typeparamref name="TException"/>.</summary>
    public static RetryOptions For<TException>(int maxAttempts = 3)
        where TException : Exception => new()
        {
            MaxAttempts = maxAttempts,
            ShouldRetry = ex => ex is TException
        };
}
