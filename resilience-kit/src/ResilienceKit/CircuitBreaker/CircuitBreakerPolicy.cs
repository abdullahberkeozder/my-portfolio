using ResilienceKit.Exceptions;

namespace ResilienceKit.CircuitBreaker;

// Opens after counted failures and resumes calls after a configured duration.
// State mutations are locked, but HalfOpen does not enforce a single concurrent probe.
// Create one instance per protected resource — the state is per-dependency.
public sealed class CircuitBreakerPolicy
{
    private readonly CircuitBreakerOptions _options;
    private readonly Lock _lock = new();

    private CircuitState _state = CircuitState.Closed;
    private int _consecutiveFailures;
    private DateTimeOffset _openedAt;

    public CircuitState State => _state;

    public CircuitBreakerPolicy(CircuitBreakerOptions? options = null)
    {
        _options = options ?? CircuitBreakerOptions.Default;
    }

    public async Task ExecuteAsync(
        Func<CancellationToken, Task> operation,
        CancellationToken cancellationToken = default)
    {
        await ExecuteAsync<bool>(async ct =>
        {
            await operation(ct);
            return true;
        }, cancellationToken);
    }

    public async Task<T> ExecuteAsync<T>(
        Func<CancellationToken, Task<T>> operation,
        CancellationToken cancellationToken = default)
    {
        ThrowIfOpen();

        try
        {
            var result = await operation(cancellationToken);
            OnSuccess();
            return result;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex) when (_options.IsFailure(ex))
        {
            OnFailure();
            throw;
        }
    }

    private void ThrowIfOpen()
    {
        lock (_lock)
        {
            if (_state != CircuitState.Open)
                return;

            var remaining = _options.OpenDuration - (DateTimeOffset.UtcNow - _openedAt);

            if (remaining > TimeSpan.Zero)
                throw new CircuitBreakerOpenException(remaining);

            Transition(CircuitState.HalfOpen);
        }
    }

    private void OnSuccess()
    {
        lock (_lock)
        {
            _consecutiveFailures = 0;
            if (_state != CircuitState.Closed)
                Transition(CircuitState.Closed);
        }
    }

    private void OnFailure()
    {
        lock (_lock)
        {
            _consecutiveFailures++;

            if (_state == CircuitState.HalfOpen || _consecutiveFailures >= _options.FailureThreshold)
            {
                _openedAt = DateTimeOffset.UtcNow;
                Transition(CircuitState.Open);
            }
        }
    }

    private void Transition(CircuitState next)
    {
        var previous = _state;
        _state = next;
        _options.OnStateChanged?.Invoke(previous, next);
    }

    // Resets to Closed. Useful in tests and admin endpoints.
    public void Reset()
    {
        lock (_lock)
        {
            _consecutiveFailures = 0;
            Transition(CircuitState.Closed);
        }
    }

    public static CircuitBreakerPolicy WithOptions(CircuitBreakerOptions options) => new(options);

    public static CircuitBreakerPolicy WithThreshold(int failures, TimeSpan openDuration) =>
        new(new CircuitBreakerOptions { FailureThreshold = failures, OpenDuration = openDuration });
}
