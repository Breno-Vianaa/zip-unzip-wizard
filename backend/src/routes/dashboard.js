/**
 * Rotas do dashboard
 * Endpoints específicos para dados do dashboard
 */

const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Estatísticas gerais para o dashboard
 */
router.get('/stats', authenticateToken, async (req, res, next) => {
    try {
        // Estatísticas de hoje
        const today = new Date().toISOString().split('T')[0];
        
        const todayStats = await query(`
            SELECT 
                COUNT(*) as vendas_hoje,
                COALESCE(SUM(valor_total), 0) as receita_hoje
            FROM vendas
            WHERE DATE(data_venda) = $1
        `, [today]);

        // Estatísticas do mês
        const monthStats = await query(`
            SELECT 
                COUNT(*) as vendas_mes,
                COALESCE(SUM(valor_total), 0) as receita_mes
            FROM vendas
            WHERE DATE_TRUNC('month', data_venda) = DATE_TRUNC('month', CURRENT_DATE)
        `);

        // Produtos em estoque baixo
        const lowStockProducts = await query(`
            SELECT COUNT(*) as produtos_estoque_baixo
            FROM estoque e
            WHERE e.quantidade_atual <= e.quantidade_minima
        `);

        // Total de clientes ativos
        const activeClients = await query(`
            SELECT COUNT(*) as clientes_ativos
            FROM clientes
            WHERE ativo = true
        `);

        res.json({
            today: todayStats.rows[0],
            month: monthStats.rows[0],
            low_stock_products: parseInt(lowStockProducts.rows[0].produtos_estoque_baixo),
            active_clients: parseInt(activeClients.rows[0].clientes_ativos)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/charts
 * Dados para gráficos do dashboard
 */
router.get('/charts', authenticateToken, async (req, res, next) => {
    try {
        // Vendas dos últimos 30 dias
        const salesChart = await query(`
            SELECT 
                DATE(data_venda) as data,
                COUNT(*) as vendas,
                SUM(valor_total) as receita
            FROM vendas
            WHERE data_venda >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(data_venda)
            ORDER BY data ASC
        `);

        // Top 5 produtos mais vendidos (últimos 30 dias)
        const topProducts = await query(`
            SELECT 
                p.nome,
                SUM(iv.quantidade) as quantidade_vendida,
                SUM(iv.valor_total) as receita_produto
            FROM produtos p
            JOIN itens_venda iv ON p.id = iv.produto_id
            JOIN vendas v ON iv.venda_id = v.id
            WHERE v.data_venda >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY p.id, p.nome
            ORDER BY quantidade_vendida DESC
            LIMIT 5
        `);

        // Vendas por vendedor (últimos 30 dias)
        const salesByUser = await query(`
            SELECT 
                u.nome as vendedor,
                COUNT(*) as total_vendas,
                SUM(v.valor_total) as receita_vendedor
            FROM vendas v
            JOIN profiles u ON v.vendedor_id = u.id
            WHERE v.data_venda >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY u.id, u.nome
            ORDER BY receita_vendedor DESC
        `);

        res.json({
            sales_chart: salesChart.rows,
            top_products: topProducts.rows,
            sales_by_user: salesByUser.rows
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/recent-activities
 * Atividades recentes do sistema
 */
router.get('/recent-activities', authenticateToken, async (req, res, next) => {
    try {
        // Últimas vendas
        const recentSales = await query(`
            SELECT 
                v.id,
                v.numero_venda,
                v.data_venda,
                v.valor_total,
                v.status,
                c.nome as cliente_nome,
                u.nome as vendedor_nome
            FROM vendas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN profiles u ON v.vendedor_id = u.id
            ORDER BY v.data_venda DESC
            LIMIT 10
        `);

        // Últimas movimentações de estoque
        const recentStockMovements = await query(`
            SELECT 
                me.id,
                me.tipo,
                me.quantidade,
                me.data_movimentacao,
                p.nome as produto_nome,
                u.nome as usuario_nome
            FROM movimentacoes_estoque me
            JOIN produtos p ON me.produto_id = p.id
            LEFT JOIN profiles u ON me.usuario_id = u.id
            ORDER BY me.data_movimentacao DESC
            LIMIT 10
        `);

        res.json({
            recent_sales: recentSales.rows,
            recent_stock_movements: recentStockMovements.rows
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/dashboard/alerts
 * Alertas e notificações do sistema
 */
router.get('/alerts', authenticateToken, async (req, res, next) => {
    try {
        // Produtos com estoque baixo
        const lowStockAlerts = await query(`
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                e.quantidade_atual,
                e.quantidade_minima
            FROM produtos p
            JOIN estoque e ON p.id = e.produto_id
            WHERE e.quantidade_atual <= e.quantidade_minima
            ORDER BY e.quantidade_atual ASC
            LIMIT 10
        `);

        // Produtos sem estoque
        const noStockAlerts = await query(`
            SELECT 
                p.id,
                p.nome,
                p.codigo
            FROM produtos p
            LEFT JOIN estoque e ON p.id = e.produto_id
            WHERE e.quantidade_atual IS NULL OR e.quantidade_atual = 0
            ORDER BY p.nome ASC
            LIMIT 10
        `);

        res.json({
            low_stock_alerts: lowStockAlerts.rows,
            no_stock_alerts: noStockAlerts.rows
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;