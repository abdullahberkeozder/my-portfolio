using System.Text.Json;

namespace DevTool;
public static class Cli
{
    public static async Task<int> RunAsync(string[] args, TextWriter output,
        Func<string, string?>? environment = null)
    {
        var json = args.Contains("--json");
        var stage = "arguments";
        Report report;
        try
        {
            if (args.Length == 1 && args[0] is "--help" or "-h")
            {
                await output.WriteLineAsync("devtool check --schema <file> [--json]\ndevtool info --project <csproj> [--json]\nExit codes: 0 success, 1 validation failed, 2 usage/configuration error.");
                return 0;
            }
            if (args.Length == 0 || args[0] is not ("check" or "info")) throw new ArgumentException();
            var expectedOption = args[0] == "check" ? "--schema" : "--project";
            string? path = null;
            var seenJson = false;
            for (var i = 1; i < args.Length; i++)
            {
                if (args[i] == "--json" && !seenJson) { seenJson = true; continue; }
                if (args[i] == expectedOption && path is null && i + 1 < args.Length && !args[i + 1].StartsWith("--"))
                    path = args[++i];
                else throw new ArgumentException();
            }
            if (path is null) throw new ArgumentException();
            stage = args[0] == "check" ? "schema" : "project";
            report = args[0] == "check"
                ? EnvironmentCheck.Evaluate(EnvironmentCheck.Parse(await File.ReadAllTextAsync(path)),
                    environment ?? Environment.GetEnvironmentVariable)
                : await SdkInfo.Inspect(path);
        }
        catch (Exception error) when (error is ArgumentException or IOException or UnauthorizedAccessException
            or JsonException or System.Xml.XmlException or InvalidOperationException
            or System.ComponentModel.Win32Exception or TimeoutException or FormatException or OverflowException)
        {
            // Parser and process exceptions may contain configuration values.
            var (code, message) = error switch
            {
                FileNotFoundException or DirectoryNotFoundException =>
                    ("input_not_found", "Input file or directory was not found. Check the supplied path."),
                UnauthorizedAccessException => ("access_denied", "Input cannot be accessed. Check file permissions."),
                System.ComponentModel.Win32Exception => ("dotnet_unavailable", "Cannot start dotnet. Check SDK installation and PATH."),
                TimeoutException => ("dotnet_timeout", "dotnet exceeded the ten-second timeout."),
                IOException => ("input_io_error", "Could not read the input file."),
                _ when stage == "arguments" => ("invalid_arguments", "Invalid arguments. Use --help for syntax."),
                _ when stage == "schema" => ("invalid_schema", "Invalid schema. Check version, variable names, types and bounds."),
                _ => ("invalid_project_configuration", "Invalid project or global.json configuration. Check file structure and SDK settings.")
            };
            report = new(args.FirstOrDefault() is "check" or "info" ? args[0] : "usage", 2,
                [new(code, "fail", message)]);
        }
        await WriteReport(report, json, output);
        return report.ExitCode;
    }

    public static async Task WriteReport(Report report, bool json, TextWriter output)
    {
        if (json)
            await output.WriteLineAsync(JsonSerializer.Serialize(report,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        else
        {
            foreach (var finding in report.Checks)
                await output.WriteLineAsync($"[{finding.Status.ToUpperInvariant()}] {finding.Name}: {finding.Message}");
            await output.WriteLineAsync($"{report.Command}: exit {report.ExitCode}");
        }
    }
}
