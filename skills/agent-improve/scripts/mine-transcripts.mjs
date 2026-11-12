#!/usr/bin/env node
// mine-transcripts.mjs — mines Claude Code transcripts for turns that used a
// dev_guides-owned skill or subagent, into a compact JSON the agent-improve
// skill's transcript-reviewer subagent scores. Read-only; writes only to
// --out (or stdout).
//
// Scope: dev_guides skills/agents are machine-global (ENVIRONMENT.md's
// CLAUDE_CONFIG_DIR override loads them into every Claude Code session on
// this machine, regardless of cwd) — confirmed by finding real
// architect/database/backend/frontend/security subagent calls inside the
// PARW project's own transcripts, a folder outside dev_guides entirely. So
// this script scans EVERY project folder under --dir, with no folder
// allowlist, and scopes purely by content: a work unit is only kept if its
// turn actually invoked a Skill/Agent tool_use, or a manual slash command,
// naming something in the catalog below, or (for a subagent's own
// transcript file) its meta.json agentType is in that catalog. An earlier
// draft of this script assumed a 3-folder allowlist; that assumption was
// wrong and has been removed.
//
// The catalog is read from disk on every run (dev_guides/skills/*/SKILL.md
// and dev_guides/agents/*.md), so a new skill or agent is picked up without
// editing this file.
//
// A subagent's own transcript is nested under the parent turn that spawned
// it (matched by meta.json toolUseId = the parent's Agent tool_use id), so
// one task is one work unit, not two.
//
// Failed tool calls are kept and marked is_error, and Bash output is
// captured (tail-clipped), so the judge can see what actually happened.
//
// Parsing conventions below (uuid dedup, Skill/Agent tool_use detection,
// the <command-name> slash-command tag, the "[Request interrupted" marker,
// human-message turn boundaries) are adapted from the session-report
// plugin's analyze-sessions.mjs, which documents the same JSONL schema this
// script relies on.
//
// Usage:
//   node mine-transcripts.mjs [--dir <path>] [--since <ISO|7d|24h>] [--scope <skill-or-agent-name>] [--out <path>]

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

function flag(argv, name, dflt) {
  const i = argv.indexOf(name)
  if (i === -1) return dflt
  const v = argv[i + 1]
  return v === undefined || v.startsWith('--') ? dflt : v
}

function parseSince(s) {
  if (!s) return null
  const m = /^(\d+)([dh])$/.exec(s)
  if (m) {
    const ms = m[2] === 'd' ? 86400000 : 3600000
    return new Date(Date.now() - parseInt(m[1], 10) * ms)
  }
  const d = new Date(s)
  if (isNaN(d)) {
    console.error(`mine-transcripts: could not parse --since "${s}" (expected an ISO date, or "7d"/"24h")`)
    process.exit(2)
  }
  return d
}

const argv = process.argv.slice(2)
const DIR = flag(argv, '--dir', 'D:/Github/.claude/projects')
const SINCE = parseSince(flag(argv, '--since', '30d'))
const SCOPE = flag(argv, '--scope', null)
const OUT = flag(argv, '--out', null)
const CLIP_CHARS = 4000 // keeps the mined JSON small enough for the judge to read without re-opening raw transcripts
// Bash output is tail-clipped, since test summaries and final errors sit at
// the end. A failed command keeps more; a passing one only needs its last
// line or two (e.g. "All tests passed!").
const FAILED_OUTPUT_CHARS = 2000
const OK_OUTPUT_CHARS = 300

const DEV_GUIDES_DIR = 'D:/Github/dev_guides'

// Deliberately excludes agent-improve/transcript-reviewer themselves, so
// the judge never has to reason about scoring its own prior runs.
const SELF = new Set(['agent-improve', 'transcript-reviewer'])

// Skills that belong to the dev_guides setup but live outside
// dev_guides/skills. manage-azure-devops-stories ships with the MCP server
// in C:/ClaudePlugins/azure-devops-work-items.
const EXTERNAL_SKILLS = ['manage-azure-devops-stories']

function listSkillNames() {
  const skillsDir = path.join(DEV_GUIDES_DIR, 'skills')
  let ents = []
  try {
    ents = fs.readdirSync(skillsDir, { withFileTypes: true })
  } catch {
    return []
  }
  const names = []
  for (const e of ents) {
    if (!e.isDirectory()) continue
    if (SELF.has(e.name)) continue
    if (fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md'))) names.push(e.name)
  }
  return names
}

function listAgentNames() {
  const agentsDir = path.join(DEV_GUIDES_DIR, 'agents')
  let files = []
  try {
    files = fs.readdirSync(agentsDir)
  } catch {
    return []
  }
  const names = []
  for (const f of files) {
    if (!f.endsWith('.md')) continue
    const name = path.basename(f, '.md')
    if (!SELF.has(name)) names.push(name)
  }
  return names
}

const DEV_GUIDES_SKILLS = new Set([...listSkillNames(), ...EXTERNAL_SKILLS])
const DEV_GUIDES_AGENTS = new Set(listAgentNames())

if (DEV_GUIDES_SKILLS.size === EXTERNAL_SKILLS.length || DEV_GUIDES_AGENTS.size === 0) {
  console.error(`mine-transcripts: found no skills or no agents under ${DEV_GUIDES_DIR} — refusing to mine with an empty catalog`)
  process.exit(2)
}

function clip(s) {
  if (typeof s !== 'string') return s
  return s.length > CLIP_CHARS ? s.slice(0, CLIP_CHARS) + '…(clipped)' : s
}

function clipTail(s, maxChars) {
  if (typeof s !== 'string') return s
  return s.length > maxChars ? '(clipped)…' + s.slice(-maxChars) : s
}

// A tool_result's content is either a plain string or an array of blocks.
function resultText(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts = []
  for (const b of content) {
    if (b && b.type === 'text' && b.text) parts.push(b.text)
  }
  return parts.join('\n')
}

function* walk(dir) {
  let ents
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of ents) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (e.isFile() && e.name.endsWith('.jsonl')) yield p
  }
}

function listTargetFiles(root) {
  return [...walk(root)]
}

function classify(p, root) {
  const rel = path.relative(root, p)
  const parts = rel.split(path.sep)
  const project = parts[0]
  const subIdx = parts.indexOf('subagents')
  if (subIdx !== -1) {
    // Workflow-spawned agents live in subagents/workflows/<runId>/ and their
    // meta.json has no toolUseId, so the run id is their link to the parent.
    const workflowRunId = parts[subIdx + 1] === 'workflows' ? parts[subIdx + 2] : null
    return { project, sessionId: parts[subIdx - 1], kind: 'subagent', workflowRunId }
  }
  return { project, sessionId: path.basename(p, '.jsonl'), kind: 'main', workflowRunId: null }
}

function emptyUnit(id, project, sessionId, kind) {
  return {
    id,
    project,
    session_id: sessionId,
    kind,
    agent_type: null,
    active_skill_or_agent: null,
    started_at: null,
    ended_at: null,
    prompt_preview: '',
    edits: [],
    bash_commands: [],
    rework: [],
    correction_signals: [],
    spawned_ids: [], // Agent/Task tool_use ids and Workflow run ids started in this turn
    spawned_by: null, // subagent units only: the tool_use id or Workflow run id that started this run
    subagent_units: [], // subagent runs spawned in this turn, nested here after mining
    _entriesById: new Map(), // tool_use id -> edit/bash entry, so its tool_result can be attached
  }
}

// Attaches a tool_result to the edit/bash entry it answers.
function recordToolResult(unit, block) {
  const entry = unit._entriesById.get(block.tool_use_id)
  if (!entry) return
  entry.is_error = !!block.is_error
  const text = resultText(block.content)
  if (entry.tool === 'Bash') {
    const maxChars = entry.is_error ? FAILED_OUTPUT_CHARS : OK_OUTPUT_CHARS
    entry.output = clipTail(text, maxChars)
  } else if (entry.is_error) {
    entry.error = clip(text)
  }
}

function textOf(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    const first = content[0]
    if (first && first.type === 'text') return first.text || ''
  }
  return null
}

function isToolResultEntry(content) {
  return Array.isArray(content) && content[0] && content[0].type === 'tool_result'
}

function promptPreview(text) {
  if (!text) return '(non-text)'
  const t = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length > 240 ? t.slice(0, 237) + '…' : t
}

// Rough overlap between two prompt previews — flagged for the judge to
// interpret as a possible repeated instruction, not asserted as fact.
function jaccard(a, b) {
  const sa = new Set(a.toLowerCase().split(/\s+/).filter(Boolean))
  const sb = new Set(b.toLowerCase().split(/\s+/).filter(Boolean))
  if (sa.size === 0 || sb.size === 0) return 0
  let inter = 0
  for (const w of sa) if (sb.has(w)) inter++
  return inter / (sa.size + sb.size - inter)
}

const seenUuids = new Set() // global dedupe across resumed sessions

// Units that didn't match the catalog themselves but started subagents or a
// workflow. One is kept after all if a dev_guides subagent links back to it
// (see nestSubagentUnits).
const unkeptParents = []

async function processFile(p, info, out, sessionPromptHistory) {
  const rl = readline.createInterface({
    input: fs.createReadStream(p, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  let unit = null
  const history = sessionPromptHistory.get(info.sessionId) || []
  sessionPromptHistory.set(info.sessionId, history)

  function finalizeUnit() {
    if (!unit) return

    // Rework only counts edits that succeeded — a failed Edit changed nothing.
    const byFile = new Map()
    for (const e of unit.edits) {
      if (!e.file_path || e.is_error) continue
      const arr = byFile.get(e.file_path) || []
      arr.push(e.uuid)
      byFile.set(e.file_path, arr)
    }
    for (const [file_path, uuids] of byFile) {
      if (uuids.length > 1) {
        unit.rework.push({ file_path, edit_uuids: uuids, note: 'same file edited twice within this work unit' })
      }
    }
    delete unit._entriesById

    const include = !!unit.active_skill_or_agent && (!SCOPE || unit.active_skill_or_agent === SCOPE)
    if (include) out.work_units.push(unit)
    else if (unit.spawned_ids.length > 0) unkeptParents.push(unit)
    if (unit.prompt_preview) history.push({ id: unit.id, text: unit.prompt_preview })
    unit = null
  }

  for await (const line of rl) {
    if (!line) continue
    let e
    try { e = JSON.parse(line) } catch { continue }

    if (e.uuid) {
      if (seenUuids.has(e.uuid)) continue
      seenUuids.add(e.uuid)
    }

    const ts = e.timestamp ? Date.parse(e.timestamp) : NaN
    if (!isNaN(ts) && SINCE && ts < SINCE.getTime()) continue

    if (e.type === 'user') {
      if (e.isMeta || e.isCompactSummary) continue
      const content = e.message && e.message.content

      if (Array.isArray(content)) {
        for (const b of content) {
          if (b && b.type === 'tool_result' && b.tool_use_id && unit) {
            recordToolResult(unit, b)
          }
        }
      }
      // A Workflow launch reports its run id here; its agents link back to it.
      if (unit && e.toolUseResult && e.toolUseResult.runId) {
        unit.spawned_ids.push(String(e.toolUseResult.runId))
      }
      if (isToolResultEntry(content)) continue

      const text = textOf(content)
      if (text && text.startsWith('[Request interrupted')) {
        if (unit) unit.correction_signals.push({ kind: 'interrupted', excerpt: promptPreview(text), uuid: e.uuid, timestamp: e.timestamp })
        continue
      }
      if (text && (text.startsWith('<task-notification') || text.startsWith('<scheduled-wakeup') || text.startsWith('<background-task'))) {
        continue // auto-continuation, not a new human turn
      }

      if (info.kind === 'main' && !e.isSidechain && text !== null) {
        if (unit) {
          unit.correction_signals.push({ kind: 'followup_text', excerpt: promptPreview(text), uuid: e.uuid, timestamp: e.timestamp })
        }
        finalizeUnit()
        const id = `${info.sessionId}:${e.uuid || e.timestamp}`
        unit = emptyUnit(id, info.project, info.sessionId, info.kind)
        unit.started_at = e.timestamp
        unit.prompt_preview = promptPreview(text)

        // Manual-only skills (agent-flow, review-team, teach, pre-pr, ...)
        // can't appear as an assistant Skill tool_use — the user starts them
        // with a literal /command instead, recorded as a <command-name> tag.
        const slashMatch = /<command-(?:name|message)>\/?([^<]+)<\/command-/.exec(text)
        if (slashMatch && DEV_GUIDES_SKILLS.has(slashMatch[1].trim())) {
          unit.active_skill_or_agent = slashMatch[1].trim()
        }

        for (const h of history) {
          if (jaccard(h.text, unit.prompt_preview) > 0.6) {
            unit.correction_signals.push({ kind: 'repeated_instruction', excerpt: unit.prompt_preview, uuid: e.uuid, timestamp: e.timestamp, repeated_instruction_of: h.id })
            break
          }
        }
      }
      continue
    }

    if (e.type === 'assistant') {
      if (!unit) {
        // Covers both a subagent file (one unit per file) and a main file
        // whose opening human message was deduped away as replayed history.
        unit = emptyUnit(`${info.sessionId}:${info.kind}`, info.project, info.sessionId, info.kind)
        unit.started_at = e.timestamp
      }
      unit.ended_at = e.timestamp || unit.ended_at
      const content = e.message && e.message.content
      if (!Array.isArray(content)) continue
      for (const c of content) {
        if (!c || c.type !== 'tool_use') continue
        if (c.name === 'Skill' && c.input && c.input.skill) {
          const sk = String(c.input.skill)
          if (DEV_GUIDES_SKILLS.has(sk)) unit.active_skill_or_agent = sk
        } else if (c.name === 'Agent' || c.name === 'Task') {
          if (c.id) unit.spawned_ids.push(c.id)
          const at = c.input && c.input.subagent_type ? String(c.input.subagent_type) : null
          if (at && DEV_GUIDES_AGENTS.has(at)) unit.active_skill_or_agent = at
        } else if (c.name === 'Edit' || c.name === 'MultiEdit') {
          const entry = { tool: c.name, file_path: c.input?.file_path, old_string: clip(c.input?.old_string), new_string: clip(c.input?.new_string), is_error: false, uuid: c.id }
          unit.edits.push(entry)
          unit._entriesById.set(c.id, entry)
        } else if (c.name === 'Write') {
          const entry = { tool: 'Write', file_path: c.input?.file_path, content: clip(c.input?.content), is_error: false, uuid: c.id }
          unit.edits.push(entry)
          unit._entriesById.set(c.id, entry)
        } else if (c.name === 'Bash') {
          const entry = { tool: 'Bash', command: clip(c.input?.command), is_error: false, output: null, uuid: c.id }
          unit.bash_commands.push(entry)
          unit._entriesById.set(c.id, entry)
        }
      }
      continue
    }
  }

  if (info.kind === 'subagent' && unit) {
    const metaPath = p.replace(/\.jsonl$/, '.meta.json')
    try {
      const m = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
      if (m && m.toolUseId) unit.spawned_by = String(m.toolUseId)
      else if (info.workflowRunId) unit.spawned_by = info.workflowRunId
      const at = m && (m.agentType || m.spawnedAgentType)
      if (at) {
        unit.agent_type = String(at)
        if (DEV_GUIDES_AGENTS.has(String(at))) unit.active_skill_or_agent = String(at)
      }
    } catch {
      /* no meta.json — leave unscoped, excluded below */
    }
  }
  finalizeUnit()
}

// Moves each subagent unit under the unit that spawned it (by Agent
// tool_use id or Workflow run id), so one task is scored once. Runs after
// all files are mined because a subagent file can be walked before its
// parent's main file.
//
// A parent that didn't match the catalog itself (e.g. a turn that launched
// a workflow of reviewer agents) is kept because its child matched. The walk
// continues upward, so main turn -> fork -> reviewer ends up as one unit.
// A subagent whose parent can't be found (e.g. outside --since) stays
// top-level.
function nestSubagentUnits(out) {
  const pool = [...out.work_units, ...unkeptParents]
  const parentBySpawnId = new Map()
  for (const u of pool) {
    for (const id of u.spawned_ids) parentBySpawnId.set(id, u)
  }

  const kept = new Set(out.work_units)
  const nested = new Set()
  for (const start of out.work_units) {
    let child = start
    while (child.spawned_by && !nested.has(child)) {
      const parent = parentBySpawnId.get(child.spawned_by)
      if (!parent || parent === child) break
      parent.subagent_units.push(child)
      nested.add(child)
      if (kept.has(parent)) break // that parent's own walk (or an earlier one) handles further up
      kept.add(parent)
      child = parent
    }
  }

  out.work_units = pool.filter(u => kept.has(u) && !nested.has(u))
  out.subagent_units_nested = nested.size
}

async function main() {
  const out = {
    generated_at: new Date().toISOString(),
    scope: {
      dir: DIR,
      since: SINCE ? SINCE.toISOString() : null,
      skill_or_agent_filter: SCOPE,
      projects_with_matches: [], // filled in below, after mining
    },
    dev_guides_catalog: {
      skills: [...DEV_GUIDES_SKILLS],
      agents: [...DEV_GUIDES_AGENTS],
    },
    files_scanned: 0,
    sessions_scanned: 0,
    work_units_count: 0, // top-level units (one per human turn, plus any orphaned subagent run)
    subagent_units_nested: 0, // subagent runs folded into their parent's subagent_units
    work_units: [],
  }

  const files = listTargetFiles(DIR)
  const sessionsSeen = new Set()
  const sessionPromptHistory = new Map()

  for (const p of files) {
    const info = classify(p, DIR)
    await processFile(p, info, out, sessionPromptHistory)
    out.files_scanned++
    sessionsSeen.add(info.sessionId)
  }

  nestSubagentUnits(out)

  out.sessions_scanned = sessionsSeen.size
  out.work_units_count = out.work_units.length
  out.scope.projects_with_matches = [...new Set(out.work_units.map(u => u.project))].sort()

  const json = JSON.stringify(out, null, 2)
  if (OUT) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true })
    fs.writeFileSync(OUT, json)
    console.error(`mine-transcripts: wrote ${out.work_units_count} work unit(s) from ${out.sessions_scanned} session(s) across ${out.files_scanned} file(s) to ${OUT}`)
  } else {
    console.log(json)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
