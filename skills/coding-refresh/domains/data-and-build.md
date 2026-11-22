# data-and-build

Drift, Freezed and the build tooling around them: `build_runner`,
`json_serializable`, pub workspaces and Melos.

## Targets

All paths are under `D:/Github/dev_guides/`.

- `skills/dev-flutter/references/drift_patterns.md`
- `skills/dev-flutter/references/freezed_patterns.md`
- `skills/scotch-flutter/references/drift_patterns.md`
- `skills/scotch-flutter/references/freezed_patterns.md`
- `skills/scotch-flutter/references/melos_tooling.md` - not the APK build and
  install lines (those belong to `android-kotlin`).
- `skills/dev-flutter/SKILL.md` and `skills/scotch-flutter/SKILL.md` - the
  Freezed, Drift and `build_runner` lines of "Code Generation Rules".
- `skills/scotch-flutter/SKILL.md` - "Melos Commands (Quick Reference)".
- `agents/database.md`
- `agents/backend.md` - the Freezed and Drift lines.
- `skills/dev-flutter/references/external_sources.md` and
  `skills/scotch-flutter/references/external_sources.md` - the Drift, Freezed
  and Melos links.
- `CODEX.md` "Flutter/Dart Standards" - the Freezed, Drift and codegen lines.
- `templates/new_package/pubspec.yaml` - the Freezed, json_serializable,
  build_runner and Drift packages, and whether it has the workspace keys a
  pub workspace member needs.

## Sources

- https://pub.dev/api/packages/drift - Use for: latest stable `drift` version and published date.
- https://pub.dev/api/packages/drift_dev - Use for: latest stable `drift_dev` version.
- https://pub.dev/api/packages/freezed - Use for: latest stable `freezed` version and its Dart SDK floor.
- https://pub.dev/api/packages/freezed_annotation - Use for: latest stable `freezed_annotation` version.
- https://pub.dev/api/packages/build_runner - Use for: latest stable `build_runner` version.
- https://pub.dev/api/packages/json_serializable - Use for: latest stable `json_serializable` version.
- https://pub.dev/api/packages/melos - Use for: latest stable `melos` version.
- https://pub.dev/packages/drift/changelog - Use for: Drift API changes per version.
- https://pub.dev/packages/drift_dev/changelog - Use for: schema and migration tooling changes per version.
- https://pub.dev/packages/freezed/changelog - Use for: Freezed breaking changes per major.
- https://github.com/rrousselGit/freezed - Use for: the Freezed README, which documents generated APIs such as `when`/`map`.
- https://pub.dev/packages/build_runner/changelog - Use for: command and flag changes.
- https://pub.dev/packages/melos/changelog - Use for: where Melos config lives and which keys changed.
- https://drift.simonbinder.eu/migrations/ - Use for: the recommended migration workflow and schema tools.
- https://drift.simonbinder.eu/testing/ - Use for: in-memory test databases and test setup.
- https://drift.simonbinder.eu/guides/upgrading/ - Use for: breaking changes between Drift versions.
- https://drift.simonbinder.eu/generation_options/modular/ - Use for: modular code generation setup.
- https://dart.dev/tools/build_runner - Use for: the official code generation command and flags.
- https://dart.dev/tools/pub/workspaces - Use for: pub workspace setup, including `resolution: workspace`.
- https://melos.invertase.dev/configuration/overview - Use for: where a Melos workspace is configured.
