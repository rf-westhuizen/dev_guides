# CONTEXT.md Format

Use `CONTEXT.md` to capture project-local language that is settled enough to guide future work.

## Location

- Single-context repos use root `CONTEXT.md`.
- Multi-context repos use root `CONTEXT-MAP.md` to point to bounded-context-specific files.
- Create `CONTEXT.md` lazily when the first term is resolved.

## Content Rules

- Keep it as a glossary and shared-language reference.
- Capture terms, meanings, aliases, boundaries, and examples.
- Do not turn it into an implementation spec.
- Do not record unresolved debates as settled language.

## Entry Shape

```text
## Term Name

Meaning:
- ...

Also Known As:
- ...

Use When:
- ...

Do Not Use For:
- ...
```
