---
name: shared-understanding
description: >
  Collaborative planning, concept explanation, and learning-support skill for
  reaching shared understanding with the user. Use when the user asks for
  Plan Mode refinement, interview-style clarification, shared understanding,
  code explanation, learning tracking, architecture tradeoff discussion, or
  help understanding Dart, Flutter, SQL, Java, Kotlin, Riverpod, Drift, DDD,
  or MVVM concepts.
---

# Shared Understanding

Use this skill to keep collaboration clear, compact, and grounded.

## Start

- Begin active skill conversations with: `Lets understand this...`
- Read `D:/Github/dev_guides/CODEX.md` or `D:/Github/dev_guides/CLAUDE.md` before code work, based on the active agent.
- If both may apply, read both.
- Keep responses less verbose unless the user asks for depth.

## Shared Understanding Workflow

1. Explore first. Read code, docs, errors, or tests before asking questions.
2. Ask only questions that change the plan or clarify a real ambiguity.
3. Limit questions to 10-15 total for a planning thread.
4. Walk the design tree one decision at a time: goal, scope, constraints, architecture, interfaces, tests, risks.
5. State decisions plainly and record assumptions.
6. If context is missing, say `I don't know` and suggest the next step.

To grill a plan against `CONTEXT.md`, `CONTEXT-MAP.md` and ADRs, or to record
resolved terms and decisions in them, use `grill-with-docs`
(`D:/Github/dev_guides/skills/grill-with-docs/SKILL.md`) instead.

## Plan Mode Behavior

- Do not mutate files while Plan Mode is active.
- Use non-mutating inspection to reduce unknowns.
- Ask focused questions only after inspection.
- Keep a visible question budget during interview-style clarification.
- End with one decision-complete `<proposed_plan>` block.

## Explanation Style

- Explain concepts in plain English.
- Start from the closest topic in `D:/Github/dev_guides/KNOWLEDGE_MAP.md`, as
  set out in "Active Thinking (Always)" in `D:/Github/dev_guides/CLAUDE.md`.
- Pitch explanations and examples at the level set in "Code Level" in
  `D:/Github/dev_guides/CLAUDE.md`: a mid-to-junior engineer.
- Use small code examples when useful.
- Prefer Dart/Flutter examples for architecture, state, async, and UI topics.
- Use SQL, Java, or Kotlin examples when those are the topic.
- Explain code snippets line by line only when the user needs it.

## Learning Tracker

When teaching or explaining, end with a compact tracker:

```text
Learned:
- ...

Connects to:
- <new idea> -> <topic from KNOWLEDGE_MAP.md>: <same idea | builds on | contrast>

Review Next:
- ...

Open Questions:
- ...
```

Keep the tracker short and practical. When the user shows they understand a
Learned item, add or update its entry in `D:/Github/dev_guides/KNOWLEDGE_MAP.md`.

## Reasoning Style

- Consider multiple solution branches internally.
- Summarize tradeoffs and the chosen path.
- Do not expose private chain-of-thought.
- Prefer direct, decision-ready recommendations.
