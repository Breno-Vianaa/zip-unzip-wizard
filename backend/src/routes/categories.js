/**
 * Rotas de categorias
 * Gerenciamento de categorias de produtos
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken, requireManager } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/categories
 * Lista todas as categorias
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const result = await query(`
            SELECT id, nome, descricao, ativa, data_cadastro
            FROM categorias 
            ORDER BY nome ASC
        `);

        res.json({
            categories: result.rows
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/categories/:id
 * Busca categoria por ID
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT id, nome, descricao, ativa, data_cadastro
            FROM categorias 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Categoria não encontrada',
                code: 'CATEGORY_NOT_FOUND'
            });
        }

        res.json({
            category: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/categories
 * Cria nova categoria
 */
router.post('/', authenticateToken, requireManager, [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('descricao').optional().isString()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { nome, descricao } = req.body;

        const result = await query(`
            INSERT INTO categorias (nome, descricao, ativa)
            VALUES ($1, $2, true)
            RETURNING id, nome, descricao, ativa, data_cadastro
        `, [nome, descricao]);

        res.status(201).json({
            message: 'Categoria criada com sucesso',
            category: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/categories/:id
 * Atualiza categoria
 */
router.put('/:id', authenticateToken, requireManager, [
    body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
    body('descricao').optional().isString()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { nome, descricao, ativa } = req.body;

        const result = await query(`
            UPDATE categorias 
            SET nome = COALESCE($1, nome),
                descricao = COALESCE($2, descricao),
                ativa = COALESCE($3, ativa)
            WHERE id = $4
            RETURNING id, nome, descricao, ativa, data_cadastro
        `, [nome, descricao, ativa, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Categoria não encontrada',
                code: 'CATEGORY_NOT_FOUND'
            });
        }

        res.json({
            message: 'Categoria atualizada com sucesso',
            category: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/categories/:id
 * Remove categoria
 */
router.delete('/:id', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM categorias WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Categoria não encontrada',
                code: 'CATEGORY_NOT_FOUND'
            });
        }

        res.json({
            message: 'Categoria removida com sucesso'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;