-- Triggers para automatizar operações no banco de dados
\c bvolt_db;

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER tr_profiles_atualizacao
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER tr_categorias_atualizacao
    BEFORE UPDATE ON categorias_produtos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER tr_fornecedores_atualizacao
    BEFORE UPDATE ON fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER tr_clientes_atualizacao
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER tr_produtos_atualizacao
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER tr_vendas_atualizacao
    BEFORE UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- Função para calcular valor total da venda
CREATE OR REPLACE FUNCTION calcular_valor_venda()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendas 
    SET valor_total = (
        SELECT COALESCE(SUM(preco_total - desconto), 0) 
        FROM itens_venda 
        WHERE venda_id = NEW.venda_id
    ),
    valor_final = (
        SELECT COALESCE(SUM(preco_total - desconto), 0) 
        FROM itens_venda 
        WHERE venda_id = NEW.venda_id
    ) - COALESCE((SELECT valor_desconto FROM vendas WHERE id = NEW.venda_id), 0)
    WHERE id = NEW.venda_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular valor da venda quando itens são alterados
CREATE TRIGGER tr_recalcular_venda
    AFTER INSERT OR UPDATE OR DELETE ON itens_venda
    FOR EACH ROW
    EXECUTE FUNCTION calcular_valor_venda();

-- Função para movimentar estoque automaticamente
CREATE OR REPLACE FUNCTION movimentar_estoque_venda()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for uma nova venda concluída, dar baixa no estoque
    IF TG_OP = 'UPDATE' AND OLD.status != 'concluida' AND NEW.status = 'concluida' THEN
        -- Dar baixa no estoque para cada item da venda
        INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, venda_id, usuario_id)
        SELECT 
            iv.produto_id,
            'saida',
            iv.quantidade,
            'Venda - ' || NEW.numero_venda,
            NEW.id,
            NEW.vendedor_id
        FROM itens_venda iv
        WHERE iv.venda_id = NEW.id;
        
        -- Atualizar estoque atual dos produtos
        UPDATE produtos 
        SET estoque_atual = estoque_atual - iv.quantidade
        FROM itens_venda iv
        WHERE produtos.id = iv.produto_id 
        AND iv.venda_id = NEW.id;
        
    -- Se a venda for cancelada, estornar o estoque
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'concluida' AND NEW.status = 'cancelada' THEN
        -- Estornar estoque
        INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, venda_id, usuario_id)
        SELECT 
            iv.produto_id,
            'entrada',
            iv.quantidade,
            'Cancelamento venda - ' || NEW.numero_venda,
            NEW.id,
            NEW.vendedor_id
        FROM itens_venda iv
        WHERE iv.venda_id = NEW.id;
        
        -- Atualizar estoque atual dos produtos
        UPDATE produtos 
        SET estoque_atual = estoque_atual + iv.quantidade
        FROM itens_venda iv
        WHERE produtos.id = iv.produto_id 
        AND iv.venda_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para movimentar estoque baseado no status da venda
CREATE TRIGGER tr_movimentar_estoque_venda
    AFTER UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION movimentar_estoque_venda();

-- Função para registrar logs de alterações
CREATE OR REPLACE FUNCTION registrar_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs_sistema (
        acao, 
        tabela_afetada, 
        registro_id, 
        dados_anteriores, 
        dados_novos
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para log em tabelas importantes
CREATE TRIGGER tr_log_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION registrar_log();

CREATE TRIGGER tr_log_produtos
    AFTER INSERT OR UPDATE OR DELETE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_log();

CREATE TRIGGER tr_log_vendas
    AFTER INSERT OR UPDATE OR DELETE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_log();