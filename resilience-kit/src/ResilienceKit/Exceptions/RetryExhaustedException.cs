namespace ResilienceKit.Exceptions;

/// <summary>
/// Thrown when all retry attempts have been exhausted.
/// Check <see cref="InnerExceptions"/> to see what failed each time.
/// </summary>
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
