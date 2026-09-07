using ResilienceKit.CircuitBreaker;
using ResilienceKit.Exceptions;
using ResilienceKit.Pipeline;
using ResilienceKit.Retry;
using ResilienceKit.Retry.Backoff;

namespace ResilienceKit.Tests.Pipeline;

public sealed class ResiliencePipelineTests
{
    [Fact]
    public async Task Pipeline_SuccessOnFirstAttempt_ReturnsResult()
    {
        var pipeline = ResiliencePipeline.Create()
            .WithRetry(new RetryOptions { MaxAttempts = 3, Backoff = ConstantBackoff.Of(TimeSpan.Zero) })
            .WithCircuitBreaker(new CircuitBreakerOptions { FailureThreshold = 5 })
            .Build();

        var result = await pipeline.ExecuteAsync<string>(_ => Task.FromResult("success"));
        Assert.Equal("success", result);
    }

    [Fact]
    public async Task Pipeline_AllAttemptsFail_ThrowsRetryExhaustedException()
    {
        var pipeline = ResiliencePipeline.Create()
            .WithRetry(new RetryOptions { MaxAttempts = 3, Backoff = ConstantBackoff.Of(TimeSpan.Zero) })
            .WithCircuitBreaker(new CircuitBreakerOptions { FailureThreshold = 10 })
            .Build();

        await Assert.ThrowsAsync<RetryExhaustedException>(() =>
            pipeline.ExecuteAsync(_ => throw new HttpRequestException("service down")));
    }

    [Fact]
    public async Task Pipeline_OpenCircuit_CausesRetryExhaustion_Quickly()
    {
        // When the circuit is open, each retry attempt fast-fails with
        // CircuitBreakerOpenException rather than waiting for the real operation.
        // This means retries exhaust quickly — intended behaviour.
        var cb = CircuitBreakerPolicy.WithOptions(new CircuitBreakerOptions
        {
            FailureThreshold = 1,
            OpenDuration = TimeSpan.FromMinutes(10)
        });

        // Open the circuit
        try { await cb.ExecuteAsync(_ => throw new Exception("open it")); }
        catch { }

        var retry = new RetryPolicy(new RetryOptions
        {
            MaxAttempts = 3,
            Backoff = ConstantBackoff.Of(TimeSpan.Zero)
        });

        var pipeline = new ResiliencePipeline(retry, cb);

        var ex = await Assert.ThrowsAsync<RetryExhaustedException>(() =>
            pipeline.ExecuteAsync(_ => Task.CompletedTask));

        // All 3 attempts should have been rejected by the open circuit
        Assert.Equal(3, ex.Attempts);
        Assert.All(ex.InnerExceptions, e => Assert.IsType<CircuitBreakerOpenException>(e));
    }
}
