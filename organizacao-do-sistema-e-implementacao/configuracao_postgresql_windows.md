
# 🐘 Configuração PostgreSQL Local - Sistema BVOLT (Versão Windows)

## 📋 Pré-requisitos

### 1. Instalar PostgreSQL
```bat
REM Windows - Baixe do site oficial:
REM https://www.postgresql.org/download/windows/
```

### 2. Verificar Instalação
```bat
psql --version
REM Deve retornar: psql (PostgreSQL) 12.x ou superior
```

## 🔧 Configuração Manual (Alternativa Recomendável no Windows)

### 1. Conectar ao PostgreSQL
```bat
REM Abrir o terminal como administrador (cmd ou PowerShell)
psql -U postgres -h localhost
```

### 2. Criar Banco e Usuário
```sql
CREATE USER bvolt_user WITH PASSWORD 'sua_senha_segura_123';

CREATE DATABASE bvolt_db WITH 
    OWNER = bvolt_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8';

GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;

\q
```

### 3. Conectar ao Banco Criado
```bat
psql -U bvolt_user -d bvolt_db -h localhost
```

### 4. Executar Scripts de Migração
```bat
psql -U bvolt_user -d bvolt_db -h localhost -f backend\database\create_tables.sql
psql -U bvolt_user -d bvolt_db -h localhost -f backend\database\triggers.sql
psql -U bvolt_user -d bvolt_db -h localhost -f backend\database\seed_data.sql
```

## ⚙️ Configurar Variáveis de Ambiente

### 1. Criar `.env`
```bat
cd backend
notepad .env
```

### 2. Conteúdo do `.env`
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvolt_db
DB_USER=bvolt_user
DB_PASSWORD=sua_senha_segura_123

JWT_SECRET=seu_jwt_secret_super_seguro_aqui_deve_ser_muito_longo
JWT_EXPIRES_IN=24h

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

FRONTEND_URL=http://localhost:5173

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Gerar JWT Secret Seguro
```bat
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Iniciar Aplicação

### 1. Backend
```bat
cd backend
npm install
mkdir uploads
npm run dev
curl http://localhost:3001/health
```

### 2. Frontend
```bat
cd frontend
npm install
npm run dev
```

## 🧪 Testar Conexão com Banco

### 1. Teste Manual
```bat
psql -U bvolt_user -d bvolt_db -h localhost
\dt
SELECT * FROM users;
\q
```

### 2. Teste via API
```bat
curl http://localhost:3001/health
curl http://localhost:3001/api/users
```

## 🗑️ Remover Dados Fictícios

```sql
DELETE FROM users WHERE email != 'admin@bvolt.com';
DELETE FROM categories WHERE name LIKE '%Teste%' OR name LIKE '%Exemplo%';
DELETE FROM suppliers WHERE name LIKE '%Teste%' OR name LIKE '%Exemplo%';
DELETE FROM customers WHERE name LIKE '%Teste%' OR name LIKE '%Exemplo%';
COMMIT;
```

## 🔒 Configurações de Segurança

### 1. PostgreSQL (No Windows, edite via pgAdmin ou postgresql.conf)
```conf
listen_addresses = 'localhost'
port = 5432
max_connections = 100
```

### 2. Backup Manual (Simples)
```bat
pg_dump -U bvolt_user -h localhost bvolt_db > backup_bvolt.sql
```

## 🐛 Solução de Problemas

### 1. Erro: "Connection refused"
- Verifique se o serviço PostgreSQL está iniciado (use `services.msc` no Windows).

### 2. Erro: "Authentication failed"
```sql
ALTER USER bvolt_user WITH PASSWORD 'nova_senha';
```

### 3. Erro: "Database does not exist"
```bat
createdb -U postgres -O bvolt_user bvolt_db
```

### 4. Erro de Permissão
```sql
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;
\c bvolt_db
GRANT ALL ON SCHEMA public TO bvolt_user;
```

## 📊 Monitoramento

### 1. Ver conexões
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'bvolt_db';
```

### 2. Ver queries lentas
```sql
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## ✅ Checklist de Configuração

- [x] PostgreSQL instalado e rodando
- [x] Banco `bvolt_db` criado
- [x] Usuário `bvolt_user` criado com permissões
- [x] Scripts executados
- [x] .env configurado
- [x] Backend e frontend funcionando
- [x] Dados fictícios removidos
- [x] Backup funcionando

## 🎯 Resultado Final

- PostgreSQL funcional localmente
- Sistema pronto para desenvolvimento completo
- Dados salvos com segurança

## 📞 Suporte

1. Verifique logs do PostgreSQL (ou pgAdmin)
2. Teste conexão com `psql`
3. Revise `.env`
4. Consulte a documentação oficial PostgreSQL
