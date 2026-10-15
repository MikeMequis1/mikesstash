---
{"dg-publish":true,"permalink":"/portfolio/linux-servers-on-android-project-overview/","title":{"pt":"🐧 Servidores Linux em Android — Visão geral de projetos","en":"🐧 Linux Servers on Android - Project Overview"},"dg-note-properties":{"dgShowComments":false,"isPortfolioViewableOnly":true,"navOrder":5,"cardDescription":{"pt":"Experimentos com servidores Linux executados em dispositivos Android, explorando serviços, automação, acesso remoto e diferentes usos para hardware reaproveitado.","en":"Experiments with Linux servers running on Android devices, exploring services, automation, remote access, and different uses for reused hardware."},"title":{"pt":"🐧 Servidores Linux em Android — Visão geral de projetos","en":"🐧 Linux Servers on Android - Project Overview"}}}
---


[[Other Projects & Tutorials/🌱 Minecraft Server in Android (2024)\|🌱 Minecraft Server in Android (2024)]]
[[Other Projects & Tutorials/⚔️ Ocarina of Time Server in Android (2025)\|⚔️ Ocarina of Time Server in Android (2025)]]

---

:::lang pt
# 🐧 Servidores Linux em Android — Visão geral de projetos

## 🌱 Minecraft Server in Android (2024)

### Visão geral

Projeto experimental de infraestrutura desenvolvido para transformar um **smartphone Android em um servidor de Minecraft acessível pela Internet**. A proposta surgiu como uma exploração prática de computação de baixo custo, administração Linux e execução de serviços de rede em dispositivos originalmente projetados para uso móvel.

A solução utiliza **Termux** para fornecer um ambiente Linux no Android, com uma distribuição **Ubuntu** executada através do AnLinux. Sobre esse ambiente, foi configurado um servidor de Minecraft baseado em Java e uma camada de tunelamento através do **Ngrok**, permitindo que jogadores externos se conectassem ao servidor sem a necessidade de configurar diretamente a rede doméstica.

### Arquitetura e implementação

- **Android** como plataforma de hospedagem.
    
- **Termux** como ambiente de execução de ferramentas Linux.
    
- **Ubuntu** como ambiente Linux isolado.
    
- **OpenJDK 21** para execução do servidor.
    
- **Minecraft Server / PaperMC** como software de servidor.
    
- **Ngrok TCP** para exposição do serviço à Internet.
    
- **Shell scripts** para automatizar a inicialização dos serviços.
    
- **Termux Wakelock** para manter os processos ativos em segundo plano.
    

A configuração também envolveu gerenciamento básico de memória da JVM através de `-Xmx` e `-Xms`, edição de arquivos de configuração do servidor e gerenciamento de múltiplas sessões do Termux para manter o servidor e o túnel de rede funcionando simultaneamente.

### Objetivos e desafios

O principal objetivo foi compreender, na prática, como **um dispositivo móvel poderia desempenhar o papel de um pequeno servidor Linux**, explorando as limitações de recursos de hardware, gerenciamento de processos e conectividade de rede.

O projeto exigiu lidar principalmente com:

- disponibilidade limitada de memória RAM;
    
- execução contínua de processos em um sistema operacional móvel;
    
- manutenção dos serviços ativos em segundo plano;
    
- configuração de uma aplicação Java em ambiente Linux;
    
- exposição segura de uma porta local através de um túnel TCP;
    

---

## ⚔️ Ocarina of Time Server in Android (2025)

### Visão geral

Projeto desenvolvido como uma evolução do experimento anterior, utilizando um **smartphone Android como servidor multiplayer para The Legend of Zelda: Ocarina of Time**, através da aplicação **Ship of Harkinian** e do servidor **Anchor**.

### Arquitetura e implementação

- **Android** como plataforma de hospedagem.
    
- **Termux + Ubuntu** como ambiente Linux.
    
- **Deno** como runtime do servidor.
    
- **Anchor** como servidor responsável pela comunicação multiplayer.
    
- **Ship of Harkinian** como cliente modificado de Ocarina of Time.
    
- **Ngrok TCP** para disponibilização do servidor na Internet.
    
- **Shell scripts** para automatizar a inicialização do Anchor e do Ngrok.
    
- **Termux Wakelock** para manter os serviços ativos em segundo plano.
    

O servidor Anchor foi obtido a partir de um repositório público e executado diretamente no ambiente Linux do Android. Sua porta de execução também pôde ser configurada através de uma variável de ambiente, permitindo adaptar a infraestrutura conforme a necessidade.

### Objetivos e desafios

O projeto teve como principal objetivo **expandir o experimento de hospedagem em Android para uma arquitetura multiplayer diferente**, explorando um servidor baseado em Deno em vez de uma aplicação Java tradicional.

Entre os principais desafios estavam:

- configurar um ambiente Linux funcional dentro do Android;
    
- instalar e configurar um runtime diferente do utilizado no projeto anterior;
    
- compreender a arquitetura do servidor Anchor;
    
- configurar comunicação TCP através do Ngrok;
    
- manter múltiplos serviços executando simultaneamente;
    
- automatizar a inicialização do servidor e do túnel;
    
- integrar corretamente o cliente Ship of Harkinian ao servidor remoto.
    

### Resultado

O projeto comprovou a viabilidade de utilizar um **dispositivo Android de baixo consumo como servidor multiplayer dedicado**, desta vez para uma aplicação baseada em _The Legend of Zelda: Ocarina of Time_.

Além de aprofundar os conhecimentos adquiridos no projeto de Minecraft, o experimento ampliou a experiência com **Linux, Deno, redes TCP, automação de processos, servidores multiplayer e integração entre aplicações cliente-servidor**.

---

## 🧩 O que esses projetos representam

Os dois projetos fazem parte de uma mesma linha de experimentação: **explorar dispositivos acessíveis e ambientes não convencionais como plataformas de computação e hospedagem**.

O primeiro projeto começou como uma experiência de infraestrutura — _"é possível transformar um celular antigo em um servidor?"_. O segundo levou essa ideia além, utilizando uma aplicação multiplayer completamente diferente e uma arquitetura baseada em Deno.

Juntos, eles representam experiências práticas com:

- **Linux e administração de sistemas**
    
- **Android como plataforma de servidor**
    
- **Redes TCP/IP e tunelamento**
    
- **Servidores multiplayer**
    
- **Java e Deno**
    
- **Shell scripting e automação**
    
- **Gerenciamento de processos**
    
- **Ambientes Linux isolados**
    
- **Integração cliente-servidor**
    
- **Otimização para hardware limitado**
    

[< Voltar](/portfolio/)

:::

:::lang en
# 🐧 Linux servers on Android — Projects overview

## 🌱 Minecraft Server in Android (2024)

### Overview

An experimental infrastructure project developed to turn an **Android smartphone into an Internet-accessible Minecraft server**. The project was conceived as a practical exploration of low-cost computing, Linux administration, and network services running on devices originally designed for mobile use.

The solution uses **Termux** to provide a Linux environment on Android, with an **Ubuntu** distribution running through AnLinux. On top of this environment, a Java-based Minecraft server and an **Ngrok** tunneling layer were configured, allowing external players to connect to the server without directly configuring the home network.

### Architecture and implementation

- **Android** as the hosting platform.
    
- **Termux** as the Linux tooling environment.
    
- **Ubuntu** as the isolated Linux environment.
    
- **OpenJDK 21** for server execution.
    
- **Minecraft Server / PaperMC** as the server software.
    
- **Ngrok TCP** for Internet exposure.
    
- **Shell scripts** for service startup automation.
    
- **Termux Wakelock** to keep processes running in the background.
    

The configuration also involved JVM memory management through `-Xmx` and `-Xms`, server configuration files, and multiple Termux sessions to keep the game server and network tunnel running simultaneously.

### Goals and challenges

The main goal was to understand, through hands-on experimentation, how **a mobile device could perform the role of a small Linux server**, while exploring hardware limitations, process management, and network connectivity.

The project required dealing with:

- limited RAM availability;
    
- continuous process execution on a mobile operating system;
    
- keeping background services alive;
    
- configuring a Java application in a Linux environment;
    
- exposing a local service through a TCP tunnel;
    

---

## ⚔️ Ocarina of Time Server in Android (2025)

### Overview

A follow-up project that expanded the previous experiment by using an **Android smartphone as a multiplayer server for The Legend of Zelda: Ocarina of Time**, through the **Ship of Harkinian** application and the **Anchor** server.

### Architecture and implementation

- **Android** as the hosting platform.
    
- **Termux + Ubuntu** as the Linux environment.
    
- **Deno** as the server runtime.
    
- **Anchor** as the multiplayer communication server.
    
- **Ship of Harkinian** as the modified Ocarina of Time client.
    
- **Ngrok TCP** for Internet access.
    
- **Shell scripts** for automating Anchor and Ngrok startup.
    
- **Termux Wakelock** to keep services running in the background.
    

The Anchor server was obtained from a public repository and executed directly inside the Android Linux environment. Its listening port could also be configured through an environment variable, allowing the infrastructure to be adapted to different requirements.

### Goals and challenges

The primary goal was to **extend the Android hosting experiment to a different multiplayer architecture**, using a Deno-based server instead of the Java environment used by the previous project.

The main challenges included:

- configuring a functional Linux environment on Android;
    
- installing and configuring a different runtime;
    
- understanding the Anchor server architecture;
    
- establishing TCP communication through Ngrok;
    
- keeping multiple services running simultaneously;
    
- automating server and tunnel startup;
    
- correctly integrating the Ship of Harkinian client with the remote server.
    

### Result

The project demonstrated the feasibility of using a **low-power Android device as a dedicated multiplayer server**, this time for an application based on _The Legend of Zelda: Ocarina of Time_.

In addition to expanding upon the knowledge gained from the Minecraft project, the experiment provided further experience with **Linux, Deno, TCP networking, process automation, multiplayer servers, and client-server integration**.

---

## 🧩 What these projects represent

Both projects belong to the same line of experimentation: **exploring affordable and unconventional devices as computing and hosting platforms**.

The first project began as an infrastructure experiment — _"can I turn an antique phone into a server?"_. The second took the idea further by applying it to a completely different multiplayer application and a Deno-based architecture.

Together, they represent hands-on experience with:

- **Linux and system administration**
    
- **Android as a server platform**
    
- **TCP/IP networking and tunneling**
    
- **Multiplayer servers**
    
- **Java and Deno**
    
- **Shell scripting and automation**
    
- **Process management**
    
- **Isolated Linux environments**
    
- **Client-server integration**
    
- **Optimization for constrained hardware**
    

[< Back](/portfolio/)

:::