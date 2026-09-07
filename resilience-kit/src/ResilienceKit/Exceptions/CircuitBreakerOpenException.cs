namespace ResilienceKit.Exceptions;

/// <summary>
/// Thrown when a call is attempted while the circuit breaker is open.
/// <see cref="RetryAfter"/> is how long until the circuit moves to half-open.
/// </summary>
public sealed class CircuitBreakerOpenException : Exception
{
    public TimeSpan RetryAfter { get; }

    public CircuitBreakerOpenException(TimeSpan retryAfter)
        : base($"Circuit is open. Try again in {retryAfter.TotalSeconds:F1}s.")
    {
        RetryAfter = retryAfter;
    }
}
