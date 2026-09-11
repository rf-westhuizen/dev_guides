# ENVIRONMENT.md - How skills get loaded on this machine

This file documents the machine-specific plumbing behind skill discovery.
Read this if a skill isn't showing up, or before adding a new one.

## Config directory override

Claude Code normally reads global config/skills from `%USERPROFILE%\.claude`.
On this machine that is overridden:

```
CLAUDE_CONFIG_DIR = D:\Github\.claude
```

Any Claude Code session on this machine (any cwd) loads global skills from
`D:\Github\.claude\skills\*\SKILL.md`, regardless of which project it's
launched in. That is why `dev-flutter`, `shared-understanding`, etc. appear
in every session's skill list unprefixed, without needing a project-local
`.claude/skills` folder.

## Skills are NTFS junctions, not copies

Each entry under `D:\Github\.claude\skills\` is an NTFS directory junction
pointing at the real source of that skill. This keeps the skill live: edits
to the source are picked up immediately, no re-sync step.

Junctions were used (not `ln -s` / real symbolic links) because creating a
true Windows symlink requires Developer Mode or an elevated shell; junctions
don't need either privilege. Git Bash's `ls -la` renders junctions with a
misleading `l` (symlink-style) prefix, but `fsutil reparsepoint query` /
PowerShell `Get-Item ... | Select LinkType` show them as `Junction`. Plain
`ln -s` from Git Bash silently fell back to copying the whole directory tree
instead of linking when it lacked symlink privilege — no error was printed,
so always verify a new link with `fsutil reparsepoint query <path>` (a real
junction/symlink prints reparse tag info; a plain directory errors with
"not a reparse point").

To add a new junction (PowerShell, no elevation needed):

```powershell
New-Item -ItemType Junction -Path "D:\Github\.claude\skills\<name>" -Target "<source dir>"
```

## Current junction registry

| Junction (`D:\Github\.claude\skills\...`) | Target | Source repo |
|---|---|---|
| `dev-flutter` | `D:\Github\dev_guides\skills\dev-flutter` | dev_guides |
| `shared-understanding` | `D:\Github\dev_guides\skills\shared-understanding` | dev_guides |
| `ubiquitous-language` | `D:\Github\dev_guides\skills\ubiquitous-language` | dev_guides |
| `grill-with-docs` | `D:\Github\dev_guides\skills\grill-with-docs` | dev_guides |
| `error-replication` | `D:\Github\dev_guides\skills\error-replication` | dev_guides |
| `manage-azure-devops-stories` | `C:\ClaudePlugins\azure-devops-work-items\skills\manage-azure-devops-stories` | ClaudePlugins (Azure DevOps MCP plugin) |

`scotch-flutter` exists in `dev_guides\skills\` but has **no** junction — it's
intentionally not globally live; read it directly when working in the
`scotch_software` monorepo (see `CLAUDE.md`/`CODEX.md`).

## Separate concern: the Azure DevOps MCP server

`manage-azure-devops-stories` (the skill above) is only the policy layer. The
MCP tools it governs (`get_work_item`, `create_bug`, `change_work_item_parent`,
etc.) come from a **separate**, project-scoped registration:

- Server: `C:\ClaudePlugins\azure-devops-work-items\` (Node/MCP server, see its
  own `README.md`)
- Registration: `.mcp.json` in that folder — only active in sessions whose cwd
  is `C:\ClaudePlugins` (or another directory with an equivalent `.mcp.json`)
- Auth: requires `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PROJECT`, `AZURE_DEVOPS_PAT`
  env vars set in the launching shell. Without them the tools appear but
  can't authenticate.

So: the skill (behavior/guardrails) is global via the junction above; the
tools themselves (capability) are not — they need the MCP server registered
and PAT env vars present wherever `claude` is launched.

## Codex

Codex does not read Claude Code's `CLAUDE_CONFIG_DIR`/skills mechanism at all.
For Codex, `CODEX.md` in this repo is read directly and points at each
`SKILL.md` by absolute path instead of relying on auto-discovery.
