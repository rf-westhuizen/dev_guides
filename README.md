# Dev Guides

Single source of truth for coding standards, architecture patterns,
and AI-assisted development workflows.

## Directory Structure

```text
dev_guides/
|-- agents/                              # Subagents: architect, backend, debugger, reviewer, ...
|-- skills/
|   |-- dev-flutter/                     # Universal Flutter/Dart skill
|   |   |-- SKILL.md                     # Main skill (architecture, rules, gotchas)
|   |   `-- references/
|   |       |-- architecture.md          # MVVM + DDD layer rules + examples
|   |       |-- riverpod_patterns.md     # Provider patterns, consumption rules
|   |       |-- riverpod_gotchas.md      # Riverpod 3.x pitfalls + fixes
|   |       |-- drift_patterns.md        # Tables, DAOs, migrations, codegen
|   |       |-- freezed_patterns.md      # Models, unions, DTOs, Dart 3 switch
|   |       |-- naming_conventions.md    # File, class, variable naming
|   |       |-- testing_standards.md     # Mocktail, AAA pattern, coverage
|   |       |-- external_sources.md      # Official doc links
|   |       `-- analysis_options.md      # Lint rules, static analysis
|   |
|   |-- learn/                           # One-session tutor: teach, ELI5, quiz me
|   |   `-- SKILL.md
|   |
|   |-- agent-topic-teach/               # /agent-topic-teach: multi-session learning workspace
|   |   `-- SKILL.md                     # Plus mission, resources, glossary, record formats
|   |
|   |-- shared-understanding/            # Planning, teaching, explanations
|   |   `-- SKILL.md
|   |
|   |-- ubiquitous-language/             # Shared DDD terminology
|   |   `-- SKILL.md
|   |
|   |-- grill-with-docs/                 # Plan grilling with CONTEXT.md and ADRs
|   |   |-- SKILL.md                     # Interview workflow and doc update rules
|   |   `-- references/                  # ADR and CONTEXT formats
|   |
|   |-- error-replication/               # Reproduce-first debugging
|   |-- pre-pr/                          # Commit and PR readiness check
|   |-- agent-flow/                      # /agent-flow: build a feature through the subagents
|   |-- agent-code-review-team/          # /agent-code-review-team: four-lens review
|   |-- agent-improve/                   # /agent-improve: improve skills from past transcripts
|   |-- coding-refresh/                  # /coding-refresh: check guides against official docs
|   |
|   `-- scotch-flutter/                  # Scotch Software monorepo-specific
|       |-- SKILL.md                     # Monorepo conventions, package patterns
|       `-- references/
|           |-- architecture.md          # Scotch-specific layer rules
|           |-- riverpod_patterns.md     # Scotch provider patterns
|           |-- drift_patterns.md        # Scotch Drift + hooks pattern
|           |-- freezed_patterns.md      # Scotch Freezed conventions
|           |-- naming_conventions.md    # Scotch package naming + Java/Android
|           |-- melos_tooling.md         # Melos config, scripts, workspace
|           |-- pigeon_platform.md       # Pigeon, Trampoline Activity, ADB
|           |-- testing_standards.md     # Scotch testing standards
|           |-- external_sources.md      # Official doc links
|           `-- analysis_options.md      # Scotch lint rules
|
|-- templates/
|   |-- new_package/                     # Starter for a new monorepo package
|   |   |-- pubspec.yaml
|   |   |-- analysis_options.yaml
|   |   |-- lib/
|   |   `-- test/
|   `-- new_feature/                     # Starter for a new feature module
|       |-- data/                        # Services used by the feature and that implements or extends the Interface class from the domain
|       |-- domain/
|       |-- providers/                   # State Management logic
|       `-- presentation/                # Holds the View and ViewModel files
|
|-- docs/                                # Learning docs: oop_solid_dart.md, riverpod_3_cheat_sheet.md
|-- scripts/                             # Read-only Bash guard hook and its test
|-- CLAUDE.md                            # Claude Code global instructions
|-- CODEX.md                             # Codex global instructions
|-- ENVIRONMENT.md                       # How skills and agents are wired up on this machine
|-- KNOWLEDGE_MAP.md                     # What you already know and how topics connect
|-- PROMPTS.md                           # Ready-made prompts
|-- UBIQUITOUS_LANGUAGE.md               # Shared glossary
`-- README.md                            # This file
```

## Core Skills - When to Use Which

### `dev-flutter` - Universal (any Flutter/Dart project)

Use for **any** Flutter project, including new standalone apps, side projects,
or learning exercises. Contains:
- MVVM + DDD architecture with Riverpod
- Freezed 3.0 patterns (abstract/sealed, Dart 3 switch)
- Drift modular codegen (tables, DAOs, migrations)
- Riverpod 3.x gotchas (auto-retry, stale when(), bootstrap gate)
- Naming conventions, Strongly Typed DTOs, testing standards, lint rules

### `scotch-flutter` - Scotch Software monorepo only

Use when working inside the `scotch_software` monorepo. Contains
**everything in dev-flutter PLUS** monorepo-specific patterns:
- Package naming (`_api`, `_service`, `_db_package`, `_fetcher`)
- Melos configuration and scripts
- Pigeon platform channels + Trampoline Activity
- Hooks pattern for cross-package decoupling
- Shelf HTTP server scaffolding
- PAX device quirks (Room/Drift SQLite conflicts)

### `grill-with-docs` - Documentation-backed shared understanding

Use when you want Codex or Claude Code to grill, stress-test, or challenge a
plan against the codebase, project-local `CONTEXT.md` language,
`CONTEXT-MAP.md` boundaries, and ADRs before implementation. It asks one
decision-shaping question at a time, recommends an answer, updates `CONTEXT.md`
when terms are resolved, and offers ADRs only for decisions that are hard to
reverse, surprising without context, and the result of a real trade-off.

Installed as a live skill through the junction in `D:\Github\.claude\skills` (see
`ENVIRONMENT.md`). In Claude Code it starts on its own when you ask to grill or
stress-test a plan, or you can run `/grill-with-docs`. Codex has no skill
mechanism, so it reads `skills\grill-with-docs\SKILL.md` directly (see
`PROMPTS.md`).

### `shared-understanding` - Planning, teaching, and explanations

Use when you want collaborative planning, compact concept explanation, learning
support, or architecture trade-off discussion.

### `ubiquitous-language` - Shared terminology

Use when you want to extract, align, or update domain terminology in
`D:\Github\dev_guides\UBIQUITOUS_LANGUAGE.md`.

### `learn` and `agent-topic-teach` - Learning a topic

- `learn` tutors you in chat for one session. It starts on its own when you ask
  to be taught, say "ELI5" or "quiz me", or say a concept won't stick. It saves
  no files.
- `agent-topic-teach` teaches a whole topic over several sessions. Start it with
  `/agent-topic-teach <topic>`. It keeps a workspace of files (mission, trusted
  resources, HTML lessons, glossary, learning records) and picks the next lesson
  from what you have shown you understand.
- For reading on your own, `docs/oop_solid_dart.md` teaches OOP and SOLID with
  Dart examples, and `docs/riverpod_3_cheat_sheet.md` is a Riverpod quick
  reference.
- `KNOWLEDGE_MAP.md` records what you already know and how topics connect. The
  "Active Thinking (Always)" rule in `CLAUDE.md` and `CODEX.md` uses it so every
  explanation starts from something familiar, and tasks end with an optional
  `Connects to:` / `Think:` pair.

### Other skills and agents

The Skill Routing table and Further Reading section in `CLAUDE.md` say when each
remaining skill starts and which ones are manual slash commands. `ENVIRONMENT.md`
explains how the skills and the subagents in `agents/` are wired up.

## How to Use

### With Claude Code (CLI)

Use `CLAUDE.md` as the Claude Code-facing bootstrap guide for this repository.

Recommended prompt pattern:
```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this Flutter project.
```

For Scotch monorepo work, explicitly mention both guides:
```text
Use D:\Github\dev_guides\CLAUDE.md, dev-flutter, scotch-flutter, and grill-with-docs as the standards for this project.
```

In practice, Claude Code should read:
1. `CLAUDE.md`
2. `skills/dev-flutter/SKILL.md`
3. The relevant file under `skills/dev-flutter/references/`

If working in `scotch_software`, also read:
4. `skills/scotch-flutter/SKILL.md`

For planning, teaching, terminology, or documentation-backed grilling, also read:
5. `skills/shared-understanding/SKILL.md`
6. `skills/ubiquitous-language/SKILL.md`
7. `skills/grill-with-docs/SKILL.md`

**Option A - Global skills (recommended):**
Set `CLAUDE_CONFIG_DIR=D:\Github\.claude`, then symlink or copy
the relevant skills into `D:\Github\.claude\skills\`.

**Option B - Per-session:**
```bash
claude --add-dir D:\Github\dev_guides
```

**Option C - Project-level:**
Symlink the relevant skills into any project's `.claude/skills/`:
```powershell
# From your project root
mklink /D ".claude\skills\dev-flutter" "D:\Github\dev_guides\skills\dev-flutter"
mklink /D ".claude\skills\shared-understanding" "D:\Github\dev_guides\skills\shared-understanding"
mklink /D ".claude\skills\ubiquitous-language" "D:\Github\dev_guides\skills\ubiquitous-language"
mklink /D ".claude\skills\grill-with-docs" "D:\Github\dev_guides\skills\grill-with-docs"
```

### With Claude.ai (Web Interface)

1. ZIP the relevant skill folder, such as `skills/dev-flutter/`
2. Upload via Settings > Capabilities > Custom Skills
3. Claude auto-triggers the skill when you ask Flutter/Dart questions

### With Codex

Use `CODEX.md` as the Codex-facing bootstrap guide for this repository.

Recommended prompt pattern:
```text
Use D:\Github\dev_guides\CODEX.md and the dev-flutter skill as the guide for this Flutter project.
```

For Scotch monorepo work, explicitly mention both guides:
```text
Use D:\Github\dev_guides\CODEX.md, dev-flutter, scotch-flutter, and grill-with-docs as the standards for this project.
```

In practice, Codex should read:
1. `CODEX.md`
2. `skills/dev-flutter/SKILL.md`
3. The relevant file under `skills/dev-flutter/references/`

If working in `scotch_software`, also read:
4. `skills/scotch-flutter/SKILL.md`

For grilling or documentation-backed planning, also read:
5. `skills/grill-with-docs/SKILL.md`

### Templates

When starting a new package, copy `templates/new_package/` and rename.
When adding a feature, copy `templates/new_feature/` into
`lib/src/features/` and rename.
