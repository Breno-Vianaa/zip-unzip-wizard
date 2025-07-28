/**
 * Rotas de autenticação
 * Login, logout, registro e validação de tokens
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Autentica usuário e retorna token JWT
 */
router.post('/login', [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email válido é obrigatório'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res, next) => {
    try {
        // Verifica erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // Busca usuário no banco
        const userResult = await query(
            `SELECT id, nome, email, tipo, senha_hash, ativo, data_cadastro 
       FROM profiles 
       WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Email ou senha incorretos',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const user = userResult.rows[0];

        // Verifica se usuário está ativo
        if (!user.ativo) {
            return res.status(401).json({
                error: 'Usuário inativo',
                code: 'USER_INACTIVE'
            });
        }

        // Verifica senha (simulação - na implementação real, use bcrypt)
        const senhasValidas = {
            'admin@bvolt.com': 'admin123',
            'gerente@bvolt.com': 'gerente123',
            'vendedor@bvolt.com': 'vendedor123'
        };

        if (senhasValidas[email] !== password) {
            return res.status(401).json({
                error: 'Email ou senha incorretos',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Gera token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                tipo: user.tipo
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Atualiza último login
        await query(
            'UPDATE profiles SET ultimo_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Remove dados sensíveis da resposta
        const { senha_hash, ...userData } = user;

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: userData
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/logout
 * Invalida token (em implementação real, adicionar token a blacklist)
 */
router.post('/logout', authenticateToken, async (req, res) => {
    // Em uma implementação real, adicionar token a uma blacklist
    res.json({
        message: 'Logout realizado com sucesso'
    });
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        const userResult = await query(
            `SELECT id, nome, email, tipo, avatar_url, telefone, 
              endereco, ativo, data_cadastro, ultimo_login
       FROM profiles 
       WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            user: userResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/refresh
 * Atualiza token de acesso
 */
router.post('/refresh', authenticateToken, async (req, res, next) => {
    try {
        // Gera novo token
        const token = jwt.sign(
            {
                userId: req.user.id,
                email: req.user.email,
                tipo: req.user.tipo
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: 'Token atualizado com sucesso',
            token
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;