# Jogo do Bixo
Este projeto é uma atividade de projeto final para a disciplina de Programação Web. Este software é uma simulação do "Jogo do Bicho" criada exclusivamente para fins acadêmicos.


## Arquitetura do Projeto
O projeto utiliza uma arquitetura modular baseada em features (Feature-Based Architecture). Essa abordagem organiza o código por funcionalidade de negócio (users, games, animals) em vez de por tipo de arquivo (controllers, models).

Essa estrutura é muito parecida com o padrão MVC.

## Estrutura
```
/jogo-bixo
├── .vscode/              # Configurações do editor
├── biome.json            # Configuração do Biome (Linter/Formatter)
├── package.json
├── tsconfig.base.json    # O tsconfig base para todos os pacotes
│
├── packages/
│   ├── backend/          # 📦 Backend (Elysia.js)
│   │   ├── src/
│   │   │   ├── features/ # Cada funcionalidade (Usuários, Apostas, etc.)
│   │   │   ├── helpers/  # Funções auxiliares
│   │   │   ├── plugins/  # Plugins do Elysia (DB, Logger)
│   │   │   └── index.ts  # Entrypoint do servidor
│   │   └── package.json
│   │
│   └── frontend/         # 📦 Frontend (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── App.tsx
│       ├── .env.example  # Exemplo de variáveis de ambiente
│       └── package.json
│
└── schema/               # 📦 Pacote Compartilhado
    ├── src/              # Schemas Zod e tipos compartilhados do TypeScript
    └── package.json
```

## Como Iniciar o Projeto
Siga estes passos para configurar e rodar o ambiente de desenvolvimento.

### Pré-requisitos

- Node.js (v20+ recomendado)
- npm (v7+ ou superior para suporte a workspaces)

### 1. Instalação
Clone o repositório e instale todas as dependências rodando o comando na pasta raiz do projeto:
```bash
git clone https://github.com/rodriigo-rocha/jogo-bixo.git
cd jogo-bixo
npm install
```

### 2. DB
Este projeto utiliza uma db local SQLite via Drizzle ORM. Você precisa que o arquivo da DB seja criado e os modelos carregados.
```bash
npm run db:create
```

### 3. Rodando
Este comando irá iniciar o backend e o frontend ao mesmo tempo usando concurrently.
```bash
npm run dev
```
