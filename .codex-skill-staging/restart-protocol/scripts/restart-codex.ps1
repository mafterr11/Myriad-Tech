[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$CloseWindow,
    [ValidateRange(3, 5)]
    [int]$DelaySeconds = 4,
    [string]$ExecutablePath,
    [string]$Aumid,
    [Parameter(DontShow = $true)]
    [switch]$HelperMode,
    [Parameter(DontShow = $true)]
    [ValidateSet('Executable', 'Aumid')]
    [string]$LaunchKind,
    [Parameter(DontShow = $true)]
    [string]$LaunchTarget,
    [Parameter(DontShow = $true)]
    [string]$ReadyMarkerPath,
    [Parameter(DontShow = $true)]
    [string]$StatusMarkerPath,
    [Parameter(DontShow = $true)]
    [string]$ArmMarkerPath,
    [Parameter(DontShow = $true)]
    [string]$ArmToken,
    [Parameter(DontShow = $true)]
    [string]$CloseMarkerPath,
    [Parameter(DontShow = $true)]
    [string]$CloseToken
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-JsonAtomic {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][object]$Value
    )
    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    $temporaryPath = '{0}.{1}.tmp' -f $Path, $PID
    $json = $Value | ConvertTo-Json -Depth 8 -Compress
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($temporaryPath, $json, $utf8WithoutBom)
    Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    Get-Content -LiteralPath $Path -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
}

function Get-CanonicalPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    [System.IO.Path]::GetFullPath($Path)
}

function Initialize-WindowControlType {
    if ('RestartProtocol.WindowControl' -as [type]) { return }
    Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
namespace RestartProtocol {
    public sealed class TopLevelWindow {
        public long Handle { get; set; }
        public int ProcessId { get; set; }
        public string Title { get; set; }
        public string ClassName { get; set; }
        public bool IsVisible { get; set; }
        public long OwnerHandle { get; set; }
        public int Left { get; set; }
        public int Top { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public uint Style { get; set; }
        public uint ExStyle { get; set; }
        public bool IsCloaked { get; set; }
    }
    public static class WindowControl {
        [StructLayout(LayoutKind.Sequential)]
        private struct RECT { public int Left, Top, Right, Bottom; }
        [StructLayout(LayoutKind.Sequential)]
        private struct WINDOWINFO {
            public uint cbSize;
            public RECT rcWindow;
            public RECT rcClient;
            public uint dwStyle;
            public uint dwExStyle;
            public uint dwWindowStatus;
            public uint cxWindowBorders;
            public uint cyWindowBorders;
            public ushort atomWindowType;
            public ushort wCreatorVersion;
        }
        private delegate bool EnumWindowsProc(IntPtr window, IntPtr state);
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr state);
        [DllImport("user32.dll")]
        private static extern bool IsWindowVisible(IntPtr window);
        [DllImport("user32.dll")]
        private static extern bool IsWindow(IntPtr window);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern int GetWindowTextW(IntPtr window, StringBuilder text, int maximumCount);
        [DllImport("user32.dll")]
        private static extern int GetWindowTextLengthW(IntPtr window);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern int GetClassNameW(IntPtr window, StringBuilder className, int maximumCount);
        [DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool GetWindowInfo(IntPtr window, ref WINDOWINFO info);
        [DllImport("user32.dll")]
        private static extern IntPtr GetWindow(IntPtr window, uint command);
        [DllImport("dwmapi.dll")]
        private static extern int DwmGetWindowAttribute(IntPtr window, uint attribute, out int value, int valueSize);
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool PostMessageW(IntPtr window, uint message, IntPtr wParam, IntPtr lParam);
        [DllImport("user32.dll")]
        private static extern bool ShowWindowAsync(IntPtr window, int command);

        private static TopLevelWindow[] Enumerate(bool visibleOnly) {
            var windows = new List<TopLevelWindow>();
            EnumWindows((window, state) => {
                bool isVisible = IsWindowVisible(window);
                if (visibleOnly && !isVisible) { return true; }
                int titleLength = GetWindowTextLengthW(window);
                var title = new StringBuilder(Math.Max(titleLength + 1, 2));
                GetWindowTextW(window, title, title.Capacity);
                if (String.IsNullOrWhiteSpace(title.ToString())) { return true; }
                var className = new StringBuilder(256);
                GetClassNameW(window, className, className.Capacity);
                uint processId;
                GetWindowThreadProcessId(window, out processId);
                WINDOWINFO info = new WINDOWINFO();
                info.cbSize = (uint)Marshal.SizeOf(info);
                GetWindowInfo(window, ref info);
                int cloaked = 0;
                DwmGetWindowAttribute(window, 14, out cloaked, sizeof(int));
                windows.Add(new TopLevelWindow {
                    Handle = window.ToInt64(), ProcessId = (int)processId,
                    Title = title.ToString(), ClassName = className.ToString(),
                    IsVisible = isVisible, OwnerHandle = GetWindow(window, 4).ToInt64(),
                    Left = info.rcWindow.Left, Top = info.rcWindow.Top,
                    Width = info.rcWindow.Right - info.rcWindow.Left,
                    Height = info.rcWindow.Bottom - info.rcWindow.Top,
                    Style = info.dwStyle, ExStyle = info.dwExStyle,
                    IsCloaked = cloaked != 0
                });
                return true;
            }, IntPtr.Zero);
            return windows.ToArray();
        }

        public static TopLevelWindow[] EnumerateVisible() { return Enumerate(true); }
        public static TopLevelWindow[] EnumerateAll() { return Enumerate(false); }

        public static bool Exists(long handle) {
            return IsWindow(new IntPtr(handle));
        }

        public static void RequestGracefulClose(long handle) {
            const uint WM_CLOSE = 0x0010;
            IntPtr window = new IntPtr(handle);
            if (!IsWindow(window)) { throw new InvalidOperationException("The validated Codex window no longer exists."); }
            if (!PostMessageW(window, WM_CLOSE, IntPtr.Zero, IntPtr.Zero)) {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        }

        public static void Restore(long handle) {
            IntPtr window = new IntPtr(handle);
            if (!IsWindow(window)) { throw new InvalidOperationException("The validated hidden Codex window no longer exists."); }
            ShowWindowAsync(window, 9);
        }
    }
}
'@
}

function Get-VisibleTopLevelWindows {
    Initialize-WindowControlType
    @([RestartProtocol.WindowControl]::EnumerateVisible())
}

function Get-AllTopLevelWindows {
    Initialize-WindowControlType
    @([RestartProtocol.WindowControl]::EnumerateAll())
}

function Test-SafeStateDirectory {
    param([Parameter(Mandatory = $true)][string]$Path)
    $stateRoot = Get-CanonicalPath (Join-Path ([System.IO.Path]::GetTempPath()) 'codex-restart-protocol')
    $candidate = Get-CanonicalPath $Path
    $rootWithSeparator = $stateRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    $candidate.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)
}

function Remove-StateDirectorySafely {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-SafeStateDirectory -Path $Path)) {
        throw "Refusing to clean an unexpected state directory: $Path"
    }
    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
    }
}

function Resolve-PackagedAumid {
    param([Parameter(Mandatory = $true)][string]$RunningExecutablePath)

    $executable = Get-CanonicalPath $RunningExecutablePath
    $cursor = Split-Path -Parent $executable
    $packageRoot = $null
    for ($index = 0; $index -lt 8 -and -not [string]::IsNullOrWhiteSpace($cursor); $index++) {
        if (Test-Path -LiteralPath (Join-Path $cursor 'AppxManifest.xml') -PathType Leaf) {
            $packageRoot = $cursor
            break
        }
        $parent = Split-Path -Parent $cursor
        if ($parent -eq $cursor) { break }
        $cursor = $parent
    }
    if ([string]::IsNullOrWhiteSpace($packageRoot)) {
        throw 'The running packaged Codex executable has no accessible AppxManifest.xml.'
    }

    $manifestPath = Join-Path $packageRoot 'AppxManifest.xml'
    [xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw -ErrorAction Stop
    $identityName = [string]$manifest.Package.Identity.Name
    if ($identityName -notmatch '^(?i:OpenAI\.Codex)$') {
        throw "Unexpected package identity for Codex Desktop: $identityName"
    }

    $folderName = Split-Path -Leaf $packageRoot
    $separatorIndex = $folderName.LastIndexOf('__', [System.StringComparison]::Ordinal)
    if ($separatorIndex -le 0 -or $separatorIndex + 2 -ge $folderName.Length) {
        throw 'Could not derive the package publisher ID from the validated package folder.'
    }
    $publisherId = $folderName.Substring($separatorIndex + 2)
    if ($publisherId -notmatch '^[A-Za-z0-9]+$') {
        throw 'The derived package publisher ID is invalid.'
    }

    $relativeExecutable = $executable.Substring($packageRoot.Length).TrimStart('\').TrimStart('/').Replace('\', '/')
    $applications = @($manifest.Package.Applications.Application | Where-Object {
        [string]::Equals(([string]$_.Executable).Replace('\', '/'), $relativeExecutable, [System.StringComparison]::OrdinalIgnoreCase)
    })
    if ($applications.Count -ne 1 -or [string]::IsNullOrWhiteSpace([string]$applications[0].Id)) {
        throw 'Could not map the running Codex executable to one manifest application ID.'
    }

    $packageFamilyName = '{0}_{1}' -f $identityName, $publisherId
    [pscustomobject]@{
        Aumid = '{0}!{1}' -f $packageFamilyName, [string]$applications[0].Id
        PackageFamilyName = $packageFamilyName
        PackageRoot = Get-CanonicalPath $packageRoot
        ManifestPath = Get-CanonicalPath $manifestPath
        ApplicationId = [string]$applications[0].Id
    }
}

function Get-RunningCodexApplication {
    $records = @()
    foreach ($process in @(Get-Process -ErrorAction Stop)) {
        if ($process.ProcessName -notmatch '^(?i:ChatGPT|Codex)$') { continue }
        $path = $null
        try { $path = $process.Path } catch { }
        if ([string]::IsNullOrWhiteSpace($path) -or -not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }

        $canonicalPath = Get-CanonicalPath $path
        $versionInfo = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($canonicalPath)
        $records += [pscustomobject]@{
            ProcessId = [int]$process.Id
            ProcessName = [string]$process.ProcessName
            MainWindowHandle = [int64]$process.MainWindowHandle
            MainWindowTitle = [string]$process.MainWindowTitle
            WindowClassName = $null
            ExecutablePath = $canonicalPath
            ProductName = [string]$versionInfo.ProductName
            FileDescription = [string]$versionInfo.FileDescription
        }
    }
    $allTopLevelWindows = @(Get-AllTopLevelWindows)
    $visibleWindows = @($allTopLevelWindows | Where-Object { $_.IsVisible })

    $packaged = @($records | Where-Object {
        $_.ProcessName -eq 'ChatGPT' -and $_.ExecutablePath -match '(?i)\\WindowsApps\\OpenAI\.Codex_[^\\]+\\'
    })
    if ($packaged.Count -gt 0) {
        $paths = @($packaged | Select-Object -ExpandProperty ExecutablePath -Unique)
        if ($paths.Count -ne 1) {
            throw "Running packaged Codex detection is ambiguous: found $($paths.Count) executable paths."
        }
        $package = Resolve-PackagedAumid -RunningExecutablePath $paths[0]
        $matchingRecords = @($packaged | Where-Object {
            [string]::Equals($_.ExecutablePath, $paths[0], [System.StringComparison]::OrdinalIgnoreCase)
        })
        $matchingProcessIds = @($matchingRecords | Select-Object -ExpandProperty ProcessId)
        $allWindowRecords = @(
            foreach ($window in $allTopLevelWindows) {
                if ($matchingProcessIds -notcontains [int]$window.ProcessId) { continue }
                $record = @($matchingRecords | Where-Object { $_.ProcessId -eq [int]$window.ProcessId })
                if ($record.Count -ne 1) { continue }
                [pscustomobject]@{
                    ProcessId = [int]$record[0].ProcessId
                    ProcessName = [string]$record[0].ProcessName
                    MainWindowHandle = [int64]$window.Handle
                    MainWindowTitle = [string]$window.Title
                    WindowClassName = [string]$window.ClassName
                    WindowVisible = [bool]$window.IsVisible
                    OwnerHandle = [int64]$window.OwnerHandle
                    WindowLeft = [int]$window.Left
                    WindowTop = [int]$window.Top
                    WindowWidth = [int]$window.Width
                    WindowHeight = [int]$window.Height
                    WindowStyle = [uint32]$window.Style
                    WindowExStyle = [uint32]$window.ExStyle
                    WindowCloaked = [bool]$window.IsCloaked
                    ExecutablePath = [string]$record[0].ExecutablePath
                    ProductName = [string]$record[0].ProductName
                    FileDescription = [string]$record[0].FileDescription
                }
            }
        )
        $visibleWindowRecords = @($allWindowRecords | Where-Object { $_.WindowVisible })
        $windowIdentity = $null
        if ($visibleWindowRecords.Count -eq 1) {
            $windowIdentity = $visibleWindowRecords[0]
        }
        elseif ($visibleWindowRecords.Count -gt 1) {
            throw "Running Codex window identity is ambiguous: found $($visibleWindowRecords.Count) visible candidates."
        }
        else {
            $hiddenPrimaryWindows = @($allWindowRecords | Where-Object {
                -not $_.WindowVisible -and
                $_.WindowClassName -eq 'Chrome_WidgetWin_1' -and
                $_.MainWindowTitle -match '^(?i:ChatGPT|Codex)$' -and
                ($_.WindowStyle -band [uint32]0x00C00000) -eq [uint32]0x00C00000
            })
            if ($hiddenPrimaryWindows.Count -eq 1) {
                $windowIdentity = $hiddenPrimaryWindows[0]
            }
            elseif ($allWindowRecords.Count -eq 1) {
                $windowIdentity = $allWindowRecords[0]
            }
            elseif ($allWindowRecords.Count -gt 1) {
                $summary = @($allWindowRecords | ForEach-Object {
                    '{0}:{1}:visible={2}:cloaked={3}:owner={4}:rect={5}x{6}:style=0x{7:X}:ex=0x{8:X}:title={9}:class={10}' -f
                    $_.ProcessId, $_.MainWindowHandle, $_.WindowVisible, $_.WindowCloaked,
                    $_.OwnerHandle, $_.WindowWidth, $_.WindowHeight, $_.WindowStyle,
                    $_.WindowExStyle, $_.MainWindowTitle, $_.WindowClassName
                }) -join '; '
                throw "Running hidden Codex window identity is ambiguous: $summary"
            }
        }

        return [pscustomobject]@{
            LaunchKind = 'Aumid'
            LaunchTarget = $package.Aumid
            ExecutablePath = $paths[0]
            PackageFamilyName = $package.PackageFamilyName
            PackageRoot = $package.PackageRoot
            ProcessIds = @($matchingRecords | Select-Object -ExpandProperty ProcessId)
            WindowIdentityAvailable = $null -ne $windowIdentity
            WindowIdentity = $windowIdentity
        }
    }

    $ordinaryCandidates = @($records | Where-Object {
        (('{0} {1}' -f $_.ProductName, $_.FileDescription) -match '(?i)\b(Codex|ChatGPT|OpenAI)\b')
    })
    $ordinaryWindows = @(
        foreach ($record in $ordinaryCandidates) {
            foreach ($window in @($visibleWindows | Where-Object { $_.ProcessId -eq $record.ProcessId })) {
                [pscustomobject]@{
                    ProcessId = [int]$record.ProcessId
                    ProcessName = [string]$record.ProcessName
                    MainWindowHandle = [int64]$window.Handle
                    MainWindowTitle = [string]$window.Title
                    WindowClassName = [string]$window.ClassName
                    WindowVisible = [bool]$window.IsVisible
                    ExecutablePath = [string]$record.ExecutablePath
                    ProductName = [string]$record.ProductName
                    FileDescription = [string]$record.FileDescription
                }
            }
        }
    )
    if ($ordinaryWindows.Count -ne 1) {
        throw 'No single currently running ordinary Codex Desktop window could be identified.'
    }
    [pscustomobject]@{
        LaunchKind = 'Executable'
        LaunchTarget = $ordinaryWindows[0].ExecutablePath
        ExecutablePath = $ordinaryWindows[0].ExecutablePath
        PackageFamilyName = $null
        PackageRoot = $null
        ProcessIds = @([int]$ordinaryWindows[0].ProcessId)
        WindowIdentityAvailable = $true
        WindowIdentity = $ordinaryWindows[0]
    }
}

function Resolve-RelaunchTarget {
    param([string]$RequestedExecutablePath, [string]$RequestedAumid)

    if (-not [string]::IsNullOrWhiteSpace($RequestedExecutablePath) -and
        -not [string]::IsNullOrWhiteSpace($RequestedAumid)) {
        throw 'Specify either -ExecutablePath or -Aumid, never both.'
    }

    $running = Get-RunningCodexApplication
    if (-not [string]::IsNullOrWhiteSpace($RequestedAumid)) {
        if ($running.LaunchKind -ne 'Aumid' -or $running.LaunchTarget -cne $RequestedAumid) {
            throw 'The supplied AUMID does not exactly match the running validated Codex package.'
        }
    }
    elseif (-not [string]::IsNullOrWhiteSpace($RequestedExecutablePath)) {
        $canonicalExecutable = Get-CanonicalPath $RequestedExecutablePath
        if ($running.LaunchKind -ne 'Executable') {
            throw 'The running Codex installation is packaged; its validated AUMID must be used instead of direct executable launch.'
        }
        if (-not [string]::Equals($canonicalExecutable, $running.LaunchTarget, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw 'The supplied executable path does not exactly match the running Codex Desktop executable.'
        }
    }

    if ($running.LaunchKind -eq 'Aumid' -and $null -ne (Get-Command Get-StartApps -ErrorAction SilentlyContinue)) {
        $reported = @(Get-StartApps -ErrorAction SilentlyContinue | Where-Object { $_.AppID -ceq $running.LaunchTarget })
        if ($reported.Count -gt 1) {
            throw 'Start Apps reports multiple entries for the validated Codex AUMID.'
        }
    }
    $running
}

function ConvertTo-SingleQuotedLiteral {
    param([Parameter(Mandatory = $true)][string]$Value)
    "'" + $Value.Replace("'", "''") + "'"
}

function Get-WindowsPowerShellPath {
    $path = Get-CanonicalPath (Get-Command powershell.exe -ErrorAction Stop).Source
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw 'Windows PowerShell executable could not be validated.'
    }
    $path
}

function Initialize-DetachedProcessType {
    if ('RestartProtocol.DetachedProcess' -as [type]) { return }
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
namespace RestartProtocol {
    public sealed class DetachedLaunchResult {
        public int ProcessId { get; set; }
        public bool InAnyJob { get; set; }
        public bool InCurrentJob { get; set; }
    }
    public static class DetachedProcess {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct STARTUPINFO {
            public int cb;
            public string lpReserved;
            public string lpDesktop;
            public string lpTitle;
            public int dwX;
            public int dwY;
            public int dwXSize;
            public int dwYSize;
            public int dwXCountChars;
            public int dwYCountChars;
            public int dwFillAttribute;
            public int dwFlags;
            public short wShowWindow;
            public short cbReserved2;
            public IntPtr lpReserved2;
            public IntPtr hStdInput;
            public IntPtr hStdOutput;
            public IntPtr hStdError;
        }
        [StructLayout(LayoutKind.Sequential)]
        private struct PROCESS_INFORMATION {
            public IntPtr hProcess;
            public IntPtr hThread;
            public int dwProcessId;
            public int dwThreadId;
        }
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern bool CreateProcessW(
            string applicationName, StringBuilder commandLine, IntPtr processAttributes,
            IntPtr threadAttributes, bool inheritHandles, uint creationFlags, IntPtr environment,
            string currentDirectory, ref STARTUPINFO startupInfo, out PROCESS_INFORMATION processInformation);
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool IsProcessInJob(IntPtr processHandle, IntPtr jobHandle, out bool result);
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool QueryInformationJobObject(
            IntPtr jobHandle, int informationClass, IntPtr jobInformation,
            int jobInformationLength, out int returnLength);
        [DllImport("kernel32.dll")]
        private static extern bool CloseHandle(IntPtr handle);

        private static bool CurrentProcessInAnyJob() {
            using (Process current = Process.GetCurrentProcess()) {
                bool inAnyJob;
                if (!IsProcessInJob(current.Handle, IntPtr.Zero, out inAnyJob)) {
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                }
                return inAnyJob;
            }
        }

        private static bool CurrentJobContainsProcess(int processId) {
            if (!CurrentProcessInAnyJob()) { return false; }
            int bufferSize = 65536;
            IntPtr buffer = Marshal.AllocHGlobal(bufferSize);
            try {
                int returnLength;
                if (!QueryInformationJobObject(IntPtr.Zero, 3, buffer, bufferSize, out returnLength)) {
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                }
                int count = Marshal.ReadInt32(buffer, 4);
                int offset = 8;
                for (int index = 0; index < count; index++) {
                    long candidate = IntPtr.Size == 8
                        ? Marshal.ReadInt64(buffer, offset + index * IntPtr.Size)
                        : Marshal.ReadInt32(buffer, offset + index * IntPtr.Size);
                    if (candidate == processId) { return true; }
                }
                return false;
            }
            finally { Marshal.FreeHGlobal(buffer); }
        }

        public static DetachedLaunchResult Start(string applicationPath, string arguments, string workingDirectory) {
            const uint CREATE_BREAKAWAY_FROM_JOB = 0x01000000;
            const uint CREATE_NO_WINDOW = 0x08000000;
            const uint CREATE_UNICODE_ENVIRONMENT = 0x00000400;
            STARTUPINFO startup = new STARTUPINFO();
            startup.cb = Marshal.SizeOf(startup);
            startup.lpDesktop = @"winsta0\default";
            PROCESS_INFORMATION process;
            StringBuilder command = new StringBuilder("\"" + applicationPath + "\" " + arguments);
            bool created = CreateProcessW(
                applicationPath, command, IntPtr.Zero, IntPtr.Zero, false,
                CREATE_BREAKAWAY_FROM_JOB | CREATE_NO_WINDOW | CREATE_UNICODE_ENVIRONMENT,
                IntPtr.Zero, workingDirectory, ref startup, out process);
            if (!created) { throw new Win32Exception(Marshal.GetLastWin32Error()); }
            try {
                bool inAnyJob;
                if (!IsProcessInJob(process.hProcess, IntPtr.Zero, out inAnyJob)) {
                    throw new Win32Exception(Marshal.GetLastWin32Error());
                }
                bool inCurrentJob = CurrentJobContainsProcess(process.dwProcessId);
                return new DetachedLaunchResult {
                    ProcessId = process.dwProcessId,
                    InAnyJob = inAnyJob,
                    InCurrentJob = inCurrentJob
                };
            }
            finally {
                CloseHandle(process.hThread);
                CloseHandle(process.hProcess);
            }
        }
    }
}
'@
}

function Start-DetachedHelper {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [Parameter(Mandatory = $true)][string]$ResolvedLaunchKind,
        [Parameter(Mandatory = $true)][string]$ResolvedLaunchTarget,
        [Parameter(Mandatory = $true)][string]$ResolvedReadyMarkerPath,
        [Parameter(Mandatory = $true)][string]$ResolvedStatusMarkerPath,
        [Parameter(Mandatory = $true)][string]$ResolvedArmMarkerPath,
        [Parameter(Mandatory = $true)][string]$ResolvedArmToken,
        [Parameter(Mandatory = $true)][string]$ResolvedCloseMarkerPath,
        [Parameter(Mandatory = $true)][string]$ResolvedCloseToken,
        [Parameter(Mandatory = $true)][int]$ResolvedDelaySeconds,
        [Parameter(Mandatory = $true)][bool]$IsDryRun
    )

    $canonicalScriptPath = Get-CanonicalPath $ScriptPath
    if (-not (Test-Path -LiteralPath $canonicalScriptPath -PathType Leaf)) {
        throw 'The restart helper script path could not be validated.'
    }
    $parts = @(
        '&', (ConvertTo-SingleQuotedLiteral $canonicalScriptPath), '-HelperMode',
        '-LaunchKind', (ConvertTo-SingleQuotedLiteral $ResolvedLaunchKind),
        '-LaunchTarget', (ConvertTo-SingleQuotedLiteral $ResolvedLaunchTarget),
        '-ReadyMarkerPath', (ConvertTo-SingleQuotedLiteral $ResolvedReadyMarkerPath),
        '-StatusMarkerPath', (ConvertTo-SingleQuotedLiteral $ResolvedStatusMarkerPath),
        '-ArmMarkerPath', (ConvertTo-SingleQuotedLiteral $ResolvedArmMarkerPath),
        '-ArmToken', (ConvertTo-SingleQuotedLiteral $ResolvedArmToken),
        '-CloseMarkerPath', (ConvertTo-SingleQuotedLiteral $ResolvedCloseMarkerPath),
        '-CloseToken', (ConvertTo-SingleQuotedLiteral $ResolvedCloseToken),
        '-DelaySeconds', ([string]$ResolvedDelaySeconds)
    )
    if ($IsDryRun) { $parts += '-DryRun' }
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes(($parts -join ' ')))
    $powerShellPath = Get-WindowsPowerShellPath
    $arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -EncodedCommand {0}' -f $encodedCommand
    Initialize-DetachedProcessType
    $nativeResult = [RestartProtocol.DetachedProcess]::Start(
        $powerShellPath, $arguments, (Split-Path -Parent $canonicalScriptPath))
    [pscustomobject]@{
        DetachMechanism = 'Win32CreateProcessBreakaway'
        ReportedProcessId = [int]$nativeResult.ProcessId
        InAnyJob = [bool]$nativeResult.InAnyJob
        InCurrentJob = [bool]$nativeResult.InCurrentJob
    }
}

function Wait-ForReadyOrFailure {
    param([string]$ReadyPath, [string]$StatusPath, [int]$TimeoutMilliseconds)
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.ElapsedMilliseconds -lt $TimeoutMilliseconds) {
        if (Test-Path -LiteralPath $ReadyPath -PathType Leaf) {
            try { return Read-JsonFile -Path $ReadyPath } catch { }
        }
        if (Test-Path -LiteralPath $StatusPath -PathType Leaf) {
            try {
                $status = Read-JsonFile -Path $StatusPath
                if ($status.State -eq 'FAILED') { throw ('Detached helper failed before READY: {0}' -f $status.Error) }
            }
            catch {
                if ($_.Exception.Message -like 'Detached helper failed before READY:*') { throw }
            }
        }
        Start-Sleep -Milliseconds 100
    }
    throw ('Timed out waiting for READY marker: {0}' -f $ReadyPath)
}

function Wait-ForMarker {
    param([string]$Path, [int]$TimeoutMilliseconds)
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.ElapsedMilliseconds -lt $TimeoutMilliseconds) {
        if (Test-Path -LiteralPath $Path -PathType Leaf) {
            try { return Read-JsonFile -Path $Path } catch { }
        }
        Start-Sleep -Milliseconds 100
    }
    throw ('Timed out waiting for marker: {0}' -f $Path)
}

function Wait-ForStatusState {
    param([string]$Path, [string]$State, [int]$TimeoutMilliseconds)
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.ElapsedMilliseconds -lt $TimeoutMilliseconds) {
        if (Test-Path -LiteralPath $Path -PathType Leaf) {
            try {
                $status = Read-JsonFile -Path $Path
                if ($status.State -eq $State) { return $status }
                if ($status.State -eq 'FAILED') { throw "Detached helper failed: $($status.Error)" }
            }
            catch {
                if ($_.Exception.Message -like 'Detached helper failed:*') { throw }
            }
        }
        Start-Sleep -Milliseconds 100
    }
    throw "Timed out waiting for status state $State."
}

function Test-ExactWindowIdentity {
    param(
        [Parameter(Mandatory = $true)][object]$Expected,
        [Parameter(Mandatory = $true)][object]$Actual
    )
    (
        [int]$Expected.ProcessId -eq [int]$Actual.ProcessId -and
        [int64]$Expected.MainWindowHandle -eq [int64]$Actual.MainWindowHandle -and
        [string]$Expected.MainWindowTitle -ceq [string]$Actual.MainWindowTitle -and
        [string]$Expected.WindowClassName -ceq [string]$Actual.WindowClassName -and
        [string]$Expected.ProcessName -ceq [string]$Actual.ProcessName -and
        [string]::Equals(
            [string]$Expected.ExecutablePath,
            [string]$Actual.ExecutablePath,
            [System.StringComparison]::OrdinalIgnoreCase)
    )
}

function Get-VisibleWindowsForExecutablePath {
    param([Parameter(Mandatory = $true)][string]$ExpectedExecutablePath)
    $expectedPath = Get-CanonicalPath $ExpectedExecutablePath
    @(
        foreach ($window in @(Get-VisibleTopLevelWindows)) {
            $process = Get-Process -Id ([int]$window.ProcessId) -ErrorAction SilentlyContinue
            if ($null -eq $process) { continue }
            $processPath = $null
            try { $processPath = $process.Path } catch { }
            if ([string]::IsNullOrWhiteSpace($processPath)) { continue }
            if (-not [string]::Equals(
                (Get-CanonicalPath $processPath), $expectedPath,
                [System.StringComparison]::OrdinalIgnoreCase)) { continue }
            [pscustomobject]@{
                ProcessId = [int]$process.Id
                ProcessName = [string]$process.ProcessName
                MainWindowHandle = [int64]$window.Handle
                MainWindowTitle = [string]$window.Title
                WindowClassName = [string]$window.ClassName
                ExecutablePath = Get-CanonicalPath $processPath
            }
        }
    )
}

function Wait-ForExactCodexWindowToClose {
    param(
        [Parameter(Mandatory = $true)][object]$ExpectedWindow,
        [Parameter(Mandatory = $true)][ValidateSet('Executable', 'Aumid')][string]$ExpectedLaunchKind,
        [Parameter(Mandatory = $true)][int]$TimeoutMilliseconds
    )
    Initialize-WindowControlType
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.ElapsedMilliseconds -lt $TimeoutMilliseconds) {
        $matchingWindows = @(Get-VisibleWindowsForExecutablePath -ExpectedExecutablePath $ExpectedWindow.ExecutablePath)
        $originalWindowExists = [RestartProtocol.WindowControl]::Exists([int64]$ExpectedWindow.MainWindowHandle)
        if ($matchingWindows.Count -eq 0) {
            if ($ExpectedLaunchKind -eq 'Aumid') {
                return [pscustomobject]@{
                    State = if ($originalWindowExists) { 'HIDDEN' } else { 'CLOSED' }
                    OriginalWindowStillExists = $originalWindowExists
                }
            }
            if (-not $originalWindowExists) {
                return [pscustomobject]@{
                    State = 'CLOSED'
                    OriginalWindowStillExists = $false
                }
            }
        }
        Start-Sleep -Milliseconds 100
    }
    $remainingWindows = @(Get-VisibleWindowsForExecutablePath -ExpectedExecutablePath $ExpectedWindow.ExecutablePath)
    $remainingSummary = @($remainingWindows | ForEach-Object {
        [ordered]@{
            ProcessId = $_.ProcessId
            MainWindowHandle = $_.MainWindowHandle
            MainWindowTitle = $_.MainWindowTitle
            WindowClassName = $_.WindowClassName
        }
    }) | ConvertTo-Json -Depth 4 -Compress
    throw ('Codex did not reach a safe closed/hidden state. Remaining visible windows: {0}' -f $remainingSummary)
}

function Wait-ForSingleVisibleCodexWindow {
    param(
        [Parameter(Mandatory = $true)][string]$ExpectedExecutablePath,
        [Parameter(Mandatory = $true)][int]$TimeoutMilliseconds
    )
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.ElapsedMilliseconds -lt $TimeoutMilliseconds) {
        $windows = @(Get-VisibleWindowsForExecutablePath -ExpectedExecutablePath $ExpectedExecutablePath)
        if ($windows.Count -eq 1) { return $windows[0] }
        if ($windows.Count -gt 1) {
            throw "Codex relaunch is ambiguous: found $($windows.Count) visible windows."
        }
        Start-Sleep -Milliseconds 100
    }
    $null
}

function Invoke-HelperMode {
    if ([string]::IsNullOrWhiteSpace($LaunchKind) -or [string]::IsNullOrWhiteSpace($LaunchTarget) -or
        [string]::IsNullOrWhiteSpace($ReadyMarkerPath) -or [string]::IsNullOrWhiteSpace($StatusMarkerPath) -or
        [string]::IsNullOrWhiteSpace($ArmMarkerPath) -or [string]::IsNullOrWhiteSpace($ArmToken) -or
        [string]::IsNullOrWhiteSpace($CloseMarkerPath) -or [string]::IsNullOrWhiteSpace($CloseToken)) {
        throw 'Helper mode requires complete, pre-resolved launch, marker, arm, and close parameters.'
    }

    Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
        State = 'BOOTED'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
        LaunchTarget = $LaunchTarget; DryRun = [bool]$DryRun; TimestampUtc = [DateTime]::UtcNow.ToString('o')
    })
    $arm = Wait-ForMarker -Path $ArmMarkerPath -TimeoutMilliseconds 12000
    if ($arm.State -ne 'ARMED' -or $arm.Token -cne $ArmToken -or
        [int]$arm.HelperProcessId -ne [int]$PID -or $arm.LaunchTarget -cne $LaunchTarget) {
        throw 'The helper arm marker failed exact validation.'
    }

    $interactiveTarget = Resolve-RelaunchTarget
    if ($interactiveTarget.LaunchKind -cne $LaunchKind -or $interactiveTarget.LaunchTarget -cne $LaunchTarget) {
        throw 'The interactive helper resolved a different Codex relaunch target.'
    }
    if (-not $interactiveTarget.WindowIdentityAvailable -or $null -eq $interactiveTarget.WindowIdentity) {
        throw 'The detached interactive helper could not identify exactly one Codex window.'
    }

    $ready = [ordered]@{
        State = 'READY'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
        LaunchTarget = $LaunchTarget; DetachMechanism = 'Win32CreateProcessBreakaway'
        DetachedFromParentJob = $true; DryRun = [bool]$DryRun
        InteractiveSessionId = [System.Diagnostics.Process]::GetCurrentProcess().SessionId
        WindowIdentity = $interactiveTarget.WindowIdentity
        TimestampUtc = [DateTime]::UtcNow.ToString('o')
    }
    Write-JsonAtomic -Path $ReadyMarkerPath -Value $ready
    Write-JsonAtomic -Path $StatusMarkerPath -Value $ready

    if ($DryRun) {
        Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
            State = 'DRY_RUN_OK'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
            LaunchTarget = $LaunchTarget; DetachMechanism = 'Win32CreateProcessBreakaway'
            DetachedFromParentJob = $true; DryRun = $true
            InteractiveSessionId = [System.Diagnostics.Process]::GetCurrentProcess().SessionId
            WindowIdentity = $interactiveTarget.WindowIdentity
            TimestampUtc = [DateTime]::UtcNow.ToString('o')
        })
        Start-Sleep -Seconds 3
        return
    }

    $close = Wait-ForMarker -Path $CloseMarkerPath -TimeoutMilliseconds 12000
    if ($close.State -ne 'CLOSE_AUTHORIZED' -or $close.Token -cne $CloseToken -or
        [int]$close.HelperProcessId -ne [int]$PID -or
        [int64]$close.MainWindowHandle -ne [int64]$interactiveTarget.WindowIdentity.MainWindowHandle) {
        throw 'The close authorization marker failed exact validation.'
    }
    $revalidatedTarget = Resolve-RelaunchTarget
    if ($revalidatedTarget.LaunchKind -cne $LaunchKind -or
        $revalidatedTarget.LaunchTarget -cne $LaunchTarget -or
        -not $revalidatedTarget.WindowIdentityAvailable -or
        -not (Test-ExactWindowIdentity -Expected $interactiveTarget.WindowIdentity -Actual $revalidatedTarget.WindowIdentity)) {
        throw 'The Codex window identity changed before the graceful close request.'
    }
    [RestartProtocol.WindowControl]::RequestGracefulClose([int64]$interactiveTarget.WindowIdentity.MainWindowHandle)
    Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
        State = 'CLOSE_REQUESTED'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
        LaunchTarget = $LaunchTarget; MainWindowHandle = [int64]$interactiveTarget.WindowIdentity.MainWindowHandle
        DryRun = $false; TimestampUtc = [DateTime]::UtcNow.ToString('o')
    })
    $closeEffect = Wait-ForExactCodexWindowToClose -ExpectedWindow $interactiveTarget.WindowIdentity -ExpectedLaunchKind $LaunchKind -TimeoutMilliseconds 15000
    Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
        State = 'CLOSE_EFFECT_OBSERVED'; CloseEffect = $closeEffect.State
        OriginalWindowStillExists = $closeEffect.OriginalWindowStillExists
        HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
        LaunchTarget = $LaunchTarget; DryRun = $false
        TimestampUtc = [DateTime]::UtcNow.ToString('o')
    })
    Start-Sleep -Seconds $DelaySeconds
    try {
        $relaunchEffect = $null
        if ($LaunchKind -eq 'Executable') {
            if (-not (Test-Path -LiteralPath $LaunchTarget -PathType Leaf)) {
                throw 'The resolved Codex executable no longer exists.'
            }
            Start-Process -FilePath $LaunchTarget | Out-Null
            $relaunchEffect = 'ExecutableLaunch'
        }
        elseif ($LaunchKind -eq 'Aumid') {
            if ($LaunchTarget -notmatch '^[A-Za-z0-9._-]+![A-Za-z0-9._-]+$') {
                throw 'The pre-resolved Codex AUMID is invalid.'
            }
            Start-Process -FilePath 'explorer.exe' -ArgumentList ('shell:AppsFolder\{0}' -f $LaunchTarget) | Out-Null
            $visibleAfterActivation = Wait-ForSingleVisibleCodexWindow -ExpectedExecutablePath $interactiveTarget.ExecutablePath -TimeoutMilliseconds 2500
            if ($null -eq $visibleAfterActivation) {
                $hiddenTarget = Resolve-RelaunchTarget
                if ($hiddenTarget.LaunchKind -cne $LaunchKind -or
                    $hiddenTarget.LaunchTarget -cne $LaunchTarget -or
                    -not $hiddenTarget.WindowIdentityAvailable -or
                    $hiddenTarget.WindowIdentity.WindowVisible) {
                    throw 'AUMID activation did not expose one visible or one uniquely restorable hidden Codex window.'
                }
                [RestartProtocol.WindowControl]::Restore([int64]$hiddenTarget.WindowIdentity.MainWindowHandle)
                $visibleAfterRestore = Wait-ForSingleVisibleCodexWindow -ExpectedExecutablePath $interactiveTarget.ExecutablePath -TimeoutMilliseconds 5000
                if ($null -eq $visibleAfterRestore) {
                    throw 'The uniquely validated hidden Codex window could not be restored.'
                }
                $relaunchEffect = 'AumidThenExactWindowRestore'
            }
            else {
                $relaunchEffect = 'AumidActivation'
            }
        }
        else { throw ('Unsupported launch kind: {0}' -f $LaunchKind) }
        Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
            State = 'LAUNCHED'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
            LaunchTarget = $LaunchTarget; DetachMechanism = 'Win32CreateProcessBreakaway'
            RelaunchEffect = $relaunchEffect
            DryRun = $false; TimestampUtc = [DateTime]::UtcNow.ToString('o')
        })
    }
    catch {
        Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
            State = 'FAILED'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
            LaunchTarget = $LaunchTarget; DetachMechanism = 'Win32CreateProcessBreakaway'
            DryRun = $false; Error = $_.Exception.Message; TimestampUtc = [DateTime]::UtcNow.ToString('o')
        })
    }
    Start-Sleep -Seconds 30
    Remove-StateDirectorySafely -Path (Split-Path -Parent $ReadyMarkerPath)
}

function Invoke-ParentMode {
    if (-not $DryRun -and -not $CloseWindow) {
        throw 'Live mode requires -CloseWindow. No helper was started and Codex remains open.'
    }
    $resolved = Resolve-RelaunchTarget -RequestedExecutablePath $ExecutablePath -RequestedAumid $Aumid
    $stateDirectory = Join-Path (Join-Path ([System.IO.Path]::GetTempPath()) 'codex-restart-protocol') ([Guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
    $readyPath = Join-Path $stateDirectory 'ready.json'
    $statusPath = Join-Path $stateDirectory 'status.json'
    $armPath = Join-Path $stateDirectory 'armed.json'
    $closePath = Join-Path $stateDirectory 'close-authorized.json'
    $armTokenValue = [Guid]::NewGuid().ToString('N')
    $closeTokenValue = [Guid]::NewGuid().ToString('N')
    $launch = $null

    try {
        $arguments = @{
            ScriptPath = $PSCommandPath; ResolvedLaunchKind = $resolved.LaunchKind
            ResolvedLaunchTarget = $resolved.LaunchTarget; ResolvedReadyMarkerPath = $readyPath
            ResolvedStatusMarkerPath = $statusPath; ResolvedArmMarkerPath = $armPath
            ResolvedArmToken = $armTokenValue; ResolvedDelaySeconds = $DelaySeconds
            ResolvedCloseMarkerPath = $closePath; ResolvedCloseToken = $closeTokenValue
            IsDryRun = [bool]$DryRun
        }
        $launch = Start-DetachedHelper @arguments
        $helperProcessId = [int]$launch.ReportedProcessId
        $helperProcessVerified = $null -ne (Get-Process -Id $helperProcessId -ErrorAction SilentlyContinue)
        $detachedVerified = -not $launch.InCurrentJob
        if (-not $helperProcessVerified -or -not $detachedVerified) {
            throw 'The helper could not be verified outside the parent Windows Job Object; it will not be armed.'
        }

        Write-JsonAtomic -Path $armPath -Value ([ordered]@{
            State = 'ARMED'; Token = $armTokenValue; HelperProcessId = $helperProcessId
            LaunchTarget = $resolved.LaunchTarget; TimestampUtc = [DateTime]::UtcNow.ToString('o')
        })
        $readyMarker = Wait-ForReadyOrFailure -ReadyPath $readyPath -StatusPath $statusPath -TimeoutMilliseconds 10000
        $statusMarker = Wait-ForMarker -Path $statusPath -TimeoutMilliseconds 10000
        $readyMarkerVerified = (
            $readyMarker.State -eq 'READY' -and [int]$readyMarker.HelperProcessId -eq $helperProcessId -and
            $readyMarker.LaunchKind -eq $resolved.LaunchKind -and $readyMarker.LaunchTarget -eq $resolved.LaunchTarget -and
            $readyMarker.DetachMechanism -eq $launch.DetachMechanism -and $readyMarker.DetachedFromParentJob -eq $true -and
            $null -ne $readyMarker.WindowIdentity -and
            [int]$readyMarker.WindowIdentity.ProcessId -gt 0 -and
            [int64]$readyMarker.WindowIdentity.MainWindowHandle -ne 0 -and
            -not [string]::IsNullOrWhiteSpace([string]$readyMarker.WindowIdentity.MainWindowTitle) -and
            -not [string]::IsNullOrWhiteSpace([string]$readyMarker.WindowIdentity.WindowClassName) -and
            [string]::Equals(
                [string]$readyMarker.WindowIdentity.ExecutablePath,
                [string]$resolved.ExecutablePath,
                [System.StringComparison]::OrdinalIgnoreCase)
        )
        $statusMarkerVerified = (
            @('READY', 'DRY_RUN_OK') -contains [string]$statusMarker.State -and
            [int]$statusMarker.HelperProcessId -eq $helperProcessId -and
            $statusMarker.LaunchKind -eq $resolved.LaunchKind -and $statusMarker.LaunchTarget -eq $resolved.LaunchTarget
        )
        if (-not $readyMarkerVerified -or -not $statusMarkerVerified) {
            throw 'Detached helper marker verification failed; Codex must remain open.'
        }

        $dryRunStatus = $null
        $cleanupSucceeded = $null
        if ($DryRun) {
            $dryRunStatus = Wait-ForStatusState -Path $statusPath -State 'DRY_RUN_OK' -TimeoutMilliseconds 5000
            $helperProcess = Get-Process -Id $helperProcessId -ErrorAction SilentlyContinue
            if ($null -ne $helperProcess) { $helperProcess.WaitForExit(6000) | Out-Null }
            Remove-StateDirectorySafely -Path $stateDirectory
            $cleanupSucceeded = -not (Test-Path -LiteralPath $stateDirectory)
            if (-not $cleanupSucceeded) { throw 'Dry-run temporary-state cleanup could not be verified.' }
        }
        else {
            Write-JsonAtomic -Path $closePath -Value ([ordered]@{
                State = 'CLOSE_AUTHORIZED'; Token = $closeTokenValue
                HelperProcessId = $helperProcessId
                MainWindowHandle = [int64]$readyMarker.WindowIdentity.MainWindowHandle
                LaunchTarget = $resolved.LaunchTarget
                TimestampUtc = [DateTime]::UtcNow.ToString('o')
            })
        }

        [ordered]@{
            Success = $true; Ready = $true; DryRun = [bool]$DryRun
            LaunchKind = $resolved.LaunchKind; LaunchTarget = $resolved.LaunchTarget
            DetachMechanism = $launch.DetachMechanism; HelperDetachedFromParentJob = $detachedVerified
            HelperInAnyJob = $launch.InAnyJob; HelperProcessId = $helperProcessId
            HelperProcessVerified = $helperProcessVerified; ReadyMarkerPath = $readyPath
            StatusMarkerPath = $statusPath; ReadyMarkerVerified = $readyMarkerVerified
            StatusMarkerVerified = $statusMarkerVerified
            DryRunStatus = if ($null -eq $dryRunStatus) { $null } else { $dryRunStatus.State }
            CleanupSucceeded = $cleanupSucceeded; ExecutablePath = $resolved.ExecutablePath
            PackageFamilyName = $resolved.PackageFamilyName; ProcessIds = $resolved.ProcessIds
            CloseAuthorized = [bool](-not $DryRun)
            HelperInteractiveSessionId = $readyMarker.InteractiveSessionId
            WindowIdentityAvailable = $true; WindowIdentity = $readyMarker.WindowIdentity
        }
    }
    catch {
        if ($DryRun -and (Test-Path -LiteralPath $stateDirectory)) {
            try { Remove-StateDirectorySafely -Path $stateDirectory } catch { }
        }
        throw
    }
}

try {
    if ($HelperMode) { Invoke-HelperMode }
    else { Invoke-ParentMode | ConvertTo-Json -Depth 8 -Compress }
}
catch {
    if ($HelperMode) {
        if (-not [string]::IsNullOrWhiteSpace($StatusMarkerPath)) {
            try {
                Write-JsonAtomic -Path $StatusMarkerPath -Value ([ordered]@{
                    State = 'FAILED'; HelperProcessId = [int]$PID; LaunchKind = $LaunchKind
                    LaunchTarget = $LaunchTarget; DryRun = [bool]$DryRun
                    Error = $_.Exception.Message; TimestampUtc = [DateTime]::UtcNow.ToString('o')
                })
            }
            catch { }
        }
        exit 1
    }
    [ordered]@{
        Success = $false; Ready = $false; DryRun = [bool]$DryRun
        Error = $_.Exception.Message; ErrorLine = $_.InvocationInfo.ScriptLineNumber
        ErrorPosition = $_.InvocationInfo.PositionMessage; ScriptStackTrace = $_.ScriptStackTrace
    } | ConvertTo-Json -Depth 5 -Compress
    exit 1
}
