using ResilienceKit.Exceptions;
using ResilienceKit.Retry;
using ResilienceKit.Retry.Backoff;

namespace ResilienceKit.Tests.Retry;

public sealed class RetryPolicyTests
{
    // ¦¦ Success path ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task ExecuteAsync_SucceedsOnFirstAttempt_ReturnsResult()
    {
        var policy = new RetryPolicy();
        var result = await policy.ExecuteAsync<int>(_ => Task.FromResult(42));
        Assert.Equal(42, result);
    }

    [Fact]
    public async Task ExecuteAsync_SucceedsOnSecondAttempt_ReturnsResult()
    {
        var attempts = 0;
        var policy = new RetryPolicy(new RetryOptions
        {
            MaxAttempts = 3,
            Backoff = ConstantBackoff.Of(TimeSpan.Zero)
        });

        var result = await policy.ExecuteAsync<int>(_ =>
        {
            attempts++;
            if (attempts < 2) throw new InvalidOperationException("transient");
            return Task.FromResult(99);
        });

        Assert.Equal(99, result);
        Assert.Equal(2, attempts);
    }

    // ¦¦ Failure path ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task ExecuteAsync_AllAttemptsFail_ThrowsRetryExhaustedException()
    {
        var policy = new RetryPolicy(new RetryOptions
        {
            MaxAttempts = 3,
            Backoff = ConstantBackoff.Of(TimeSpan.Zero)
        });

        var ex = await Assert.ThrowsAsync<RetryExhaustedException>(() =>
            policy.ExecuteAsync(_ => throw new HttpRequestException("down")));

        Assert.Equal(3, ex.Attempts);
        Assert.Equal(3, ex.InnerExceptions.Count);
        Assert.All(ex.InnerExceptions, e => Assert.IsType<HttpRequestException>(e));
    }

    [Fact]
    public async Task ExecuteAsync_ShouldRetryReturnsFalse_ThrowsImmediately()
    {
        var attempts = 0;
        var policy = new RetryPolicy(new RetryOptions
        {
            MaxAttempts = 5,
            ShouldRetry = ex => ex is not ArgumentException,
            Backoff = ConstantBackoff.Of(TimeSpan.Zero)
        });

        await Assert.ThrowsAsync<RetryExhaustedException>(() =>
            policy.ExecuteAsync(_ =>
            {
                attempts++;
                throw new ArgumentException("non-retryable");
            }));

        // Should not have retried — ArgumentException is excluded
        Assert.Equal(1, attempts);
    }

    // ¦¦ Cancellation ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task ExecuteAsync_CancellationRequested_ThrowsOperationCancelledException()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        var policy = new RetryPolicy();

        await Assert.ThrowsAsync<OperationCanceledException>(() =>
            policy.ExecuteAsync(ct => Task.Delay(1000, ct), cts.Token));
    }

    // ¦¦ OnRetry callback ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task ExecuteAsync_OnRetryCallback_InvokedOnEachFailure()
    {
        var retryLog = new List<(int attempt, TimeSpan delay)>();

        var policy = new RetryPolicy(new RetryOptions
        {
            MaxAttempts = 3,
            Backoff = ConstantBackoff.Of(TimeSpan.Zero),
            OnRetry = (_, attempt, delay) => retryLog.Add((attempt, delay))
        });

        await Assert.ThrowsAsync<RetryExhaustedException>(() =>
            policy.ExecuteAsync(_ => throw new Exception("boom")));

        // OnRetry is called after each failure except the last (no more retries after that)
        Assert.Equal(2, retryLog.Count);
        Assert.Equal(1, retryLog[0].attempt);
        Assert.Equal(2, retryLog[1].attempt);
    }

    // ¦¦ Backoff strategies ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public void ExponentialBackoff_DelaysDoNotExceedMaxDelay()
    {
        var backoff = ExponentialBackoff.Starting(
            TimeSpan.FromMilliseconds(100),
            maxDelay: TimeSpan.FromSeconds(2));

        for (var i = 1; i <= 20; i++)
        {
            var delay = backoff.GetDelay(i);
            Assert.True(delay <= TimeSpan.FromSeconds(2),
                $"Attempt {i}: delay {delay} exceeded max");
        }
    }

    [Fact]
    public void ExponentialBackoffWithJitter_DelaysDoNotExceedMaxDelay()
    {
        var backoff = new ExponentialBackoffWithJitter(
            TimeSpan.FromMilliseconds(100),
            maxDelay: TimeSpan.FromSeconds(2),
            seed: 42); // deterministic for testing

        for (var i = 1; i <= 20; i++)
        {
            var delay = backoff.GetDelay(i);
            Assert.True(delay <= TimeSpan.FromSeconds(2),
                $"Attempt {i}: delay {delay} exceeded max");
        }
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(10)]
    public void ConstantBackoff_AlwaysReturnsConfiguredDelay(int seconds)
    {
        var expected = TimeSpan.FromSeconds(seconds);
        var backoff = ConstantBackoff.Of(expected);

        for (var i = 1; i <= 5; i++)
            Assert.Equal(expected, backoff.GetDelay(i));
    }
}
