namespace ResilienceKit.CircuitBreaker;

public enum CircuitState
{
    Closed,   // Normal — requests pass through.
    Open,     // Too many failures — requests are rejected immediately.
    HalfOpen  // One probe request allowed; success closes, failure reopens.
}
