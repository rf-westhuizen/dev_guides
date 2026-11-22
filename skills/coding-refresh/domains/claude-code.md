# claude-code

How dev_guides configures Claude Code: skill and agent frontmatter, tool lists,
hooks, settings, permissions, CLAUDE.md loading, and subagent behaviour.

## Targets

All paths are under `D:/Github/dev_guides/`.

- The frontmatter of every `skills/*/SKILL.md` and `agents/*.md`, except the
  never-edit files listed in `skills/coding-refresh/SKILL.md`.
- `skills/agent-flow/SKILL.md` and `skills/agent-code-review-team/SKILL.md` -
  claims about how subagents and teammates behave.
- `ENVIRONMENT.md`
- `CLAUDE.md` "Further Reading"
- `CODEX.md` "How To Use This Repo With Codex"
- `scripts/readonly-bash-guard.ps1` - report only, never edited: the hook
  exit-code and input behaviour it relies on.

## Sources

- https://code.claude.com/docs/en/skills - Use for: SKILL.md frontmatter keys, arguments and `allowed-tools`.
- https://code.claude.com/docs/en/sub-agents - Use for: agent frontmatter keys (tools, model, effort, color, hooks, skills) and what subagents inherit.
- https://code.claude.com/docs/en/hooks - Use for: hook events, matcher syntax and exit codes.
- https://code.claude.com/docs/en/settings - Use for: settings file locations and keys.
- https://code.claude.com/docs/en/permissions - Use for: permission rule syntax and permission modes.
- https://code.claude.com/docs/en/memory - Use for: how CLAUDE.md files load and `@` imports.
- https://code.claude.com/docs/en/best-practices - Use for: Anthropic's guidance on working with Claude Code.
- https://code.claude.com/docs/en/changelog - Use for: when a feature or frontmatter key was added or changed.
- https://code.claude.com/docs/llms.txt - Use for: finding the new address of a moved docs page.
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices - Use for: Anthropic's guidance on writing skills.

## Notes

- The documented agent colours are red, blue, green, yellow, purple, orange,
  pink and cyan.
