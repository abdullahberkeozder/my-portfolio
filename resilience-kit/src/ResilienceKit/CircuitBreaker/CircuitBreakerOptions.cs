namespace ResilienceKit.CircuitBreaker;

/// <summary>Configuration for a <see cref="CircuitBreakerPolicy"/>.</summary>
public sealed class CircuitBreakerOptions
{
    /// <summary>
    /// How many consecutive failures open the circuit. Default: 5.
    /// </summary>
    public int FailureThreshold { get; init; } = 5;

    /// <summary>
    /// How long the circuit stays open before allowing a probe request. Default: 30 seconds.
    /// </summary>
    public TimeSpan OpenDuration { get; init; } = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Returns true if this exception should count toward the failure threshold.
    /// By default every exception counts. Override to ignore exceptions that should not trip the circuit
    /// (e.g. validation errors or 4xx responses).
    /// </summary>
    public Func<Exception, bool> IsFailure { get; init; } = _ => true;

    /// <summary>
    /// Called whenever the circuit changes state. Useful for logging and metrics.
    /// </summary>
    public Action<CircuitState, CircuitState>? OnStateChanged { get; init; }

    public static CircuitBreakerOptions Default => new();
}
