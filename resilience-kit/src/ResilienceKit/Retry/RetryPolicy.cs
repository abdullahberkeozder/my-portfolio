using ResilienceKit.Exceptions;

namespace ResilienceKit.Retry;

/// <summary>
/// Runs an operation and retries it when it fails, according to <see cref="RetryOptions"/>.
/// Stateless and thread-safe — one instance can be shared across concurrent callers.
/// </summary>
public sealed class RetryPolicy
{
    private readonly RetryOptions _options;

    public RetryPolicy(RetryOptions? options = null)
    {
        _options = options ?? RetryOptions.Default;
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
        var exceptions = new List<Exception>();

        for (var attempt = 1; attempt <= _options.MaxAttempts; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                return await operation(cancellationToken);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex) when (_options.ShouldRetry(ex))
            {
                exceptions.Add(ex);

                if (attempt == _options.MaxAttempts)
                    break;

                var delay = _options.Backoff.GetDelay(attempt);
                _options.OnRetry?.Invoke(ex, attempt, delay);

                if (delay > TimeSpan.Zero)
                    await Task.Delay(delay, cancellationToken);
            }
            catch (Exception ex)
            {
                // ShouldRetry returned false — surface immediately rather than wrapping.
                exceptions.Add(ex);
                break;
            }
        }

        throw new RetryExhaustedException(exceptions.Count, exceptions);
    }

    public static RetryPolicy WithOptions(RetryOptions options) => new(options);

    public static RetryPolicy WithMaxAttempts(int maxAttempts) =>
        new(new RetryOptions { MaxAttempts = maxAttempts });
}
