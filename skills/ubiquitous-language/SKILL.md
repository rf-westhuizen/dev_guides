---
name: ubiquitous-language
description: >
  Domain terminology extraction and glossary maintenance skill. Use when the
  user asks to create, update, scan, explain, or align a ubiquitous language,
  domain language, terminology glossary, DDD vocabulary, shared code terms, or
  UBIQUITOUS_LANGUAGE.md file for a codebase. "UL" or "ul" always means
  ubiquitous language (e.g. "add this to the ul", "check the UL").
---

# Ubiquitous Language

Use this skill to keep code, planning, and conversation aligned with the same domain model.

## Start

- Begin active skill conversations with: `Lets name this...`

## Source Of Truth

- Maintain the central file at `D:/Github/dev_guides/UBIQUITOUS_LANGUAGE.md`.
- Use the active project name in the `Project` column.
- Prefer terms already present in code, tests, docs, routes, database names, and UI labels.
- Mark unclear meanings as `Needs confirmation`.

## Scan Order

Scan focused sources first:

1. `lib/**/domain/**`
2. `lib/**/providers/**`
3. `lib/**/data/**/dtos/**`, `lib/**/data/**/daos/**`, and repository implementations
4. `test/**`
5. Feature docs or README files

Avoid generated files, build output, platform folders, and dependency caches.

## What To Extract

Look for:

- Entities and aggregate-like concepts
- Value objects and meaningful primitives
- States, failures, commands, and events
- Repository and service contracts
- Use cases, workflows, and transaction names
- Database table names and important columns
- Repeated business terms from tests

Skip generic technical words unless the codebase gives them domain meaning.

## Table Format

Use this Markdown table:

```markdown
| Project | Term | Meaning | Code Expression | Layer | Notes |
|---|---|---|---|---|---|
| project_name | Basket | Current sale being assembled before checkout. | `BasketState`, `BasketLine` | Domain | Needs confirmation |
```

Keep meanings short. Use the codebase's words instead of inventing synonyms.

## Update Rules

- Merge duplicates by keeping the clearest definition.
- Add new terms when they help planning, explanation, or code review.
- Update meanings when the code shows a better definition.
- Keep uncertain rows instead of pretending certainty.
- Mention learning value when terms explain a DDD, MVVM, Riverpod, Drift, or platform concept.
