namespace ResilienceKit.Retry.Backoff;

/// <summary>
/// Exponential backoff with full jitter: each delay is a random value in [0, min(cap, base * 2^attempt)].
/// This is the recommended default when multiple callers might retry concurrently after a shared failure.
/// Without jitter they all sleep for the same duration and hit the recovering dependency together.
/// </summary>
public sealed class ExponentialBackoffWithJitter : IBackoffStrategy
{
    private readonly TimeSpan _baseDelay;
    private readonly TimeSpan _maxDelay;
    private readonly Random _random;

    public ExponentialBackoffWithJitter(
        TimeSpan baseDelay,
        TimeSpan? maxDelay = null,
        int? seed = null)
    {
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(baseDelay, TimeSpan.Zero);
        _baseDelay = baseDelay;
        _maxDelay = maxDelay ?? TimeSpan.FromMinutes(1);
        _random = seed.HasValue ? new Random(seed.Value) : Random.Shared;
    }

    public TimeSpan GetDelay(int attempt)
    {
        var exponent = Math.Min(attempt - 1, 30);
        var ceiling = Math.Min(
            _maxDelay.TotalMilliseconds,
            _baseDelay.TotalMilliseconds * Math.Pow(2, exponent));

        return TimeSpan.FromMilliseconds(_random.NextDouble() * ceiling);
    }

    public static ExponentialBackoffWithJitter Starting(TimeSpan baseDelay, TimeSpan? maxDelay = null)
        => new(baseDelay, maxDelay);
}
