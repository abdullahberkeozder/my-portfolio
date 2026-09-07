using ResilienceKit.Retry.Backoff;

namespace ResilienceKit.Retry;

// Init-only configuration. Custom callbacks and backoff strategies must support concurrent use.
public sealed class RetryOptions
{
    // Total attempts including the first call. Default: 3.
    public int MaxAttempts { get; init; } = 3;

    // Return true to retry on this exception. Default: retry on everything.
    public Func<Exception, bool> ShouldRetry { get; init; } = _ => true;

    // Delay strategy between attempts. Default: exponential with jitter starting at 200 ms.
    public IBackoffStrategy Backoff { get; init; } =
        ExponentialBackoffWithJitter.Starting(TimeSpan.FromMilliseconds(200));

    // Called after each failed attempt, before the delay. Use for logging or metrics.
    public Action<Exception, int, TimeSpan>? OnRetry { get; init; }

    public static RetryOptions Default => new();

    // Retry only when the exception is TException.
    public static RetryOptions For<TException>(int maxAttempts = 3)
        where TException : Exception => new()
        {
            MaxAttempts = maxAttempts,
            ShouldRetry = ex => ex is TException
        };
}
