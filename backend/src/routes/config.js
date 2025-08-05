/**
 * Rotas de configuração
 * Gerenciamento de configurações do sistema
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/config
 * Busca todas as configurações
 */
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
    try {
        const result = await query(`
            SELECT chave, valor, descricao, tipo, data_atualizacao
            FROM configuracoes 
            ORDER BY chave ASC
        `);

        res.json({
            config: result.rows
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/config/:key
 * Busca configuração por chave
 */
router.get('/:key', authenticateToken, async (req, res, next) => {
    try {
        const { key } = req.params;

        const result = await query(`
            SELECT chave, valor, descricao, tipo, data_atualizacao
            FROM configuracoes 
            WHERE chave = $1
        `, [key]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Configuração não encontrada',
                code: 'CONFIG_NOT_FOUND'
            });
        }

        res.json({
            config: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/config/:key
 * Atualiza configuração
 */
router.put('/:key', authenticateToken, requireAdmin, [
    body('valor').notEmpty().withMessage('Valor é obrigatório')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { key } = req.params;
        const { valor } = req.body;

        const result = await query(`
            UPDATE configuracoes 
            SET valor = $1, data_atualizacao = NOW()
            WHERE chave = $2
            RETURNING chave, valor, descricao, tipo, data_atualizacao
        `, [valor, key]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Configuração não encontrada',
                code: 'CONFIG_NOT_FOUND'
            });
        }

        res.json({
            message: 'Configuração atualizada com sucesso',
            config: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/config
 * Cria nova configuração
 */
router.post('/', authenticateToken, requireAdmin, [
    body('chave').notEmpty().withMessage('Chave é obrigatória'),
    body('valor').notEmpty().withMessage('Valor é obrigatório'),
    body('descricao').optional().isString(),
    body('tipo').optional().isIn(['string', 'number', 'boolean', 'json']).withMessage('Tipo inválido')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { chave, valor, descricao, tipo = 'string' } = req.body;

        const result = await query(`
            INSERT INTO configuracoes (chave, valor, descricao, tipo)
            VALUES ($1, $2, $3, $4)
            RETURNING chave, valor, descricao, tipo, data_atualizacao
        `, [chave, valor, descricao, tipo]);

        res.status(201).json({
            message: 'Configuração criada com sucesso',
            config: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') { // Violação de chave única
            return res.status(409).json({
                error: 'Configuração já existe',
                code: 'CONFIG_ALREADY_EXISTS'
            });
        }
        next(error);
    }
});

/**
 * DELETE /api/config/:key
 * Remove configuração
 */
router.delete('/:key', authenticateToken, requireAdmin, async (req, res, next) => {
    try {
        const { key } = req.params;

        const result = await query('DELETE FROM configuracoes WHERE chave = $1 RETURNING chave', [key]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Configuração não encontrada',
                code: 'CONFIG_NOT_FOUND'
            });
        }

        res.json({
            message: 'Configuração removida com sucesso'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/config/public/:key
 * Busca configuração pública (sem autenticação)
 */
router.get('/public/:key', async (req, res, next) => {
    try {
        const { key } = req.params;

        // Lista de configurações que podem ser acessadas publicamente
        const publicConfigs = ['app_name', 'app_version', 'maintenance_mode'];

        if (!publicConfigs.includes(key)) {
            return res.status(403).json({
                error: 'Configuração não é pública',
                code: 'CONFIG_NOT_PUBLIC'
            });
        }

        const result = await query(`
            SELECT chave, valor
            FROM configuracoes 
            WHERE chave = $1
        `, [key]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Configuração não encontrada',
                code: 'CONFIG_NOT_FOUND'
            });
        }

        res.json({
            config: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;