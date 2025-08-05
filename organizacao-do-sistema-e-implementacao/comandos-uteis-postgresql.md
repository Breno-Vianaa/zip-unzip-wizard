# 📋 Comandos Úteis PostgreSQL - Sistema BVOLT

## 🔧 Comandos Básicos de Administração

### 1. Conectar ao Banco
```bash
# Conectar como usuário do sistema
psql -U bvolt_user -d bvolt_db -h localhost

# Conectar como postgres (admin)
sudo -u postgres psql

# Conectar especificando porta
psql -U bvolt_user -d bvolt_db -h localhost -p 5432
```

### 2. Comandos Meta (\)
```sql
-- Listar bancos de dados
\l

-- Conectar a um banco
\c bvolt_db

-- Listar tabelas
\dt

-- Descrever estrutura de uma tabela
\d usuarios

-- Listar usuários/roles
\du

-- Sair do psql
\q

-- Ajuda
\?
```

## 🗄️ Gerenciamento de Dados

### 1. Consultas Básicas
```sql
-- Ver todos os usuários
SELECT * FROM usuarios;

-- Ver apenas admins
SELECT nome, email, tipo, ativo FROM usuarios WHERE tipo = 'admin';

-- Contar registros por tabela
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'produtos' as tabela, COUNT(*) as total FROM produtos;
```

### 2. Limpeza de Dados
```sql
-- Remover dados de teste (CUIDADO!)
DELETE FROM clientes WHERE nome LIKE '%Teste%' OR nome LIKE '%Exemplo%';
DELETE FROM fornecedores WHERE nome LIKE '%Teste%' OR nome LIKE '%Exemplo%';

-- Resetar sequências
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;

-- Limpar tabela específica
TRUNCATE TABLE logs_sistema RESTART IDENTITY CASCADE;
```

### 3. Backup e Restore
```bash
# Backup completo
pg_dump -U bvolt_user -h localhost bvolt_db > backup_completo.sql

# Backup apenas estrutura
pg_dump -U bvolt_user -h localhost -s bvolt_db > backup_estrutura.sql

# Backup apenas dados
pg_dump -U bvolt_user -h localhost -a bvolt_db > backup_dados.sql

# Restore
psql -U bvolt_user -d bvolt_db -h localhost < backup_completo.sql
```

## 🔒 Gerenciamento de Usuários e Permissões

### 1. Criar Usuários
```sql
-- Criar usuário básico
CREATE USER novo_usuario WITH PASSWORD 'senha_segura';

-- Criar usuário com permissões específicas
CREATE USER readonly_user WITH PASSWORD 'senha123';
GRANT CONNECT ON DATABASE bvolt_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 2. Alterar Permissões
```sql
-- Dar privilégios totais
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;

-- Revogar permissões
REVOKE ALL ON DATABASE bvolt_db FROM usuario_temporario;

-- Alterar senha
ALTER USER bvolt_user WITH PASSWORD 'nova_senha_super_segura';
```

### 3. Verificar Permissões
```sql
-- Ver permissões de um usuário
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE grantee = 'bvolt_user';

-- Ver usuários conectados
SELECT 
    usename,
    datname,
    client_addr,
    state,
    query_start
FROM pg_stat_activity 
WHERE datname = 'bvolt_db';
```

## 📊 Monitoramento e Performance

### 1. Estatísticas de Uso
```sql
-- Tamanho do banco de dados
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'bvolt_db';

-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Conexões Ativas
```sql
-- Ver conexões ativas
SELECT 
    pid,
    usename,
    datname,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE datname = 'bvolt_db';

-- Matar conexão específica
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'bvolt_db' AND pid <> pg_backend_pid();
```

### 3. Logs e Auditoria
```sql
-- Ver logs do sistema (se habilitado)
SELECT * FROM logs_sistema ORDER BY data_log DESC LIMIT 50;

-- Estatísticas de queries (se pg_stat_statements habilitado)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

## 🔧 Manutenção do Banco

### 1. Análise e Vacuum
```sql
-- Analisar tabela para otimizar consultas
ANALYZE usuarios;

-- Vacuum para recuperar espaço
VACUUM usuarios;

-- Vacuum completo (mais pesado)
VACUUM FULL usuarios;

-- Reindex para otimizar índices
REINDEX TABLE usuarios;
```

### 2. Verificação de Integridade
```sql
-- Verificar integridade das tabelas
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public';
```

## 🚨 Comandos de Emergência

### 1. Problemas de Conexão
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Ver portas em uso
sudo netstat -nlp | grep 5432
```

### 2. Resetar Banco (CUIDADO!)
```sql
-- Dropar e recriar banco (PERDE TODOS OS DADOS!)
DROP DATABASE IF EXISTS bvolt_db;
CREATE DATABASE bvolt_db WITH OWNER = bvolt_user ENCODING = 'UTF8';
```

### 3. Backup de Emergência
```bash
# Backup rápido antes de mudanças críticas
pg_dump -U bvolt_user -h localhost bvolt_db | gzip > emergency_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Verificar backup
gunzip -c emergency_backup_*.sql.gz | head -20
```

## 📝 Scripts Úteis

### 1. Script de Status Completo
```sql
-- Status geral do sistema
SELECT 
    'Database Size' as metric, 
    pg_size_pretty(pg_database_size('bvolt_db')) as value
UNION ALL
SELECT 
    'Active Connections', 
    COUNT(*)::text 
FROM pg_stat_activity 
WHERE datname = 'bvolt_db'
UNION ALL
SELECT 
    'Total Users', 
    COUNT(*)::text 
FROM usuarios
UNION ALL
SELECT 
    'Total Products', 
    COUNT(*)::text 
FROM produtos;
```

### 2. Script de Limpeza Semanal
```sql
-- Limpeza automática (executar semanalmente)
DELETE FROM logs_sistema WHERE data_log < NOW() - INTERVAL '30 days';
VACUUM ANALYZE logs_sistema;

-- Estatísticas após limpeza
SELECT 
    'Logs Remaining' as info, 
    COUNT(*)::text as count 
FROM logs_sistema;
```

## 🔍 Troubleshooting

### 1. Erro "too many connections"
```sql
-- Ver limite de conexões
SHOW max_connections;

-- Ver conexões atuais
SELECT COUNT(*) FROM pg_stat_activity;

-- Matar conexões inativas
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND query_start < NOW() - INTERVAL '1 hour';
```

### 2. Problemas de Performance
```sql
-- Queries lentas em execução
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Tabelas que precisam de vacuum
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup::numeric / n_live_tup::numeric * 100, 2) AS dead_pct
FROM pg_stat_user_tables 
WHERE n_live_tup > 0 
AND round(n_dead_tup::numeric / n_live_tup::numeric * 100, 2) > 10
ORDER BY dead_pct DESC;
```

## 📞 Comandos de Suporte

### 1. Informações do Sistema
```sql
-- Versão do PostgreSQL
SELECT version();

-- Configurações importantes
SELECT name, setting, unit, short_desc 
FROM pg_settings 
WHERE name IN ('max_connections', 'shared_buffers', 'work_mem', 'maintenance_work_mem');

-- Extensões instaladas
SELECT * FROM pg_extension;
```

### 2. Gerar Relatório de Status
```bash
# Criar relatório completo
echo "=== RELATÓRIO STATUS POSTGRESQL ===" > status_report.txt
echo "Data: $(date)" >> status_report.txt
echo "" >> status_report.txt

psql -U bvolt_user -d bvolt_db -h localhost -c "
SELECT 
    'Database Size' as metric, 
    pg_size_pretty(pg_database_size('bvolt_db')) as value
UNION ALL
SELECT 'Version', version()
UNION ALL
SELECT 'Uptime', (now() - pg_postmaster_start_time())::text;
" >> status_report.txt
```

Este guia cobre os comandos mais úteis para administração do PostgreSQL no sistema BVOLT. Mantenha este arquivo como referência rápida para operações do dia a dia.