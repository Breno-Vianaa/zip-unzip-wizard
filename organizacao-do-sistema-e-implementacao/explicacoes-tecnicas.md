# 🧠 Explicações Técnicas - Sistema BVOLT

## 🔐 Sistema de Autenticação

### 🎯 Arquitetura JWT
O sistema utiliza **JSON Web Tokens (JWT)** para autenticação stateless:

```javascript
// Fluxo de autenticação
1. Cliente envia credenciais (email/senha)
2. Servidor valida no banco de dados
3. Se válido, gera JWT com dados do usuário
4. Cliente armazena token e envia em todas requisições
5. Servidor valida token em cada requisição protegida
```

### 🛡️ Middleware de Autenticação
```javascript
// backend/src/middlewares/auth.js
const authenticateToken = async (req, res, next) => {
    // Extrai token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // Verifica se token existe
    if (!token) {
        return res.status(401).json({
            error: 'Token de acesso requerido'
        });
    }
    
    try {
        // Decodifica e valida token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Busca dados atuais do usuário
        const user = await query(
            'SELECT * FROM profiles WHERE id = $1', 
            [decoded.userId]
        );
        
        // Adiciona usuário à requisição
        req.user = user.rows[0];
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido'
        });
    }
};
```

### 👥 Sistema de Permissões
```javascript
// Hierarquia de permissões
const userHierarchy = {
    'admin': ['admin', 'gerente', 'vendedor'],    // Acesso total
    'gerente': ['gerente', 'vendedor'],           // Acesso gerencial
    'vendedor': ['vendedor']                      // Acesso básico
};

// Middleware de verificação de papel
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.tipo)) {
            return res.status(403).json({
                error: 'Permissão insuficiente'
            });
        }
        next();
    };
};
```

## 🗄️ Banco de Dados PostgreSQL

### 📊 Modelo Relacional
```sql
-- Estrutura principal das tabelas

-- Usuários e autenticação
profiles (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo user_type NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Produtos
products (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id UUID REFERENCES categories(id),
    fornecedor_id UUID REFERENCES suppliers(id),
    sku VARCHAR(100) UNIQUE,
    ativo BOOLEAN DEFAULT true
);

-- Controle de estoque
stock (
    id UUID PRIMARY KEY,
    produto_id UUID REFERENCES products(id),
    quantidade INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER DEFAULT 10,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendas
sales (
    id UUID PRIMARY KEY,
    cliente_id UUID REFERENCES clients(id),
    vendedor_id UUID REFERENCES profiles(id),
    total DECIMAL(10,2) NOT NULL,
    status sale_status DEFAULT 'pendente',
    data_venda TIMESTAMP DEFAULT NOW()
);
```

### 🔄 Triggers Automáticos
```sql
-- Trigger para atualizar estoque após venda
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Reduz quantidade em estoque
    UPDATE stock 
    SET quantidade = quantidade - NEW.quantidade,
        updated_at = NOW()
    WHERE produto_id = NEW.produto_id;
    
    -- Verifica se ficou abaixo do mínimo
    IF (SELECT quantidade FROM stock WHERE produto_id = NEW.produto_id) 
       < (SELECT quantidade_minima FROM stock WHERE produto_id = NEW.produto_id) THEN
        
        -- Gera alerta de estoque baixo
        INSERT INTO alerts (tipo, mensagem, produto_id, created_at)
        VALUES ('estoque_baixo', 'Produto com estoque abaixo do mínimo', NEW.produto_id, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 📈 Pool de Conexões
```javascript
// backend/src/database/connection.js
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,                    // máximo de conexões simultâneas
    idleTimeoutMillis: 30000,   // timeout de conexão idle
    connectionTimeoutMillis: 2000 // timeout de conexão
});

// Função para executar queries com logging
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log('Query executada:', { 
                text, 
                duration: `${duration}ms`, 
                rows: result.rowCount 
            });
        }
        
        return result;
    } catch (error) {
        console.error('Erro na query:', { text, error: error.message });
        throw error;
    }
};
```

## 🌐 API REST

### 📡 Estrutura de Rotas
```javascript
// Padrão RESTful adotado
app.use('/api/auth', authRoutes);        // POST /login, /logout, /refresh
app.use('/api/users', userRoutes);       // CRUD de usuários
app.use('/api/products', productRoutes); // CRUD de produtos
app.use('/api/sales', salesRoutes);      // CRUD de vendas
app.use('/api/reports', reportRoutes);   // Geração de relatórios

// Exemplo de rota com validação
router.post('/products', 
    authenticateToken,           // Middleware de autenticação
    requireRole(['admin', 'gerente']), // Middleware de permissão
    [
        body('nome').notEmpty().withMessage('Nome é obrigatório'),
        body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser positivo'),
        body('categoria_id').isUUID().withMessage('Categoria inválida')
    ],                          // Validação de entrada
    async (req, res) => {
        // Lógica do controller
    }
);
```

### 🛡️ Middleware de Segurança
```javascript
// Configuração de segurança no Express
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configurado para frontend específico
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## ⚛️ Frontend React

### 🎣 Context API para Estado Global
```typescript
// frontend/src/contexts/AuthContext.tsx
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (requiredRoles: UserType[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
```

### 🔄 React Query para Cache de Dados
```typescript
// Hook para buscar produtos com cache
const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/api/products');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
        refetchOnWindowFocus: false
    });
};

// Hook para mutação (criação/edição)
const useCreateProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (productData) => api.post('/api/products', productData),
        onSuccess: () => {
            // Invalida cache para refetch automático
            queryClient.invalidateQueries(['products']);
            toast.success('Produto criado com sucesso!');
        },
        onError: (error) => {
            toast.error('Erro ao criar produto');
        }
    });
};
```

### 🎨 Sistema de Design com Tailwind
```typescript
// Componente Button com variants
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline"
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    }
);
```

## 📊 Sistema de Relatórios

### 📈 Geração de PDFs
```javascript
// backend/src/controllers/reportController.js
const generateSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, vendedorId } = req.query;
        
        // Busca dados de vendas
        const salesData = await query(`
            SELECT s.*, c.nome as cliente_nome, p.nome as vendedor_nome
            FROM sales s
            JOIN clients c ON s.cliente_id = c.id
            JOIN profiles p ON s.vendedor_id = p.id
            WHERE s.data_venda BETWEEN $1 AND $2
            ${vendedorId ? 'AND s.vendedor_id = $3' : ''}
            ORDER BY s.data_venda DESC
        `, vendedorId ? [startDate, endDate, vendedorId] : [startDate, endDate]);
        
        // Gera PDF com jsPDF
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório de Vendas', 20, 20);
        
        // Adiciona dados em tabela
        salesData.rows.forEach((sale, index) => {
            const y = 40 + (index * 10);
            doc.text(`${sale.cliente_nome} - R$ ${sale.total}`, 20, y);
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-vendas.pdf');
        res.send(doc.output());
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
```

### 📊 Gráficos com Recharts
```typescript
// Componente de gráfico de vendas
const SalesChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="data" 
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                />
                <YAxis 
                    tickFormatter={(value) => 
                        new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(value)
                    }
                />
                <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                    formatter={(value) => [
                        new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(value),
                        'Vendas'
                    ]}
                />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};
```

## 🔒 Segurança e Validação

### 🛡️ Validação de Entrada
```javascript
// Validador de CPF brasileiro
const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return cpf[9] == digit1 && cpf[10] == digit2;
};

// Middleware de validação personalizada
const validateBrazilianData = (req, res, next) => {
    const { cpf, cnpj, cep } = req.body;
    
    if (cpf && !validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido' });
    }
    
    if (cnpj && !validateCNPJ(cnpj)) {
        return res.status(400).json({ error: 'CNPJ inválido' });
    }
    
    if (cep && !validateCEP(cep)) {
        return res.status(400).json({ error: 'CEP inválido' });
    }
    
    next();
};
```

### 🔐 Criptografia de Senhas
```javascript
// Hash de senha com bcrypt
const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

// Verificação de senha
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Geração de JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user.id, 
            email: user.email, 
            tipo: user.tipo 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
        }
    );
};
```

## 📱 Responsividade e Performance

### 🎨 Design Responsivo
```css
/* Breakpoints Tailwind configurados */
@media (min-width: 640px) {  /* sm: smartphones */
    .container { max-width: 640px; }
}

@media (min-width: 768px) {  /* md: tablets */
    .container { max-width: 768px; }
}

@media (min-width: 1024px) { /* lg: laptops */
    .container { max-width: 1024px; }
}

@media (min-width: 1280px) { /* xl: desktops */
    .container { max-width: 1280px; }
}
```

### ⚡ Otimizações de Performance
```typescript
// Lazy loading de componentes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));

// Memoização de componentes
const ProductCard = memo(({ product }) => {
    return (
        <div className="border rounded-lg p-4">
            <h3>{product.nome}</h3>
            <p>{product.preco}</p>
        </div>
    );
});

// Debounce para busca
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};
```