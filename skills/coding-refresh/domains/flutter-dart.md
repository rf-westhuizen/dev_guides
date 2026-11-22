# flutter-dart

Flutter and Dart versions, language features, Effective Dart, lint packages,
test packages and the Flutter team's architecture guidance.

## Targets

All paths are under `D:/Github/dev_guides/`.

- `skills/dev-flutter/SKILL.md` - everything except the Riverpod, Freezed and
  Drift lines (those belong to `riverpod` and `data-and-build`).
- `skills/scotch-flutter/SKILL.md` - everything not owned by `riverpod`,
  `data-and-build` or `android-kotlin`.
- `skills/dev-flutter/references/architecture.md`
- `skills/dev-flutter/references/naming_conventions.md`
- `skills/dev-flutter/references/analysis_options.md`
- `skills/dev-flutter/references/testing_standards.md` - not the Riverpod parts.
- `skills/scotch-flutter/references/architecture.md`
- `skills/scotch-flutter/references/naming_conventions.md` - not the
  "Android/Java Naming" section.
- `skills/scotch-flutter/references/analysis_options.md`
- `skills/scotch-flutter/references/testing_standards.md` - not the Riverpod parts.
- `skills/dev-flutter/references/external_sources.md` and
  `skills/scotch-flutter/references/external_sources.md` - the Flutter, Dart,
  VGV, lint, testing, error-handling, Shelf and background-service links.
- `CODEX.md` "Flutter/Dart Standards" - lines not about Riverpod, Freezed or Drift.
- `templates/new_package/pubspec.yaml` - SDK and Flutter floors, lint and test
  packages only.
- `templates/new_package/analysis_options.yaml`
- `PROMPTS.md`, `README.md` and `templates/new_feature/` - layer and folder
  names only, checked against other dev_guides files (see Notes). No web source.

## Sources

- https://storage.googleapis.com/flutter_infra_release/releases/releases_windows.json - Use for: the current Flutter stable version and the Dart version it bundles.
- https://docs.flutter.dev/release/release-notes - Use for: what changed in each Flutter release.
- https://docs.flutter.dev/release/breaking-changes - Use for: removed or changed Flutter APIs and their migration guides.
- https://docs.flutter.dev/app-architecture/guide - Use for: the Flutter team's layering guidance.
- https://docs.flutter.dev/app-architecture/recommendations - Use for: the Flutter team's ranked architecture recommendations.
- https://docs.flutter.dev/app-architecture/design-patterns - Use for: Result, Command and other patterns the Flutter team documents.
- https://dart.dev/resources/language/evolution - Use for: which Dart version added a language feature.
- https://dart.dev/effective-dart - Use for: style, documentation, usage and design rules.
- https://api.flutter.dev/ - Use for: Flutter API names and signatures, including `flutter_test`.
- https://engineering.verygood.ventures/ - Use for: Very Good Ventures' own engineering guides, which dev_guides cites (third-party, kept because the guides follow `very_good_analysis` and VGV testing practice).
- https://dart.dev/tools/linter-rules - Use for: whether a lint rule exists, is deprecated or was removed.
- https://pub.dev/api/packages/lints - Use for: latest stable `lints` version and its published date.
- https://pub.dev/api/packages/flutter_lints - Use for: latest stable `flutter_lints` version and its published date.
- https://pub.dev/api/packages/very_good_analysis - Use for: latest stable `very_good_analysis` version and its Dart SDK floor.
- https://pub.dev/packages/very_good_analysis/changelog - Use for: rules added or removed in each major.
- https://pub.dev/api/packages/mocktail - Use for: latest stable `mocktail` version and its published date.
- https://pub.dev/api/packages/fpdart - Use for: whether the error-handling packages the guides cite are still maintained.

## Notes

- `PROMPTS.md`, `README.md` and `templates/new_feature/` restate the layer
  model. The baseline is the "Overview" of
  `skills/dev-flutter/references/architecture.md`: `domain`, `data`,
  `providers` and `presentation` inside each feature. A layer or folder name
  that disagrees with it (for example `application/` or `infrastructure/` used
  as a layer) is Wrong now, kind `contradiction`: the source is that file's
  absolute path, the anchor is its line number, and the quote is that line
  exactly. This is two dev_guides files disagreeing, not "differs by choice".
