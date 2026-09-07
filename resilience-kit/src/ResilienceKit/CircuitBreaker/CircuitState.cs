namespace ResilienceKit.CircuitBreaker;

public enum CircuitState
{
    /// <summary>Normal operation — requests pass through.</summary>
    Closed,

    /// <summary>Too many failures — requests are rejected immediately to let the dependency recover.</summary>
    Open,

    /// <summary>
    /// One trial request is allowed through. If it succeeds the circuit closes; if it fails it opens again.
    /// </summary>
    HalfOpen
}
