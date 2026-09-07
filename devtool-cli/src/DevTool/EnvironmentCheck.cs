using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace DevTool;

public sealed record Finding(string Name, string Status, string Message);
public sealed record Report(string Command, int ExitCode, IReadOnlyList<Finding> Checks);
public sealed class VariableRule
{
    public required string Name { get; init; }
    public required string Type { get; init; }
    public bool Required { get; init; } = true;
    public decimal? Min { get; init; }
    public decimal? Max { get; init; }
}
public sealed class EnvironmentSchema
{
    public required int Version { get; init; }
    public required List<VariableRule> Variables { get; init; }
}
public static partial class EnvironmentCheck
{
    [GeneratedRegex("^[A-Za-z_][A-Za-z0-9_]{0,127}$")]
    private static partial Regex VariableName();

    public static EnvironmentSchema Parse(string json)
    {
        var schema = JsonSerializer.Deserialize<EnvironmentSchema>(json, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow
        });
        if (schema is null || schema.Version != 1 || schema.Variables is null || schema.Variables.Count == 0)
            throw new ArgumentException();
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var rule in schema.Variables)
        {
            if (rule is null || rule.Name is null || !VariableName().IsMatch(rule.Name) || !names.Add(rule.Name))
                throw new ArgumentException();
            if (rule.Type is not ("string" or "url" or "integer" or "number" or "boolean"))
                throw new ArgumentException();
            if ((rule.Min.HasValue || rule.Max.HasValue) && rule.Type is not ("integer" or "number"))
                throw new ArgumentException();
            if (rule.Min > rule.Max) throw new ArgumentException();
        }
        return schema;
    }

    public static Report Evaluate(EnvironmentSchema schema, Func<string, string?> read)
    {
        var findings = new List<Finding>();
        foreach (var rule in schema.Variables)
        {
            var value = read(rule.Name);
            if (string.IsNullOrWhiteSpace(value))
            {
                findings.Add(new(rule.Name, rule.Required ? "fail" : "skip",
                    rule.Required ? "Set this required environment variable." : "Optional variable is not set."));
                continue;
            }
            decimal number = 0;
            var valid = rule.Type switch
            {
                "string" => true,
                "url" => Uri.TryCreate(value, UriKind.Absolute, out var uri)
                    && uri.Scheme is "http" or "https" && !string.IsNullOrEmpty(uri.Host),
                "integer" => decimal.TryParse(value, NumberStyles.AllowLeadingSign,
                    CultureInfo.InvariantCulture, out number) && decimal.Truncate(number) == number,
                "number" => decimal.TryParse(value, NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint,
                    CultureInfo.InvariantCulture, out number),
                "boolean" => bool.TryParse(value, out _),
                _ => false
            };
            if (valid && rule.Type is "integer" or "number")
                valid = (!rule.Min.HasValue || number >= rule.Min) && (!rule.Max.HasValue || number <= rule.Max);
            // Never include values in reports, even when validation fails.
            findings.Add(new(rule.Name, valid ? "pass" : "fail",
                valid ? "Valid." : $"Expected {rule.Type} matching the schema constraints."));
        }
        return new("check", findings.Any(f => f.Status == "fail") ? 1 : 0, findings);
    }
}
