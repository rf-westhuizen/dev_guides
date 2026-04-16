# Analysis Options — Flutter Development Standards

## Base Configuration

Extend `very_good_analysis` for strict, opinionated linting.

## analysis_options.yaml

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
    missing_return: error
    dead_code: error
    invalid_annotation_target: ignore  # Freezed false positives

linter:
  rules:
    public_member_api_docs: true
    prefer_const_constructors: true
    prefer_const_declarations: true
    prefer_const_literals_to_create_immutables: true
    prefer_final_locals: true
    prefer_single_quotes: true
    avoid_dynamic_calls: true
    avoid_print: true
    avoid_relative_lib_imports: true
    cancel_subscriptions: true
    close_sinks: true
```

## Key Lint Rules Explained

| Rule | Why |
|------|-----|
| `public_member_api_docs` | All public APIs documented with `///` |
| `prefer_const_constructors` | Better performance, widget tree optimization |
| `avoid_print` | Use proper logging, never print |
| `strict-casts` | No implicit casts, catch type errors at compile time |
| `strict-inference` | No implicit dynamic, everything typed |
| `avoid_relative_lib_imports` | Use `package:` imports for clarity |
| `cancel_subscriptions` | Prevent memory leaks from streams |
| `close_sinks` | Prevent resource leaks from unclosed sinks |

## Dependencies

```yaml
dev_dependencies:
  very_good_analysis: ^7.0.0
```

## Running Analysis

```bash
dart analyze . --fatal-infos
dart fix --apply
```
