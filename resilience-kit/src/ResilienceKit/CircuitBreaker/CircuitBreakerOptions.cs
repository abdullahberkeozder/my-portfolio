namespace ResilienceKit.CircuitBreaker;

// Configuration for CircuitBreakerPolicy.
public sealed class CircuitBreakerOptions
{
    // Consecutive failures before the circuit opens. Default: 5.
    public int FailureThreshold { get; init; } = 5;

    // How long the circuit stays open before allowing a probe request. Default: 30s.
    public TimeSpan OpenDuration { get; init; } = TimeSpan.FromSeconds(30);

    // Return true if this exception should count toward the threshold.
    // Override to ignore validation errors or 4xx responses that are not dependency failures.
    public Func<Exception, bool> IsFailure { get; init; } = _ => true;

    // Called on every state transition. Use for logging or metrics.
    public Action<CircuitState, CircuitState>? OnStateChanged { get; init; }

    public static CircuitBreakerOptions Default => new();
}
