using ResilienceKit.CircuitBreaker;
using ResilienceKit.Retry;

namespace ResilienceKit.Pipeline;

public sealed class ResiliencePipelineBuilder
{
    private RetryOptions? _retryOptions;
    private CircuitBreakerOptions? _circuitBreakerOptions;

    public ResiliencePipelineBuilder WithRetry(RetryOptions options)
    {
        _retryOptions = options;
        return this;
    }

    public ResiliencePipelineBuilder WithCircuitBreaker(CircuitBreakerOptions options)
    {
        _circuitBreakerOptions = options;
        return this;
    }

    public ResiliencePipeline Build() => new(
        new RetryPolicy(_retryOptions),
        new CircuitBreakerPolicy(_circuitBreakerOptions));
}
