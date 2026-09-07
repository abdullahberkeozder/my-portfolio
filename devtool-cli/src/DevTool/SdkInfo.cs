using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace DevTool;

public sealed record CommandResult(int ExitCode, string Output);
public static partial class SdkInfo
{
    [GeneratedRegex(@"^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$")]
    private static partial Regex SdkVersion();
    [GeneratedRegex(@"^net(\d+)\.(\d+)(?:-[A-Za-z0-9.]+)?$")]
    private static partial Regex Framework();

    public static async Task<CommandResult> RunDotnet(string directory, string argument)
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo("dotnet")
            {
                WorkingDirectory = directory, RedirectStandardOutput = true,
                RedirectStandardError = true, UseShellExecute = false, CreateNoWindow = true
            }
        };
        process.StartInfo.ArgumentList.Add(argument);
        process.StartInfo.Environment["DOTNET_NOLOGO"] = "1";
        process.StartInfo.Environment["DOTNET_SKIP_FIRST_TIME_EXPERIENCE"] = "1";
        process.Start();
        var output = process.StandardOutput.ReadToEndAsync();
        var errors = process.StandardError.ReadToEndAsync();
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        try { await process.WaitForExitAsync(timeout.Token); }
        catch (OperationCanceledException)
        {
            process.Kill(entireProcessTree: true);
            await process.WaitForExitAsync();
            throw new TimeoutException();
        }
        await errors;
        return new(process.ExitCode, await output);
    }

    public static async Task<Report> Inspect(string project,
        Func<string, string, Task<CommandResult>>? run = null)
    {
        run ??= RunDotnet;
        project = Path.GetFullPath(project);
        var directory = Path.GetDirectoryName(project)!;
        using var reader = XmlReader.Create(project, new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit });
        var document = XDocument.Load(reader);
        var findings = new List<Finding>();
        var nodes = document.Descendants()
            .Where(n => n.Name.LocalName is "TargetFramework" or "TargetFrameworks").ToArray();
        var targets = nodes.SelectMany(n => n.Value.Split(';', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
            .Distinct().ToArray();
        var conditional = nodes.Any(n => n.AncestorsAndSelf().Any(a => a.Attribute("Condition") is not null));
        if (targets.Length == 0 || conditional || targets.Any(t => !Framework().IsMatch(t)))
            findings.Add(new("targetFramework", "fail",
                "Cannot establish literal modern .NET targets. Imported, conditional, legacy and property-based targets require MSBuild evaluation."));
        else findings.Add(new("targetFramework", "pass", string.Join(", ", targets)));

        var global = FindGlobalJson(directory);
        if (global is null)
            findings.Add(new("global.json", "skip", "No global.json found in the project directory or its parents."));
        else
        {
            using var json = JsonDocument.Parse(File.ReadAllText(global), new JsonDocumentOptions
            { AllowTrailingCommas = true, CommentHandling = JsonCommentHandling.Skip });
            if (json.RootElement.TryGetProperty("sdk", out var sdk) &&
                sdk.TryGetProperty("version", out var version) &&
                version.ValueKind == JsonValueKind.String && SdkVersion().IsMatch(version.GetString()!))
                findings.Add(new("global.json", "pass", $"Requested SDK: {version.GetString()}. Resolution is delegated to dotnet."));
            else findings.Add(new("global.json", "skip", "No SDK version to display; dotnet will resolve the configuration."));
        }
        var installed = await run(directory, "--list-sdks");
        var versions = installed.Output.Split('\n')
            .Select(line => line.Trim().Split(' ')[0]).Where(v => SdkVersion().IsMatch(v)).Distinct().ToArray();
        findings.Add(new("installedSdks", installed.ExitCode == 0 && versions.Length > 0 ? "pass" : "fail",
            versions.Length > 0 ? string.Join(", ", versions) : "No installed SDKs detected."));
        var selected = await run(directory, "--version");
        var selectedVersion = selected.Output.Trim();
        if (selected.ExitCode != 0 || !SdkVersion().IsMatch(selectedVersion))
            findings.Add(new("selectedSdk", "fail", "SDK resolution failed. Check installed SDKs and global.json version/rollForward settings."));
        else
        {
            findings.Add(new("selectedSdk", "pass", selectedVersion));
            var sdkMajor = int.Parse(selectedVersion.Split('.')[0]);
            if (!conditional && targets.Length > 0 && targets.All(t => Framework().IsMatch(t)))
            {
                var compatible = targets.All(t => int.Parse(Framework().Match(t).Groups[1].Value) <= sdkMajor);
                findings.Add(new("compatibility", compatible ? "pass" : "fail",
                    compatible ? "Selected SDK major covers the declared targets; restore/build and workloads are not checked."
                        : "A target requires a newer SDK major than the selected SDK."));
            }
        }
        return new("info", findings.Any(f => f.Status == "fail") ? 1 : 0, findings);
    }

    private static string? FindGlobalJson(string directory)
    {
        for (var current = new DirectoryInfo(directory); current is not null; current = current.Parent)
        {
            var candidate = Path.Combine(current.FullName, "global.json");
            if (File.Exists(candidate)) return candidate;
        }
        return null;
    }
}
