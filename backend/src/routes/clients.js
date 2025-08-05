/**
 * Rotas de clientes
 * Gerenciamento de clientes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/clients
 * Lista todos os clientes
 */
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [limit, offset];

        if (search) {
            whereClause = 'WHERE nome ILIKE $3 OR cpf ILIKE $3 OR email ILIKE $3';
            queryParams.push(`%${search}%`);
        }

        const result = await query(`
            SELECT id, nome, cpf, email, telefone, endereco, ativo, data_cadastro
            FROM clientes 
            ${whereClause}
            ORDER BY nome ASC
            LIMIT $1 OFFSET $2
        `, queryParams);

        const countResult = await query(`
            SELECT COUNT(*) as total FROM clientes ${whereClause}
        `, search ? [`%${search}%`] : []);

        res.json({
            clients: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/clients/:id
 * Busca cliente por ID
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT id, nome, cpf, email, telefone, endereco, ativo, data_cadastro
            FROM clientes 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cliente não encontrado',
                code: 'CLIENT_NOT_FOUND'
            });
        }

        res.json({
            client: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/clients
 * Cria novo cliente
 */
router.post('/', authenticateToken, [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('cpf').notEmpty().withMessage('CPF é obrigatório'),
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

        const { nome, cpf, email, telefone, endereco } = req.body;

        const result = await query(`
            INSERT INTO clientes (nome, cpf, email, telefone, endereco, ativo)
            VALUES ($1, $2, $3, $4, $5, true)
            RETURNING id, nome, cpf, email, telefone, endereco, ativo, data_cadastro
        `, [nome, cpf, email, telefone, endereco]);

        res.status(201).json({
            message: 'Cliente criado com sucesso',
            client: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/clients/:id
 * Atualiza cliente
 */
router.put('/:id', authenticateToken, [
    body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
    body('cpf').optional().notEmpty().withMessage('CPF não pode estar vazio'),
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
        const { nome, cpf, email, telefone, endereco, ativo } = req.body;

        const result = await query(`
            UPDATE clientes 
            SET nome = COALESCE($1, nome),
                cpf = COALESCE($2, cpf),
                email = COALESCE($3, email),
                telefone = COALESCE($4, telefone),
                endereco = COALESCE($5, endereco),
                ativo = COALESCE($6, ativo)
            WHERE id = $7
            RETURNING id, nome, cpf, email, telefone, endereco, ativo, data_cadastro
        `, [nome, cpf, email, telefone, endereco, ativo, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cliente não encontrado',
                code: 'CLIENT_NOT_FOUND'
            });
        }

        res.json({
            message: 'Cliente atualizado com sucesso',
            client: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/clients/:id
 * Remove cliente
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM clientes WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cliente não encontrado',
                code: 'CLIENT_NOT_FOUND'
            });
        }

        res.json({
            message: 'Cliente removido com sucesso'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;