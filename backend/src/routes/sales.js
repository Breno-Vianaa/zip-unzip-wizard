/**
 * Rotas para gerenciamento de vendas
 * CRUD de vendas, itens e controle de estoque
 */

const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query, getClient } = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/sales
 * Lista vendas com filtros e paginação
 */
router.get('/', [
    authenticateToken,
    queryValidator('page').optional().isInt({ min: 1 }),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('cliente').optional().isUUID(),
    queryValidator('vendedor').optional().isUUID(),
    queryValidator('status').optional().isIn(['pendente', 'confirmada', 'entregue', 'cancelada']),
    queryValidator('data_inicio').optional().isISO8601(),
    queryValidator('data_fim').optional().isISO8601()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Parâmetros inválidos',
                details: errors.array()
            });
        }

        const {
            page = 1,
            limit = 20,
            cliente,
            vendedor,
            status,
            data_inicio,
            data_fim
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['1=1'];
        let params = [];
        let paramCount = 0;

        // Filtro por vendedor (vendedores só veem suas próprias vendas)
        if (req.user.tipo === 'vendedor') {
            paramCount++;
            whereConditions.push(`v.vendedor_id = $${paramCount}`);
            params.push(req.user.id);
        } else if (vendedor) {
            paramCount++;
            whereConditions.push(`v.vendedor_id = $${paramCount}`);
            params.push(vendedor);
        }

        // Filtro por cliente
        if (cliente) {
            paramCount++;
            whereConditions.push(`v.cliente_id = $${paramCount}`);
            params.push(cliente);
        }

        // Filtro por status
        if (status) {
            paramCount++;
            whereConditions.push(`v.status = $${paramCount}`);
            params.push(status);
        }

        // Filtro por período
        if (data_inicio) {
            paramCount++;
            whereConditions.push(`v.data_venda >= $${paramCount}`);
            params.push(data_inicio);
        }

        if (data_fim) {
            paramCount++;
            whereConditions.push(`v.data_venda <= $${paramCount}`);
            params.push(data_fim);
        }

        const whereClause = whereConditions.join(' AND ');

        // Query para buscar vendas
        const salesQuery = `
      SELECT 
        v.*,
        c.nome as cliente_nome,
        c.cpf as cliente_cpf,
        c.cnpj as cliente_cnpj,
        u.nome as vendedor_nome,
        COUNT(iv.*) as total_itens
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN profiles u ON v.vendedor_id = u.id
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
      WHERE ${whereClause}
      GROUP BY v.id, c.nome, c.cpf, c.cnpj, u.nome
      ORDER BY v.data_venda DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

        params.push(limit, offset);

        // Query para contar total
        const countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE ${whereClause}
    `;

        const [salesResult, countResult] = await Promise.all([
            query(salesQuery, params),
            query(countQuery, params.slice(0, -2))
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        res.json({
            sales: salesResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/sales/:id
 * Busca venda por ID com itens
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Busca dados da venda
        const saleResult = await query(`
      SELECT 
        v.*,
        c.nome as cliente_nome,
        c.email as cliente_email,
        c.telefone as cliente_telefone,
        c.cpf as cliente_cpf,
        c.cnpj as cliente_cnpj,
        u.nome as vendedor_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN profiles u ON v.vendedor_id = u.id
      WHERE v.id = $1
    `, [id]);

        if (saleResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Venda não encontrada',
                code: 'SALE_NOT_FOUND'
            });
        }

        const sale = saleResult.rows[0];

        // Verifica permissão (vendedores só veem suas próprias vendas)
        if (req.user.tipo === 'vendedor' && sale.vendedor_id !== req.user.id) {
            return res.status(403).json({
                error: 'Acesso negado',
                code: 'ACCESS_DENIED'
            });
        }

        // Busca itens da venda
        const itemsResult = await query(`
      SELECT 
        iv.*,
        p.nome as produto_nome,
        p.codigo_interno,
        p.unidade_medida,
        p.imagem_principal
      FROM itens_venda iv
      LEFT JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = $1
      ORDER BY iv.nome_produto
    `, [id]);

        res.json({
            sale: {
                ...sale,
                itens: itemsResult.rows
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/sales
 * Cria nova venda com itens
 */
router.post('/', [
    authenticateToken,
    body('cliente_id').isUUID().withMessage('Cliente válido é obrigatório'),
    body('itens').isArray({ min: 1 }).withMessage('Pelo menos um item é obrigatório'),
    body('itens.*.produto_id').isUUID().withMessage('Produto válido é obrigatório'),
    body('itens.*.quantidade').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser positiva'),
    body('forma_pagamento').isIn(['dinheiro', 'cartao_debito', 'cartao_credito', 'pix', 'transferencia'])
], async (req, res, next) => {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const {
            cliente_id,
            itens,
            forma_pagamento,
            desconto = 0,
            acrescimo = 0,
            observacoes,
            endereco_entrega,
            valor_frete = 0
        } = req.body;

        // Gera número da venda
        const numeroResult = await client.query(
            'SELECT COALESCE(MAX(numero_venda), 0) + 1 as proximo_numero FROM vendas'
        );
        const numero_venda = numeroResult.rows[0].proximo_numero;

        // Calcula totais
        let subtotal = 0;
        const itensProcessados = [];

        for (const item of itens) {
            // Busca dados do produto
            const produtoResult = await client.query(
                'SELECT nome, preco_venda, estoque_atual FROM produtos WHERE id = $1 AND ativo = true',
                [item.produto_id]
            );

            if (produtoResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: `Produto ${item.produto_id} não encontrado ou inativo`,
                    code: 'PRODUCT_NOT_FOUND'
                });
            }

            const produto = produtoResult.rows[0];
            const preco_unitario = item.preco_unitario || produto.preco_venda;
            const quantidade = parseFloat(item.quantidade);
            const desconto_item = parseFloat(item.desconto_item || 0);
            const subtotal_item = (preco_unitario * quantidade) - desconto_item;

            subtotal += subtotal_item;

            itensProcessados.push({
                produto_id: item.produto_id,
                quantidade,
                preco_unitario,
                desconto_item,
                subtotal: subtotal_item,
                nome_produto: produto.nome,
                codigo_produto: item.codigo_produto
            });
        }

        const valor_total = subtotal - desconto + acrescimo + valor_frete;

        // Cria a venda
        const saleResult = await client.query(`
      INSERT INTO vendas (
        numero_venda, cliente_id, vendedor_id, subtotal, desconto,
        acrescimo, valor_total, forma_pagamento, observacoes,
        endereco_entrega, valor_frete
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
            numero_venda, cliente_id, req.user.id, subtotal, desconto,
            acrescimo, valor_total, forma_pagamento, observacoes,
            endereco_entrega, valor_frete
        ]);

        const venda = saleResult.rows[0];

        // Insere os itens da venda
        for (const item of itensProcessados) {
            await client.query(`
        INSERT INTO itens_venda (
          venda_id, produto_id, quantidade, preco_unitario,
          desconto_item, subtotal, nome_produto, codigo_produto
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                venda.id, item.produto_id, item.quantidade, item.preco_unitario,
                item.desconto_item, item.subtotal, item.nome_produto, item.codigo_produto
            ]);
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Venda criada com sucesso',
            sale: venda
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

/**
 * PUT /api/sales/:id/status
 * Atualiza status da venda
 */
router.put('/:id/status', [
    authenticateToken,
    requireRole(['admin', 'gerente']),
    body('status').isIn(['pendente', 'confirmada', 'entregue', 'cancelada'])
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Status inválido',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        const saleResult = await query(
            'UPDATE vendas SET status = $1, data_atualizacao = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (saleResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Venda não encontrada',
                code: 'SALE_NOT_FOUND'
            });
        }

        res.json({
            message: 'Status da venda atualizado com sucesso',
            sale: saleResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;