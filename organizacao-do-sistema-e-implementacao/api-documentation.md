# 🌐 Documentação da API - Sistema BVOLT

## 📋 Endpoints Principais

### 🔐 Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário  
- `POST /api/auth/refresh` - Renovar token JWT

### 👥 Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário

### 🛍️ Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Remover produto

### 💰 Vendas
- `GET /api/sales` - Listar vendas
- `POST /api/sales` - Registrar venda
- `GET /api/sales/:id` - Detalhar venda

### 📊 Relatórios
- `GET /api/reports/sales` - Relatório de vendas
- `GET /api/reports/stock` - Relatório de estoque
- `GET /api/reports/financial` - Relatório financeiro

## 🛡️ Autenticação JWT
Todas as rotas protegidas requerem token no header:
```
Authorization: Bearer <token>
```