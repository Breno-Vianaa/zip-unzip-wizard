/**
 * Rotas de usuários
 * Gerenciamento de perfis e usuários do sistema
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken, requireAdmin, requireManager } = require('../middlewares/auth');

const router = express.Router();

/**
 * GET /api/users
 * Lista todos os usuários (apenas admin/gerente)
 */
router.get('/', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [limit, offset];

        if (search) {
            whereClause = 'WHERE nome ILIKE $3 OR email ILIKE $3';
            queryParams.push(`%${search}%`);
        }

        const result = await query(`
            SELECT id, nome, email, tipo, ativo, avatar_url, telefone, 
                   endereco, data_cadastro, ultimo_login
            FROM profiles 
            ${whereClause}
            ORDER BY data_cadastro DESC
            LIMIT $1 OFFSET $2
        `, queryParams);

        const countResult = await query(`
            SELECT COUNT(*) as total FROM profiles ${whereClause}
        `, search ? [`%${search}%`] : []);

        res.json({
            users: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/users/:id
 * Busca usuário por ID
 */
router.get('/:id', authenticateToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT id, nome, email, tipo, ativo, avatar_url, telefone, 
                   endereco, data_cadastro, ultimo_login
            FROM profiles 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            user: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/users
 * Cria novo usuário (apenas admin)
 */
router.post('/', authenticateToken, requireAdmin, [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().normalizeEmail().withMessage('Email válido é obrigatório'),
    body('tipo').isIn(['admin', 'gerente', 'vendedor']).withMessage('Tipo deve ser admin, gerente ou vendedor')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { nome, email, tipo, telefone, endereco } = req.body;

        // Verifica se email já existe
        const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'Email já está em uso',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }

        const result = await query(`
            INSERT INTO profiles (nome, email, tipo, telefone, endereco, ativo)
            VALUES ($1, $2, $3, $4, $5, true)
            RETURNING id, nome, email, tipo, ativo, telefone, endereco, data_cadastro
        `, [nome, email, tipo, telefone, endereco]);

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/users/:id
 * Atualiza usuário
 */
router.put('/:id', authenticateToken, requireManager, [
    body('nome').optional().notEmpty().withMessage('Nome não pode estar vazio'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email deve ser válido'),
    body('tipo').optional().isIn(['admin', 'gerente', 'vendedor']).withMessage('Tipo inválido')
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
        const { nome, email, tipo, telefone, endereco, ativo } = req.body;

        const result = await query(`
            UPDATE profiles 
            SET nome = COALESCE($1, nome),
                email = COALESCE($2, email),
                tipo = COALESCE($3, tipo),
                telefone = COALESCE($4, telefone),
                endereco = COALESCE($5, endereco),
                ativo = COALESCE($6, ativo)
            WHERE id = $7
            RETURNING id, nome, email, tipo, ativo, telefone, endereco, data_cadastro
        `, [nome, email, tipo, telefone, endereco, ativo, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            message: 'Usuário atualizado com sucesso',
            user: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/users/:id
 * Remove usuário (apenas admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM profiles WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            message: 'Usuário removido com sucesso'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;