# 🐘 Configuração PostgreSQL Local - Sistema BVOLT

## 📋 Pré-requisitos

### 1. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Baixe do site oficial: https://www.postgresql.org/download/windows/

# macOS
brew install postgresql
brew services start postgresql
```

### 2. Verificar Instalação
```bash
psql --version
# Deve retornar: psql (PostgreSQL) 12.x ou superior
```

## 🔧 Configuração Automática (Recomendado)

### 1. Executar Script de Setup
```bash
# Navegar para a pasta do banco
cd backend/database

# Dar permissão de execução (Linux/macOS)
chmod +x setup.sh

# Executar o script
./setup.sh
```

O script automaticamente:
- ✅ Cria o banco `bvolt_db`
- ✅ Cria o usuário `bvolt_user`
- ✅ Configura permissões
- ✅ Executa as migrações
- ✅ Insere dados iniciais
- ✅ Gera arquivo `.env`

## 🔧 Configuração Manual (Alternativa)

### 1. Conectar ao PostgreSQL
```bash
# Como usuário postgres
sudo -u postgres psql

# Ou com senha (se configurada)
psql -U postgres -h localhost
```

### 2. Criar Banco e Usuário
```sql
-- Criar usuário
CREATE USER bvolt_user WITH PASSWORD 'sua_senha_segura_123';

-- Criar banco
CREATE DATABASE bvolt_db WITH 
    OWNER = bvolt_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;

-- Sair
\q
```

### 3. Conectar ao Banco Criado
```bash
psql -U bvolt_user -d bvolt_db -h localhost
```

### 4. Executar Scripts de Migração
```bash
# Criar tabelas
psql -U bvolt_user -d bvolt_db -h localhost -f backend/database/create_tables.sql

# Criar triggers
psql -U bvolt_user -d bvolt_db -h localhost -f backend/database/triggers.sql

# Inserir dados iniciais (apenas se necessário)
psql -U bvolt_user -d bvolt_db -h localhost -f backend/database/seed_data.sql
```

## ⚙️ Configurar Variáveis de Ambiente

### 1. Arquivo .env (Backend)
```bash
# Criar/editar arquivo .env na raiz do projeto backend
cd backend
nano .env
```

### 2. Configurações do .env
```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvolt_db
DB_USER=bvolt_user
DB_PASSWORD=sua_senha_segura_123

# JWT Secret (gere um novo)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_deve_ser_muito_longo
JWT_EXPIRES_IN=24h

# Upload de Arquivos
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:5173

# Email (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Gerar JWT Secret Seguro
```bash
# Gerar secret aleatório
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Iniciar Aplicação

### 1. Backend
```bash
cd backend

# Instalar dependências
npm install

# Criar pasta de uploads
mkdir -p uploads

# Iniciar em modo desenvolvimento
npm run dev

# Verificar se está funcionando
curl http://localhost:3001/health
```

### 2. Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🧪 Testar Conexão com Banco

### 1. Teste Manual
```bash
# Conectar ao banco
psql -U bvolt_user -d bvolt_db -h localhost

# Listar tabelas
\dt

# Verificar usuários
SELECT * FROM users;

# Sair
\q
```

### 2. Teste via API
```bash
# Testar health check
curl http://localhost:3001/health

# Testar endpoint de usuários (se existir)
curl http://localhost:3001/api/users
```

## 🗑️ Remover Dados Fictícios

### 1. Identificar Dados de Teste
```sql
-- Conectar ao banco
psql -U bvolt_user -d bvolt_db -h localhost

-- Ver dados atuais
SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM suppliers;
SELECT * FROM customers;
```

### 2. Limpar Dados de Seed (Manter apenas Admin)
```sql
-- Manter apenas o usuário admin, remover outros
DELETE FROM users WHERE email != 'admin@bvolt.com';

-- Limpar categorias de teste (opcional)
DELETE FROM categories WHERE name LIKE '%Teste%' OR name LIKE '%Exemplo%';

-- Limpar fornecedores de teste
DELETE FROM suppliers WHERE name LIKE '%Teste%' OR name LIKE '%Exemplo%';

-- Limpar clientes de teste
DELETE FROM customers WHERE name LIKE '%Teste%' OR name LIKE '%Exemplo%';

-- Commit das alterações
COMMIT;
```

### 3. Modificar seed_data.sql (Para Futuras Reinstalações)
Edite o arquivo `backend/database/seed_data.sql` e comente ou remova:
- Usuários de teste
- Categorias de exemplo
- Fornecedores fictícios
- Clientes fictícios

Mantenha apenas:
- Usuário administrador
- Configurações do sistema

## 🔒 Configurações de Segurança

### 1. PostgreSQL
```bash
# Editar arquivo de configuração
sudo nano /etc/postgresql/*/main/postgresql.conf

# Configurar:
listen_addresses = 'localhost'
port = 5432
max_connections = 100
```

### 2. Backup Automático
```bash
# Criar script de backup
nano backup_db.sh

#!/bin/bash
PGPASSWORD=sua_senha_segura_123 pg_dump -U bvolt_user -h localhost bvolt_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Dar permissão
chmod +x backup_db.sh

# Executar backup
./backup_db.sh
```

## 🐛 Solução de Problemas

### 1. Erro: "Connection refused"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql
```

### 2. Erro: "Authentication failed"
```bash
# Resetar senha do usuário
sudo -u postgres psql
ALTER USER bvolt_user WITH PASSWORD 'nova_senha';
\q
```

### 3. Erro: "Database does not exist"
```bash
# Recriar banco
sudo -u postgres createdb -O bvolt_user bvolt_db
```

### 4. Erro de Permissão
```bash
# Verificar permissões
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;
\c bvolt_db
GRANT ALL ON SCHEMA public TO bvolt_user;
\q
```

## 📊 Monitoramento

### 1. Logs do PostgreSQL
```bash
# Ver logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### 2. Conexões Ativas
```sql
-- Ver conexões ativas
SELECT * FROM pg_stat_activity WHERE datname = 'bvolt_db';
```

### 3. Performance
```sql
-- Ver queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## ✅ Checklist de Configuração

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `bvolt_db` criado
- [ ] Usuário `bvolt_user` criado com permissões
- [ ] Tabelas criadas (via create_tables.sql)
- [ ] Triggers configurados (via triggers.sql)
- [ ] Arquivo `.env` configurado
- [ ] Backend conectando ao banco
- [ ] Frontend comunicando com backend
- [ ] Dados fictícios removidos
- [ ] Usuário admin funcionando
- [ ] Backup configurado

## 🎯 Resultado Final

Após seguir este guia:
- ✅ PostgreSQL funcionando localmente
- ✅ Banco configurado corretamente
- ✅ Frontend e backend comunicando
- ✅ Dados salvos no banco local
- ✅ Sistema pronto para desenvolvimento

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs do PostgreSQL
2. Teste conexão manual com `psql`
3. Verifique configurações do `.env`
4. Consulte documentação oficial do PostgreSQL