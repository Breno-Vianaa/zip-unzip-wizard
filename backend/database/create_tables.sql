-- Script para criar todas as tabelas do sistema BVOLT
-- Execute após criar o banco de dados

-- Conectar ao banco bvolt_db
\c bvolt_db;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários do sistema
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'gerente', 'vendedor', 'operador')),
    telefone VARCHAR(20),
    avatar_url TEXT,
    endereco TEXT,
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias de produtos
CREATE TABLE categorias_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200),
    cnpj VARCHAR(18) UNIQUE,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    endereco JSONB,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_documento CHECK (cnpj IS NOT NULL OR cpf IS NOT NULL)
);

-- Tabela de clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,
    data_nascimento DATE,
    endereco JSONB,
    observacoes TEXT,
    limite_credito DECIMAL(12,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES categorias_produtos(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    codigo_interno VARCHAR(50) UNIQUE,
    codigo_barras VARCHAR(50) UNIQUE,
    preco_custo DECIMAL(12,2),
    preco_venda DECIMAL(12,2) NOT NULL,
    margem_lucro DECIMAL(5,2),
    estoque_atual INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_maximo INTEGER,
    unidade_medida VARCHAR(10) DEFAULT 'UN',
    peso DECIMAL(8,3),
    altura DECIMAL(8,2),
    largura DECIMAL(8,2),
    comprimento DECIMAL(8,2),
    ncm VARCHAR(8),
    origem VARCHAR(1),
    cst_icms VARCHAR(3),
    aliquota_icms DECIMAL(5,2),
    imagem_principal TEXT,
    imagens_adicionais JSONB,
    ativo BOOLEAN DEFAULT true,
    cadastrado_por UUID REFERENCES profiles(id),
    data_cadastro TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_venda SERIAL UNIQUE,
    cliente_id UUID REFERENCES clientes(id),
    vendedor_id UUID REFERENCES profiles(id) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_desconto DECIMAL(12,2) DEFAULT 0,
    valor_final DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
    forma_pagamento VARCHAR(50),
    observacoes TEXT,
    data_venda TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens da venda
CREATE TABLE itens_venda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(12,2) NOT NULL,
    preco_total DECIMAL(12,2) NOT NULL,
    desconto DECIMAL(12,2) DEFAULT 0
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    forma_pagamento VARCHAR(50) NOT NULL,
    valor_pago DECIMAL(12,2) NOT NULL,
    data_pagamento TIMESTAMP DEFAULT NOW(),
    numero_parcela INTEGER DEFAULT 1,
    total_parcelas INTEGER DEFAULT 1,
    data_vencimento DATE,
    status VARCHAR(20) DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'vencido')),
    observacoes TEXT
);

-- Tabela de movimentações de estoque
CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES produtos(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
    quantidade INTEGER NOT NULL,
    motivo VARCHAR(100),
    observacoes TEXT,
    usuario_id UUID REFERENCES profiles(id),
    venda_id UUID REFERENCES vendas(id),
    data_movimentacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'string',
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES profiles(id),
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(50),
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    data_log TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_tipo ON profiles(tipo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_fornecedor ON produtos(fornecedor_id);
CREATE INDEX idx_produtos_codigo_interno ON produtos(codigo_interno);
CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_vendedor ON vendas(vendedor_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_itens_venda_produto ON itens_venda(produto_id);
CREATE INDEX idx_pagamentos_venda ON pagamentos(venda_id);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_data ON logs_sistema(data_log);