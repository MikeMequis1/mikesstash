---
{"dg-publish":true,"permalink":"/portfolio/asher/","title":{"pt":"🛠️ Asher","en":"🛠️ Asher"},"dg-note-properties":{"dgShowComments":false,"isPortfolioViewableOnly":true,"navOrder":4,"cardDescription":{"pt":"Plataforma de modding para Dust: An Elysian Tail, desenvolvida para explorar patching de código em runtime e uma infraestrutura modular para criação e gerenciamento de mods.","en":"Modding platform for Dust: An Elysian Tail, built to explore runtime code patching and a modular infrastructure for creating and managing mods."},"title":{"pt":"🛠️ Asher","en":"🛠️ Asher"}}}
---

:::lang pt

# 🛠️ Asher

## Plataforma de modding para Dust: An Elysian Tail

**Asher** é uma plataforma de modding para Windows e Linux para [_Dust: An Elysian Tail_](https://store.steampowered.com/app/236090/Dust_An_Elysian_Tail/), desenvolvida com o objetivo de fornecer uma infraestrutura modular para criação, instalação e execução de modificações.

O projeto combina **patching de código em runtime** e **substituição de conteúdo**, buscando oferecer uma experiência de modding segura, modular e reversível.

[Repositório](https://github.com/MikeMequis1/Asher)

> Documentação técnica detalhada: [[🐱 Asher\|Asher (Jardim)]]

## 🎯 Objetivo

A proposta é fornecer uma camada intermediária entre o jogo e os mods, permitindo que diferentes modificações possam ser instaladas e gerenciadas de maneira independente.

O projeto foi inspirado em soluções consolidadas do ecossistema de *modding*, especialmente **SMAPI**, **SMAPI Content Patcher** e outras plataformas de *patching* utilizadas como referência arquitetural.

## 🧩 Arquitetura

A arquitetura do Asher é dividida em componentes com responsabilidades distintas, separando o **gerenciador** (fora do processo do jogo) da **execução** das modificações dentro do jogo.

### Gerenciador (Electron + Host)

O gerenciador é uma aplicação **Electron** (`Asher.Electron`) apoiada por um host headless em C# (`Asher.Host`), comunicando-se via **JSONL** em stdin/stdout.

Entre suas responsabilidades estão:

- instalação e desinstalação reversível no diretório do jogo;
- organização e ativação/desativação de *mods*;
- configurações, localização e tema;
- preparação do launcher e lançamento do jogo;
- suporte a Windows e Linux (troca de launcher no Windows; bootstrap `LD_PRELOAD` no Linux);
- empacotamento em Distribution e atualizações via GitHub Releases;

A UI do gerenciador permanece em Distribution; a pasta do jogo recebe runtime, mods e um helper de emergência (`Uninstall-Asher.cmd`).

### Launcher / Runtime

No Windows, o **Asher.Launcher** substitui `DustAET.exe` e controla a ordem de inicialização. No Linux, o `DustAET` permanece intacto e o **`libasher_bootstrap.so`** (via `LD_PRELOAD`) se conecta ao Mono embutido. Em ambos, o **Asher Runtime** atua durante a execução do jogo, fornecendo a infraestrutura para aplicar modificações em tempo de execução.

O projeto utiliza **Harmony** como parte de sua infraestrutura de *patching*, permitindo modificar o comportamento do código existente sem alterar permanentemente os *assemblies* originais. Essa abordagem torna as alterações mais controláveis e reversíveis, além de permitir que diferentes *mods* sejam aplicados sobre o mesmo ambiente.

## 🔧 Tecnologias

O projeto utiliza principalmente o ecossistema **.NET/C#**, com um shell de gerenciamento em **Electron**.

Entre as principais tecnologias e referências utilizadas estão:

- **C#** / **.NET** (Host, Services, Core) e **.NET Framework** (Launcher, Runtime, SDK, patches)
    
- **Electron** (Node.js) — UI do gerenciador
    
- **Harmony** — patching em runtime
    
- **XNA Framework 4.0** (Windows) / **Mono + FNA** (Linux) — compatibilidade com o jogo
- **AppImage / tar.gz** — empacotamento Linux
    
- **Git**
    
- **SMAPI** / **SMAPI Content Patcher**
    
- **DustAetPatchingPlatform**
    

## 🧠 Principais desafios técnicos

O desenvolvimento do Asher envolve problemas diferentes daqueles encontrados no desenvolvimento de uma aplicação convencional.

Entre os principais desafios estão:

- modificar o comportamento de uma aplicação existente sem possuir controle sobre seu código-fonte;
    
- aplicar patches durante a execução do jogo;
    
- manter as alterações reversíveis;
    
- coordenar componentes executados em diferentes momentos do ciclo de vida da aplicação;
    
- estabelecer uma arquitetura extensível para diferentes tipos de mods;
    
- gerenciar instalação, execução e distribuição de modificações (incluindo empacotamento e recuperação de emergência);
    

Esses requisitos tornam o projeto particularmente interessante como estudo de **engenharia reversa, extensibilidade de software e arquitetura de sistemas sobre aplicações existentes**.

[< Voltar](/portfolio/)

:::

:::lang en

# 🛠️ Asher

## Modding platform for Dust: An Elysian Tail

**Asher** is a modding platform for Windows and Linux for [_Dust: An Elysian Tail_](https://store.steampowered.com/app/236090/Dust_An_Elysian_Tail/), designed to provide a modular infrastructure for creating, installing, and running modifications.

The project combines **runtime code patching** and **content replacement**, aiming to provide a safe, modular, and reversible modding experience.

[Repository](https://github.com/MikeMequis1/Asher)

> Detailed technical documentation:  [[🐱 Asher\|Asher (Garden)]]

## 🎯 Objective

The platform introduces an intermediate layer between the game and its mods, allowing different modifications to be installed and managed independently.

The project takes inspiration from established modding solutions, particularly **SMAPI**, **SMAPI Content Patcher**, and other patching platforms used as architectural references.

## 🧩 Architecture

Asher is divided into components with distinct responsibilities, separating the **manager** (outside the game process) from modification **execution** inside the game.

### Manager (Electron + Host)

The manager is an **Electron** app (`Asher.Electron`) backed by a headless C# host (`Asher.Host`), communicating over **JSONL** on stdin/stdout.

Its responsibilities include:

- reversible install and uninstall into the game directory;
    
- organizing and enabling/disabling mods;
    
- settings, localization, and theme;
    
- launcher preparation and game launch;
    
- Windows and Linux support (launcher swap on Windows; `LD_PRELOAD` bootstrap on Linux);
    
- Distribution packaging and GitHub Releases updates;
    

The manager UI stays in Distribution; the game folder receives runtime, mods, and an emergency helper (`Uninstall-Asher.cmd`).

### Launcher / Runtime

On Windows, **Asher.Launcher** replaces `DustAET.exe` and controls startup order. On Linux, `DustAET` stays untouched and **`libasher_bootstrap.so`** (via `LD_PRELOAD`) attaches to the embedded Mono runtime. In both, the **Asher Runtime** operates while the game is running, providing the infrastructure required to apply modifications at runtime.

The project uses **Harmony** as part of its patching infrastructure, allowing existing code behavior to be modified without permanently altering the original assemblies. This approach makes modifications more controlled and reversible while allowing multiple mods to operate within the same environment.

## 🔧 Technologies

The project primarily uses the **.NET/C#** ecosystem, with an **Electron** management shell.

Key technologies and references include:

- **C#** / **.NET** (Host, Services, Core) and **.NET Framework** (Launcher, Runtime, SDK, patches)
    
- **Electron** (Node.js) — manager UI
    
- **Harmony** — runtime patching
    
- **XNA Framework 4.0** (Windows) / **Mono + FNA** (Linux) — game compatibility
- **AppImage / tar.gz** — Linux packaging
    
- **Git**
    
- **SMAPI** / **SMAPI Content Patcher**
    
- **DustAetPatchingPlatform**

## 🧠 Key technical challenges

Asher involves challenges that differ significantly from those found in conventional application development.

Key challenges include:

- modifying the behavior of an existing application without access to its source code;
    
- applying patches during runtime;
    
- keeping modifications reversible;
    
- coordinating components operating at different stages of the application's lifecycle;
    
- establishing an extensible architecture for different types of mods;
    
- managing mod installation, execution, and distribution (including packaging and emergency recovery);
    

These requirements make the project a practical study in **reverse engineering, software extensibility, and system architecture built around an existing application**.

[< Back](/portfolio/)

:::
