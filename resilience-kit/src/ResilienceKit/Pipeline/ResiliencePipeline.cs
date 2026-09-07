using ResilienceKit.CircuitBreaker;
using ResilienceKit.Retry;

namespace ResilienceKit.Pipeline;

/// <summary>
/// Composes retry and circuit breaker into a single execution call.
///
/// The retry wraps the circuit breaker, not the other way around.
/// When the circuit is open it throws immediately, which the retry policy counts as a failed attempt —
/// so the caller gets a fast <see cref="Exceptions.RetryExhaustedException"/> rather than waiting for timeouts.
/// The trade-off is more circuit state updates per caller, but faster detection of broken dependencies.
/// </summary>
public sealed class ResiliencePipeline
{
    private readonly RetryPolicy _retry;
    private readonly CircuitBreakerPolicy _circuitBreaker;

    public ResiliencePipeline(RetryPolicy retry, CircuitBreakerPolicy circuitBreaker)
    {
        _retry = retry;
        _circuitBreaker = circuitBreaker;
    }

    public Task ExecuteAsync(
        Func<CancellationToken, Task> operation,
        CancellationToken cancellationToken = default) =>
        _retry.ExecuteAsync(ct => _circuitBreaker.ExecuteAsync(operation, ct), cancellationToken);

    public Task<T> ExecuteAsync<T>(
        Func<CancellationToken, Task<T>> operation,
        CancellationToken cancellationToken = default) =>
        _retry.ExecuteAsync(ct => _circuitBreaker.ExecuteAsync(operation, ct), cancellationToken);

    public static ResiliencePipelineBuilder Create() => new();
}
