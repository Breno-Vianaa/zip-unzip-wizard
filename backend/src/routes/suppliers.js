/**
 * Rotas de fornecedores
 * Gerenciamento de fornecedores
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken, requireManager } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/suppliers
 * Lista todos os fornecedores
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [limit, offset];

        if (search) {
            whereClause = 'WHERE nome ILIKE $3 OR cnpj ILIKE $3';
            queryParams.push(`%${search}%`);
        }

        const result = await query(`
            SELECT id, nome, cnpj, email, telefone, endereco, ativo, data_cadastro
            FROM fornecedores 
            ${whereClause}
            ORDER BY nome ASC
            LIMIT $1 OFFSET $2
        `, queryParams);

        const countResult = await query(`
            SELECT COUNT(*) as total FROM fornecedores ${whereClause}
        `, search ? [`%${search}%`] : []);

        res.json({
            suppliers: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/suppliers/:id
 * Busca fornecedor por ID
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT id, nome, cnpj, email, telefone, endereco, ativo, data_cadastro
            FROM fornecedores 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Fornecedor não encontrado',
                code: 'SUPPLIER_NOT_FOUND'
            });
        }

        res.json({
            supplier: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/suppliers
 * Cria novo fornecedor
 */
router.post('/', authenticateToken, requireManager, [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('cnpj').notEmpty().withMessage('CNPJ é obrigatório'),
    body('email').optional().isEmail().withMessage('Email deve ser válido')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { nome, cnpj, email, telefone, endereco } = req.body;

        const result = await query(`
            INSERT INTO fornecedores (nome, cnpj, email, telefone, endereco, ativo)
            VALUES ($1, $2, $3, $4, $5, true)
            RETURNING id, nome, cnpj, email, telefone, endereco, ativo, data_cadastro
        `, [nome, cnpj, email, telefone, endereco]);

        res.status(201).json({
            message: 'Fornecedor criado com sucesso',
            supplier: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/suppliers/:id
 * Atualiza fornecedor
 */
router.put('/:id', authenticateToken, requireManager, [
    body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
    body('cnpj').optional().notEmpty().withMessage('CNPJ não pode estar vazio'),
    body('email').optional().isEmail().withMessage('Email deve ser válido')
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
        const { nome, cnpj, email, telefone, endereco, ativo } = req.body;

        const result = await query(`
            UPDATE fornecedores 
            SET nome = COALESCE($1, nome),
                cnpj = COALESCE($2, cnpj),
                email = COALESCE($3, email),
                telefone = COALESCE($4, telefone),
                endereco = COALESCE($5, endereco),
                ativo = COALESCE($6, ativo)
            WHERE id = $7
            RETURNING id, nome, cnpj, email, telefone, endereco, ativo, data_cadastro
        `, [nome, cnpj, email, telefone, endereco, ativo, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Fornecedor não encontrado',
                code: 'SUPPLIER_NOT_FOUND'
            });
        }

        res.json({
            message: 'Fornecedor atualizado com sucesso',
            supplier: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/suppliers/:id
 * Remove fornecedor
 */
router.delete('/:id', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM fornecedores WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Fornecedor não encontrado',
                code: 'SUPPLIER_NOT_FOUND'
            });
        }

        res.json({
            message: 'Fornecedor removido com sucesso'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;