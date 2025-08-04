# ⚡ Guia Rápido de Instalação - Sistema BVOLT

## 🚀 Instalação em 5 Minutos

### 📋 Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL 12+ instalado
- Git instalado

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/seu-usuario/bvolt-commerce-system.git
cd bvolt-commerce-system
```

### 2️⃣ Configure o Banco de Dados
```bash
# Entre no PostgreSQL
sudo -u postgres psql

# Crie o banco e usuário
CREATE DATABASE bvolt_db;
CREATE USER bvolt_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;
\q
```

### 3️⃣ Configure o Backend
```bash
cd backend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

#### Arquivo .env (Backend)
```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvolt_db
DB_USER=bvolt_user
DB_PASSWORD=sua_senha_segura

# JWT
JWT_SECRET=sua_chave_jwt_super_segura_aqui
JWT_EXPIRES_IN=24h

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4️⃣ Execute Migrações
```bash
# Execute os scripts SQL
psql -U bvolt_user -d bvolt_db -f database/create_tables.sql
psql -U bvolt_user -d bvolt_db -f database/triggers.sql
psql -U bvolt_user -d bvolt_db -f database/seed_data.sql
```

### 5️⃣ Inicie o Backend
```bash
# Modo desenvolvimento
npm run dev

# Ou modo produção
npm start
```

### 6️⃣ Configure o Frontend
```bash
# Em outro terminal, vá para o frontend
cd ../frontend

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🎯 Pronto! Sistema Funcionando

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 🔑 Credenciais de Acesso
- **Admin**: `admin` / `123456`
- **Gerente**: `gerente` / `123456`
- **Vendedor**: `vendedor` / `123456`

## 🐳 Instalação com Docker (Alternativa)

### 1️⃣ Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: bvolt_db
      POSTGRES_USER: bvolt_user
      POSTGRES_PASSWORD: sua_senha_segura
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_NAME: bvolt_db
      DB_USER: bvolt_user
      DB_PASSWORD: sua_senha_segura
      JWT_SECRET: sua_chave_jwt_super_segura

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2️⃣ Execute com Docker
```bash
# Suba todos os serviços
docker-compose up -d

# Execute migrações
docker-compose exec backend npm run migrate
```

## 🔧 Scripts Úteis

### Backend
```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start

# Testes
npm test

# Verificar saúde da API
curl http://localhost:3001/health
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 🔍 Verificação da Instalação

### 1️⃣ Teste o Backend
```bash
curl http://localhost:3001/health
# Resposta esperada: {"status":"OK","timestamp":"..."}
```

### 2️⃣ Teste o Frontend
- Acesse http://localhost:5173
- Faça login com `admin` / `123456`
- Verifique se o dashboard carrega

### 3️⃣ Teste Funcionalidades
- Crie um cliente
- Cadastre um produto
- Realize uma venda
- Gere um relatório

## 🐛 Solução de Problemas Comuns

### Erro de Conexão com Banco
```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql

# Teste conexão manual
psql -U bvolt_user -d bvolt_db -h localhost
```

### Erro de CORS
- Verifique `FRONTEND_URL` no `.env`
- Confirme que as portas estão corretas

### Erro de Permissão
```bash
# Dê permissões aos diretórios
chmod -R 755 backend/uploads
chmod +x backend/database/setup.sh
```

### Porta já em uso
```bash
# Verifique processos nas portas
lsof -i :3001
lsof -i :5173

# Mate processos se necessário
kill -9 <PID>
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console
2. Consulte a documentação completa
3. Verifique as issues no GitHub
4. Entre em contato com a equipe de desenvolvimento

---

🎉 **Parabéns! O Sistema BVOLT está funcionando!**