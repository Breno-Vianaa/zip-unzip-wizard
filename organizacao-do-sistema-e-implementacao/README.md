# 🚀 Sistema BVOLT - ERP Completo para Pequenas e Médias Empresas

## 📋 Visão Geral

O BVOLT é um sistema ERP completo desenvolvido para o mercado brasileiro, oferecendo gestão integrada de vendas, estoque, clientes, fornecedores e relatórios financeiros.

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

## 📂 Estrutura de Pastas

```
bvolt-commerce-system/
├── frontend/                     # Aplicação React (Interface do usuário)
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── contexts/           # Contextos React (Auth, Theme)
│   │   ├── pages/              # Páginas principais
│   │   ├── hooks/              # Hooks customizados
│   │   ├── lib/                # Utilitários e configurações
│   │   ├── types/              # Definições de tipos TypeScript
│   │   └── assets/             # Imagens, ícones, etc.
│   ├── public/                 # Arquivos estáticos
│   └── package.json            # Dependências do frontend
│
├── backend/                      # API REST + Lógica de negócio
│   ├── src/
│   │   ├── routes/             # Definição de rotas da API
│   │   ├── middlewares/        # Middlewares de autenticação/validação
│   │   ├── database/           # Configuração e conexão com BD
│   │   ├── utils/              # Funções utilitárias
│   │   └── server.js           # Servidor principal
│   ├── database/               # Scripts SQL
│   │   ├── create_tables.sql   # Criação das tabelas
│   │   ├── triggers.sql        # Triggers do banco
│   │   ├── seed_data.sql       # Dados iniciais
│   │   └── setup.sh           # Script de configuração
│   └── package.json            # Dependências do backend
│
├── organizacao-do-sistema-e-implementacao/  # Documentação técnica
└── documentacao-de-funcionalidades/         # Documentação do usuário
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18**: Framework principal para interface
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e servidor de desenvolvimento
- **Tailwind CSS**: Framework CSS utilitário
- **Radix UI**: Componentes acessíveis
- **React Query**: Cache e sincronização de dados
- **React Router**: Navegação SPA
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas
- **Lucide React**: Ícones
- **Recharts**: Gráficos e visualizações

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação baseada em tokens
- **bcryptjs**: Criptografia de senhas
- **Helmet**: Segurança HTTP
- **CORS**: Controle de acesso
- **Morgan**: Logging de requisições
- **Multer**: Upload de arquivos
- **Compression**: Compressão de respostas

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