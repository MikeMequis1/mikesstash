---
{"dg-publish":true,"permalink":"/other-projects-and-tutorials/ocarina-of-time-server-in-android-2025/","title":{"pt":"⚔️ Servidor Ocarina of Time no Android (2025)","en":"⚔️ Ocarina of Time Server in Android (2025)"},"dg-note-properties":{"title":{"pt":"⚔️ Servidor Ocarina of Time no Android (2025)","en":"⚔️ Ocarina of Time Server in Android (2025)"},"navOrder":2}}
---

![ZeldaServer.gif](/img/user/img/ZeldaServer.gif)

:::lang pt
# ⚔️ Como Hospedar um Servidor de Ocarina of Time/Ship of Harkinian no Android

Quer jogar o lendário *The Legend of Zelda - Ocarina of Time* com seus amigos? Tudo o que precisa é de um celular Android, a configuração de um servidor leve de Linux e poucos minutos de seu tempo.

> [!tip] Aconselhável possuir conexão estável para baixar e instalar programas necessários, além de manter os serviços ativos, e conectar um teclado físico (via Bluetooth ou cabo OTG). Também é possível usar o app **Hacker's Keyboard** ou configurar e conectar via SSH.

> [!question] **Diferentemente do servidor de Minecraft, não é necessário um celular muito potente**, pois a quantidade necessária de memória RAM é aproximadamente entre **256 e 512 MB**.

## Etapa 1 — Repita o Mesmo Procedimento do Servidor Anterior

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

> [!question] Por algum motivo, o Ubuntu instalado não possui esses dois comandos instalados por padrão.

Instale também o Git e o Deno:

```bash
apt install git   # Utilizado para clonar o repositório contendo o projeto do servidor

curl -fsSL https://deno.land/install.sh | sh -s v1.46.3   # Aplicação responsável pela execução do servidor e das sessões
```

> **Instalação:** Você pode selecionar uma outra versão do Deno, contanto que seja **anterior a 2.0.0**.

Certifique-se da instalação com:

```bash
deno -version
```

## Etapa 3 — Configurando o Servidor Anchor

1. Clone (transfira) o repositório do GitHub e acesse a nova pasta criada:
    
    ```bash
    git clone https://github.com/garrettjoecox/anchor.git && cd anchor
    ```
    
2. Inicialize o servidor sem alterações, utilizando a porta padrão `43385`:
    
    ```bash
    deno run --allow-all mod.ts
    ```
    
3. Para executar em uma porta específica (caso queira usar a mesma do Minecraft, por exemplo):
    
    ```bash
    PORT={Nº da porta} deno run --allow-all mod.ts
    ```
    
4. Você pode realizar alterações no código editando o arquivo `mod.ts` na pasta `anchor`. Porém, o servidor já está funcional sem modificações.
    
5. O servidor estará ativo quando a seguinte mensagem for exibida:
    
    ```
    [Server]: Server Started on port {Nº da porta ativa}
    ```
    
6. Para encerrar o servidor:
    
    ```
    Ctrl+C
    ```
    

## Etapa 4 — Configurando o Ngrok (Repita o Procedimento do Servidor Anterior)

1. Acesse [ngrok.com](https://ngrok.com/).
    
2. Crie uma conta e faça login.
    
3. Na página **Dashboard**, selecione **Linux** em **Agents**.
    
4. Copie e cole o comando `curl` fornecido pelo site para instalar. Caso não funcione, use:
    
    ```bash
    apt install ngrok
    ```
    
5. Após instalar o programa, copie e cole o comando contendo o **Token de Autenticação** fornecido pelo site (algo parecido com isto):
    
    ```bash
    ngrok config add-authtoken [...]
    ```
    
6. Gere um link de acesso ao servidor:
    
    ```bash
    ngrok tcp 25565
    ```
    
    > [!question] Cada vez que é inicializado, o link gerado é diferente. O site requer o cadastro de um cartão de crédito, mas este serviço **não é cobrado** — serve apenas para verificar a identidade do usuário como pessoa física (assim como a Oracle faz).
    
    > [!tip] **IMPORTANTE:** Caso queira utilizar a porta `25565` para abrir a conexão ao servidor, **não execute simultaneamente** com o servidor Minecraft ou qualquer outro serviço que esteja utilizando esta porta. Caso queira registrar em outra porta, altere `25565` para outra. O padrão utilizado pelo Anchor é `43385`.
    
7. Se aparecer **"Status da sessão online"** em verde, a autenticação foi bem-sucedida. O link de acesso está na linha **Forwarding**. Copie a parte no formato:
    
    ```
    0.tcp.ngrok.io:12345
    ```
    

## Etapa 5 — Automatizando a Inicialização

1. Se os dois serviços estiverem funcionando corretamente, é necessário mantê-los ativos simultaneamente. Abra uma nova sessão apertando `Ctrl+Alt+C`.
    
2. Alterne entre as sessões com `Ctrl+Alt+↑/↓` ou `Ctrl+Alt+P/N`. Você também pode fazer isso pela aba do Termux.
    
3. Para simplificar, crie arquivos sem extensão para iniciar o servidor Anchor e o serviço do Ngrok:
    
    **Script do Anchor:**
    
    ```bash
    nano z
    ```
    
    Conteúdo:
    
    ```bash
    #!/bin/bash
    cd ./anchor
    PORT={Nº da porta} deno run --allow-all mod.ts
    ```
    
    Salve (`Ctrl+S`), saia (`Ctrl+X`) e dê permissão:
    
    ```bash
    chmod +x z
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
    ./z
    ```
    
    ```bash
    ./n
    ```
    
5. Para encerrar os dois serviços, use `Ctrl+C` nas duas sessões ativas.
    

## Etapa 6 — Instalação do Ship of Harkinian

> O acesso ao servidor é realizado por meio de um build personalizado do programa, feito pelo próprio usuário **garrettjoecox**. Pule para a próxima etapa caso já tenha instalado.

1. Acesse [github.com/garrettjoecox/OOT/pull/64](https://github.com/garrettjoecox/OOT/pull/64) e baixe o `.zip` da aplicação no item **Build Artifacts**, de acordo com o sistema operacional do seu PC.
2. Descompacte o `.zip` e realize o processo de instalação do jogo. Você precisa obter o arquivo **ROM** do jogo — deve ser a **versão europeia** para funcionar corretamente.
3. Ao iniciar `soh.exe` pela primeira vez, ele solicitará a criação dos arquivos **OTR** e a localização da ROM. Aceite a criação, localize seu arquivo ROM e deixe o programa descompactar os assets do jogo.
4. Terminado o processo, execute `soh.exe` novamente e o jogo iniciará com as configurações padrão.

### Etapa 6.1 [OPCIONAL] — Configurações Adicionais

- **Configurações:** Pressionando `F1` é exibido um menu com opções como **Enhancements** (melhorias) e **Settings** (configurações gerais, incluindo controle). Por exemplo, é possível jogar sem limitação de FPS e com suporte a teclado e mouse.
    
- **Mods:** Você pode personalizar a aparência do jogo instalando modificações na pasta `mods`. Acesse [gamebanana.com/mods/games/16121](https://gamebanana.com/mods/games/16121) para ver diferentes opções feitas pela comunidade. Para alternar o uso dos mods durante o jogo, pressione `TAB` ou ative a opção **Enable Alternate Assets** no menu **Enhancements**.
    
    > [!tip] Os mods são aplicados localmente, na instalação do seu jogo — portanto, **não afetam os outros jogadores**.
    

## Etapa 7 — Conectando ao Servidor

1. Pressione `F1` para exibir o menu de configurações e abra a aba **Network**.
2. Insira as seguintes configurações:
    - **Remote Interaction Scheme:** selecione `Anchor`.
    - **Remote IP & Port:** escreva o endereço `0.tcp.ngrok.io` no primeiro campo e a porta no segundo.
    - **Outras configurações:** você pode alternar a cor do seu personagem para diferenciar de outros jogadores ativos, definir seu nome e o ID da sala. Também é possível ativar/desativar janelas de localização dos jogadores (**Player Location Window**) e de ações realizadas no servidor (**Incoming Item Window**).
3. Realizadas as configurações, selecione **Enable** para conectar-se ao servidor. Caso não funcione, verifique as configurações e se o servidor está rodando normalmente.

> [!tip] **IMPORTANTE:** Jogadores devem possuir um arquivo de save criado e carregado antes de acessar o servidor, preferencialmente no mesmo ponto de partida, para que todos estejam alinhados na progressão do jogo. Caso esteja jogando no modo **Randomizer**, é importante que os jogadores utilizem a mesma _seed_. 

Se tudo der certo, jogue e seja feliz!

---

### Fontes

1. [GitHub — garrettjoecox/OOT Pull Request_#64](https://github.com/garrettjoecox/OOT/pull/64)
2. [GitHub — garrettjoecox/anchor](https://github.com/garrettjoecox/anchor) — _contém mais informações, como alterar configurações de conexão, usar Docker, etc._
3. [Deno — Guia de Instalação](https://docs.deno.com/runtime/getting_started/installation/)
4. [GameBanana — Ocarina of Time Mods](https://gamebanana.com/mods/games/16121)
5. YouTube — Ocarina of Time Multiplayer Setup — pelo canal _A Couple of Average Gamers_ 
	https://www.youtube.com/watch?v=9YLnUKaJPVU

[Post Original do LinkedIn](https://www.linkedin.com/posts/ugcPost-7390227348110954496-OWa0/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD35xZwBUhYqcLdrd2oPUKqiV2XwWJxL0C0)

[[🏡 Home Page\|< Voltar]]

:::

:::lang en
# ⚔️ How to Host an Ocarina of Time/Ship of Harkinian Server on Android

Want to play the legendary *The Legend of Zelda - Ocarina of Time* with your friends? All that is necessary is an Android phone, a lightweight Linux server configuration and a few minutes of your time.

> [!tip] It's advisable to have a stable connection to download and install the necessary programs, keep the services running, and connect a physical keyboard (via Bluetooth or an OTG cable). You can also use the **Hacker's Keyboard** app or set up and connect via SSH.

> [!question] **Unlike the Minecraft server, you don't need a very powerful phone**, since the amount of RAM required is roughly between **256 and 512 MB**.

## Step 1 — Repeat the Same Procedure as the Previous Server

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

> [!question] For some reason, the installed Ubuntu doesn't come with these two commands by default.

Also install Git and Deno:

```bash
apt install git   # Used to clone the repository containing the server project
curl -fsSL https://deno.land/install.sh | sh -s v1.46.3   # Application responsible for running the server and sessions
```

> **Installation:** You can select a different Deno version, as long as it's **earlier than 2.0.0**.

Confirm the installation with:

```bash
deno -version
```

## Step 3 — Setting Up the Anchor Server

1. Clone (transfer) the GitHub repository and go into the newly created folder:
    
    ```bash
    git clone https://github.com/garrettjoecox/anchor.git && cd anchor
    ```
    
2. Start the server with no changes, using the default port `43385`:
    
    ```bash
    deno run --allow-all mod.ts
    ```
    
3. To run on a specific port (in case you want to use the same one as Minecraft, for example):
    
    ```bash
    PORT={port number} deno run --allow-all mod.ts
    ```
    
4. You can make changes to the code by editing the `mod.ts` file in the `anchor` folder. However, the server already works fine without modifications.
    
5. The server will be active once the following message appears:
    
    ```
    [Server]: Server Started on port {active port number}
    ```
    
6. To stop the server:
    
    ```
    Ctrl+C
    ```
    

## Step 4 — Setting Up Ngrok (Repeat the Procedure from the Previous Server)

1. Go to [ngrok.com](https://ngrok.com/).
    
2. Create an account and log in.
    
3. On the **Dashboard** page, select **Linux** under **Agents**.
    
4. Copy and paste the `curl` install command provided by the site. If it doesn't work, use:
    
    ```bash
    apt install ngrok
    ```
    
5. After installing the program, copy and paste the command containing the **Auth Token** provided by the site (something like this):
    
    ```bash
    ngrok config add-authtoken [...]
    ```
    
6. Generate an access link to the server:
    
    ```bash
    ngrok tcp 25565
    ```
    
    > [!question] Each time it's started, the generated link is different. The site requires registering a credit card, but this service **is not charged** — it's only used to verify the user's identity as a real person (the same way Oracle does).
    
    > [!tip] **IMPORTANT:** If you want to use port `25565` to open the connection to the server, **do not run it at the same time** as the Minecraft server or any other service using this port. If you want to register on another port, change `25565` to a different one. The default used by Anchor is `43385`.
    
7. If **"Session Status: online"** appears in green, authentication was successful. The access link is on the **Forwarding** line. Copy the part in the format:
    
    ```
    0.tcp.ngrok.io:12345
    ```
    

## Step 5 — Automating Startup

1. If both services are working correctly, you need to keep them running simultaneously. Open a new session by pressing `Ctrl+Alt+C`.
    
2. Switch between sessions with `Ctrl+Alt+↑/↓` or `Ctrl+Alt+P/N`. You can also do this from the Termux tab.
    
3. To simplify things, create extensionless files to start the Anchor server and the Ngrok service:
    
    **Anchor script:**
    
    ```bash
    nano z
    ```
    
    Content:
    
    ```bash
    #!/bin/bash
    cd ./anchor
    PORT={port number} deno run --allow-all mod.ts
    ```
    
    Save (`Ctrl+S`), exit (`Ctrl+X`), and grant permission:
    
    ```bash
    chmod +x z
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
    ./z
    ```
    
    ```bash
    ./n
    ```
    
5. To stop both services, use `Ctrl+C` in both active sessions.
    

## Step 6 — Installing Ship of Harkinian

> Access to the server is done through a custom build of the program made by the user **garrettjoecox** themselves. Skip to the next step if you've already installed it.

1. Go to [github.com/garrettjoecox/OOT/pull/64](https://github.com/garrettjoecox/OOT/pull/64) and download the app's `.zip` from the **Build Artifacts** item, matching your PC's operating system.
2. Unzip the `.zip` file and go through the game's install process. You'll need to obtain the game's **ROM** file — it must be the **European version** to work correctly.
3. The first time you launch `soh.exe`, it will ask you to create the **OTR** files and locate the ROM. Accept the creation, locate your ROM file, and let the program unpack the game's assets.
4. Once finished, run `soh.exe` again and the game will start with the default settings.

### Step 6.1 [OPTIONAL] — Additional Settings

- **Settings:** Pressing `F1` shows a menu with options like **Enhancements** and **Settings** (general settings, including controls). For example, you can play with no FPS cap and with keyboard/mouse support.
    
- **Mods:** You can customize the game's appearance by installing modifications in the `mods` folder. Go to [gamebanana.com/mods/games/16121](https://gamebanana.com/mods/games/16121) to see different options made by the community. To toggle mod usage during gameplay, press `TAB` or enable the **Enable Alternate Assets** option in the **Enhancements** menu.
    
    > [!tip] Mods are applied locally, on your own game install — so they **don't affect other players**.
    

## Step 7 — Connecting to the Server

1. Press `F1` to bring up the settings menu and open the **Network** tab.
2. Enter the following settings:
    - **Remote Interaction Scheme:** select `Anchor`.
    - **Remote IP & Port:** enter `0.tcp.ngrok.io` in the first field and the port in the second.
    - **Other settings:** you can change your character's color to set yourself apart from other active players, set your name and the room ID. You can also enable/disable the **Player Location Window** and the **Incoming Item Window**.
3. Once configured, select **Enable** to connect to the server. If it doesn't work, check your settings and whether the server is running properly.

> [!tip] **IMPORTANT:** Players should have a save file created and loaded before joining the server, preferably at the same starting point, so everyone is aligned in game progression. If you're playing in **Randomizer** mode, it's important that players use the same _seed_. 

If everything works, play and have fun!

---

### Sources

1. [GitHub — garrettjoecox/OOT Pull Request_#64](https://github.com/garrettjoecox/OOT/pull/64)
2. [GitHub — garrettjoecox/anchor](https://github.com/garrettjoecox/anchor) — _contains more information, such as changing connection settings, using Docker, etc._
3. [Deno — Installation Guide](https://docs.deno.com/runtime/getting_started/installation/)
4. [GameBanana — Ocarina of Time Mods](https://gamebanana.com/mods/games/16121)
5. YouTube — Ocarina of Time Multiplayer Setup — by the channel _A Couple of Average Gamers_  
	https://www.youtube.com/watch?v=9YLnUKaJPVU  

[Original Post in LinkedIn](https://www.linkedin.com/posts/ugcPost-7390227348110954496-OWa0/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD35xZwBUhYqcLdrd2oPUKqiV2XwWJxL0C0)

[[🏡 Home Page\|< Back]]

:::