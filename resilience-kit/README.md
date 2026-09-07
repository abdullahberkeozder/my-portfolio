# resilience-kit

A small C# library for retries, backoff, and circuit breaking, targeting .NET 10.

I built this to understand the patterns from the inside rather than just calling Polly.
The code and tests explore exception filtering, cancellation, recovery, and policy order.
The library has no third-party runtime package dependencies; the test project uses xUnit and test tooling.

## Getting started

Install the .NET 10 SDK. From the `my-portfolio` repository root:

```bash
dotnet restore resilience-kit/ResilienceKit.slnx
dotnet build resilience-kit/ResilienceKit.slnx --configuration Release --no-restore
dotnet test resilience-kit/ResilienceKit.slnx --configuration Release --no-build
```

To use the library in a .NET 10 application, add a project reference, replacing the application path:

```bash
dotnet add path/to/YourApp.csproj reference resilience-kit/src/ResilienceKit/ResilienceKit.csproj
```

---

## Usage

```csharp
using ResilienceKit.Retry;
using ResilienceKit.Retry.Backoff;
using ResilienceKit.CircuitBreaker;
using ResilienceKit.Pipeline;

// Integration snippets: supply your HTTP client, logger, database, and email adapter.
var retry = new RetryPolicy(new RetryOptions
{
    MaxAttempts = 3,
    ShouldRetry = ex => ex is HttpRequestException,
    Backoff = ExponentialBackoffWithJitter.Starting(TimeSpan.FromMilliseconds(200)),
    OnRetry = (ex, attempt, delay) =>
        logger.LogWarning("Attempt {Attempt} failed: {Message}. Retrying in {Delay}ms",
            attempt, ex.Message, delay.TotalMilliseconds)
});

var body = await retry.ExecuteAsync(ct => httpClient.GetStringAsync(url, ct));

// Circuit breaker
var cb = CircuitBreakerPolicy.WithThreshold(failures: 5, openDuration: TimeSpan.FromSeconds(30));
await cb.ExecuteAsync(ct => db.ExecuteAsync(sql, ct));

// Both together
var pipeline = ResiliencePipeline.Create()
    .WithRetry(new RetryOptions { MaxAttempts = 3 })
    .WithCircuitBreaker(new CircuitBreakerOptions { FailureThreshold = 5 })
    .Build();

await pipeline.ExecuteAsync(ct => emailService.SendAsync(message, ct));
```

`MaxAttempts` includes the first call. Reuse a circuit breaker or pipeline for the same
dependency so its state persists between calls. The builder always creates both policies;
omitted options use their defaults. Pass cancellation tokens through to the underlying operation.

These snippets illustrate integration points, not a complete application. Retrying a write
or sending an email again is only safe when the application or provider handles duplicates.
The library itself does not provide idempotency.

---

## Why I wrote this instead of using Polly

Short answer: to understand the trade-offs, not to replace Polly.

Inlining retry loops works for one place. By the third place, they have diverged —
different attempt counts, different exception filters, no consistent logging.
Extracting the policy into a named object gives consistency across call sites,
a single place to add metrics, and the ability to inject a zero-delay policy in tests.

This implementation has no hedging, sliding-window failure rate, shared circuit state,
or HTTP-specific integration. For production work I would evaluate an established library
such as Polly against the actual requirements. This project is an exercise in understanding
the behavior and its trade-offs, with the limitations below still to address.

---

## Circuit breaker

```
Closed ──(N failures)──► Open ──(duration elapsed)──► HalfOpen
  ▲                                                        │
  └──────────────────(probe succeeds)─────────────────────┘
                    (probe fails → back to Open)
```

The circuit breaker tracks consecutive failures, not failures within a sliding window.
A window-based approach is more accurate under bursty traffic, but the consecutive model
covers the common case (dependency goes from healthy to completely broken) and is simpler to reason about.

State is in-process. If you run multiple instances behind a load balancer and need the circuit
to trip across all of them, you need a shared backing store. That is out of scope here.

### Execution order in the pipeline

```
RetryPolicy → CircuitBreakerPolicy → operation
```

The breaker is inside retry, so it sees every attempted operation, including retries.
One caller can therefore contribute multiple failures toward the threshold. A breaker
outside retry would instead see the final outcome of each retry execution.

With defaults, retry also catches `CircuitBreakerOpenException`. The dependency is not
called while the circuit is open, but backoff delays still apply between attempts.
The whole pipeline is therefore not guaranteed to fail immediately.
Use `ShouldRetry` to select relevant transient exceptions and exclude open-circuit rejections
when appropriate. Excluded operation failures are still wrapped in `RetryExhaustedException`.

---

## Backoff strategies

| Strategy | Delay | When to use |
|---|---|---|
| `ConstantBackoff` | Fixed, same every time | Predictable load or tests |
| `ExponentialBackoff` | Doubles each attempt | Single caller |
| `ExponentialBackoffWithJitter` | Random in [0, cap] | **Multiple concurrent callers — the default** |

Without jitter, many callers that fail at the same moment all sleep for exactly the same duration
and hit the recovering dependency simultaneously. Jitter scatters them.

---

## Running the tests

```bash
dotnet test
```

Run this command from the `resilience-kit` directory. The suite covers retry outcomes,
exception filters, cancellation, callbacks, backoff caps, circuit transitions, and composition.
Retry tests generally use zero-delay backoff. Several circuit recovery tests use
`Task.Delay(100)` to let a 50 ms open duration expire, so the suite depends partly on real time.

## Current limitations

- HalfOpen does not reserve a single probe. Concurrent callers can enter, and in-flight
  results can affect newer circuit state. Locks protect individual mutations, not a fully
  coordinated recovery cycle.
- Recovery uses `DateTimeOffset.UtcNow`; there is no injectable clock.
- Options are not comprehensively validated, including attempt counts, thresholds,
  open durations, and exponential delay caps.
- User callbacks and predicates are not isolated from exceptions. State-change callbacks
  execute inside the state lock; keep them short and non-throwing.
- Cancellation propagates without retry wrapping or counting as a circuit failure.
  Cancellation or an excluded exception during HalfOpen leaves that state unchanged.
- There is no operation timeout, durable job storage, or built-in metrics exporter.

Next steps include an injectable clock, concurrent recovery tests, and option validation.
The current tests do not establish single-probe safety under concurrent load.

This is a separate portfolio library. It is not currently integrated into the Orkestra notification worker.

---

## Project layout

```
src/ResilienceKit/
  Retry/
    RetryPolicy.cs
    RetryOptions.cs
    Backoff/
      IBackoffStrategy.cs
      ConstantBackoff.cs
      ExponentialBackoff.cs
      ExponentialBackoffWithJitter.cs
  CircuitBreaker/
    CircuitBreakerPolicy.cs
    CircuitBreakerOptions.cs
    CircuitState.cs
  Pipeline/
    ResiliencePipeline.cs
    ResiliencePipelineBuilder.cs
  Exceptions/
    RetryExhaustedException.cs
    CircuitBreakerOpenException.cs

tests/ResilienceKit.Tests/
  Retry/RetryPolicyTests.cs
  CircuitBreaker/CircuitBreakerPolicyTests.cs
  Pipeline/ResiliencePipelineTests.cs
```
