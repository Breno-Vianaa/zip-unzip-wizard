/**
 * Middleware de autenticação JWT
 * Valida tokens e gerencia permissões de usuário
 */

const jwt = require('jsonwebtoken');
const { query } = require('../database/connection');

/**
 * Middleware para verificar se o usuário está autenticado
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Token de acesso requerido',
            code: 'MISSING_TOKEN'
        });
    }

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Busca dados atuais do usuário no banco
        const userResult = await query(
            'SELECT id, nome, email, tipo, ativo FROM profiles WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = userResult.rows[0];

        // Verifica se o usuário está ativo
        if (!user.ativo) {
            return res.status(401).json({
                error: 'Usuário inativo',
                code: 'USER_INACTIVE'
            });
        }

        // Adiciona informações do usuário à requisição
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(403).json({
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }
};

/**
 * Middleware para verificar permissões baseadas no tipo de usuário
 * @param {Array} allowedRoles - Array com os tipos permitidos ['admin', 'gerente', 'vendedor']
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        if (!allowedRoles.includes(req.user.tipo)) {
            return res.status(403).json({
                error: 'Permissão insuficiente',
                code: 'INSUFFICIENT_PERMISSION',
                required: allowedRoles,
                current: req.user.tipo
            });
        }

        next();
    };
};

/**
 * Middleware para verificar se é admin
 */
const requireAdmin = requireRole(['admin']);

/**
 * Middleware para verificar se é admin ou gerente
 */
const requireManager = requireRole(['admin', 'gerente']);

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireManager
};