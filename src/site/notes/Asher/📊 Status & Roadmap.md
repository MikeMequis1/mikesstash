---
{"dg-publish":true,"permalink":"/asher/status-and-roadmap/","title":{"pt":"📊 Progresso & Roadmap","en":"📊 Status & Roadmap"},"dg-note-properties":{"dgShowComments":false,"title":{"pt":"📊 Progresso & Roadmap","en":"📊 Status & Roadmap"},"navOrder":6}}
---

:::lang en

## Current status

|Area|Status|Notes|
|---|---|---|
|Solution structure|✅ Done|Multi-project architecture stabilized|
|Windows launcher runtime|✅ Done|`DustAET.exe` swap + `DustAET.real.exe` backup|
|Steam compatibility|✅ Done|The game launches normally through Steam|
|Runtime initialization|✅ Done|Logs, lifecycle, and folders working|
|Harmony bootstrap|✅ Done|Runtime patching confirmed and working|
|Mod SDK|✅ Done|Clean interfaces for mod authors|
|Default patches|✅ Done|5 built-in patch modules (see [🎯 Project Overview](https://chatgpt.com/g/g-p-693349c679288191939e9043a41b8205-asher-project/c/%F0%9F%8E%AF%20Project%20Overview))|
|Electron manager UI|⏸️ Deferred|Being replaced by the Avalonia manager UI|
|JSONL host|✅ Done|Headless service for install, mods, and settings|
|Patch Manager|✅ Done|Enable/disable mods by moving files|
|Game-folder logging|✅ Done|`runtime_*`, `manager_*`, `launcher_fatal_*`|
|Windows packaging|✅ Done|NSIS installer + portable zip + `latest.yml`|
|Linux support|✅ Done|Discovery, install, `LD_PRELOAD` launch, AppImage/tar.gz (validated on WSL2)|
|Emergency uninstall helper|✅ Done|`Uninstall-Asher.cmd` beside `DustAET.exe` (Windows)|
|Safe vs Total removal|✅ Done|In-app uninstall vs the emergency script (Windows)|
|In-app GitHub updates|✅ Done|Packaged builds apply release zips (Windows only)|
|Avalonia manager UI|🔨 Working|Cross-platform manager UI replacing Electron|
|Discord Rich Presence|🔨 Working|Discord Rich Presence integration|
|Custom application icon & Desktop shortcut|🔨 Working|Custom application icon and Desktop shortcut creation|
|Multiple game installations|🔨 Working|Support for multiple installations of the same game, such as Steam and GOG|
|Content patcher|🔜 Planned|ContentManager interception — no backend yet|
|Mod metadata (`mod.json`)|🔜 Planned|Description, load order, dependencies|
|Public mod API docs|🔜 Planned|Developer documentation and examples|
|Mod configuration UI|🔜 Planned|Per-mod settings files and manager integration|
|Install wizard stepper chrome|⏸️ Deferred|More complete welcome/stepper flow|
|Linux external launch / in-app updater / `.deb`|⏸️ Deferred|Out of scope for now|

## Next version

The next version will focus on improving the manager experience and installation model before continuing with the remaining gameplay patches from the original project.

- **Electron to Avalonia transition** → replace the Electron-based manager interface with a native Avalonia application for a shared cross-platform C#/.NET UI
- **Discord Rich Presence** → add Discord Rich Presence integration for the active game session
- **Custom application icon & Desktop shortcut** → provide a custom Asher application icon and create a Desktop shortcut during installation
- **Multiple game installations** → support multiple installations of the same game on a single device, such as having both the Steam and GOG versions installed

## Backlog

- **Mod metadata** → a `mod.json` schema with description, load order, and dependencies
- **Content patcher** → intercept `ContentManager.Load<T>()` and support `content.json` replacements
- **Mod configuration UI** → per-mod settings files and manager integration
- **Public mod API docs** → developer documentation and examples
- **Customizable Discord Rich Presence** → toggle visible information regarding the active game session
- Linux: external Steam/desktop launch, in-app updater, `.deb` packaging

---

[[🐱 Asher\|< Back]]

:::

:::lang pt

## Status atual

|Área|Status|Notas|
|---|---|---|
|Estrutura da solução|✅ Feito|Arquitetura multi-projeto estabilizada|
|Runtime com launcher no Windows|✅ Feito|Troca do `DustAET.exe` + backup `DustAET.real.exe`|
|Compatibilidade com Steam|✅ Feito|O jogo inicia normalmente pela Steam|
|Inicialização do runtime|✅ Feito|Logs, ciclo de vida e pastas funcionando|
|Bootstrap do Harmony|✅ Feito|Patching em runtime confirmado e funcionando|
|SDK de mods|✅ Feito|Interfaces limpas para autores de mods|
|Patches padrão|✅ Feito|5 módulos de patch integrados (ver [🎯 Project Overview](https://chatgpt.com/g/g-p-693349c679288191939e9043a41b8205-asher-project/c/%F0%9F%8E%AF%20Project%20Overview))|
|UI Electron do gerenciador|⏸️ Adiado|Será substituída pela interface Avalonia|
|Host JSONL|✅ Feito|Serviço headless para instalação, mods e settings|
|Patch Manager|✅ Feito|Ativa/desativa mods movendo arquivos|
|Logs na pasta do jogo|✅ Feito|`runtime_*`, `manager_*`, `launcher_fatal_*`|
|Empacotamento Windows|✅ Feito|Instalador NSIS + zip portátil + `latest.yml`|
|Suporte a Linux|✅ Feito|Descoberta, instalação, launch via `LD_PRELOAD`, AppImage/tar.gz (validado no WSL2)|
|Helper de desinstalação de emergência|✅ Feito|`Uninstall-Asher.cmd` ao lado do `DustAET.exe`|
|Remoção Safe vs Total|✅ Feito|Uninstall in-app vs script de emergência (Windows)|
|Updates via GitHub in-app|✅ Feito|Builds empacotadas aplicam zips de release (somente Windows)|
|UI Avalonia do gerenciador|🔨 Em andamento|Interface multiplataforma substituindo o Electron|
|Discord Rich Presence|🔨 Em andamento|Integração com Discord Rich Presence|
|Ícone personalizado + atalho na área de trabalho|🔨 Em andamento|Ícone próprio e criação de atalho na área de trabalho|
|Múltiplas instalações do jogo|🔨 Em andamento|Suporte a múltiplas instalações do mesmo jogo, como Steam e GOG|
|Content patcher|🔜 Planejado|Interceptação do ContentManager — ainda sem backend|
|Metadados de mod (`mod.json`)|🔜 Planejado|Descrição, ordem de carregamento e dependências|
|UI de configuração de mods|🔜 Planejado|Arquivos de configuração por mod e integração no gerenciador|
|Documentação pública da API de mods|🔜 Planejado|Documentação e exemplos para desenvolvedores|
|Chrome do assistente de instalação|⏸️ Adiado|Fluxo de welcome/stepper mais completo|
|Linux: launch externo / updater in-app / `.deb`|⏸️ Adiado|Fora de escopo por ora|

## Próxima versão

A próxima versão será focada em melhorias na experiência do gerenciador e no modelo de instalação antes de dar sequência aos patches de gameplay restantes do projeto original.

- **Transição de Electron para Avalonia** → substituir a interface baseada em Electron por uma aplicação nativa em Avalonia, compartilhando a stack multiplataforma C#/.NET
- **Discord Rich Presence** → adicionar integração com o Discord Rich Presence para a sessão de jogo ativa
- **Ícone personalizado da aplicação + atalho na área de trabalho** → fornecer um ícone próprio para o Asher e criar um atalho na área de trabalho durante a instalação
- **Múltiplas instalações do jogo** → permitir diferentes instalações do mesmo jogo em um único dispositivo, como possuir simultaneamente as versões de Steam e GOG

## Backlog

- **Metadados de mod** → esquema `mod.json` com descrição, ordem de carregamento e dependências
- **Content patcher** → interceptar `ContentManager.Load<T>()` e suportar substituições via `content.json`
- **UI de configuração de mods** → arquivos de configuração por mod e integração no gerenciador
- **Documentação pública da API de mods** → documentação e exemplos para desenvolvedores

---

[[🐱 Asher\|< Voltar]]
:::