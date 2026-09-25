<#
.SYNOPSIS
  PreToolUse hook that keeps a read-only subagent's Bash calls read-only.

.DESCRIPTION
  Wired into the frontmatter `hooks:` block of the reviewer, security and
  tester agents in D:/Github/dev_guides/agents/. Claude Code pipes the hook
  JSON on stdin; this script takes tool_input.command, splits it on shell
  separators (&&, ||, ;, |, newline) and requires every segment to match the
  allowlist for -Mode. Exit 0 allows the call; exit 2 blocks it and the
  stderr reason is shown to the agent.

  Fails closed: unparseable input, command substitution, redirection to a
  file, or any segment outside the allowlist is blocked. Separators inside
  quotes are not understood, so a quoted '|' or ';' blocks a harmless command.
  That is the intended direction to fail.

.PARAMETER Mode
  git-read  git history/inspection plus plain read commands.
  test      git-read plus flutter/dart test and analyze, and melos test/analyze scripts.
#>
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('git-read', 'test')]
    [string]$Mode
)

function Block([string]$reason) {
    [Console]::Error.WriteLine("Blocked by readonly-bash-guard ($Mode): $reason. This agent is read-only; report what you needed instead of working around it.")
    exit 2
}

try {
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $command = [string]$payload.tool_input.command
} catch {
    Block 'could not parse hook input'
}

if ([string]::IsNullOrWhiteSpace($command)) { Block 'empty command' }

# Stderr merges and discards are harmless; strip them before the redirection check.
$normalized = $command -replace '\d?>&\d', '' -replace '\d?>\s*/dev/null', ''

if ($normalized -match '\$\(|`|<\(|>\(') { Block 'command substitution is not allowed' }
if ($normalized -match '>')              { Block 'redirecting output to a file is not allowed' }
if ($normalized -match '(^|[^&])&($|[^&])') { Block 'background jobs are not allowed' }

# Flags that make otherwise read-only tools write files or run other programs.
$forbiddenFlags = '(^|\s)(--output|--write|--file-reporter|--update-goldens|--coverage|--pre|--open-files-in-pager|--ext-diff|--exec)(=|\s|$)'
if ($normalized -match $forbiddenFlags) { Block "flag '$($Matches[2])' writes files or runs another program" }

# git grep -O<program> is the short form of --open-files-in-pager. Case-sensitive so grep -o still passes.
if ($normalized -cmatch '(^|\s)-O') { Block "flag '-O' runs another program" }

$gitRead = '^git(\s+--no-pager)?(\s+-C\s+("[^"]*"|''[^'']*''|\S+))?\s+(log|show|diff|grep|blame|status|rev-parse|ls-files|rev-list|for-each-ref|cat-file|shortlog)(\s|$)'
# No sort: sort -o <file> writes a file.
$plainRead = '^(cd|pwd|ls|cat|head|tail|wc|grep|uniq|cut|echo)(\s|$)'
# melos scripts are arbitrary shell, so only the read-only test/analyze scripts in scotch_software's pubspec.yaml are named.
$testRun = '^(flutter\s+(test|analyze)|dart\s+(test|analyze)|melos\s+(list|analyze)|melos\s+run\s+(test|test:dart|test:flutter|test:diff|analyze|analyze:diff))(\s|$)'

$allowed = @($gitRead, $plainRead)
if ($Mode -eq 'test') { $allowed += $testRun }

foreach ($segment in ($normalized -split '&&|\|\||;|\||\r?\n')) {
    $s = $segment.Trim()
    if ($s -eq '') { continue }
    $ok = $false
    foreach ($pattern in $allowed) {
        # Case-sensitive: git -c (set config, can run a pager) must not pass as -C (path).
        if ($s -cmatch $pattern) { $ok = $true; break }
    }
    if (-not $ok) { Block "'$s' is not on the $Mode allowlist" }
}

exit 0
