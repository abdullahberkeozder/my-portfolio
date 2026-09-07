namespace ResilienceKit.Retry.Backoff;

// Same fixed delay every attempt. Simple to reason about.
// If many callers fail at the same time, they all retry simultaneously —
// use ExponentialBackoffWithJitter to spread them out.
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
