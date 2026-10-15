---
{"dg-publish":true,"permalink":"/other-projects-and-tutorials/minecraft-server-in-android-2024/","title":{"pt":"🌱 Servidor Minecraft no Android (2024)","en":"🌱 Minecraft Server in Android (2024)"},"dg-note-properties":{"title":{"pt":"🌱 Servidor Minecraft no Android (2024)","en":"🌱 Minecraft Server in Android (2024)"},"navOrder":1}}
---

![MineServer.gif](/img/user/img/MineServer.gif)

:::lang pt
# 🌱 Como Hospedar um Servidor de Minecraft no Android

Quer hospedar um servidor de *Minecraft* para jogar com seus amigos? Só precisa de um celular Android e a configuração de um servidor Linux. É bem simples, juro.

> [!tip] Aconselhável possuir um celular com 2GB a 4GB de RAM, conexão estável para baixar e instalar programas necessários, além de manter os serviços ativos, e conectar um teclado físico (via Bluetooth ou cabo OTG). Também é possível usar o app **Hacker's Keyboard**.

## Etapa 1 — Instalação do Termux e Ubuntu

1. Baixe **Termux** e **AnLinux** no seu Android na Google Play Store.
    
2. Selecione **Ubuntu** no AnLinux e copie o código.
    
3. Execute o comando no Termux.
    
4. Para iniciar o servidor, execute:
    
    ```bash
    ./start-ubuntu.sh
    ```
    
    - Você pode renomear para `s`, executando:
        
        ```bash
        mv start-ubuntu.sh s
        ```
        
        Isso permite entrar no Ubuntu escrevendo apenas `./s`.
        

> **IMPORTANTE:** Arraste para baixo na barra de notificações — deve haver uma opção de **Wakelock** para o Termux. Isso impede que o serviço seja encerrado e permite que continue funcionando em segundo plano.

## Etapa 2 — Instalação dos Componentes Necessários

Antes de instalar os componentes necessários, execute:

```bash
apt-get update && apt-get upgrade
apt install nano   # Programa de edição e adição de arquivos
apt install curl   # Usado para instalação do Ngrok, serve para obter URLs
```

> Por algum motivo, o Ubuntu instalado não possui esses dois comandos instalados por padrão.

Em seguida, instale o Java:

```bash
apt-get install software-properties-common
add-apt-repository ppa:openjdk-r/ppa
apt-get update
apt-get install openjdk-21-jdk   # Instale o mais recente
```

Certifique-se de que está instalado corretamente:

```bash
java -version
```

## Etapa 3 — Configurando o Servidor (Vanilla, mundo comum)

1. Certifique-se de que você está no diretório inicial:
    
    ```bash
    cd ~
    ```
    
2. Crie uma pasta para seu diretório e entre nela:
    
    ```bash
    mkdir mc && cd mc
    ```
    
3. Baixe o arquivo `.jar` do servidor do Minecraft. Você pode fazer isso a partir do site oficial do Minecraft ou de outro site, como o **PaperMC** (implementação de Spigot e plugins). Baixe o `.jar` correspondente à versão do seu Minecraft.
    
    **Servidor oficial (Vanilla):**
    
    ```bash
    wget -O minecraft_server.jar https://launcher.mojang.com/v1/objects/bb2b6b1aefcd70dfd1892149ac3a215f6c636b07/server.jar
    ```
    
    **Ou PaperMC:**
    
    ```bash
    wget -O minecraft_server.jar https://api.papermc.io/v2/projects/paper/versions/1.19.3/builds/448/downloads/paper-1.19.3-448.jar
    ```
    
4. Dê permissão de execução:
    
    ```bash
    chmod +x minecraft_server.jar
    ```
    
5. Inicie o servidor:
    
    ```bash
    java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui
    ```
    
    > Os valores em `-Xmx` e `-Xms` determinam, respectivamente, a memória RAM **máxima** e **mínima** dedicada ao servidor. Por segurança, deixe pelo menos 1 GB.
    
6. Na primeira execução, ocorrerá um erro pedindo para concordar com o `eula.txt`. Você também pode alterar parâmetros no `server.properties` para modificar as informações do servidor:
    
    ```bash
    nano server.properties
    ```
    
    - `max-players` → quantidade de jogadores
    - `online-mode` → permissão para entrada de contas não-legacy
    - `difficulty` → dificuldade, entre outros...
7. Edite o arquivo do EULA:
    
    ```bash
    nano eula.txt
    ```
    
    - Altere `eula=false` para `eula=true`
    - `Ctrl+S` para salvar, `Ctrl+X` para sair
8. Inicie o servidor novamente:
    
    ```bash
    java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui
    ```
    
9. Para encerrar o servidor, digite:
    
    ```bash
    stop
    ```
    

## Etapa 4 — Configurando o Ngrok (Acesso Externo)

1. Acesse [ngrok.com](https://ngrok.com/).
    
2. Crie uma conta e faça login.
    
3. Na página **Dashboard**, selecione **Linux** em **Agents**.
    
4. Copie e cole o comando `curl` fornecido pelo site para instalar. Caso não funcione, use:
    
    ```bash
    apt install ngrok
    ```
    
5. Após instalar o programa, copie e cole o comando contendo o **Token de Autenticação** fornecido pelo site.
    
6. Gere um link de acesso ao servidor:
    
    ```bash
    ngrok tcp 25565
    ```
    
    > Cada vez que é inicializado, o link gerado é diferente. O site requer o cadastro de um cartão de crédito, mas este serviço **não é cobrado** — serve apenas para verificar a identidade do usuário como pessoa física (assim como a Oracle faz).
    
7. Se aparecer **"Status da sessão online"** em verde, a autenticação foi bem-sucedida. O link de acesso está na linha **Forwarding**. Copie a parte no formato:
    
    ```
    0.tcp.ngrok.io:12345
    ```
    

## Etapa 5 — Automatizando a Inicialização

1. Se os dois serviços estiverem funcionando corretamente, é necessário mantê-los ativos simultaneamente. Abra uma nova sessão apertando `Ctrl+Alt+C`.
    
2. Alterne entre as sessões com `Ctrl+Alt+↑/↓` ou `Ctrl+Alt+P/N`. Você também pode fazer isso pela aba do Termux.
    
3. Para simplificar, crie arquivos sem extensão para iniciar o servidor de Minecraft e o serviço do Ngrok:
    
    **Script do servidor:**
    
    ```bash
    nano m
    ```
    
    Conteúdo:
    
    ```bash
    #!/bin/bash
    java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui
    ```
    
    Salve (`Ctrl+S`), saia (`Ctrl+X`) e dê permissão:
    
    ```bash
    chmod +x m
    ```
    
    **Script do Ngrok:**
    
    ```bash
    nano n
    ```
    
    Conteúdo:
    
    ```bash
    #!/bin/bash
    ngrok tcp 25565
    ```
    
    Salve (`Ctrl+S`), saia (`Ctrl+X`) e dê permissão:
    
    ```bash
    chmod +x n
    ```
    
4. Execute cada script em uma sessão separada:
    
    ```bash
    ./m
    ```
    
    ```bash
    ./n
    ```
    
5. Para encerrar os dois serviços, use `Ctrl+C` nas duas sessões ativas.
    

## Etapa 6 — Conectando ao Servidor

1. Entre no Minecraft.
2. Selecione **Multijogador** → **Conexão Direta** e cole o link de acesso obtido no Ngrok.
3. Acesse e divirta-se!

---

### Fontes

1. [XDA Developers — Run Minecraft Server on Android](https://www.xda-developers.com/run-minecraft-server-android/)
2. [Reddit — Hosting a Minecraft Server on Android](https://www.reddit.com/r/Android/comments/glr4gc/hosting_a_minecraft_server_on_android_20/?rdt=57465) — _contém mais informações, como conexão via SSH, inserção de mundos criados anteriormente, instalação de Forge, e muito mais._
3. [Termux Wiki — Hardware Keyboard](https://wiki.termux.com/wiki/Hardware_Keyboard) :::

[Post Original do LinkedIn](https://www.linkedin.com/posts/ugcPost-7390227348110954496-OWa0/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD35xZwBUhYqcLdrd2oPUKqiV2XwWJxL0C0)

[[🏡 Home Page\|< Voltar]]

:::

:::lang en
# 🌱 How to Host a Minecraft Server on Android

Want to host a *Minecraft* server to play with your friends? All it requires is an Android phone and the Linux server configuration. It's pretty simple, I swear.

> [!tip] It's advisable to have a phone with 2GB to 4GB of RAM, a stable connection to download and install the necessary programs, keep the services running, and connect a physical keyboard (via Bluetooth or an OTG cable). You can also use the **Hacker's Keyboard** app.

## Step 1 — Installing Termux and Ubuntu

1. Download **Termux** and **AnLinux** on your Android from the Google Play Store.
    
2. Select **Ubuntu** in AnLinux and copy the code.
    
3. Run the command in Termux.
    
4. To start the server, run:
    
    ```bash
    ./start-ubuntu.sh
    ```
    
    - You can rename it to `s` by running:
        
        ```bash
        mv start-ubuntu.sh s
        ```
        
        This lets you enter Ubuntu just by typing `./s`.
        

> **IMPORTANT:** Pull down the notification bar — there should be a **Wakelock** option for Termux. This prevents the service from being killed and lets it keep running in the background.

## Step 2 — Installing the Required Components

Before installing the required components, run:

```bash
apt-get update && apt-get upgrade
apt install nano   # Editing/file-adding program
apt install curl   # Used for installing Ngrok, used to get URLs
```

> For some reason, the installed Ubuntu doesn't come with these two commands by default.

Next, install Java:

```bash
apt-get install software-properties-common
add-apt-repository ppa:openjdk-r/ppa
apt-get update
apt-get install openjdk-21-jdk   # Install the latest version
```

Confirm it's installed correctly:

```bash
java -version
```

## Step 3 — Setting Up the Server (Vanilla, regular world)

1. Make sure you're in your home directory:
    
    ```bash
    cd ~
    ```
    
2. Create a folder for your directory and go into it:
    
    ```bash
    mkdir mc && cd mc
    ```
    
3. Download the Minecraft server `.jar` file. You can do this from Minecraft's official site or another site, such as **PaperMC** (a Spigot/plugin implementation). Download the `.jar` matching your Minecraft version.
    
    **Official server (Vanilla):**
    
    ```bash
    wget -O minecraft_server.jar https://launcher.mojang.com/v1/objects/bb2b6b1aefcd70dfd1892149ac3a215f6c636b07/server.jar
    ```
    
    **Or PaperMC:**
    
    ```bash
    wget -O minecraft_server.jar https://api.papermc.io/v2/projects/paper/versions/1.19.3/builds/448/downloads/paper-1.19.3-448.jar
    ```
    
4. Grant execute permission:
    
    ```bash
    chmod +x minecraft_server.jar
    ```
    
5. Start the server:
    
    ```bash
    java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui
    ```
    
    > The `-Xmx` and `-Xms` values set, respectively, the **maximum** and **minimum** RAM dedicated to the server. For safety, leave at least 1 GB.
    
6. On the first run, an error will occur asking you to agree to `eula.txt`. You can also change parameters in `server.properties` to modify the server's settings:
    
    ```bash
    nano server.properties
    ```
    
    - `max-players` → number of players
    - `online-mode` → whether non-legacy accounts are allowed in
    - `difficulty` → difficulty, among others...
7. Edit the EULA file:
    
    ```bash
    nano eula.txt
    ```
    
    - Change `eula=false` to `eula=true`
    - `Ctrl+S` to save, `Ctrl+X` to exit
8. Start the server again:
    
    ```bash
    java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui
    ```
    
9. To stop the server, type:
    
    ```bash
    stop
    ```
    

## Step 4 — Setting Up Ngrok (External Access)

1. Go to [ngrok.com](https://ngrok.com/).
    
2. Create an account and log in.
    
3. On the **Dashboard** page, select **Linux** under **Agents**.
    
4. Copy and paste the `curl` install command provided by the site. If it doesn't work, use:
    
    ```bash
    apt install ngrok
    ```
    
5. After installing the program, copy and paste the command containing the **Auth Token** provided by the site.
    
6. Generate an access link to the server:
    
    ```bash
    ngrok tcp 25565
    ```
    
    > Each time it's started, the generated link is different. The site requires registering a credit card, but this service **is not charged** — it's only used to verify the user's identity as a real person (the same way Oracle does).
    
7. If **"Session Status: online"** appears in green, authentication was successful. The access link is on the **Forwarding** line. Copy the part in the format:
    
    ```
    0.tcp.ngrok.io:12345
    ```
    

## Step 5 — Automating Startup

1. If both services are working correctly, you need to keep them running simultaneously. Open a new session by pressing `Ctrl+Alt+C`.
    
2. Switch between sessions with `Ctrl+Alt+↑/↓` or `Ctrl+Alt+P/N`. You can also do this from the Termux tab.
    
3. To simplify things, create extensionless files to start the Minecraft server and the Ngrok service:
    
    **Server script:**
    
    ```bash
    nano m
    ```
    
    Content:
    
    ```bash
    #!/bin/bash
    java -Xmx1024M -Xms1024M -jar minecraft_server.jar nogui
    ```
    
    Save (`Ctrl+S`), exit (`Ctrl+X`), and grant permission:
    
    ```bash
    chmod +x m
    ```
    
    **Ngrok script:**
    
    ```bash
    nano n
    ```
    
    Content:
    
    ```bash
    #!/bin/bash
    ngrok tcp 25565
    ```
    
    Save (`Ctrl+S`), exit (`Ctrl+X`), and grant permission:
    
    ```bash
    chmod +x n
    ```
    
4. Run each script in a separate session:
    
    ```bash
    ./m
    ```
    
    ```bash
    ./n
    ```
    
5. To stop both services, use `Ctrl+C` in both active sessions.
    

## Step 6 — Connecting to the Server

1. Open Minecraft.
2. Select **Multiplayer** → **Direct Connection** and paste the access link obtained from Ngrok.
3. Connect and have fun!

---

### Sources

1. [XDA Developers — Run Minecraft Server on Android](https://www.xda-developers.com/run-minecraft-server-android/)
2. [Reddit — Hosting a Minecraft Server on Android](https://www.reddit.com/r/Android/comments/glr4gc/hosting_a_minecraft_server_on_android_20/?rdt=57465) — _contains more information, such as connecting via SSH, importing previously created worlds, installing Forge, and much more._
3. [Termux Wiki — Hardware Keyboard](https://wiki.termux.com/wiki/Hardware_Keyboard) 

[Original Post in LinkedIn](https://www.linkedin.com/posts/ugcPost-7390227348110954496-OWa0/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD35xZwBUhYqcLdrd2oPUKqiV2XwWJxL0C0)

[[🏡 Home Page\|< Back]]

:::