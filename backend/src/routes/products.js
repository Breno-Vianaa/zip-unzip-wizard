/**
 * Rotas para gerenciamento de produtos
 * CRUD completo com filtros, busca e validações
 */

const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const { authenticateToken, requireManager } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/produtos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'produto-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, WebP)'));
    }
});

/**
 * GET /api/products
 * Lista produtos com filtros e paginação
 */
router.get('/', [
    authenticateToken,
    queryValidator('page').optional().isInt({ min: 1 }),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('search').optional().isLength({ max: 100 }),
    queryValidator('categoria').optional().isUUID(),
    queryValidator('fornecedor').optional().isUUID(),
    queryValidator('ativo').optional().isBoolean()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Parâmetros inválidos',
                details: errors.array()
            });
        }

        const {
            page = 1,
            limit = 20,
            search,
            categoria,
            fornecedor,
            ativo = true
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['p.ativo = $1'];
        let params = [ativo];
        let paramCount = 1;

        // Filtro de busca
        if (search) {
            paramCount++;
            whereConditions.push(`(
        p.nome ILIKE $${paramCount} OR 
        p.codigo_interno ILIKE $${paramCount} OR 
        p.codigo_barras ILIKE $${paramCount}
      )`);
            params.push(`%${search}%`);
        }

        // Filtro por categoria
        if (categoria) {
            paramCount++;
            whereConditions.push(`p.categoria_id = $${paramCount}`);
            params.push(categoria);
        }

        // Filtro por fornecedor
        if (fornecedor) {
            paramCount++;
            whereConditions.push(`p.fornecedor_id = $${paramCount}`);
            params.push(fornecedor);
        }

        const whereClause = whereConditions.join(' AND ');

        // Query para buscar produtos
        const productsQuery = `
      SELECT 
        p.*,
        c.nome as categoria_nome,
        c.cor as categoria_cor,
        f.nome as fornecedor_nome
      FROM produtos p
      LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE ${whereClause}
      ORDER BY p.nome
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

        params.push(limit, offset);

        // Query para contar total
        const countQuery = `
      SELECT COUNT(*) as total
      FROM produtos p
      WHERE ${whereClause}
    `;

        const [productsResult, countResult] = await Promise.all([
            query(productsQuery, params),
            query(countQuery, params.slice(0, -2)) // Remove limit e offset do count
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        res.json({
            products: productsResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/products/:id
 * Busca produto por ID
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;

        const productResult = await query(`
      SELECT 
        p.*,
        c.nome as categoria_nome,
        c.cor as categoria_cor,
        f.nome as fornecedor_nome,
        f.telefone as fornecedor_telefone
      FROM produtos p
      LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.id = $1
    `, [id]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Produto não encontrado',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        res.json({
            product: productResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/products
 * Cria novo produto
 */
router.post('/', [
    authenticateToken,
    requireManager,
    upload.single('imagem_principal'),
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('categoria_id').isUUID().withMessage('Categoria válida é obrigatória'),
    body('preco_venda').isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo'),
    body('estoque_atual').optional().isInt({ min: 0 })
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const {
            nome,
            descricao,
            categoria_id,
            fornecedor_id,
            codigo_interno,
            codigo_barras,
            preco_custo,
            preco_venda,
            margem_lucro,
            estoque_atual = 0,
            estoque_minimo,
            estoque_maximo,
            unidade_medida,
            peso,
            altura,
            largura,
            comprimento,
            ncm,
            origem,
            cst_icms,
            aliquota_icms
        } = req.body;

        const imagem_principal = req.file ? `/uploads/produtos/${req.file.filename}` : null;

        const productResult = await query(`
      INSERT INTO produtos (
        nome, descricao, categoria_id, fornecedor_id, codigo_interno,
        codigo_barras, preco_custo, preco_venda, margem_lucro,
        estoque_atual, estoque_minimo, estoque_maximo, unidade_medida,
        peso, altura, largura, comprimento, ncm, origem,
        cst_icms, aliquota_icms, imagem_principal, cadastrado_por
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *
    `, [
            nome, descricao, categoria_id, fornecedor_id, codigo_interno,
            codigo_barras, preco_custo, preco_venda, margem_lucro,
            estoque_atual, estoque_minimo, estoque_maximo, unidade_medida,
            peso, altura, largura, comprimento, ncm, origem,
            cst_icms, aliquota_icms, imagem_principal, req.user.id
        ]);

        res.status(201).json({
            message: 'Produto criado com sucesso',
            product: productResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/products/:id
 * Atualiza produto existente
 */
router.put('/:id', [
    authenticateToken,
    requireManager,
    upload.single('imagem_principal'),
    body('nome').optional().notEmpty(),
    body('preco_venda').optional().isFloat({ min: 0 })
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
        const updateData = { ...req.body };

        if (req.file) {
            updateData.imagem_principal = `/uploads/produtos/${req.file.filename}`;
        }

        // Remove campos que não devem ser atualizados diretamente
        delete updateData.id;
        delete updateData.data_cadastro;

        const updateFields = Object.keys(updateData).map((key, index) =>
            `${key} = $${index + 2}`
        ).join(', ');

        const values = [id, ...Object.values(updateData)];

        const productResult = await query(`
      UPDATE produtos 
      SET ${updateFields}, data_atualizacao = NOW()
      WHERE id = $1 
      RETURNING *
    `, values);

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Produto não encontrado',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        res.json({
            message: 'Produto atualizado com sucesso',
            product: productResult.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/products/:id
 * Remove produto (soft delete)
 */
router.delete('/:id', [authenticateToken, requireManager], async (req, res, next) => {
    try {
        const { id } = req.params;

        const productResult = await query(
            'UPDATE produtos SET ativo = false, data_atualizacao = NOW() WHERE id = $1 RETURNING *',
            [id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Produto não encontrado',
                code: 'PRODUCT_NOT_FOUND'
            });
        }

        res.json({
            message: 'Produto removido com sucesso'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;