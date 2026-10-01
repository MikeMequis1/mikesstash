---
{"dg-publish":true,"permalink":"/asher/architecture/","title":{"pt":"🧠 Arquitetura","en":"🧠 Architecture"},"dg-note-properties":{"dgShowComments":false,"title":{"pt":"🧠 Arquitetura","en":"🧠 Architecture"},"navOrder":2}}
---

:::lang en
## Core Architecture (Controlled Startup)

Asher is built around a **controlled entry point**: a custom launcher on Windows and a native bootstrap on Linux. Both guarantee a deterministic initialization order and reliable runtime behavior.

**Key principle:**  
Injection and patching are **controlled and delayed**, never performed blindly at process startup.

A companion **Electron manager app** (`Asher.Electron`) handles installation, mod management, and user settings. It talks to **`Asher.Host`** over JSONL on stdin/stdout — the host wraps `IAsherApplication` / `Asher.Services` without starting a UI or touching the game process directly. The manager stays in **Distribution**; the game folder receives runtime files plus an emergency uninstall helper only.

## Solution Structure

```
/Asher.sln
│
├── Asher.Electron/             → Electron manager UI (HTML/CSS/JS)
│   ├── src/main/               → Spawns Asher.Host, JSONL IPC, updates
│   ├── src/preload/            → contextBridge → window.asher
│   └── src/renderer/           → Controllers, localization, theme, icons
│
├── Asher.Host/                 → Headless JSONL service host (.NET 8; Windows x86 / Linux x64)
│   └── Jsonl/JsonlHostSession  → install, uninstall, mods, settings RPC
│
├── Asher.Services/             → IAsherApplication + install/launch/patch manager
│   └── Platform/               → Windows/Linux platform implementations
├── Asher.Core/                 → Paths, settings, shared models (no UI types)
│   └── Platform/               → IPlatformInfo (platform descriptor)
│
├── Asher.Launcher/             → Windows custom game launcher (.NET Framework 4.7.2)
│   └── Program.cs              → Entry point and bootstrap orchestration
│
├── Asher.Linux/                → Linux LD_PRELOAD bootstrap + managed build scripts
│
├── Asher.Runtime/              → Runtime mod loader foundation (.NET Framework 4.7.2)
│   ├── Bootstrap/              → AssemblyLoader, PreInit, Patch, Lifecycle
│   ├── Core/                   → RuntimeContext, RuntimeController
│   ├── RuntimeLogger.cs        → File logging to Asher/AsherLogs/
│   └── RuntimeEntry.cs         → Public runtime API
│
├── Asher.SDK/                  → API for mod developers (.NET Framework 4.7.2)
│   ├── Logging/                → AsherLog facade
│   └── Patching/               → IAsherPatchModule, IAsherPreInitModule, lifecycle
│
├── Asher.Patching.*/           → Built-in patch mods
│   ├── DebugEnabler
│   ├── IntroSkipper
│   ├── GraphicsDeprofiler
│   ├── MuteVoiceActing
│   └── OverheatDisabler
│
└── Distribution/               → Zip/dir packaging output (npm run dist)
```

## Manager ↔ Host Communication

```
Asher.Electron (renderer)
    ↓ IPC
Asher.Electron (main / HostManager)
    ↓ spawn + JSONL on stdin/stdout
Asher.Host --jsonl
    ↓
IAsherApplication → Asher.Services / Asher.Core
```

Progress operations (`install`, `uninstall`) stream `progress` events over stdout. The host session guards against late progress callbacks after an operation completes to keep uninstall→reinstall flows stable in a single session. `getPlatformInfo` exposes the OS capability model and `getInstallState` is the authoritative install status; the renderer derives install/uninstall capabilities from them.

OS-specific work is isolated behind small contracts (`IGameFolderDiscovery`, `IGameExecutableLayout`, `IRuntimeDeployment`, `IGameProcessLauncher`); `GameInstallationService` stays shared across Windows and Linux.

In-game stack (separate process): Windows — `DustAET.exe` (= Asher.Launcher) → Asher.Runtime → Asher.Patching.*; Linux — native `DustAET` → `libasher_bootstrap.so` (`LD_PRELOAD`) → Asher.Runtime → Asher.Patching.*

---
[[🐱 Asher\|< Back]]

:::

:::lang pt

## Arquitetura Central (Inicialização Controlada)

O Asher é construído em torno de um **ponto de entrada controlado**: um launcher personalizado no Windows e um bootstrap nativo no Linux. Ambos garantem uma ordem de inicialização determinística e um comportamento confiável em tempo de execução.

**Princípio-chave:**  
A injeção e a aplicação de patches são **controladas e postergadas**, nunca realizadas às cegas na inicialização do processo.

Um **app gerenciador Electron** complementar (`Asher.Electron`) cuida da instalação, do gerenciamento de mods e das configurações do usuário. Ele se comunica com o **`Asher.Host`** via JSONL em stdin/stdout — o host encapsula `IAsherApplication` / `Asher.Services` sem iniciar UI nem tocar diretamente no processo do jogo. O gerenciador permanece em **Distribution**; a pasta do jogo recebe os arquivos de runtime e um helper de desinstalação de emergência.

## Estrutura da Solução

```
/Asher.sln
│
├── Asher.Electron/             → UI do gerenciador Electron (HTML/CSS/JS)
│   ├── src/main/               → Inicia o Asher.Host, IPC JSONL, updates
│   ├── src/preload/            → contextBridge → window.asher
│   └── src/renderer/           → Controllers, localização, tema, ícones
│
├── Asher.Host/                 → Host de serviços JSONL headless (.NET 8; Windows x86 / Linux x64)
│   └── Jsonl/JsonlHostSession  → RPC de instalação, desinstalação, mods, settings
│
├── Asher.Services/             → IAsherApplication + instalação/launch/patch manager
│   └── Platform/               → Implementações de plataforma Windows/Linux
├── Asher.Core/                 → Caminhos, configurações, modelos compartilhados (sem tipos de UI)
│   └── Platform/               → IPlatformInfo (descritor de plataforma)
│
├── Asher.Launcher/             → Launcher personalizado do Windows (.NET Framework 4.7.2)
│   └── Program.cs              → Entry point e orquestração do bootstrap
│
├── Asher.Linux/                → Bootstrap LD_PRELOAD + scripts de build gerenciado (Linux)
│
├── Asher.Runtime/              → Base do carregador de mods em runtime (.NET Framework 4.7.2)
│   ├── Bootstrap/              → AssemblyLoader, PreInit, Patch, Lifecycle
│   ├── Core/                   → RuntimeContext, RuntimeController
│   ├── RuntimeLogger.cs        → Logging em arquivo para Asher/AsherLogs/
│   └── RuntimeEntry.cs         → API pública do runtime
│
├── Asher.SDK/                  → API para desenvolvedores de mods (.NET Framework 4.7.2)
│   ├── Logging/                → Fachada AsherLog
│   └── Patching/               → IAsherPatchModule, IAsherPreInitModule, lifecycle
│
├── Asher.Patching.*/           → Patches integrados
│   ├── DebugEnabler
│   ├── IntroSkipper
│   ├── GraphicsDeprofiler
│   ├── MuteVoiceActing
│   └── OverheatDisabler
│
└── Distribution/               → Saída zip/dir (npm run dist)
```

## Comunicação Gerenciador ↔ Host

```
Asher.Electron (renderer)
    ↓ IPC
Asher.Electron (main / HostManager)
    ↓ spawn + JSONL em stdin/stdout
Asher.Host --jsonl
    ↓
IAsherApplication → Asher.Services / Asher.Core
```

Operações com progresso (`install`, `uninstall`) enviam eventos `progress` pelo stdout. A sessão do host bloqueia callbacks de progresso tardios após a conclusão da operação, mantendo fluxos de desinstalar→reinstalar estáveis na mesma sessão. `getPlatformInfo` expõe o modelo de capacidades do SO e `getInstallState` é o status de instalação autoritativo; o renderer deriva as capacidades de instalação/desinstalação deles.

O trabalho específico de SO fica isolado atrás de contratos pequenos (`IGameFolderDiscovery`, `IGameExecutableLayout`, `IRuntimeDeployment`, `IGameProcessLauncher`); o `GameInstallationService` permanece compartilhado entre Windows e Linux.

Stack in-game (processo separado): Windows — `DustAET.exe` (= Asher.Launcher) → Asher.Runtime → Asher.Patching.*; Linux — `DustAET` nativo → `libasher_bootstrap.so` (`LD_PRELOAD`) → Asher.Runtime → Asher.Patching.*

[[🐱 Asher\|< Voltar]]

:::
