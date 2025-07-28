# 🚀 Passo a Passo - Implementação do Sistema BVOLT

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **Git** (para controle de versão)
- **Visual Studio Code** (recomendado)

### Verificar Instalações
```bash
node --version    # v18.0.0 ou superior
npm --version     # 8.0.0 ou superior
psql --version    # 12.0 ou superior
```

## 🗄️ Configuração do Banco de Dados

### 1. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows - baixar do site oficial
# https://www.postgresql.org/download/windows/

# macOS
brew install postgresql
```

### 2. Configurar Banco de Dados
```bash
# Navegar para a pasta do projeto
cd backend/database

# Executar script de configuração (Linux/macOS)
chmod +x setup.sh
./setup.sh

# Windows - executar comandos manualmente:
# 1. Criar usuário e banco no PostgreSQL
# 2. Executar scripts SQL na ordem: create_tables.sql, triggers.sql, seed_data.sql
```

### 3. Configurar Variáveis de Ambiente
O script `setup.sh` criará automaticamente o arquivo `.env` na raiz do projeto com:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bvolt_db
DB_USER=bvolt_user
DB_PASSWORD=sua_senha_aqui

# Aplicação
NODE_ENV=development
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# Frontend
FRONTEND_URL=http://localhost:5173

# Upload de Arquivos
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10485760

# Segurança
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
```

## 🔧 Configuração do Backend

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Executar Backend
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start

# Executar testes
npm test
```

### 3. Verificar Funcionamento
```bash
# Testar health check
curl http://localhost:3001/health

# Resposta esperada:
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🎨 Configuração do Frontend

### 1. Instalar Dependências
```bash
cd frontend
npm install
```

### 2. Executar Frontend
```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build de produção
npm run preview
```

### 3. Verificar Funcionamento
- Abrir navegador em `http://localhost:5173`
- Fazer login com credenciais padrão:
  - **Admin**: admin@bvolt.com / 123456
  - **Gerente**: gerente@bvolt.com / 123456
  - **Vendedor**: vendedor@bvolt.com / 123456

## 🔐 Configuração de Segurança

### 1. JWT Secret
```bash
# Gerar novo JWT secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Senha do Banco de Dados
- Alterar senha padrão do usuário `bvolt_user`
- Usar senhas complexas em produção
- Configurar backup automático do banco

### 3. HTTPS em Produção
- Configurar certificado SSL/TLS
- Redirecionar HTTP para HTTPS
- Configurar HSTS headers

## 📊 Monitoramento e Logs

### 1. Logs de Desenvolvimento
```bash
# Backend - logs automáticos no console
# Frontend - logs no DevTools do navegador
```

### 2. Logs de Produção
- Configurar Winston ou similar para logs estruturados
- Configurar rotação de logs
- Monitorar performance com ferramentas como PM2

## 🚀 Deploy em Produção

### 1. Preparar Ambiente
```bash
# Build do frontend
cd frontend
npm run build

# Configurar variáveis de ambiente de produção
# NODE_ENV=production
# JWT_SECRET=seu_secret_super_seguro
# DB_PASSWORD=senha_forte_produção
```

### 2. Opções de Deploy
- **VPS/Servidor Dedicado**: PM2 + Nginx + PostgreSQL
- **Docker**: Docker Compose com containers separados
- **Heroku**: Heroku Postgres + Node.js buildpack
- **AWS**: EC2 + RDS + S3 para uploads
- **DigitalOcean**: Droplet + Managed Database

### 3. Configurar Proxy Reverso (Nginx)
```nginx
server {
    listen 80;
    server_name seudominio.com;

    # Frontend
    location / {
        root /var/www/bvolt/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar se PostgreSQL está rodando
   - Conferir credenciais no `.env`
   - Testar conexão manual com `psql`

2. **Erro de CORS**
   - Verificar FRONTEND_URL no `.env`
   - Conferir configuração de CORS no backend

3. **Erro de autenticação**
   - Verificar JWT_SECRET
   - Limpar localStorage do navegador
   - Verificar se usuário existe no banco

4. **Erro de build**
   - Limpar node_modules e reinstalar
   - Verificar versões do Node.js
   - Conferir dependências no package.json

### Comandos Úteis
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Reset do banco de dados
psql -U postgres -c "DROP DATABASE IF EXISTS bvolt_db;"
cd backend/database && ./setup.sh

# Verificar status dos serviços
sudo systemctl status postgresql
sudo systemctl status nginx
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs de erro no console
2. Consultar documentação das dependências
3. Verificar issues no repositório GitHub
4. Contatar equipe de desenvolvimento