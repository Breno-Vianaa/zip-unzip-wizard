/**
 * Rotas de estoque
 * Gerenciamento de estoque e movimentações
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken, requireManager } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/stock
 * Lista itens do estoque
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [limit, offset];

        if (search) {
            whereClause = 'WHERE p.nome ILIKE $3';
            queryParams.push(`%${search}%`);
        }

        const result = await query(`
            SELECT 
                e.id,
                e.produto_id,
                p.nome as produto_nome,
                p.codigo,
                e.quantidade_atual,
                e.quantidade_minima,
                e.localizacao,
                e.ultima_movimentacao
            FROM estoque e
            JOIN produtos p ON e.produto_id = p.id
            ${whereClause}
            ORDER BY e.ultima_movimentacao DESC
            LIMIT $1 OFFSET $2
        `, queryParams);

        const countResult = await query(`
            SELECT COUNT(*) as total 
            FROM estoque e
            JOIN produtos p ON e.produto_id = p.id
            ${whereClause}
        `, search ? [`%${search}%`] : []);

        res.json({
            stock: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/stock/movements
 * Lista movimentações de estoque
 */
router.get('/movements', authenticateToken, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, produto_id } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [limit, offset];

        if (produto_id) {
            whereClause = 'WHERE me.produto_id = $3';
            queryParams.push(produto_id);
        }

        const result = await query(`
            SELECT 
                me.id,
                me.produto_id,
                p.nome as produto_nome,
                me.tipo,
                me.quantidade,
                me.observacao,
                me.data_movimentacao,
                u.nome as usuario_nome
            FROM movimentacoes_estoque me
            JOIN produtos p ON me.produto_id = p.id
            LEFT JOIN profiles u ON me.usuario_id = u.id
            ${whereClause}
            ORDER BY me.data_movimentacao DESC
            LIMIT $1 OFFSET $2
        `, queryParams);

        const countResult = await query(`
            SELECT COUNT(*) as total FROM movimentacoes_estoque me ${whereClause}
        `, produto_id ? [produto_id] : []);

        res.json({
            movements: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/stock/movement
 * Registra movimentação de estoque
 */
router.post('/movement', authenticateToken, requireManager, [
    body('produto_id').isInt().withMessage('ID do produto é obrigatório'),
    body('tipo').isIn(['entrada', 'saida', 'ajuste']).withMessage('Tipo deve ser entrada, saida ou ajuste'),
    body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
    body('observacao').optional().isString()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { produto_id, tipo, quantidade, observacao } = req.body;
        const usuario_id = req.user.id;

        // Verifica se produto existe
        const produtoResult = await query('SELECT id FROM produtos WHERE id = $1', [produto_id]);
        if (produtoResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Produto não encontrado',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        // Busca estoque atual
        const estoqueResult = await query('SELECT quantidade_atual FROM estoque WHERE produto_id = $1', [produto_id]);
        
        let novaQuantidade;
        if (estoqueResult.rows.length === 0) {
            // Cria registro de estoque se não existe
            novaQuantidade = tipo === 'entrada' ? quantidade : 0;
            await query(`
                INSERT INTO estoque (produto_id, quantidade_atual, quantidade_minima, ultima_movimentacao)
                VALUES ($1, $2, 0, NOW())
            `, [produto_id, novaQuantidade]);
        } else {
            const quantidadeAtual = estoqueResult.rows[0].quantidade_atual;
            
            switch (tipo) {
                case 'entrada':
                    novaQuantidade = quantidadeAtual + quantidade;
                    break;
                case 'saida':
                    novaQuantidade = quantidadeAtual - quantidade;
                    if (novaQuantidade < 0) {
                        return res.status(400).json({
                            error: 'Quantidade insuficiente em estoque',
                            code: 'INSUFFICIENT_STOCK'
                        });
                    }
                    break;
                case 'ajuste':
                    novaQuantidade = quantidade;
                    break;
            }

            // Atualiza estoque
            await query(`
                UPDATE estoque 
                SET quantidade_atual = $1, ultima_movimentacao = NOW()
                WHERE produto_id = $2
            `, [novaQuantidade, produto_id]);
        }

        // Registra movimentação
        const movimentacaoResult = await query(`
            INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, observacao, usuario_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, data_movimentacao
        `, [produto_id, tipo, quantidade, observacao, usuario_id]);

        res.status(201).json({
            message: 'Movimentação registrada com sucesso',
            movement: {
                id: movimentacaoResult.rows[0].id,
                produto_id,
                tipo,
                quantidade,
                observacao,
                data_movimentacao: movimentacaoResult.rows[0].data_movimentacao,
                nova_quantidade: novaQuantidade
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/stock/low
 * Lista produtos com estoque baixo
 */
router.get('/low', authenticateToken, async (req, res, next) => {
    try {
        const result = await query(`
            SELECT 
                e.id,
                e.produto_id,
                p.nome as produto_nome,
                p.codigo,
                e.quantidade_atual,
                e.quantidade_minima
            FROM estoque e
            JOIN produtos p ON e.produto_id = p.id
            WHERE e.quantidade_atual <= e.quantidade_minima
            ORDER BY e.quantidade_atual ASC
        `);

        res.json({
            low_stock: result.rows
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;