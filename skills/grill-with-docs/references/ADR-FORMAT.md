# ADR Format

Use ADRs for decisions that future maintainers will need to understand.

## Location

- ADRs live in `docs/adr/`.
- Create the directory lazily.
- Number ADRs by scanning existing ADR files and incrementing the next number.

## Create An ADR Only When

- The decision is hard to reverse.
- The decision is surprising without context.
- The decision came from a real trade-off.

## Template

```text
# ADR NNN: Title

Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded

## Context

## Decision

## Consequences

## Alternatives Considered
```
