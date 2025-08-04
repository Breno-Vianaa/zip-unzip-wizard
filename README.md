# 🚀 Sistema BVOLT - ERP Completo

Sistema ERP moderno desenvolvido para pequenas e médias empresas, oferecendo gestão integrada de vendas, estoque, clientes, fornecedores, financeiro e relatórios.

## 🎯 Características Principais

- **Interface Moderna**: Design responsivo com modo claro/escuro
- **Sistema de Permissões**: Controle granular por níveis (Admin, Gerente, Vendedor)
- **Autenticação Segura**: Sistema baseado em JWT com logout automático
- **Código de Barras**: Scanner integrado para gestão de estoque
- **Relatórios PDF**: Geração automática de relatórios detalhados
- **Dashboard Interativo**: Métricas em tempo real com gráficos
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, PostgreSQL
- **Autenticação**: JWT + bcryptjs
- **Gráficos**: Recharts
- **PDF**: jsPDF
- **Formulários**: React Hook Form + Zod

## 🚀 Acesso Rápido

### Credenciais de Teste
- **Admin**: admin / 123456
- **Gerente**: gerente / 123456  
- **Vendedor**: vendedor / 123456

### URLs de Desenvolvimento
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 📂 Estrutura do Projeto

```
bvolt-commerce-system/
├── frontend/                     # Interface React
├── backend/                      # API Node.js
├── documentacao-de-funcionalidades/  # Documentação de usuário
└── organizacao-do-sistema-e-implementacao/  # Documentação técnica
```

## 📚 Documentação

- [**Documentação de Funcionalidades**](./documentacao-de-funcionalidades/) - Guias para usuários finais
- [**Implementação e Setup**](./organizacao-do-sistema-e-implementacao/) - Documentação técnica para desenvolvedores