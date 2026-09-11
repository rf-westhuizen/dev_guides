# Melos Tooling — Scotch Software Standards

## Monorepo Root Structure

```
D:/Github/scotch_software/
├── apps/
│   ├── scotch_launcher/          # Main launcher app
│   └── mipos_pay/                # MiPOS payment app
├── packages/
│   ├── standard_bank_api/
│   ├── standard_bank_service/
│   ├── newlands_api/
│   ├── newlands_service/
│   ├── hiopos_plugin/
│   ├── log_db_package/
│   ├── audit_db_package/
│   ├── device_info_fetcher/
│   ├── yaml_parser_fetcher/
│   └── pilot_light/
├── melos.yaml
├── pubspec.yaml                  # Dart workspace root
├── analysis_options.yaml         # Shared lint config
└── CLAUDE.md                     # Claude Code instructions
```

## melos.yaml Configuration

```yaml
name: scotch_software
repository: https://github.com/scotch-software/scotch_software

packages:
  - "apps/*"
  - "packages/*"

command:
  bootstrap:
    usePubspecOverrides: true

scripts:
  # Static analysis
  analyze:
    run: melos exec -- dart analyze . --fatal-infos
    description: Run dart analyze across all packages

  # Run all tests
  test:all:
    run: melos exec --fail-fast -- flutter test
    packageFilters:
      dirExists: test
    description: Run tests in all packages that have a test directory

  # Code generation — cross-platform via Dart helper
  codegen:
    run: melos exec -- dart run build_runner build --delete-conflicting-outputs
    packageFilters:
      dependsOn: build_runner
    description: Run build_runner in all packages that depend on it

  # Cross-platform codegen (Windows/cmd compatible)
  codegen_raw:
    run: dart run tools/codegen_helper.dart
    description: Cross-platform codegen via Dart helper script

  # Format all Dart files
  format:
    run: melos exec -- dart format .
    description: Format all Dart files

  # Clean all packages
  clean:
    run: melos exec -- flutter clean
    description: Clean all packages

  # Check for outdated dependencies
  outdated:
    run: melos exec -- dart pub outdated
    description: Check outdated deps in all packages
```

## Common Melos Commands

```bash
# Initial setup — install deps and link local packages
melos bootstrap

# Run analysis across entire monorepo
melos run analyze

# Run all tests with fail-fast
melos run test:all

# Run codegen in all packages that need it
melos run codegen

# Run a command in a specific package
melos exec --scope="standard_bank_service" -- flutter test

# List all packages
melos list

# Show package dependency graph
melos list --graph

# Run command only in packages that changed (git diff)
melos exec --diff="main" -- flutter test
```

## Dart Workspace (pubspec.yaml at root)

```yaml
# Root pubspec.yaml — Dart 3.6+ workspace
name: scotch_software_workspace
environment:
  sdk: ">=3.6.0 <4.0.0"

workspace:
  - apps/scotch_launcher
  - apps/mipos_pay
  - packages/standard_bank_api
  - packages/standard_bank_service
  - packages/newlands_api
  - packages/newlands_service
  - packages/hiopos_plugin
  - packages/log_db_package
  - packages/audit_db_package
  - packages/device_info_fetcher
  - packages/yaml_parser_fetcher
  - packages/pilot_light
```

## Cross-Platform Codegen Helper (Windows Fix)

Because Windows `cmd.exe` doesn't support `&&` chaining the same way,
use a Dart helper script:

```dart
// tools/codegen_helper.dart
import 'dart:io';

void main() async {
  final packages = Directory('packages')
      .listSync()
      .whereType<Directory>()
      .where((d) => File('${d.path}/build.yaml').existsSync() ||
          _hasBuildRunnerDep(d));

  for (final pkg in packages) {
    print('Running codegen in ${pkg.path}...');
    final result = await Process.run(
      'dart',
      ['run', 'build_runner', 'build', '--delete-conflicting-outputs'],
      workingDirectory: pkg.path,
    );
    stdout.write(result.stdout);
    stderr.write(result.stderr);
    if (result.exitCode != 0) {
      exit(result.exitCode);
    }
  }
}

bool _hasBuildRunnerDep(Directory dir) {
  final pubspec = File('${dir.path}/pubspec.yaml');
  if (!pubspec.existsSync()) return false;
  return pubspec.readAsStringSync().contains('build_runner');
}
```

## Adding a New Package

1. Create directory under `packages/`
2. Add `pubspec.yaml` with dependencies
3. Add `analysis_options.yaml` (include shared config)
4. Add to root `pubspec.yaml` workspace list
5. Add to `melos.yaml` if using specific package globs
6. Run `melos bootstrap`
7. Verify with `melos list`

## CI Pipeline Order

```bash
melos bootstrap
melos run format -- --set-exit-if-changed
melos run analyze
melos run test:all
```

## Environment Reset & Clean Build

Use this when dependency resolution is corrupted, pub cache is stale, or a
clean-slate build is needed before release/debug testing.

**Clear all caches** (from `scotch_software` root):

```bash
melos exec -- flutter clean       # clears build/ and .dart_tool/ for every package
flutter clean                     # cleans the root repository build artifacts
flutter pub cache clean           # removes all downloaded packages from the global pub cache
flutter pub get                   # resolves root project dependencies only (mainly melos)
flutter pub global activate melos # (re)installs the melos CLI globally
melos bootstrap                   # resolves and links all project dependencies per pubspec.yaml
```

**Build & install** (from `scotch_launcher`, any APK):

```bash
flutter build apk --split-per-abi --no-tree-shake-icons  # builds the split APKs
adb install <v7a>.apk                                    # installs the ARM v7a APK to the device
```
