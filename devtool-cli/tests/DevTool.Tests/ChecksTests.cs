using System.Text.Json;
using DevTool;

namespace DevTool.Tests;

public sealed class ChecksTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "devtool-tests-" + Guid.NewGuid());
    private string FileWith(string name, string contents)
    {
        Directory.CreateDirectory(directory);
        var path = Path.Combine(directory, name);
        File.WriteAllText(path, contents);
        return path;
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }

    [Theory]
    [InlineData("url", "https://example.com", 0)]
    [InlineData("url", "file:///tmp/key", 1)]
    [InlineData("url", "not-a-url-SECRET", 1)]
    [InlineData("integer", "25", 0)]
    [InlineData("integer", "2.5", 1)]
    [InlineData("number", "2.5", 0)]
    [InlineData("number", "NaN", 1)]
    [InlineData("boolean", "true", 0)]
    [InlineData("boolean", "yes", 1)]
    public void ValidatesTypesWithoutEchoingValues(string type, string value, int expected)
    {
        var schema = EnvironmentCheck.Parse(JsonSerializer.Serialize(new
        { version = 1, variables = new[] { new { name = "SETTING", type } } }));
        var report = EnvironmentCheck.Evaluate(schema, _ => value);
        Assert.Equal(expected, report.ExitCode);
        Assert.DoesNotContain(value, JsonSerializer.Serialize(report));
    }

    [Fact]
    public void MissingOptionalDoesNotFailButInvalidOptionalDoes()
    {
        var schema = EnvironmentCheck.Parse("""
        {"version":1,"variables":[{"name":"COUNT","type":"integer","required":false,"min":1,"max":25}]}
        """);
        Assert.Equal(0, EnvironmentCheck.Evaluate(schema, _ => null).ExitCode);
        Assert.Equal(1, EnvironmentCheck.Evaluate(schema, _ => "0").ExitCode);
        Assert.Equal(1, EnvironmentCheck.Evaluate(schema, _ => "26").ExitCode);
        Assert.Equal(0, EnvironmentCheck.Evaluate(schema, _ => "25").ExitCode);
    }

    [Fact]
    public void WhitespaceRequiredIsMissing()
    {
        var schema = EnvironmentCheck.Parse("""{"version":1,"variables":[{"name":"KEY","type":"string"}]}""");
        Assert.Equal(1, EnvironmentCheck.Evaluate(schema, _ => "  ").ExitCode);
    }

    [Theory]
    [InlineData("""{"version":2,"variables":[]}""")]
    [InlineData("""{"version":1,"variables":[{"name":"A","type":"string"},{"name":"a","type":"string"}]}""")]
    [InlineData("""{"version":1,"variables":[{"name":"A","type":"string","min":1}]}""")]
    [InlineData("""{"version":1,"variables":[{"name":"A","type":"integer","min":3,"max":1}]}""")]
    [InlineData("""{"version":1,"variables":[{"name":"A","type":"regex"}]}""")]
    public void RejectsUnsupportedSchemas(string schema)
        => Assert.Throws<ArgumentException>(() => EnvironmentCheck.Parse(schema));

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task CliNeverPrintsSecretOnFailure(bool json)
    {
        var path = FileWith("schema.json", """{"version":1,"variables":[{"name":"URL","type":"url"}]}""");
        var output = new StringWriter();
        var args = new List<string> { "check", "--schema", path };
        if (json) args.Add("--json");
        Assert.Equal(1, await Cli.RunAsync(args.ToArray(), output, _ => "unique-secret-123"));
        Assert.DoesNotContain("unique-secret-123", output.ToString());
        if (json)
        {
            using var result = JsonDocument.Parse(output.ToString());
            Assert.Equal(1, result.RootElement.GetProperty("exitCode").GetInt32());
        }
    }

    [Fact]
    public async Task MalformedSchemaReturnsSafeJson()
    {
        var path = FileWith("broken.json", """{"version":"secret-in-parser-error"}""");
        var output = new StringWriter();
        Assert.Equal(2, await Cli.RunAsync(["check", "--schema", path, "--json"], output));
        Assert.DoesNotContain("secret-in-parser-error", output.ToString());
        using var parsed = JsonDocument.Parse(output.ToString());
        Assert.Equal(2, parsed.RootElement.GetProperty("exitCode").GetInt32());
    }

    [Fact]
    public async Task UnknownOrDuplicateOptionsAreUsageErrors()
    {
        foreach (var args in new[] { new[] { "init" }, new[] { "check", "--json", "--json" },
            new[] { "info", "--schema", "test" }, Array.Empty<string>() })
            Assert.Equal(2, await Cli.RunAsync(args, new StringWriter()));
    }

    [Fact]
    public async Task DiagnosticsDistinguishMissingFileSchemaAndArguments()
    {
        var schema = FileWith("invalid.json", """{"version":99,"variables":[]}""");
        var cases = new[]
        {
            (new[] { "check", "--schema", Path.Combine(directory, "missing.json"), "--json" }, "input_not_found"),
            (new[] { "check", "--schema", schema, "--json" }, "invalid_schema"),
            (new[] { "check", "--json" }, "invalid_arguments")
        };
        foreach (var (args, expected) in cases)
        {
            var output = new StringWriter();
            Assert.Equal(2, await Cli.RunAsync(args, output));
            using var json = JsonDocument.Parse(output.ToString());
            Assert.Equal(expected, json.RootElement.GetProperty("checks")[0].GetProperty("name").GetString());
            Assert.DoesNotContain(directory, output.ToString());
        }
    }

    [Fact]
    public async Task InfoUsesProjectDirectoryAndFindsAncestorGlobalJson()
    {
        FileWith("global.json", """{"sdk":{"version":"10.0.100","rollForward":"latestFeature"}}""");
        Directory.CreateDirectory(Path.Combine(directory, "nested"));
        var project = FileWith("nested/project.csproj", "<Project><PropertyGroup><TargetFramework>net10.0</TargetFramework></PropertyGroup></Project>");
        var report = await SdkInfo.Inspect(project, (cwd, arg) =>
        {
            Assert.Equal(Path.GetDirectoryName(project), cwd);
            return Task.FromResult(new CommandResult(0, arg == "--version" ? "10.0.400\n" : "10.0.400 [sdk-directory]\n"));
        });
        Assert.Equal(0, report.ExitCode);
        Assert.Contains(report.Checks, f => f.Name == "global.json" && f.Message.Contains("10.0.100"));
    }

    [Fact]
    public async Task NewerTargetAndUnresolvedSdkFail()
    {
        var project = FileWith("project.csproj", "<Project><PropertyGroup><TargetFrameworks>net8.0;net11.0</TargetFrameworks></PropertyGroup></Project>");
        var report = await SdkInfo.Inspect(project, (_, _) => Task.FromResult(new CommandResult(0, "10.0.400")));
        Assert.Equal(1, report.ExitCode);
        Assert.Contains(report.Checks, f => f.Name == "compatibility" && f.Status == "fail");
        report = await SdkInfo.Inspect(project, (_, _) => Task.FromResult(new CommandResult(1, "sensitive host diagnostic")));
        Assert.Equal(1, report.ExitCode);
        Assert.DoesNotContain("sensitive host diagnostic", JsonSerializer.Serialize(report));
    }

    [Theory]
    [InlineData("<Project />")]
    [InlineData("<Project><PropertyGroup><TargetFramework>$(Target)</TargetFramework></PropertyGroup></Project>")]
    [InlineData("<Project><PropertyGroup Condition=\"true\"><TargetFramework>net10.0</TargetFramework></PropertyGroup></Project>")]
    public async Task UnsupportedTargetsAreNotReportedAsCompatible(string xml)
    {
        var project = FileWith("project.csproj", xml);
        var report = await SdkInfo.Inspect(project, (_, _) => Task.FromResult(new CommandResult(0, "10.0.400")));
        Assert.Equal(1, report.ExitCode);
        Assert.DoesNotContain(report.Checks, f => f.Name == "compatibility");
    }
}
