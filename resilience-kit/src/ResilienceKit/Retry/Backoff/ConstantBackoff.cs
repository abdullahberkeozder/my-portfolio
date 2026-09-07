namespace ResilienceKit.Retry.Backoff;

/// <summary>
/// Same fixed delay every time. Simple and predictable.
/// The downside is that concurrent callers all retry at the same moment —
/// use <see cref="ExponentialBackoffWithJitter"/> if that is a concern.
/// </summary>
public sealed class ConstantBackoff : IBackoffStrategy
{
    private readonly TimeSpan _delay;

    public ConstantBackoff(TimeSpan delay)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(delay, TimeSpan.Zero);
        _delay = delay;
    }

    public TimeSpan GetDelay(int attempt) => _delay;

    public static ConstantBackoff Of(TimeSpan delay) => new(delay);
}
