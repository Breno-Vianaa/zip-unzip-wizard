-- Script para criar o banco de dados e usuário no PostgreSQL
-- Execute este script como superuser (postgres)

-- Criar usuário para a aplicação
CREATE USER bvolt_user WITH PASSWORD 'sua_senha_aqui_123';

-- Criar banco de dados
CREATE DATABASE bvolt_db WITH 
    OWNER = bvolt_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE bvolt_db TO bvolt_user;

-- Conectar ao banco criado
\c bvolt_db;

-- Conceder privilégios no esquema public
GRANT ALL ON SCHEMA public TO bvolt_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bvolt_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bvolt_user;

-- Permitir criação de tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bvolt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bvolt_user;