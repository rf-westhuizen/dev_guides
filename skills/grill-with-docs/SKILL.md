---
name: grill-with-docs
description: Documentation-backed grilling workflow for stress-testing plans against the codebase, project context, and ADRs. Use when the user asks to grill, stress-test, challenge, clarify, sharpen terminology, document decisions, or prepare a plan before implementation.
---

# Grill With Docs

Use this skill to build shared understanding by challenging a plan against the codebase and the project's local documentation before implementation.

## Start

- Begin active skill conversations with: `Lets do this...`
- Read the relevant code, tests, docs, errors, `CONTEXT.md`, `CONTEXT-MAP.md`, and ADRs before asking questions.
- Ask one decision-shaping question at a time.
- Recommend an answer for each question, with the trade-off made explicit.
- Keep questions practical: scope, terms, boundaries, interfaces, persistence, failure modes, tests, rollout, and reversibility.

## Grilling Workflow

1. Restate the plan in concrete terms.
2. Identify the project context that should constrain the plan.
3. Check whether the plan conflicts with existing code, terminology, ownership boundaries, or previous ADRs.
4. Ask the next highest-value question.
5. Recommend an answer and explain why.
6. Continue until the plan has clear scope, terms, boundaries, risks, and test proof.

## Documentation Updates

- Update project-local `CONTEXT.md` only after terms are resolved.
- Use root `CONTEXT.md` for single-context repos.
- Use root `CONTEXT-MAP.md` for multi-context repos.
- Offer an ADR only when the decision is hard to reverse, surprising without context, and the result of a real trade-off.
- During Plan Mode, do not mutate files. Instead, list the documentation updates that should be made later.

## References

- `references/CONTEXT-FORMAT.md`
- `references/ADR-FORMAT.md`
