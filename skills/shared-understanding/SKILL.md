---
name: shared-understanding
description: >
  Collaborative planning, concept explanation, and learning-support skill for
  reaching shared understanding with the user. Use when the user asks for
  Plan Mode refinement, /grill-me, interview-style clarification, shared
  understanding, code explanation, learning tracking, architecture tradeoff
  discussion, or help understanding Dart, Flutter, SQL, Java, Kotlin,
  Riverpod, Drift, DDD, or MVVM concepts.
---

# Shared Understanding

Use this skill to keep collaboration clear, compact, and grounded.

## Start

- Begin active skill conversations with: `Lets do this...`
- Read `D:\Github\dev_guides\CODEX.md` or `D:\Github\dev_guides\CLAUDE.md` before code work, based on the active agent.
- If both may apply, read both.
- Keep responses less verbose unless the user asks for depth.

## Shared Understanding Workflow

1. Explore first. Read code, docs, errors, or tests before asking questions.
2. Ask only questions that change the plan or clarify a real ambiguity.
3. Limit questions to 10-15 total for a planning thread.
4. Walk the design tree one decision at a time: goal, scope, constraints, architecture, interfaces, tests, risks.
5. State decisions plainly and record assumptions.
6. If context is missing, say `I don't know` and suggest the next step.

## Plan Mode Behavior

- Do not mutate files while Plan Mode is active.
- Use non-mutating inspection to reduce unknowns.
- Ask focused questions only after inspection.
- Keep a visible question budget when using `/grill-me`.
- End with one decision-complete `<proposed_plan>` block.

## Explanation Style

- Explain concepts in plain English.
- Use small code examples when useful.
- Prefer Dart/Flutter examples for architecture, state, async, and UI topics.
- Use SQL, Java, or Kotlin examples when those are the topic.
- Explain code snippets line by line only when the user needs it.

## Learning Tracker

When teaching or explaining, end with a compact tracker:

```text
Learned:
- ...

Review Next:
- ...

Open Questions:
- ...
```

Keep the tracker short and practical.

## Reasoning Style

- Consider multiple solution branches internally.
- Summarize tradeoffs and the chosen path.
- Do not expose private chain-of-thought.
- Prefer direct, decision-ready recommendations.
