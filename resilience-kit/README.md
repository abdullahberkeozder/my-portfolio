# resilience-kit

Retry and circuit breaker for .NET, with no external dependencies.

I built this to understand the patterns from the inside rather than just calling Polly.
The code is small enough to read in one sitting and the design notes explain the trade-offs I ran into.

---

## Usage

```csharp
// Retry
var retry = new RetryPolicy(new RetryOptions
{
    MaxAttempts = 3,
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

---

## Why I wrote this instead of using Polly

Short answer: to understand the trade-offs, not to replace Polly.

Inlining retry loops works for one place. By the third place, they have diverged —
different attempt counts, different exception filters, no consistent logging.
Extracting the policy into a named object gives consistency across call sites,
a single place to add metrics, and the ability to inject a zero-delay policy in tests.

What I gave up compared to Polly: hedging, rate-based circuit breaking, distributed state,
and the HttpClientFactory integration. For internal services that don't need those, this is enough.
**If you need any of those things, use Polly.**

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

The circuit breaker is on the inside. When it is open it throws immediately, which the retry
policy sees as a failure and counts toward its attempt budget. The caller gets a fast
`RetryExhaustedException` instead of waiting for timeouts. The alternative — circuit breaker
outside, retry inside — makes the circuit slower to detect a broken dependency because it only
counts the last failure per caller, not each retry attempt.

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

25 tests, all passing. Tests use `ConstantBackoff.Of(TimeSpan.Zero)` so they don't sleep.

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
