# 🚀 Sistema BVOLT - Documentação Técnica

## 📋 Visão Geral

O BVOLT é um sistema ERP moderno e completo desenvolvido especificamente para o mercado brasileiro. Esta documentação técnica fornece todas as informações necessárias para instalação, configuração, desenvolvimento e manutenção do sistema.

### 🎯 Principais Características Técnicas

- **Arquitetura Moderna**: Frontend React + Backend Node.js
- **Autenticação Segura**: JWT com sistema de permissões granulares
- **Scanner Integrado**: Código de barras para gestão de estoque
- **Relatórios Avançados**: Geração de PDFs com gráficos
- **API RESTful**: Endpoints bem documentados para integração
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **Localização BR**: Validação CPF/CNPJ, CEP, formatação de moeda

## 🏗️ Arquitetura do Sistema

### Frontend (/frontend)
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Radix UI + Tailwind CSS
- **Gerenciamento de Estado**: Context API + React Query
- **Roteamento**: React Router DOM
- **Validação**: Zod + React Hook Form

### Backend (/backend)
- **Runtime**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT + bcryptjs
- **Validação**: Express Validator
- **Segurança**: Helmet + CORS
- **Upload de Arquivos**: Multer

## 📂 Estrutura Detalhada do Projeto

```
bvolt-commerce-system/
├── frontend/                     # 🎨 Interface React + TypeScript
│   ├── src/
│   │   ├── components/          # 🧩 Componentes Reutilizáveis
│   │   │   ├── ui/             # Componentes básicos (Radix UI)
│   │   │   ├── charts/         # Gráficos e visualizações
│   │   │   ├── modals/         # Modais e dialogs
│   │   │   ├── vendas/         # Componentes específicos de vendas
│   │   │   ├── usuarios/       # Gestão de usuários e permissões
│   │   │   ├── relatorios/     # Sistema de relatórios
│   │   │   └── estoque/        # Scanner e gestão de estoque
│   │   ├── contexts/           # 🔄 Estado Global
│   │   │   └── AuthContext.tsx # Autenticação e permissões
│   │   ├── pages/              # 📄 Páginas Principais
│   │   │   ├── Index.tsx       # Login/Dashboard redirect
│   │   │   └── NotFound.tsx    # Página 404
│   │   ├── hooks/              # 🪝 Hooks Customizados
│   │   │   ├── useAuth.ts      # Hook de autenticação
│   │   │   ├── useTheme.ts     # Tema claro/escuro
│   │   │   └── useToast.ts     # Notificações
│   │   ├── utils/              # 🛠️ Utilitários
│   │   │   ├── validators.ts   # Validação CPF/CNPJ/CEP
│   │   │   ├── formatters.ts   # Formatação de dados
│   │   │   └── reportGenerators.ts # Geração de PDFs
│   │   ├── types/              # 📝 Tipos TypeScript
│   │   └── assets/             # 🖼️ Imagens e ícones
│   ├── public/                 # Arquivos estáticos
│   └── package.json            # Dependências
│
├── backend/                      # ⚙️ API Node.js + Express
│   ├── src/
│   │   ├── routes/             # 🛣️ Rotas da API
│   │   │   ├── auth.js         # Autenticação e sessões
│   │   │   ├── products.js     # CRUD de produtos
│   │   │   ├── sales.js        # Gestão de vendas
│   │   │   ├── clients.js      # Gestão de clientes
│   │   │   ├── suppliers.js    # Gestão de fornecedores
│   │   │   ├── stock.js        # Controle de estoque
│   │   │   ├── finance.js      # Módulo financeiro
│   │   │   ├── payments.js     # Gateway de pagamentos
│   │   │   ├── reports.js      # Geração de relatórios
│   │   │   └── users.js        # Gestão de usuários
│   │   ├── middlewares/        # 🛡️ Middlewares
│   │   │   ├── auth.js         # Verificação JWT
│   │   │   ├── permissions.js  # Controle de permissões
│   │   │   └── validation.js   # Validação de dados
│   │   ├── database/           # 🗄️ Configuração BD
│   │   │   ├── connection.js   # Conexão PostgreSQL
│   │   │   └── migrations/     # Migrações do banco
│   │   ├── utils/              # 🔧 Utilitários Backend
│   │   │   ├── validators.js   # Validações brasileiras
│   │   │   ├── encryption.js   # Criptografia
│   │   │   └── logger.js       # Sistema de logs
│   │   └── server.js           # 🚀 Servidor principal
│   ├── database/               # 💾 Scripts SQL
│   │   ├── create_tables.sql   # Estrutura do banco
│   │   ├── triggers.sql        # Triggers e procedures
│   │   ├── seed_data.sql       # Dados iniciais
│   │   └── setup.sh           # Script de instalação
│   ├── uploads/               # 📁 Arquivos enviados
│   └── package.json           # Dependências backend
│
├── documentacao-de-funcionalidades/ # 📚 Docs para Usuários
└── organizacao-do-sistema-e-implementacao/ # 🔧 Docs Técnicas
```

## 🛠️ Stack Tecnológica Completa

### 🎨 Frontend (React + TypeScript)
- **React 18**: Framework principal com hooks modernos
- **TypeScript**: Tipagem estática para maior segurança
- **Vite**: Build tool ultra-rápido para desenvolvimento
- **Tailwind CSS**: Framework CSS utilitário com design system customizado
- **Radix UI**: Componentes acessíveis e primitivos de UI
- **React Query**: Cache inteligente e sincronização de dados
- **React Router DOM**: Navegação SPA com roteamento aninhado
- **React Hook Form**: Formulários performáticos com validação
- **Zod**: Validação de esquemas TypeScript-first
- **Lucide React**: Biblioteca de ícones SVG consistente
- **Recharts**: Gráficos e visualizações interativas
- **jsPDF**: Geração de relatórios PDF no cliente
- **date-fns**: Manipulação avançada de datas

### ⚙️ Backend (Node.js + Express)
- **Node.js 18+**: Runtime JavaScript otimizado
- **Express.js**: Framework web minimalista e flexível
- **PostgreSQL**: Banco de dados relacional robusto
- **JWT**: Autenticação stateless com refresh tokens
- **bcryptjs**: Criptografia segura de senhas
- **express-validator**: Validação robusta de dados de entrada
- **Helmet**: Cabeçalhos de segurança HTTP
- **CORS**: Controle de acesso cross-origin configurável
- **Morgan**: Logging detalhado de requisições HTTP
- **Multer**: Upload seguro de arquivos e imagens
- **Compression**: Compressão de respostas para performance
- **Rate Limiting**: Proteção contra ataques de força bruta

### 🗄️ Banco de Dados
- **PostgreSQL 12+**: Sistema de gerenciamento robusto
- **Triggers**: Automação de processos no banco
- **Indexes**: Otimização de consultas
- **Views**: Simplificação de consultas complexas
- **Procedures**: Lógica de negócio no banco quando necessário

### 🔧 Ferramentas de Desenvolvimento
- **ESLint**: Linting de código para consistência
- **Prettier**: Formatação automática de código
- **Husky**: Git hooks para qualidade de código
- **TypeScript Compiler**: Verificação de tipos em tempo de build

### 🚀 Deploy e Infraestrutura
- **Docker**: Containerização para deploy consistente
- **PM2**: Gerenciamento de processos Node.js
- **Nginx**: Proxy reverso e servidor de arquivos estáticos
- **SSL/TLS**: Certificados para segurança HTTPS

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Criptografia de senhas com bcryptjs
- Validação de entrada em todas as rotas
- Headers de segurança com Helmet
- CORS configurado para domínios específicos
- Rate limiting para prevenir ataques
- Sanitização de dados de entrada

## 🌐 Localização Brasileira

- Formatação de moedas em Real (R$)
- Datas no formato dd/mm/yyyy
- Validação de CPF/CNPJ
- Validação de CEP
- Timezone América/São_Paulo
- Idioma português brasileiro
- Cálculos fiscais conforme legislação brasileira