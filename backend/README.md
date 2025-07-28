# BVOLT Backend API

Sistema de backend para o ERP BVOLT, desenvolvido em Node.js com Express e PostgreSQL.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Multer** - Upload de arquivos
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── database/
│   │   ├── connection.js      # Configuração do banco
│   │   └── migrations/        # Migrações do banco
│   ├── middleware/
│   │   ├── auth.js           # Middleware de autenticação
│   │   └── errorHandler.js   # Tratamento global de erros
│   ├── routes/
│   │   ├── auth.js           # Rotas de autenticação
│   │   ├── products.js       # Rotas de produtos
│   │   ├── sales.js          # Rotas de vendas
│   │   ├── clients.js        # Rotas de clientes
│   │   ├── suppliers.js      # Rotas de fornecedores
│   │   ├── categories.js     # Rotas de categorias
│   │   ├── users.js          # Rotas de usuários
│   │   ├── stock.js          # Rotas de estoque
│   │   ├── config.js         # Rotas de configurações
│   │   └── reports.js        # Rotas de relatórios
│   └── server.js             # Servidor principal
├── uploads/                  # Arquivos uploadados
├── .env.example             # Exemplo de variáveis de ambiente
├── package.json             # Dependências do projeto
└── README.md               # Documentação
```

## ⚙️ Configuração

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvolt_db
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:5173
```

### 3. Criar banco de dados
```sql
CREATE DATABASE bvolt_db;
```

### 4. Executar migrações
```bash
npm run migrate
```

### 5. Iniciar servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. 

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@bvolt.com",
  "password": "admin123"
}
```

### Usuários padrão
- **Admin**: admin@bvolt.com / admin123
- **Gerente**: gerente@bvolt.com / gerente123  
- **Vendedor**: vendedor@bvolt.com / vendedor123

### Autorização
Adicione o token no header das requisições:
```http
Authorization: Bearer SEU_JWT_TOKEN
```

## 📊 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário
- `POST /api/auth/refresh` - Renovar token

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Remover produto

### Vendas
- `GET /api/sales` - Listar vendas
- `GET /api/sales/:id` - Buscar venda
- `POST /api/sales` - Criar venda
- `PUT /api/sales/:id/status` - Atualizar status

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente

## 🛡️ Segurança

### Middlewares de Segurança
- **Helmet** - Headers de segurança
- **CORS** - Configuração de domínios
- **Rate Limiting** - Limitação de requisições
- **Validação** - express-validator

### Níveis de Acesso
- **Admin** - Acesso total
- **Gerente** - Gerenciamento exceto configurações
- **Vendedor** - Apenas vendas e consultas

## 📝 Validações

Todas as rotas possuem validações usando express-validator:

```javascript
// Exemplo de validação
[
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser positivo')
]
```

## 📁 Upload de Arquivos

### Configuração
- **Pasta**: `uploads/`
- **Tamanho máximo**: 5MB
- **Formatos**: JPEG, JPG, PNG, WebP

### Endpoint
```http
POST /api/products
Content-Type: multipart/form-data

{
  "nome": "Produto",
  "imagem_principal": [arquivo]
}
```

## 🗄️ Banco de Dados

### Tabelas Principais
- `profiles` - Usuários do sistema
- `produtos` - Catálogo de produtos
- `categorias_produtos` - Categorias
- `fornecedores` - Fornecedores
- `clientes` - Clientes
- `vendas` - Vendas realizadas
- `itens_venda` - Itens das vendas
- `movimentacoes_estoque` - Histórico de estoque

### Relacionamentos
- Produto → Categoria (N:1)
- Produto → Fornecedor (N:1)
- Venda → Cliente (N:1)
- Venda → Vendedor (N:1)
- Item Venda → Produto (N:1)
- Item Venda → Venda (N:1)

## 🚨 Tratamento de Erros

### Códigos de Erro Padronizados
- `VALIDATION_ERROR` - Dados inválidos
- `NOT_FOUND` - Recurso não encontrado
- `UNAUTHORIZED` - Não autorizado
- `FORBIDDEN` - Acesso negado
- `INTERNAL_SERVER_ERROR` - Erro interno

### Exemplo de Resposta de Erro
```json
{
  "error": "Produto não encontrado",
  "code": "PRODUCT_NOT_FOUND",
  "details": []
}
```

## 📈 Monitoramento

### Health Check
```http
GET /health
```

### Logs
- Desenvolvimento: Console detalhado
- Produção: Logs estruturados

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage
```

## 📦 Deploy

### Variáveis de Ambiente (Produção)
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=senha_super_segura_para_producao
DB_HOST=seu_host_postgresql
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@bvolt.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Site: https://bvolt.com

---

**BVOLT Backend API v1.0.0**  
Sistema de ERP completo para gestão empresarial.