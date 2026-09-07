using ResilienceKit.CircuitBreaker;
using ResilienceKit.Retry;

namespace ResilienceKit.Pipeline;

// Runs an operation through retry, then circuit breaker.
// The circuit breaker sits on the inside: when it is open it throws immediately,
// which retry counts as a failed attempt; configured backoff delays can still apply.
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
