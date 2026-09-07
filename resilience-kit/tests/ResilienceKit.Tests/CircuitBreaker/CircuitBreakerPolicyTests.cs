using ResilienceKit.CircuitBreaker;
using ResilienceKit.Exceptions;

namespace ResilienceKit.Tests.CircuitBreaker;

public sealed class CircuitBreakerPolicyTests
{
    // ¦¦ Closed state (normal operation) ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task NewCircuit_IsInClosedState()
    {
        var cb = new CircuitBreakerPolicy();
        Assert.Equal(CircuitState.Closed, cb.State);
    }

    [Fact]
    public async Task ClosedCircuit_SuccessfulCall_RemainsClosedAndReturnsResult()
    {
        var cb = new CircuitBreakerPolicy();
        var result = await cb.ExecuteAsync<string>(_ => Task.FromResult("ok"));
        Assert.Equal("ok", result);
        Assert.Equal(CircuitState.Closed, cb.State);
    }

    // ¦¦ Opening the circuit ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task ClosedCircuit_ReachesFailureThreshold_TransitionsToOpen()
    {
        var cb = CircuitBreakerPolicy.WithThreshold(
            failures: 3,
            openDuration: TimeSpan.FromMinutes(5));

        for (var i = 0; i < 3; i++)
        {
            try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
            catch { /* expected */ }
        }

        Assert.Equal(CircuitState.Open, cb.State);
    }

    [Fact]
    public async Task OpenCircuit_ThrowsCircuitBreakerOpenException_Immediately()
    {
        var cb = CircuitBreakerPolicy.WithThreshold(
            failures: 1,
            openDuration: TimeSpan.FromMinutes(5));

        try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
        catch { /* open the circuit */ }

        Assert.Equal(CircuitState.Open, cb.State);

        await Assert.ThrowsAsync<CircuitBreakerOpenException>(() =>
            cb.ExecuteAsync(_ => Task.CompletedTask));
    }

    // ¦¦ HalfOpen recovery ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task OpenCircuit_AfterDuration_TransitionsToHalfOpen_OnNextCall()
    {
        var stateChanges = new List<(CircuitState from, CircuitState to)>();

        var cb = CircuitBreakerPolicy.WithOptions(new CircuitBreakerOptions
        {
            FailureThreshold = 1,
            OpenDuration = TimeSpan.FromMilliseconds(50),
            OnStateChanged = (from, to) => stateChanges.Add((from, to))
        });

        try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
        catch { /* open the circuit */ }

        await Task.Delay(100); // wait for open duration to pass

        // Next call should probe — circuit moves to HalfOpen
        await cb.ExecuteAsync(_ => Task.CompletedTask); // probe succeeds › Closed

        Assert.Contains(stateChanges, t => t.from == CircuitState.Open && t.to == CircuitState.HalfOpen);
        Assert.Equal(CircuitState.Closed, cb.State);
    }

    [Fact]
    public async Task HalfOpenCircuit_ProbeSucceeds_ClosesCircuit()
    {
        var cb = CircuitBreakerPolicy.WithOptions(new CircuitBreakerOptions
        {
            FailureThreshold = 1,
            OpenDuration = TimeSpan.FromMilliseconds(50)
        });

        try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
        catch { }

        await Task.Delay(100);

        await cb.ExecuteAsync(_ => Task.CompletedTask); // probe succeeds

        Assert.Equal(CircuitState.Closed, cb.State);
    }

    [Fact]
    public async Task HalfOpenCircuit_ProbeFails_ReopensCircuit()
    {
        var cb = CircuitBreakerPolicy.WithOptions(new CircuitBreakerOptions
        {
            FailureThreshold = 1,
            OpenDuration = TimeSpan.FromMilliseconds(50)
        });

        try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
        catch { }

        await Task.Delay(100);

        try { await cb.ExecuteAsync(_ => throw new Exception("still failing")); }
        catch { }

        Assert.Equal(CircuitState.Open, cb.State);
    }

    // ¦¦ IsFailure predicate ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task NonFailureException_DoesNotCountTowardThreshold()
    {
        var cb = CircuitBreakerPolicy.WithOptions(new CircuitBreakerOptions
        {
            FailureThreshold = 2,
            OpenDuration = TimeSpan.FromMinutes(1),
            // Only HttpRequestException counts as a circuit-opening failure
            IsFailure = ex => ex is HttpRequestException
        });

        // ArgumentException does NOT count
        for (var i = 0; i < 5; i++)
        {
            try { await cb.ExecuteAsync(_ => throw new ArgumentException("not a circuit failure")); }
            catch { }
        }

        Assert.Equal(CircuitState.Closed, cb.State);
    }

    // ¦¦ Manual reset ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task Reset_OpensCircuit_ResetsToClosedAndAcceptsRequests()
    {
        var cb = CircuitBreakerPolicy.WithThreshold(1, TimeSpan.FromMinutes(5));

        try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
        catch { }

        Assert.Equal(CircuitState.Open, cb.State);

        cb.Reset();

        Assert.Equal(CircuitState.Closed, cb.State);
        var result = await cb.ExecuteAsync<int>(_ => Task.FromResult(1));
        Assert.Equal(1, result);
    }

    // ¦¦ Cancellation ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task ExecuteAsync_CancellationRequested_DoesNotCountAsFailure()
    {
        using var cts = new CancellationTokenSource();
        var cb = CircuitBreakerPolicy.WithThreshold(1, TimeSpan.FromMinutes(1));

        cts.Cancel();

        var cancelEx = await Record.ExceptionAsync(() =>
            cb.ExecuteAsync(ct => Task.Delay(1000, ct), cts.Token));
        Assert.IsAssignableFrom<OperationCanceledException>(cancelEx);

        // Cancellation must not open the circuit
        Assert.Equal(CircuitState.Closed, cb.State);
    }

    // ¦¦ OnStateChanged callback ¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦

    [Fact]
    public async Task OnStateChanged_IsInvokedOnEveryTransition()
    {
        var transitions = new List<string>();

        var cb = CircuitBreakerPolicy.WithOptions(new CircuitBreakerOptions
        {
            FailureThreshold = 1,
            OpenDuration = TimeSpan.FromMilliseconds(50),
            OnStateChanged = (from, to) => transitions.Add($"{from}->{to}")
        });

        try { await cb.ExecuteAsync(_ => throw new Exception("fail")); }
        catch { }

        await Task.Delay(100);
        await cb.ExecuteAsync(_ => Task.CompletedTask);

        Assert.Contains("Closed->Open", transitions);
        Assert.Contains("Open->HalfOpen", transitions);
        Assert.Contains("HalfOpen->Closed", transitions);
    }
}

