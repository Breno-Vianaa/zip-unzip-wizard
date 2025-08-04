# 🏆 Melhores Práticas - Sistema BVOLT

## 🎯 Práticas de Desenvolvimento

### 📝 Código Limpo

#### TypeScript/JavaScript
```typescript
// ✅ BOM: Tipos explícitos e interface bem definida
interface User {
  id: number;
  username: string;
  tipo: 'admin' | 'gerente' | 'vendedor';
  ativo: boolean;
  created_at: string;
}

const createUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  // Implementação
};

// ❌ RUIM: Sem tipos, nomes confusos
const createU = async (data: any) => {
  // Implementação
};
```

#### Componentes React
```tsx
// ✅ BOM: Componente bem estruturado
interface ProductCardProps {
  product: Product;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  canEdit 
}) => {
  return (
    <Card>
      {/* Conteúdo */}
    </Card>
  );
};

// ❌ RUIM: Props sem tipo, lógica confusa
const ProductCard = ({ data, onClick }) => {
  // Implementação confusa
};
```

### 🗂️ Organização de Arquivos

#### Estrutura de Componentes
```
components/
├── ui/                 # Componentes básicos reutilizáveis
│   ├── button.tsx
│   ├── input.tsx
│   └── modal.tsx
├── layout/             # Componentes de layout
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
├── features/           # Componentes específicos por feature
│   ├── vendas/
│   ├── produtos/
│   └── clientes/
└── shared/             # Componentes compartilhados
    ├── SearchInput.tsx
    └── DataTable.tsx
```

#### Nomenclatura
```typescript
// ✅ BOM: Nomes descritivos e consistentes
const getUserPermissions = (userType: UserType) => { /* */ };
const validateCPF = (cpf: string) => { /* */ };
const formatCurrency = (value: number) => { /* */ };

// ❌ RUIM: Nomes genéricos ou confusos
const getPerms = (type: any) => { /* */ };
const validate = (data: string) => { /* */ };
const format = (val: number) => { /* */ };
```

### 🔐 Segurança

#### Validação de Dados
```typescript
// ✅ BOM: Validação no frontend e backend
// Frontend (Zod)
const userSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  tipo: z.enum(['admin', 'gerente', 'vendedor'])
});

// Backend (express-validator)
const validateUser = [
  body('username').isLength({ min: 3, max: 50 }).trim().escape(),
  body('password').isLength({ min: 6 }),
  body('tipo').isIn(['admin', 'gerente', 'vendedor'])
];
```

#### Permissões
```typescript
// ✅ BOM: Verificação granular de permissões
const hasPermission = (userType: UserType, action: string, resource: string) => {
  const permissions = getUserPermissions(userType);
  return permissions[resource]?.includes(action) || false;
};

// ❌ RUIM: Verificação simplista
const canAccess = (user: any) => user.type === 'admin';
```

### 🎨 Interface e UX

#### Design System
```css
/* ✅ BOM: Uso de tokens do design system */
.button-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

/* ❌ RUIM: Cores hardcoded */
.button-primary {
  background-color: #3b82f6;
  color: white;
}
```

#### Responsividade
```tsx
// ✅ BOM: Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Conteúdo */}
</div>

// ❌ RUIM: Não considera mobile
<div className="grid grid-cols-3 gap-4">
  {/* Conteúdo */}
</div>
```

## 🗄️ Práticas de Banco de Dados

### 📋 Estrutura de Tabelas
```sql
-- ✅ BOM: Estrutura bem normalizada
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('admin', 'gerente', 'vendedor')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
```

### 🔍 Queries Otimizadas
```sql
-- ✅ BOM: Query otimizada com índices
SELECT u.id, u.username, u.tipo, 
       COUNT(v.id) as total_vendas
FROM usuarios u
LEFT JOIN vendas v ON u.id = v.usuario_id 
WHERE u.ativo = true 
  AND u.tipo IN ('gerente', 'vendedor')
GROUP BY u.id, u.username, u.tipo
ORDER BY total_vendas DESC
LIMIT 10;

-- ❌ RUIM: Query sem otimização
SELECT * FROM usuarios WHERE username LIKE '%texto%';
```

## 🚀 Performance

### ⚡ Frontend
```typescript
// ✅ BOM: Lazy loading de componentes
const LazyDashboard = lazy(() => import('./components/Dashboard'));
const LazyProdutos = lazy(() => import('./components/Produtos'));

// ✅ BOM: Memoização de componentes pesados
const ExpensiveComponent = memo(({ data }: { data: Product[] }) => {
  const processedData = useMemo(() => 
    data.map(item => heavyProcessing(item)), [data]
  );
  
  return <div>{/* Renderização */}</div>;
});

// ✅ BOM: Debounce em campos de busca
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 🔧 Backend
```javascript
// ✅ BOM: Cache de queries frequentes
const cache = new Map();

const getCachedData = async (key, fetchFunction, ttl = 300000) => {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }
  
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

// ✅ BOM: Paginação eficiente
const getProducts = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM produtos 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `;
  return await db.query(query, [limit, offset]);
};
```

## 🔒 Segurança Avançada

### 🛡️ Validação e Sanitização
```javascript
// ✅ BOM: Validação robusta
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres perigosos
    .substring(0, 255);   // Limita tamanho
};

const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Validação de dígitos verificadores
  // ... algoritmo completo
  return true;
};
```

### 🔐 Controle de Acesso
```javascript
// ✅ BOM: Middleware de autorização granular
const authorize = (permissions) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req.user.tipo);
    const hasAccess = permissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    next();
  };
};

// Uso
app.get('/api/admin/users', 
  authenticateToken, 
  authorize(['admin', 'manage_users']), 
  getUsersController
);
```

## 📊 Monitoramento e Logs

### 📝 Sistema de Logs
```javascript
// ✅ BOM: Logs estruturados
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

// Uso
logger.info('Usuário logado', { userId: user.id, username: user.username });
logger.error(error, { action: 'create_product', userId: req.user.id });
```

### 📈 Métricas
```javascript
// ✅ BOM: Coleta de métricas importantes
const metrics = {
  requests: 0,
  errors: 0,
  responseTime: [],
  
  recordRequest: (duration) => {
    metrics.requests++;
    metrics.responseTime.push(duration);
  },
  
  recordError: () => {
    metrics.errors++;
  },
  
  getStats: () => ({
    totalRequests: metrics.requests,
    totalErrors: metrics.errors,
    errorRate: metrics.errors / metrics.requests,
    avgResponseTime: metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
  })
};
```

## 🧪 Testes

### 🔬 Testes Unitários
```typescript
// ✅ BOM: Testes bem estruturados
describe('validateCPF', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('123.456.789-09')).toBe(true);
  });
  
  it('should reject invalid CPF', () => {
    expect(validateCPF('123.456.789-00')).toBe(false);
    expect(validateCPF('111.111.111-11')).toBe(false);
  });
  
  it('should handle different formats', () => {
    expect(validateCPF('12345678909')).toBe(true);
    expect(validateCPF('123.456.789-09')).toBe(true);
  });
});
```

### 🧩 Testes de Integração
```javascript
// ✅ BOM: Teste de API completo
describe('POST /api/products', () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedTestData();
  });
  
  it('should create product with valid data', async () => {
    const productData = {
      nome: 'Produto Teste',
      preco: 29.99,
      categoria_id: 1
    };
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData)
      .expect(201);
    
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      nome: 'Produto Teste',
      preco: 29.99
    });
  });
});
```

## 🚀 Deploy e Produção

### 🐳 Docker Best Practices
```dockerfile
# ✅ BOM: Dockerfile otimizado
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY . .

USER nextjs
EXPOSE 3001
CMD ["npm", "start"]
```

### 🔧 Configuração de Produção
```javascript
// ✅ BOM: Configuração por ambiente
const config = {
  development: {
    database: {
      host: 'localhost',
      port: 5432,
      ssl: false
    },
    cors: {
      origin: 'http://localhost:5173'
    }
  },
  
  production: {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false }
    },
    cors: {
      origin: process.env.FRONTEND_URL
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

---

🎯 **Seguindo essas práticas, você manterá o código limpo, seguro e performático!**