---
name: restart-protocol
description: Safely restart Codex Desktop on Windows by verifying a detached interactive helper that gracefully closes the exact Codex window and relaunches it. Use only when explicitly invoked as $restart-protocol.
---

# Restart Protocol

Use this skill only for the explicit $restart-protocol invocation. The invocation authorizes a normal restart, not a forced shutdown.

## Protocol

1. Briefly tell the user that the restart protocol is being prepared.
2. Resolve this skill's directory and run scripts/restart-codex.ps1 -CloseWindow in live parent mode with Windows PowerShell. Use -ExecutablePath or -Aumid only when an exact target was already established; never pass both.
3. Continue only when all of these are true:
   - The script resolves the exact executable or packaged AUMID before starting the helper.
   - The detached helper starts on the interactive Windows desktop, remains outside the parent Job Object, and writes a verified READY marker.
   - The helper identifies exactly one Codex window and binds it to its PID, HWND, title, window class, executable path, and package identity.
   - DryRun is false.
4. After READY verification, the parent writes a one-use close-authorization marker. The detached helper immediately revalidates every identity field and posts WM_CLOSE to that exact HWND, which is the graceful Win32 equivalent of the normal X action.
5. The helper waits until no verified Codex window or replacement dialog remains visible. A packaged/MSIX Codex window may retain a hidden HWND after the normal X action; that hidden single-instance state is valid and is restored through AUMID activation. An ordinary executable must destroy the original HWND. Any visible Codex window cancels relaunch.

The helper waits about four seconds after the graceful close/hidden state is observed, then relaunches the validated executable or activates the packaged app through shell:AppsFolder. If AUMID activation does not expose the uniquely identified hidden MSIX window, the interactive helper revalidates and restores that exact HWND, then verifies that exactly one Codex window is visible. It does not depend on the closing Codex process to complete either action.

## Fail closed

If target resolution, interactive-desktop access, detached launch, marker verification, process verification, or exact-window matching fails, do not close Codex. Report the specific failed check.

Never use taskkill /F, TerminateProcess, forced Stop-Process, broad process-name or command-line matching, synthetic Alt+F4, or any forced termination. Never close worker agents, terminals, PowerShell, node, WSL, dev servers, project processes, or unrelated applications. Do not request another confirmation after every safety check passes; the explicit invocation already authorizes the normal restart.

## Testing boundary

Use scripts/restart-codex.ps1 -DryRun for validation. Dry-run mode must verify interactive window detection, detached launch, READY/status markers, and cleanup without closing or relaunching Codex.
