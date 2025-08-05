/**
 * Rotas de relatórios
 * Geração de relatórios e analytics
 */

const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken, requireManager } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/reports/sales
 * Relatório de vendas
 */
router.get('/sales', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { start_date, end_date, vendedor_id } = req.query;

        let whereClause = 'WHERE 1=1';
        let queryParams = [];

        if (start_date) {
            whereClause += ' AND v.data_venda >= $' + (queryParams.length + 1);
            queryParams.push(start_date);
        }

        if (end_date) {
            whereClause += ' AND v.data_venda <= $' + (queryParams.length + 1);
            queryParams.push(end_date);
        }

        if (vendedor_id) {
            whereClause += ' AND v.vendedor_id = $' + (queryParams.length + 1);
            queryParams.push(vendedor_id);
        }

        const result = await query(`
            SELECT 
                v.id,
                v.numero_venda,
                v.data_venda,
                v.valor_total,
                v.status,
                c.nome as cliente_nome,
                u.nome as vendedor_nome,
                COUNT(iv.id) as total_itens
            FROM vendas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN profiles u ON v.vendedor_id = u.id
            LEFT JOIN itens_venda iv ON v.id = iv.venda_id
            ${whereClause}
            GROUP BY v.id, c.nome, u.nome
            ORDER BY v.data_venda DESC
        `, queryParams);

        // Resumo das vendas
        const summaryResult = await query(`
            SELECT 
                COUNT(*) as total_vendas,
                SUM(valor_total) as valor_total,
                AVG(valor_total) as ticket_medio
            FROM vendas v
            ${whereClause}
        `, queryParams);

        res.json({
            sales: result.rows,
            summary: summaryResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/reports/products
 * Relatório de produtos mais vendidos
 */
router.get('/products', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { start_date, end_date, limit = 10 } = req.query;

        let whereClause = 'WHERE 1=1';
        let queryParams = [limit];

        if (start_date) {
            whereClause += ' AND v.data_venda >= $' + (queryParams.length + 1);
            queryParams.push(start_date);
        }

        if (end_date) {
            whereClause += ' AND v.data_venda <= $' + (queryParams.length + 1);
            queryParams.push(end_date);
        }

        const result = await query(`
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                SUM(iv.quantidade) as total_vendido,
                SUM(iv.valor_total) as receita_total,
                AVG(iv.preco_unitario) as preco_medio
            FROM produtos p
            JOIN itens_venda iv ON p.id = iv.produto_id
            JOIN vendas v ON iv.venda_id = v.id
            ${whereClause}
            GROUP BY p.id, p.nome, p.codigo
            ORDER BY total_vendido DESC
            LIMIT $1
        `, queryParams);

        res.json({
            products: result.rows
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/reports/stock
 * Relatório de estoque
 */
router.get('/stock', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const result = await query(`
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                e.quantidade_atual,
                e.quantidade_minima,
                CASE 
                    WHEN e.quantidade_atual <= e.quantidade_minima THEN 'baixo'
                    WHEN e.quantidade_atual <= e.quantidade_minima * 2 THEN 'medio'
                    ELSE 'alto'
                END as nivel_estoque,
                e.ultima_movimentacao
            FROM produtos p
            LEFT JOIN estoque e ON p.id = e.produto_id
            ORDER BY 
                CASE 
                    WHEN e.quantidade_atual <= e.quantidade_minima THEN 1
                    WHEN e.quantidade_atual <= e.quantidade_minima * 2 THEN 2
                    ELSE 3
                END,
                p.nome ASC
        `);

        // Resumo do estoque
        const summaryResult = await query(`
            SELECT 
                COUNT(*) as total_produtos,
                COUNT(CASE WHEN e.quantidade_atual <= e.quantidade_minima THEN 1 END) as produtos_estoque_baixo,
                COUNT(CASE WHEN e.quantidade_atual IS NULL OR e.quantidade_atual = 0 THEN 1 END) as produtos_sem_estoque
            FROM produtos p
            LEFT JOIN estoque e ON p.id = e.produto_id
        `);

        res.json({
            stock: result.rows,
            summary: summaryResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/reports/financial
 * Relatório financeiro
 */
router.get('/financial', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;

        let whereClause = 'WHERE 1=1';
        let queryParams = [];

        if (start_date) {
            whereClause += ' AND data_venda >= $' + (queryParams.length + 1);
            queryParams.push(start_date);
        }

        if (end_date) {
            whereClause += ' AND data_venda <= $' + (queryParams.length + 1);
            queryParams.push(end_date);
        }

        // Vendas por período
        const salesResult = await query(`
            SELECT 
                DATE(data_venda) as data,
                COUNT(*) as total_vendas,
                SUM(valor_total) as receita_total
            FROM vendas
            ${whereClause}
            GROUP BY DATE(data_venda)
            ORDER BY data DESC
        `, queryParams);

        // Resumo financeiro
        const summaryResult = await query(`
            SELECT 
                COUNT(*) as total_vendas,
                SUM(valor_total) as receita_total,
                AVG(valor_total) as ticket_medio,
                MIN(valor_total) as menor_venda,
                MAX(valor_total) as maior_venda
            FROM vendas
            ${whereClause}
        `, queryParams);

        res.json({
            daily_sales: salesResult.rows,
            summary: summaryResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/reports/dashboard
 * Dados para dashboard
 */
router.get('/dashboard', authenticateToken, async (req, res, next) => {
    try {
        // Vendas do mês atual
        const salesThisMonth = await query(`
            SELECT 
                COUNT(*) as total_vendas,
                COALESCE(SUM(valor_total), 0) as receita_total
            FROM vendas
            WHERE DATE_TRUNC('month', data_venda) = DATE_TRUNC('month', CURRENT_DATE)
        `);

        // Produtos com estoque baixo
        const lowStockCount = await query(`
            SELECT COUNT(*) as total
            FROM estoque e
            WHERE e.quantidade_atual <= e.quantidade_minima
        `);

        // Clientes ativos
        const activeClients = await query(`
            SELECT COUNT(*) as total
            FROM clientes
            WHERE ativo = true
        `);

        // Vendas dos últimos 7 dias
        const recentSales = await query(`
            SELECT 
                DATE(data_venda) as data,
                COUNT(*) as vendas,
                SUM(valor_total) as receita
            FROM vendas
            WHERE data_venda >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(data_venda)
            ORDER BY data ASC
        `);

        res.json({
            sales_this_month: salesThisMonth.rows[0],
            low_stock_count: parseInt(lowStockCount.rows[0].total),
            active_clients: parseInt(activeClients.rows[0].total),
            recent_sales: recentSales.rows
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;