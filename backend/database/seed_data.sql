-- Dados iniciais para o sistema BVOLT
\c bvolt_db;

-- Limpar dados existentes (cuidado em produção!)
TRUNCATE TABLE logs_sistema, movimentacoes_estoque, pagamentos, itens_venda, vendas, produtos, clientes, fornecedores, categorias_produtos, usuarios, configuracoes RESTART IDENTITY CASCADE;

-- Inserir usuário administrador padrão
INSERT INTO usuarios (id, nome, email, senha, tipo, telefone, ativo) VALUES 
(uuid_generate_v4(), 'Administrador', 'admin@bvolt.com', crypt('admin123', gen_salt('bf', 12)), 'admin', '(11) 99999-9999', true);

-- Inserir categorias de produtos padrão
INSERT INTO categorias_produtos (id, nome, descricao, cor, icone) VALUES
(uuid_generate_v4(), 'Eletrônicos', 'Produtos eletrônicos e tecnologia', '#3B82F6', 'smartphone'),
(uuid_generate_v4(), 'Informática', 'Computadores, notebooks e acessórios', '#8B5CF6', 'laptop'),
(uuid_generate_v4(), 'Acessórios', 'Cabos, carregadores e acessórios diversos', '#10B981', 'cable'),
(uuid_generate_v4(), 'Áudio e Vídeo', 'Fones, caixas de som e equipamentos de áudio', '#F59E0B', 'headphones'),
(uuid_generate_v4(), 'Gaming', 'Produtos para jogos e entretenimento', '#EF4444', 'gamepad');

-- Inserir fornecedores de exemplo
INSERT INTO fornecedores (id, nome, razao_social, cnpj, email, telefone, endereco) VALUES
(uuid_generate_v4(), 'TechDistribuidora', 'Tech Distribuidora LTDA', '12.345.678/0001-90', 'contato@techdist.com.br', '(11) 3456-7890', '{"rua": "Rua das Tecnologias, 123", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}'),
(uuid_generate_v4(), 'InfoSupplier', 'Info Supplier Comércio LTDA', '98.765.432/0001-10', 'vendas@infosupplier.com.br', '(11) 2345-6789', '{"rua": "Av. da Informática, 456", "cidade": "São Paulo", "estado": "SP", "cep": "12345-678"}'),
(uuid_generate_v4(), 'GameStore Atacado', 'GameStore Atacadista S.A.', '11.222.333/0001-44', 'atacado@gamestore.com.br', '(11) 4567-8901', '{"rua": "Rua dos Games, 789", "cidade": "São Paulo", "estado": "SP", "cep": "23456-789"}');

-- Inserir clientes de exemplo
INSERT INTO clientes (id, nome, email, telefone, cpf, endereco) VALUES
(uuid_generate_v4(), 'João Silva', 'joao.silva@email.com', '(11) 98765-4321', '123.456.789-00', '{"rua": "Rua A, 123", "cidade": "São Paulo", "estado": "SP", "cep": "01000-000"}'),
(uuid_generate_v4(), 'Maria Oliveira', 'maria.oliveira@email.com', '(11) 87654-3210', '987.654.321-00', '{"rua": "Rua B, 456", "cidade": "São Paulo", "estado": "SP", "cep": "02000-000"}'),
(uuid_generate_v4(), 'Pedro Santos', 'pedro.santos@email.com', '(11) 76543-2109', '456.789.123-00', '{"rua": "Rua C, 789", "cidade": "São Paulo", "estado": "SP", "cep": "03000-000"}');

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes (chave, valor, descricao, tipo) VALUES
('empresa_nome', 'BVOLT Sistema', 'Nome da empresa', 'string'),
('empresa_cnpj', '00.000.000/0001-00', 'CNPJ da empresa', 'string'),
('empresa_telefone', '(11) 0000-0000', 'Telefone da empresa', 'string'),
('empresa_email', 'contato@bvolt.com', 'Email da empresa', 'string'),
('sistema_versao', '1.0.0', 'Versão do sistema', 'string'),
('backup_automatico', 'true', 'Ativar backup automático', 'boolean'),
('estoque_minimo_alerta', '5', 'Quantidade mínima para alerta de estoque', 'number'),
('venda_desconto_maximo', '50', 'Desconto máximo permitido em vendas (%)', 'number'),
('sessao_timeout', '60', 'Timeout da sessão em minutos', 'number'),
('moeda_simbolo', 'R$', 'Símbolo da moeda', 'string'),
('moeda_codigo', 'BRL', 'Código da moeda', 'string'),
('timezone', 'America/Sao_Paulo', 'Fuso horário do sistema', 'string');

-- Commit das alterações
COMMIT;

-- Mostrar estatísticas
SELECT 
    'Usuários' as tabela, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 
    'Categorias' as tabela, COUNT(*) as registros FROM categorias_produtos
UNION ALL
SELECT 
    'Fornecedores' as tabela, COUNT(*) as registros FROM fornecedores
UNION ALL
SELECT 
    'Clientes' as tabela, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 
    'Configurações' as tabela, COUNT(*) as registros FROM configuracoes;

-- Mostrar usuário admin criado
SELECT 
    nome,
    email,
    tipo,
    ativo,
    data_cadastro
FROM usuarios 
WHERE tipo = 'admin';

COMMIT;