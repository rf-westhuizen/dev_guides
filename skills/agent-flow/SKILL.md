---
name: agent-flow
description: Builds a feature or service end to end by handing each step to the right subagent in order - plan, architect, database, backend or frontend, security abuse cases, tests, review - with two user checkpoints. Start it with /agent-flow <what to build>.
disable-model-invocation: true
---

# Agent Flow

Build one feature or service by passing it through the subagents in
`D:/Github/dev_guides/agents/`, in a fixed order, with the user approving the
design before anything is built and the result before it is reviewed.

Start with: `Lets flow this...`

## Before starting

Say back what will be built and where (repository, package), in one or two
sentences. If either is unclear, ask. Then name the steps that will run and
the ones that will be skipped, with the reason, for example: "No screen, so
frontend and designer are skipped."

## Rules for the whole flow

- **Only run steps that apply.** No screen: skip `frontend` and `designer`. No
  new or changed table: skip `database`. No native code: skip `platform`.
  Using fewer agents is correct, not a shortcut.
- **Agents do not see this conversation.** Every agent prompt must carry the
  target (repository, package, paths), the decisions from step 1, and the
  output of the step before it, pasted in full. Never send "implement the
  plan" without the plan.
- **Keep the standards.** Every agent prompt reminds it to follow "Code Level"
  and, inside `scotch_software`, the "Scotch Payment And Listener Gates" in
  `D:/Github/dev_guides/CLAUDE.md`.
- **Stop when an agent stops.** If an agent reports work it needs from
  another owner (a schema change, a Dart call site), run that owner next
  instead of pushing on.
- **Do not do an agent's work yourself** while it runs. Wait for its report.

## Steps

**1. Plan.** Use `shared-understanding` to settle the goal, scope, failure
cases and edge cases with the user. Record the decisions as a short list. If
new domain terms appear, add them with `ubiquitous-language`.

**2. Structure.** Run `architect` with the decisions from step 1. It returns
where the code goes, the trade-off, and the files that change.

> **Checkpoint 1.** Show the user the architect's plan and wait for approval.
> Do not start step 3 until they approve. If they change the plan, re-run
> `architect` with the change.

**3. Data** (only if the plan adds or changes a table). Run `database` with
the approved plan. It returns the migration and the migration test.

**4. Build.** Run `backend` with the approved plan (and the database report,
if any). For UI work, run `frontend` after `backend`, then `designer` for
visual work. Native work goes to `platform`. Each writes tests for what it
changes.

**5. Attack.** Run `security` on the changed files. It returns findings and
"Abuse cases to test".

**6. Harden.** Give the abuse cases to the owner each one names (usually
`backend`) and have them written as tests. Fix any security finding the same
way, through the owner.

**7. Test.** Run `tester` scoped to the changed package. If anything fails,
run `debugger` with the failure output, then run `tester` again. Repeat until
green or until it is clear the failure needs a user decision.

> **Checkpoint 2.** Show the user the final report (below) and wait for
> approval before review.

**8. Review.** For a large change, tell the user to run
`/review-team <target>`, since it is manual-only; otherwise run `/pre-pr`.

## Final report

```text
## Built
<what was built and where, one or two sentences>

## Steps
- <step> - <agent> - <ran | skipped: why>

## Files changed
- <path> - <what changed>

## Tests added
- <test file> - <behaviour or abuse case it guards>

## Open items
- <anything an agent could not do, a blocked command, or a user decision needed>
```

## Calibration

The value of this flow is the order and the checkpoints, not the number of
agents used. A small service might only need `architect`, `backend`,
`security` and `tester`. Say so plainly rather than running agents with
nothing to do.
