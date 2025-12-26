```markdown
# ⚔️ Type Hero

![Badge Status](https://img.shields.io/badge/STATUS-FINALIZADO-green)
![Badge PHP](https://img.shields.io/badge/Backend-PHP_Native-purple)
![Badge Phaser](https://img.shields.io/badge/Frontend-Phaser.js-blue)
![Badge MySQL](https://img.shields.io/badge/Database-MySQL-orange)

> **Um RPG de turno baseado em digitação, onde suas palavras são suas armas.**

![Screenshot do Jogo](caminho/para/imagem_ou_gif_do_gameplay.png)
*(Substitua este link por um print ou GIF do jogo rodando)*

## 📖 Sobre o Projeto

**Type Hero** é um jogo web que mistura mecânicas de RPG clássico com desafios de digitação rápida. O objetivo é testar a velocidade e precisão do jogador em um ambiente de batalha por turnos.

Diferente de jogos de digitação tradicionais, aqui você precisa gerenciar o seu ataque e defesa sob pressão de tempo, enquanto progride através de um sistema de ligas competitivas.

### 🎮 Mecânicas Principais
* **Combate por Turnos:**
    * 🛡️ **Defesa:** Digite um bloco de palavras dentro do tempo limite para bloquear o ataque inimigo.
    * ⚔️ **Ataque:** Digite palavras aleatórias rapidamente para causar dano ao oponente.
* **Sistema de Ligas:** O jogador escolhe uma Liga antes de iniciar a *run*. O objetivo é chegar o mais longe possível com apenas **uma vida** (estilo Roguelike).
* **Ranking:** Tabelas de classificação **Semanal** e **Geral** para cada liga.
* **Progressão:** Inimigos e palavras tornam-se progressivamente mais difíceis conforme você avança.

---

## 🛠 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando tecnologias nativas, visando leveza e performance, sem dependência de frameworks pesados no backend ou gerenciadores de pacotes complexos.

* **Frontend:**
    * HTML5 & CSS3
    * JavaScript (ES6+)
    * [Phaser 3](https://phaser.io/) (Engine gráfica)
* **Backend:**
    * PHP (Nativo/Vanilla) - API RESTful
* **Banco de Dados:**
    * MySQL

---

## ⚙️ Pré-requisitos

Para rodar este projeto localmente, você precisará de um ambiente de servidor web com suporte a PHP e MySQL. Recomenda-se:

* [XAMPP](https://www.apachefriends.org/pt_br/index.html) (Apache + MySQL)
* Navegador Web Moderno (Chrome, Firefox, Edge)

---

## 🚀 Instalação e Configuração

Siga os passos abaixo para rodar o jogo na sua máquina:

### 1. Clonar o Repositório
Baixe o projeto para dentro da pasta pública do seu servidor (no XAMPP, geralmente é `htdocs`).

```bash
cd C:/xampp/htdocs
git clone [https://github.com/nicolas-mendes/type-hero.git](https://github.com/nicolas-mendes/type-hero)

```

### 2. Configurar Variáveis de Ambiente

O backend precisa saber quais credenciais usar. Vá até a pasta `backend/`:

1. Duplique ou renomeie o arquivo `.env.example` para `.env`.
2. Abra o arquivo `.env` e configure conforme seu ambiente local:


### 3. Criação Automática do Banco e Tabelas

Não é necessário criar o banco manualmente. O script de setup verifica se a database existe; se não, ele a cria automaticamente junto com todas as tabelas.

Acesse a seguinte URL utilizando a chave MIGRATION_KEY como parametro (caso ela não seja definida no .env, será 'admin' por padrão) no seu navegador para rodar a instalação:
`http://localhost/type-hero/backend/endpoints/setup_database.php?key=MIGRATION_KEY`

> ✅ Se tudo der certo, você verá uma mensagem confirmando a criação do banco e das tabelas.

### 4. Popular o Mundo (Seed)

Para que o jogo não comece vazio, execute o script de "seeding". Ele irá instanciar os monstros iniciais, os mundos e as configurações das ligas.

Acesse:
`http://localhost/type-hero/backend/endpoints/seed_database.php`

---

## 🕹️ Como Jogar

Com o ambiente configurado, basta acessar o frontend:

1. Abra o navegador e vá para: `http://localhost/type-hero/frontend/`
2. Faça seu **Cadastro** ou **Login**.
3. No menu principal, selecione **"Jogar"**.
4. Escolha uma **Liga** disponível.
5. Prepare os dedos e boa sorte!

---

## 📂 Estrutura de Pastas

Uma visão geral de como o código está organizado:

type-hero/
├── backend/
│   ├── endpoints/       # API (Auth, Game Logic, Leagues)
│   │   ├── auth/        # Login, Registro e Sessão
│   │   ├── game/        # Lógica de combate e progresso
│   │   ├── league/      # Gerenciamento de ligas e ranking
│   │   ├── setup_database.php # Criação do DB e Tabelas
│   │   └── seed_database.php  # População inicial de dados
│   └── .env             # Configurações de Banco
│
├── frontend/
│   ├── assets/          # Recursos visuais (HTMLs de UI, Imagens)
│   ├── src/             # Lógica do jogo
│   │   ├── game/        # Classes (Player, Enemy, TypingInput)
│   │   ├── scenes/      # Cenas do Phaser (Menu, Jogo, Ligas)
│   │   └── api_client.js # Comunicação com o Backend
│   ├── phaser.js        # Core do Phaser
│   └── index.html       # Ponto de entrada da aplicação
│
└── README.md

---

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais como forma de estudo. Sinta-se livre para estudar o código, fazer forks ou contribuir.
Feito por [Nicolas Mendes](https://github.com/nicolas-mendes)
Feito por [Mateus Gabriel](https://github.com/Mateusgpk)
Feito por [Rafael Tsuji](https://github.com/rafaeltsujiuchida)

---