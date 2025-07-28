/**
 * Middleware de tratamento global de erros
 * Padroniza respostas de erro e log de erros
 */

/**
 * Middleware de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
    console.error('🚨 Erro capturado:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        user: req.user?.id
    });

    // Erro de validação do express-validator
    if (err.type === 'validation') {
        return res.status(400).json({
            error: 'Dados inválidos',
            code: 'VALIDATION_ERROR',
            details: err.errors
        });
    }

    // Erro de banco de dados PostgreSQL
    if (err.code && err.code.startsWith('23')) {
        let message = 'Erro de integridade dos dados';

        switch (err.code) {
            case '23505': // unique_violation
                message = 'Registro já existe';
                break;
            case '23503': // foreign_key_violation
                message = 'Referência inválida';
                break;
            case '23502': // not_null_violation
                message = 'Campo obrigatório não informado';
                break;
        }

        return res.status(400).json({
            error: message,
            code: 'DATABASE_CONSTRAINT_ERROR',
            constraint: err.constraint
        });
    }

    // Erro de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Erro de upload de arquivo
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Arquivo muito grande',
            code: 'FILE_TOO_LARGE',
            limit: process.env.MAX_FILE_SIZE
        });
    }

    // Erro de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'JSON malformado',
            code: 'INVALID_JSON'
        });
    }

    // Erro padrão (500)
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : err.message,
        code: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;