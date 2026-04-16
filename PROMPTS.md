# Prompt Templates

Reusable starter prompts for working in projects under `D:\Github` while
following the shared standards in `D:\Github\dev_guides`.

## New Flutter App

### Codex

```text
Use D:\Github\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project at D:\Github\todo_list. Help me scaffold a new Flutter app following the shared architecture, Riverpod, naming, and testing rules.
```

### Claude

```text
Use D:\Github\CLAUDE.md and the dev-flutter skill from D:\Github\dev_guides for this project at D:\Github\todo_list. Help me scaffold a new Flutter app following the shared architecture, Riverpod, naming, and testing rules.
```

## Add A New Feature

### Codex

```text
Use D:\Github\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project. Add a new feature for [FEATURE NAME] in D:\Github\todo_list following the MVVM + DDD structure and the dev_guides conventions.
```

### Claude

```text
Use D:\Github\CLAUDE.md and the dev-flutter skill from D:\Github\dev_guides for this project. Add a new feature for [FEATURE NAME] in D:\Github\todo_list following the MVVM + DDD structure and the shared conventions.
```

## Fix A Bug

### Codex

```text
Use D:\Github\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md for this project. Investigate and fix this bug in D:\Github\todo_list while keeping the existing architecture and Flutter standards from dev_guides.
```

### Claude

```text
Use D:\Github\CLAUDE.md and the dev-flutter skill from D:\Github\dev_guides for this project. Investigate and fix this bug in D:\Github\todo_list while keeping the shared Flutter architecture and standards intact.
```

## Review Code

### Codex

```text
Use D:\Github\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md for this project. Review this code for architecture violations, business logic in views, Riverpod misuse, naming issues, and missing tests according to dev_guides.
```

### Claude

```text
Use D:\Github\CLAUDE.md and the dev-flutter skill from D:\Github\dev_guides for this project. Review this code for architecture violations, business logic in views, Riverpod misuse, naming issues, and missing tests according to the shared standards.
```

## Ask An Architecture Question

### Codex

```text
Use D:\Github\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project. Explain how this feature in D:\Github\todo_list should be structured across presentation, application, domain, and infrastructure before we implement it.
```

### Claude

```text
Use D:\Github\CLAUDE.md and the dev-flutter skill from D:\Github\dev_guides for this project. Explain how this feature in D:\Github\todo_list should be structured across presentation, application, domain, and infrastructure before we implement it.
```

## Scotch Add-On

Append this to any prompt when working on a Scotch project:

```text
Also use D:\Github\dev_guides\skills\scotch-flutter\SKILL.md.
```

## Recommended Habit

1. Start each new chat with one of the prompts above.
2. Replace `D:\Github\todo_list` with the real project path.
3. Replace `[FEATURE NAME]` with the actual feature.
4. Add a specific reference file when needed, for example:

```text
Use D:\Github\dev_guides\skills\dev-flutter\references\architecture.md for layering decisions.
```
