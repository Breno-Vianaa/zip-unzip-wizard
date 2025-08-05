
# 📋 Comandos Úteis PostgreSQL - Sistema BVOLT (Versão Windows)

## 🔧 Comandos Básicos de Administração

### 1. Conectar ao Banco
```bat
REM Conectar como usuário do sistema
psql -U bvolt_user -d bvolt_db -h localhost

REM Conectar como postgres (admin)
psql -U postgres -d postgres

REM Conectar especificando porta
psql -U bvolt_user -d bvolt_db -h localhost -p 5432
```

### 2. Comandos Meta (\)
```sql
\l          -- Listar bancos de dados  
\c bvolt_db -- Conectar ao banco  
\dt         -- Listar tabelas  
\d usuarios -- Estrutura da tabela  
\du         -- Listar usuários  
\q          -- Sair do psql  
\?          -- Ajuda  
```

## 🗄️ Gerenciamento de Dados

### 1. Consultas Básicas
```sql
SELECT * FROM usuarios;

SELECT nome, email, tipo, ativo FROM usuarios WHERE tipo = 'admin';

SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'produtos' as tabela, COUNT(*) as total FROM produtos;
```

### 2. Limpeza de Dados
```sql
DELETE FROM clientes WHERE nome LIKE '%Teste%' OR nome LIKE '%Exemplo%';
DELETE FROM fornecedores WHERE nome LIKE '%Teste%' OR nome LIKE '%Exemplo%';
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
TRUNCATE TABLE logs_sistema RESTART IDENTITY CASCADE;
```

### 3. Backup e Restore
```bat
REM Backup completo
pg_dump -U bvolt_user -h localhost bvolt_db > backup_completo.sql

REM Backup apenas estrutura
pg_dump -U bvolt_user -h localhost -s bvolt_db > backup_estrutura.sql

REM Backup apenas dados
pg_dump -U bvolt_user -h localhost -a bvolt_db > backup_dados.sql

REM Restore do banco
psql -U bvolt_user -d bvolt_db -h localhost < backup_completo.sql
```

## 🔒 Gerenciamento de Usuários e Permissões

### 1. Criar Usuários
```sql
CREATE USER novo_usuario WITH PASSWORD 'senha_segura';

CREATE USER readonly_user WITH PASSWORD 'senha123';
GRANT CONNECT ON DATABASE bvolt_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 2. Alterar Permissões
```sql
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;

REVOKE ALL ON DATABASE bvolt_db FROM usuario_temporario;

ALTER USER bvolt_user WITH PASSWORD 'nova_senha_super_segura';
```

### 3. Verificar Permissões
```sql
SELECT grantee, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE grantee = 'bvolt_user';

SELECT usename, datname, client_addr, state, query_start
FROM pg_stat_activity 
WHERE datname = 'bvolt_db';
```

## 📊 Monitoramento e Performance

### 1. Estatísticas de Uso
```sql
SELECT pg_database.datname,
       pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'bvolt_db';

SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Conexões Ativas
```sql
SELECT pid, usename, datname, client_addr, state, query_start, query
FROM pg_stat_activity 
WHERE datname = 'bvolt_db';

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity 
WHERE datname = 'bvolt_db' AND pid <> pg_backend_pid();
```

### 3. Logs e Auditoria
```sql
SELECT * FROM logs_sistema ORDER BY data_log DESC LIMIT 50;

SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

## 🔧 Manutenção do Banco

### 1. Análise e Vacuum
```sql
ANALYZE usuarios;
VACUUM usuarios;
VACUUM FULL usuarios;
REINDEX TABLE usuarios;
```

### 2. Verificação de Integridade
```sql
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public';

SELECT tc.constraint_name, tc.table_name, kcu.column_name, tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public';
```

## 🚨 Comandos de Emergência

### 1. Problemas de Conexão
```bat
REM Verificar se o PostgreSQL está rodando
net start | findstr /i "postgresql"

REM Reiniciar o PostgreSQL (execute como administrador)
net stop postgresql-x64-13
net start postgresql-x64-13

REM Verificar portas em uso
netstat -ano | findstr :5432
```

### 2. Resetar Banco (CUIDADO!)
```sql
DROP DATABASE IF EXISTS bvolt_db;
CREATE DATABASE bvolt_db WITH OWNER = bvolt_user ENCODING = 'UTF8';
```

### 3. Backup de Emergência
```bat
pg_dump -U bvolt_user -h localhost bvolt_db > emergency_backup.sql
```

## 📝 Scripts Úteis

### 1. Script de Status Completo
```sql
SELECT 'Database Size' as metric, pg_size_pretty(pg_database_size('bvolt_db')) as value
UNION ALL
SELECT 'Active Connections', COUNT(*)::text 
FROM pg_stat_activity 
WHERE datname = 'bvolt_db'
UNION ALL
SELECT 'Total Users', COUNT(*)::text FROM usuarios
UNION ALL
SELECT 'Total Products', COUNT(*)::text FROM produtos;
```

### 2. Script de Limpeza Semanal
```sql
DELETE FROM logs_sistema WHERE data_log < NOW() - INTERVAL '30 days';
VACUUM ANALYZE logs_sistema;

SELECT 'Logs Remaining' as info, COUNT(*)::text as count FROM logs_sistema;
```

## 🔍 Troubleshooting

### 1. Erro "too many connections"
```sql
SHOW max_connections;
SELECT COUNT(*) FROM pg_stat_activity;
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND query_start < NOW() - INTERVAL '1 hour';
```

### 2. Problemas de Performance
```sql
SELECT pid, now() - query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - query_start) > interval '5 minutes';

SELECT schemaname, tablename, n_dead_tup, n_live_tup,
       round(n_dead_tup::numeric / n_live_tup::numeric * 100, 2) AS dead_pct
FROM pg_stat_user_tables 
WHERE n_live_tup > 0 
AND round(n_dead_tup::numeric / n_live_tup::numeric * 100, 2) > 10
ORDER BY dead_pct DESC;
```

## 📞 Comandos de Suporte

### 1. Informações do Sistema
```sql
SELECT version();

SELECT name, setting, unit, short_desc 
FROM pg_settings 
WHERE name IN ('max_connections', 'shared_buffers', 'work_mem', 'maintenance_work_mem');

SELECT * FROM pg_extension;
```
