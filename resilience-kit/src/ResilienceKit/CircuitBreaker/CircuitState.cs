namespace ResilienceKit.CircuitBreaker;

public enum CircuitState
{
    Closed,   // Normal — requests pass through.
    Open,     // Too many failures — requests are rejected immediately.
    HalfOpen  // Recovery calls proceed; single-probe concurrency is not enforced.
}
