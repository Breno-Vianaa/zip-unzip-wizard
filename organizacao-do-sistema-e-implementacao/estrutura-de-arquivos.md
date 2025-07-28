# 📂 Estrutura Detalhada de Arquivos - Sistema BVOLT

## 🎯 Visão Geral da Organização

O sistema BVOLT está organizado seguindo as melhores práticas de separação entre frontend e backend, com documentação completa e estrutura modular.

## 📁 Frontend (/frontend)

### 📄 Arquivos de Configuração
- **`package.json`** - Dependências e scripts do React
- **`vite.config.ts`** - Configuração do Vite (build tool)
- **`tsconfig.json`** - Configuração do TypeScript
- **`tailwind.config.js`** - Configuração do Tailwind CSS
- **`postcss.config.js`** - Configuração do PostCSS
- **`index.html`** - Template HTML principal

### 🗂️ Pasta src/
```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   ├── forms/           # Formulários específicos
│   ├── charts/          # Componentes de gráficos
│   └── layout/          # Componentes de layout (Header, Sidebar)
│
├── contexts/            # Contextos React
│   ├── AuthContext.tsx  # Gerenciamento de autenticação
│   └── ThemeContext.tsx # Gerenciamento de tema
│
├── pages/               # Páginas principais
│   ├── Login.tsx        # Página de login
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── Products.tsx     # Gestão de produtos
│   ├── Sales.tsx        # Gestão de vendas
│   ├── Clients.tsx      # Gestão de clientes
│   ├── Suppliers.tsx    # Gestão de fornecedores
│   ├── Stock.tsx        # Controle de estoque
│   └── Reports.tsx      # Relatórios
│
├── hooks/               # Hooks customizados
│   ├── useAuth.ts       # Hook de autenticação
│   ├── useApi.ts        # Hook para requisições API
│   └── useLocalStorage.ts # Hook para localStorage
│
├── lib/                 # Utilitários e configurações
│   ├── api.ts           # Configuração do cliente HTTP
│   ├── utils.ts         # Funções utilitárias
│   ├── validators.ts    # Validadores customizados
│   └── constants.ts     # Constantes da aplicação
│
├── types/               # Definições de tipos TypeScript
│   ├── auth.ts          # Tipos de autenticação
│   ├── product.ts       # Tipos de produtos
│   ├── sale.ts          # Tipos de vendas
│   └── api.ts           # Tipos das APIs
│
├── assets/              # Recursos estáticos
│   ├── images/          # Imagens
│   ├── icons/           # Ícones personalizados
│   └── fonts/           # Fontes customizadas
│
├── styles/              # Estilos globais
│   ├── globals.css      # Estilos CSS globais
│   └── components.css   # Estilos de componentes
│
└── App.tsx              # Componente raiz da aplicação
```

### 🎨 Sistema de Design
- **Tailwind CSS**: Framework CSS utilitário para estilização
- **Radix UI**: Componentes acessíveis e sem estilo
- **Lucide React**: Biblioteca de ícones
- **Responsive Design**: Adaptação para mobile, tablet e desktop

## 🔧 Backend (/backend)

### 📄 Arquivos de Configuração
- **`package.json`** - Dependências e scripts do Node.js
- **`server.js`** - Servidor principal Express
- **`.env`** - Variáveis de ambiente (não versionado)
- **`.env.example`** - Exemplo de variáveis de ambiente

### 🗂️ Pasta src/
```
src/
├── routes/              # Definição de rotas da API
│   ├── auth.js          # Rotas de autenticação
│   ├── users.js         # CRUD de usuários
│   ├── products.js      # CRUD de produtos
│   ├── categories.js    # CRUD de categorias
│   ├── suppliers.js     # CRUD de fornecedores
│   ├── clients.js       # CRUD de clientes
│   ├── sales.js         # CRUD de vendas
│   ├── stock.js         # Controle de estoque
│   ├── config.js        # Configurações do sistema
│   └── reports.js       # Geração de relatórios
│
├── middlewares/         # Middlewares personalizados
│   ├── auth.js          # Autenticação JWT
│   ├── validation.js    # Validação de dados
│   ├── errorHandler.js  # Tratamento de erros
│   └── rateLimiter.js   # Limitação de requisições
│
├── database/            # Configuração do banco
│   ├── connection.js    # Pool de conexões PostgreSQL
│   ├── migrations.js    # Migrações do banco
│   └── seeders.js       # Dados iniciais
│
├── utils/               # Funções utilitárias
│   ├── encryption.js    # Criptografia de dados
│   ├── validators.js    # Validadores brasileiros (CPF, CNPJ)
│   ├── formatters.js    # Formatadores (moeda, data)
│   └── emailService.js  # Serviço de email
│
└── controllers/         # Lógica de negócio
    ├── authController.js    # Lógica de autenticação
    ├── userController.js    # Lógica de usuários
    ├── productController.js # Lógica de produtos
    └── reportController.js  # Lógica de relatórios
```

### 🗄️ Pasta database/
```
database/
├── setup.sh             # Script de configuração automática
├── create_tables.sql    # Criação das tabelas
├── triggers.sql         # Triggers do banco de dados
├── seed_data.sql        # Dados iniciais para teste
└── backup/              # Scripts de backup
    ├── backup.sh         # Backup automático
    └── restore.sh        # Restauração de backup
```

## 📚 Documentação (/organizacao-do-sistema-e-implementacao)

### 📄 Arquivos de Documentação
- **`README.md`** - Visão geral do sistema
- **`passo-a-passo-implementacao.md`** - Guia de instalação
- **`estrutura-de-arquivos.md`** - Este arquivo
- **`explicacoes-tecnicas.md`** - Detalhes técnicos
- **`regras-de-negocio.md`** - Regras específicas do Brasil
- **`api-documentation.md`** - Documentação da API

## 🎯 Funcionalidades (/documentacao-de-funcionalidades)

### 📄 Documentação do Usuário
- **`autenticacao.md`** - Sistema de login/logout
- **`dashboard.md`** - Painel principal
- **`gestao-produtos.md`** - Gerenciamento de produtos
- **`gestao-vendas.md`** - Processo de vendas
- **`gestao-clientes.md`** - Cadastro de clientes
- **`gestao-fornecedores.md`** - Cadastro de fornecedores
- **`controle-estoque.md`** - Gestão de inventário
- **`relatorios.md`** - Sistema de relatórios

## 🔒 Arquivos de Segurança

### 🛡️ Configurações de Segurança
- **`.env`** - Variáveis sensíveis (não versionado)
- **`.gitignore`** - Arquivos ignorados pelo Git
- **`helmet.config.js`** - Configuração de headers de segurança
- **`cors.config.js`** - Configuração de CORS

## 📦 Arquivos de Deploy

### 🚀 Configurações de Produção
- **`Dockerfile`** - Container Docker
- **`docker-compose.yml`** - Orquestração de containers
- **`nginx.conf`** - Configuração do proxy reverso
- **`pm2.config.js`** - Gerenciador de processos

## 🧪 Arquivos de Teste

### ✅ Testes Automatizados
```
tests/
├── frontend/
│   ├── components/      # Testes de componentes
│   ├── pages/           # Testes de páginas
│   └── integration/     # Testes de integração
│
└── backend/
    ├── routes/          # Testes de rotas
    ├── middlewares/     # Testes de middlewares
    └── database/        # Testes de banco
```

## 📊 Logs e Monitoramento

### 📈 Arquivos de Log
```
logs/
├── app.log              # Logs da aplicação
├── error.log            # Logs de erro
├── access.log           # Logs de acesso
└── database.log         # Logs do banco
```

## 🔄 Integração Contínua

### ⚡ CI/CD
- **`.github/workflows/`** - GitHub Actions
- **`jest.config.js`** - Configuração de testes
- **`eslint.config.js`** - Configuração do linter
- **`prettier.config.js`** - Configuração do formatador

## 📱 Responsividade

### 🎨 Breakpoints Tailwind
- **`sm`**: 640px - Smartphones
- **`md`**: 768px - Tablets
- **`lg`**: 1024px - Laptops
- **`xl`**: 1280px - Desktops
- **`2xl`**: 1536px - Telas grandes

## 🌐 Internacionalização

### 🇧🇷 Localização Brasileira
- **Moeda**: Real brasileiro (R$)
- **Data**: dd/mm/yyyy
- **Hora**: HH:mm:ss
- **Timezone**: America/Sao_Paulo
- **Idioma**: Português brasileiro
- **Validações**: CPF, CNPJ, CEP
- **Formatações**: Telefone, CEP, documentos