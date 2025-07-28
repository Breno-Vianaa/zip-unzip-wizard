/**
 * Configuração e conexão com banco de dados PostgreSQL
 * Gerencia pool de conexões e operações básicas
 */

const { Pool } = require('pg');

// Configuração do pool de conexões
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Conecta ao banco de dados e testa a conexão
 */
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao PostgreSQL com sucesso');

        // Testa a conexão
        const result = await client.query('SELECT NOW()');
        console.log('🕒 Timestamp do banco:', result.rows[0].now);

        client.release();
    } catch (error) {
        console.error('❌ Erro ao conectar com PostgreSQL:', error);
        process.exit(1);
    }
};

/**
 * Executa uma query no banco de dados
 * @param {string} text - SQL query
 * @param {Array} params - Parâmetros da query
 * @returns {Object} Resultado da query
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Query executada:', { text, duration: `${duration}ms`, rows: result.rowCount });
        }

        return result;
    } catch (error) {
        console.error('❌ Erro na query:', { text, error: error.message });
        throw error;
    }
};

/**
 * Obtém um cliente do pool para transações
 */
const getClient = async () => {
    return await pool.connect();
};

module.exports = {
    connectDB,
    query,
    getClient,
    pool
};