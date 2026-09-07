namespace ResilienceKit.Exceptions;

// Thrown when all retry attempts have been exhausted.
// InnerExceptions contains each failure in order.
public sealed class RetryExhaustedException : Exception
{
    public int Attempts { get; }
    public IReadOnlyList<Exception> InnerExceptions { get; }

    public RetryExhaustedException(int attempts, IReadOnlyList<Exception> exceptions)
        : base($"Operation failed after {attempts} attempt(s).", exceptions.LastOrDefault())
    {
        Attempts = attempts;
        InnerExceptions = exceptions;
    }
}
