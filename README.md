# Dev Guides

Single source of truth for coding standards, architecture patterns,
and AI-assisted development workflows.

## Directory Structure

```
dev_guides/
├── skills/
│   ├── dev-flutter/                     # Universal Flutter/Dart skill
│   │   ├── SKILL.md                     # Main skill (architecture, rules, gotchas)
│   │   └── references/
│   │       ├── architecture.md          # MVVM + DDD layer rules + examples
│   │       ├── riverpod_patterns.md     # Provider patterns, consumption rules
│   │       ├── riverpod_gotchas.md      # Riverpod 3.x pitfalls + fixes
│   │       ├── drift_patterns.md        # Tables, DAOs, migrations, codegen
│   │       ├── freezed_patterns.md      # Models, unions, DTOs, Dart 3 switch
│   │       ├── naming_conventions.md    # File, class, variable naming
│   │       ├── testing_standards.md     # Mocktail, AAA pattern, coverage
│   │       ├── external_sources.md      # Official doc links
│   │       └── analysis_options.md      # Lint rules, static analysis
│   │
│   └── scotch-flutter/                  # Scotch Software monorepo-specific
│       ├── SKILL.md                     # Monorepo conventions, package patterns
│       └── references/
│           ├── architecture.md          # Scotch-specific layer rules
│           ├── riverpod_patterns.md     # Scotch provider patterns
│           ├── drift_patterns.md       # Scotch Drift + hooks pattern
│           ├── freezed_patterns.md     # Scotch Freezed conventions
│           ├── naming_conventions.md   # Scotch package naming + Java/Android
│           ├── melos_tooling.md        # Melos config, scripts, workspace
│           ├── pigeon_platform.md      # Pigeon, Trampoline Activity, ADB
│           ├── testing_standards.md    # Scotch testing standards
│           ├── external_sources.md     # Official doc links
│           └── analysis_options.md     # Scotch lint rules
│
├── templates/
│   ├── new_package/                    # Starter for a new monorepo package
│   │   ├── pubspec.yaml
│   │   ├── analysis_options.yaml
│   │   ├── lib/
│   │   └── test/
│   └── new_feature/                    # Starter for a new feature module
│       ├── data/						# Services used by the feature and that implements or extends the Interface class from the domain 
│       ├── domain/
│       ├── providers/     				# State Management logic
│       └── presentation/				# Holds the View and ViewModel files
│
├── docs/                               # PDFs, architecture diagrams
├── CLAUDE.md                           # Claude Code global instructions
├── CODEX.md                            # cODEX Code global instructions
└── README.md                           # This file
```

## Two Skills — When to Use Which

### `dev-flutter` — Universal (any Flutter/Dart project)

Use for **any** Flutter project, including new standalone apps, side projects,
or learning exercises. Contains:
- MVVM + DDD architecture with Riverpod
- Freezed 3.0 patterns (abstract/sealed, Dart 3 switch)
- Drift modular codegen (tables, DAOs, migrations)
- Riverpod 3.x gotchas (auto-retry, stale when(), bootstrap gate)
- Naming conventions, Stronly Typed DTOs, testing standards, lint rules

### `scotch-flutter` — Scotch Software monorepo only

Use when working inside the `scotch_software` monorepo. Contains
**everything in dev-flutter PLUS** monorepo-specific patterns:
- Package naming (`_api`, `_service`, `_db_package`, `_fetcher`)
- Melos configuration and scripts
- Pigeon platform channels + Trampoline Activity
- Hooks pattern for cross-package decoupling
- Shelf HTTP server scaffolding
- PAX device quirks (Room/Drift SQLite conflicts)

## How to Use

### With Claude Code (CLI)

**Option A — Global skill (recommended):**
Set `CLAUDE_CONFIG_DIR=D:\Github\.claude`, then symlink or copy
`dev-flutter` into `D:\Github\.claude\skills\`.

**Option B — Per-session:**
```bash
claude --add-dir D:\Github\dev_guides
```

**Option C — Project-level:**
Symlink into any project's `.claude/skills/`:
```powershell
# From your project root
mklink /D ".claude\skills\dev-flutter" "D:\Github\dev_guides\skills\dev-flutter"
```

### With Claude.ai (Web Interface)

1. ZIP the `skills/dev-flutter/` folder
2. Upload via Settings → Capabilities → Custom Skills
3. Claude auto-triggers the skill when you ask Flutter/Dart questions

### With Codex

Use `CODEX.md` as the Codex-facing bootstrap guide for this repository.

Recommended prompt pattern:
```text
Use D:\Github\dev_guides\CODEX.md and the dev-flutter skill as the guide for this Flutter project.
```

For Scotch monorepo work, explicitly mention both guides:
```text
Use D:\Github\dev_guides\CODEX.md, dev-flutter, and scotch-flutter as the standards for this project.
```

In practice, Codex should read:
1. `CODEX.md`
2. `skills/dev-flutter/SKILL.md`
3. The relevant file under `skills/dev-flutter/references/`

If working in `scotch_software`, also read:
4. `skills/scotch-flutter/SKILL.md`

### Templates

When starting a new package, copy `templates/new_package/` and rename.
When adding a feature, copy `templates/new_feature/` into
`lib/src/features/` and rename.
