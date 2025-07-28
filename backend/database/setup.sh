#!/bin/bash

# Script para configurar o banco de dados PostgreSQL do BVOLT
# Execute este script na máquina onde está o PostgreSQL

echo "=== SETUP DO BANCO DE DADOS BVOLT ==="
echo ""

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Instale o PostgreSQL primeiro."
    echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
    echo "macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL encontrado"

# Verificar se o serviço está rodando
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🔄 Iniciando serviço PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo "✅ Serviço PostgreSQL ativo"

# Solicitar senha do usuário postgres
echo ""
echo "Digite a senha do usuário 'postgres' (se não tiver, pressione Enter):"
read -s POSTGRES_PASSWORD

# Definir variáveis de conexão
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="bvolt_db"
DB_USER="bvolt_user"

echo ""
echo "Digite a senha que deseja para o usuário 'bvolt_user':"
read -s DB_PASSWORD

echo ""
echo "🔄 Criando banco de dados e usuário..."

# Criar banco e usuário
if [ -n "$POSTGRES_PASSWORD" ]; then
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c "
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    CREATE DATABASE $DB_NAME WITH OWNER = $DB_USER ENCODING = 'UTF8';
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
    "
else
    sudo -u postgres psql -c "
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    CREATE DATABASE $DB_NAME WITH OWNER = $DB_USER ENCODING = 'UTF8';
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
    "
fi

echo "✅ Banco de dados criado"

# Executar scripts SQL
echo "🔄 Criando tabelas..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f create_tables.sql

echo "🔄 Criando triggers..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f triggers.sql

echo "🔄 Inserindo dados iniciais..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed_data.sql

# Criar arquivo .env
echo ""
echo "🔄 Criando arquivo .env..."

cat > ../.env << EOF
# Configurações do Banco de Dados
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Configurações da Aplicação
NODE_ENV=development
PORT=3001
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# Upload de arquivos
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Configurações de segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF

echo "✅ Arquivo .env criado"

echo ""
echo "🎉 SETUP CONCLUÍDO COM SUCESSO!"
echo ""
echo "📋 INFORMAÇÕES DE CONEXÃO:"
echo "   Host: $DB_HOST"
echo "   Porta: $DB_PORT" 
echo "   Banco: $DB_NAME"
echo "   Usuário: $DB_USER"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "   1. cd backend"
echo "   2. npm install"
echo "   3. npm run dev"
echo ""
echo "🔐 USUÁRIO ADMIN PADRÃO:"
echo "   Email: admin@bvolt.com"
echo "   Senha: admin123"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha do admin após o primeiro login!"