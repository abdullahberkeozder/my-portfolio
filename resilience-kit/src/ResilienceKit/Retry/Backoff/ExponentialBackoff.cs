namespace ResilienceKit.Retry.Backoff;

/// <summary>
/// Doubles the wait after each attempt: base, 2×base, 4×base, up to <paramref name="maxDelay"/>.
/// Good for a single caller. If many callers retry together after a shared failure,
/// use <see cref="ExponentialBackoffWithJitter"/> to scatter the retries.
/// </summary>
public sealed class ExponentialBackoff : IBackoffStrategy
{
    private readonly TimeSpan _baseDelay;
    private readonly TimeSpan _maxDelay;

    public ExponentialBackoff(TimeSpan baseDelay, TimeSpan? maxDelay = null)
    {
        ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(baseDelay, TimeSpan.Zero);
        _baseDelay = baseDelay;
        _maxDelay = maxDelay ?? TimeSpan.FromMinutes(1);
    }

    public TimeSpan GetDelay(int attempt)
    {
        var exponent = Math.Min(attempt - 1, 30);
        var delay = TimeSpan.FromMilliseconds(_baseDelay.TotalMilliseconds * Math.Pow(2, exponent));
        return delay < _maxDelay ? delay : _maxDelay;
    }

    public static ExponentialBackoff Starting(TimeSpan baseDelay, TimeSpan? maxDelay = null)
        => new(baseDelay, maxDelay);
}
