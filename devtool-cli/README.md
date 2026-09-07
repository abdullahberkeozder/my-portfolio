# Devtool CLI

A small .NET 10 command-line tool for checking configuration before an application starts.
It validates environment variables and reports the SDK selected for a .NET project.

The first use case is Orkestra's notification worker: identify missing settings before
starting the service, and run the same check locally or in CI.

## Build and run

Requires the .NET 10 SDK. From the portfolio root:

```bash
dotnet build devtool-cli/DevTool.slnx --configuration Release
dotnet test devtool-cli/DevTool.slnx --configuration Release --no-build
dotnet devtool-cli/src/DevTool/bin/Release/net10.0/DevTool.dll --help
```

Use the built DLL for machine-readable output so build logs are not mixed into JSON.
To install as a tool on your machine:

```bash
dotnet pack devtool-cli/src/DevTool/DevTool.csproj --configuration Release --output devtool-cli/artifacts
dotnet tool install --tool-path devtool-cli/.tools --add-source devtool-cli/artifacts AbdullahOzder.DevTool --version 0.1.0
```

The executable is `devtool-cli/.tools/devtool` (or `devtool.exe` on Windows).
This builds a local package; it does not publish anything to NuGet.
The install directory is not added to PATH. Examples below invoke it explicitly from
the repository root; PowerShell also resolves devtool.exe at that path.

## check

```bash
./devtool-cli/.tools/devtool check --schema devtool-cli/examples/orkestra-worker.schema.json
./devtool-cli/.tools/devtool check --schema devtool-cli/examples/orkestra-worker.schema.json --json
```

Reads the current process environment. It does not load .env files, contact a provider,
or validate whether a credential is accepted by a service. Configure variables through
your shell or CI environment before running it.

Reports contain names, status, and instructions, never environment values.
Parser and subprocess errors are replaced with a fixed diagnostic to avoid echoing input.
Schema files are trusted configuration: use ordinary variable identifiers, not secrets,
as their names.

### Schema

```json
{
  "version": 1,
  "variables": [
    { "name": "API_URL", "type": "url" },
    { "name": "API_KEY", "type": "string" },
    { "name": "BATCH_SIZE", "type": "integer", "required": false, "min": 1, "max": 100 },
    { "name": "ENABLED", "type": "boolean", "required": false }
  ]
}
```

- Supported types: string, HTTP(S) URL, integer, decimal number, and boolean.
- Required defaults to true. Missing, empty, and whitespace-only values count as absent.
- Optional absent values are skipped; optional values that are present must still be valid.
- Booleans accept true/false, case-insensitively. Numbers use a decimal point and invariant culture;
  grouping separators and exponent notation are not accepted.
- Numeric rules can have inclusive min/max bounds. Unknown properties, unsupported types,
  conflicting bounds, and duplicate names are rejected.
- Names follow `[A-Za-z_][A-Za-z0-9_]*` with a maximum length of 128.
  Case-only duplicates are rejected for portability.

The worker example follows its environment template. Batch size and polling interval
are optional because the worker has defaults; this preflight requires positive integers
when supplied. Sender and API keys are checked only for presence, not provider semantics.

## info

```bash
./devtool-cli/.tools/devtool info --project ankara-usta-app/services/AnkaraUsta.NotificationWorker/AnkaraUsta.NotificationWorker.csproj --json
```

Reads literal TargetFramework/TargetFrameworks entries, finds the nearest global.json
in the project directory or its ancestors, lists installed SDKs, and runs `dotnet --version`
from the project directory. SDK selection and roll-forward policy are handled by dotnet.
Only version strings are reported; raw process output is not forwarded.

The compatibility check compares the selected SDK major with the declared modern .NET
targets. It does not restore packages, evaluate MSBuild imports, verify workloads, or
guarantee that the project builds. Conditional, legacy and property-based targets return
a validation failure rather than a guessed result. Each dotnet subprocess has a ten-second timeout.

This command does not execute project build targets. It uses the dotnet executable from PATH.
The CLI itself requires a .NET 10 runtime even when inspecting a project targeting an older version.

## Output and exit codes

Both commands accept --json and write one JSON object to stdout:

```json
{"command":"check","exitCode":1,"checks":[{"name":"API_KEY","status":"fail","message":"Set this required environment variable."}]}
```

| Code | Meaning |
| --- | --- |
| 0 | Checks passed; optional checks may be skipped. |
| 1 | Missing/invalid environment value, SDK mismatch, or unsupported target inspection. |
| 2 | Invalid arguments/schema, unreadable file, malformed project/global.json, or unavailable dotnet process. |

CI can invoke the built DLL directly and use its exit code to stop a job. This tool does
not start the worker automatically; run the worker only after a successful preflight.

Exit-2 reports use a stable check name: invalid_arguments, input_not_found, access_denied,
input_io_error, invalid_schema, invalid_project_configuration, dotnet_unavailable,
or dotnet_timeout. Messages describe the cause without exposing raw exception text.

The [tools workflow](../.github/workflows/dotnet-tools-ci.yml) builds and tests this project
on Windows and Linux, then checks local package installation and the help command.

## Design and tests

The CLI parser, environment checks, and SDK inspection are separate so tests can supply
environment readers and subprocess results without changing the machine's real settings.
There are no third-party runtime dependencies or shell command interpolation.

Tests cover missing/invalid values, numeric bounds, output redaction, malformed schemas,
argument errors, ancestor global.json discovery, and SDK/target mismatches.
The first version deliberately avoids project scaffolding and full MSBuild evaluation:
those need much broader contracts than the two diagnostics implemented here.
