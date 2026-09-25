<#
.SYNOPSIS
  Checks readonly-bash-guard.ps1 against a table of commands it must allow or block.

.DESCRIPTION
  Run after changing the guard's allowlist:
    powershell -NoProfile -ExecutionPolicy Bypass -File D:/Github/dev_guides/scripts/readonly-bash-guard.test.ps1
  Prints one line per case and exits 1 if any case gets the wrong result.
#>
$guard = Join-Path $PSScriptRoot 'readonly-bash-guard.ps1'

# Mode, command, expected exit code (0 = allowed, 2 = blocked).
$cases = @(
    @('git-read', 'git status --short', 0),
    @('git-read', 'git log --oneline -5 | head -3', 0),
    @('git-read', 'git diff 2>&1 | grep -o foo', 0),
    @('git-read', 'git diff > out.txt', 2),
    @('git-read', 'git -c core.pager=x log', 2),
    @('git-read', 'git grep --open-files-in-pager=notepad foo', 2),
    @('git-read', 'git grep -Onotepad foo', 2),
    @('git-read', 'sort -o victim.txt README.md', 2),
    @('git-read', 'git diff --output=x.txt', 2),
    @('git-read', 'rm -rf x', 2),
    @('git-read', 'flutter test', 2),
    @('test', 'flutter test --no-pub', 0),
    @('test', 'melos run test:flutter', 0),
    @('test', 'flutter test --coverage', 2),
    @('test', 'flutter test --update-goldens', 2),
    @('test', 'melos run test:update-goldens', 2),
    @('test', 'flutter pub get', 2)
)

$failed = 0
foreach ($case in $cases) {
    $mode = $case[0]
    $command = $case[1]
    $expected = $case[2]

    $json = @{ tool_input = @{ command = $command } } | ConvertTo-Json -Compress
    $json | powershell -NoProfile -ExecutionPolicy Bypass -File $guard -Mode $mode 2>$null | Out-Null
    $actual = $LASTEXITCODE

    if ($actual -eq $expected) {
        $result = 'ok  '
    } else {
        $result = 'FAIL'
        $failed++
    }
    Write-Output ("{0} [{1}] expected {2}, got {3}: {4}" -f $result, $mode, $expected, $actual, $command)
}

if ($failed -gt 0) {
    Write-Output "$failed case(s) failed."
    exit 1
}
Write-Output 'All cases passed.'
