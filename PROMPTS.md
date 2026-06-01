# Prompt Templates

Reusable starter prompts for working in projects under `D:\Github` while
following the shared standards in `D:\Github\dev_guides`.

## New Flutter App

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project at D:\Github\todo_list. Help me scaffold a new Flutter app following the shared architecture, Riverpod, naming, and testing rules.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project at D:\Github\todo_list. Help me scaffold a new Flutter app following the shared architecture, Riverpod, naming, and testing rules.
```

## Add A New Feature

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project. Add a new feature for [FEATURE NAME] in D:\Github\todo_list following the MVVM + DDD structure and the dev_guides conventions.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project. Add a new feature for [FEATURE NAME] in D:\Github\todo_list following the MVVM + DDD structure and the dev_guides conventions.
```

## Fix A Bug

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md for this project. Investigate and fix this bug in D:\Github\todo_list while keeping the existing architecture and Flutter standards from dev_guides.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md for this project. Investigate and fix this bug in D:\Github\todo_list while keeping the existing architecture and Flutter standards from dev_guides.
```

## Review Code

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md for this project. Review this code for architecture violations, business logic in views, Riverpod misuse, naming issues, and missing tests according to dev_guides.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md for this project. Review this code for architecture violations, business logic in views, Riverpod misuse, naming issues, and missing tests according to dev_guides.
```

## Review Like Heinrich

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and the relevant dev_guides skills for this project. Review this PR like Heinrich: lead with blockers, check for conflict markers, git diff --check issues, line-ending churn, rename noise, committed dev notes/databases/DLLs, dynamic or known-shape Map<String, dynamic> leaks, wrong-layer imports, literal route/action strings, oversized mixed-concern files, weak tests, and Scotch payment/security risks such as PAN logging, hardcoded secrets/subnets/paths, implicit isReprint defaults, and undocumented listener/admin auth behavior.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and the relevant dev_guides skills for this project. Review this PR like Heinrich: lead with blockers, check for conflict markers, git diff --check issues, line-ending churn, rename noise, committed dev notes/databases/DLLs, dynamic or known-shape Map<String, dynamic> leaks, wrong-layer imports, literal route/action strings, oversized mixed-concern files, weak tests, and Scotch payment/security risks such as PAN logging, hardcoded secrets/subnets/paths, implicit isReprint defaults, and undocumented listener/admin auth behavior.
```

## Prepare A PR

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and the relevant dev_guides skills for this project. Prepare this change for PR review: check git diff --check, search for conflict markers, identify unrelated line-ending churn or rename noise, verify no dev notes/databases/DLLs/generated platform folders outside scope are committed, summarize cross-package changes, explain listener/launcher wiring, describe payment-flow or config-recovery behavior changes, call out risk, and list the tests that prove the real behavior.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and the relevant dev_guides skills for this project. Prepare this change for PR review: check git diff --check, search for conflict markers, identify unrelated line-ending churn or rename noise, verify no dev notes/databases/DLLs/generated platform folders outside scope are committed, summarize cross-package changes, explain listener/launcher wiring, describe payment-flow or config-recovery behavior changes, call out risk, and list the tests that prove the real behavior.
```

## Ask An Architecture Question

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project. Explain how this feature in D:\Github\todo_list should be structured across presentation, application, domain, and infrastructure before we implement it.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\dev-flutter\SKILL.md as the guide for this project. Explain how this feature in D:\Github\todo_list should be structured across presentation, application, domain, and infrastructure before we implement it.
```


## Grill With Docs

### Codex

```text
Use D:\Github\dev_guides\CODEX.md and D:\Github\dev_guides\skills\grill-with-docs\SKILL.md to grill this plan against the codebase, CONTEXT.md, CONTEXT-MAP.md, and ADRs before implementation. Ask one decision-shaping question at a time and recommend an answer for each question.
```

### Claude

```text
Use D:\Github\dev_guides\CLAUDE.md and D:\Github\dev_guides\skills\grill-with-docs\SKILL.md to grill this plan against the codebase, CONTEXT.md, CONTEXT-MAP.md, and ADRs before implementation. Ask one decision-shaping question at a time and recommend an answer for each question.
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
