namespace ResilienceKit.Exceptions;

// Thrown when a call is attempted while the circuit is open.
public sealed class CircuitBreakerOpenException : Exception
{
    public TimeSpan RetryAfter { get; }

    public CircuitBreakerOpenException(TimeSpan retryAfter)
        : base($"Circuit is open. Try again in {retryAfter.TotalSeconds:F1}s.")
    {
        RetryAfter = retryAfter;
    }
}
