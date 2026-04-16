# Analysis Options — Scotch Software Standards

## Shared Configuration

Every package in the monorepo includes a shared `analysis_options.yaml`.
The root config extends `very_good_analysis` for strict linting.

## Root analysis_options.yaml

```yaml
include: package:very_good_analysis/analysis_options.yaml

analyzer:
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
    - "**/*.drift.dart"
    - "**/*.pigeon.dart"
    - "**/generated/**"
    - "**/l10n/**"

  errors:
    # Treat as errors (fail CI)
    missing_return: error
    dead_code: error
    invalid_annotation_target: ignore  # Freezed false positives

linter:
  rules:
    # Documentation
    public_member_api_docs: true

    # Style
    prefer_const_constructors: true
    prefer_const_declarations: true
    prefer_const_literals_to_create_immutables: true
    prefer_final_locals: true
    prefer_single_quotes: true

    # Safety
    avoid_dynamic_calls: true
    avoid_print: true
    avoid_relative_lib_imports: true
    cancel_subscriptions: true
    close_sinks: true

    # Disable if causing issues with generated code
    # lines_longer_than_80_chars: false
```

## Per-Package analysis_options.yaml

Each package inherits from the root:

```yaml
# packages/standard_bank_service/analysis_options.yaml
include: ../../analysis_options.yaml

# Package-specific overrides if needed
linter:
  rules:
    # Disable for packages with complex generated code
    # public_member_api_docs: false
```

## Key Lint Rules Explained

| Rule | Why |
|------|-----|
| `public_member_api_docs` | All public APIs must be documented with `///` |
| `prefer_const_constructors` | Better performance, widget tree optimization |
| `avoid_print` | Use proper logging (Talker/Sentry), never print |
| `strict-casts` | No implicit casts, catch type errors at compile time |
| `strict-inference` | No implicit dynamic, everything must have a type |
| `avoid_relative_lib_imports` | Use `package:` imports for clarity |
| `cancel_subscriptions` | Prevent memory leaks from stream subscriptions |
| `close_sinks` | Prevent resource leaks from unclosed sinks |

## Dependencies for Linting

```yaml
# Root pubspec.yaml or per-package
dev_dependencies:
  very_good_analysis: ^7.0.0
  custom_lint: ^0.7.0    # Optional: project-specific rules
```

## Running Analysis

```bash
# Single package
dart analyze . --fatal-infos

# All packages via Melos
melos run analyze

# Fix auto-fixable issues
dart fix --apply
```
