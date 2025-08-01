
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de usuário do sistema BVOLT
export type UserType = 'admin' | 'gerente' | 'vendedor';

// Estrutura de permissões por módulo e ação
export interface Permission {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
}

export interface UserPermissions {
    produtos: Permission;
    vendas: Permission;
    clientes: Permission;
    fornecedores: Permission;
    estoque: Permission;
    relatorios: Permission;
    financeiro: Permission;
    usuarios: Permission;
    configuracoes: Permission;
}

// Interface para o usuário logado
export interface User {
    id: string;
    nome: string;
    usuario: string;
    tipo: UserType;
    permissions: UserPermissions;
    avatar?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
    user: User | null;
    login: (usuario: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (module: string, action: string) => boolean;
    hasRolePermission: (requiredRole: UserType[]) => boolean;
    getDefaultPermissions: (tipo: UserType) => UserPermissions;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

// Função para gerar permissões padrão baseadas no tipo
const getDefaultPermissions = (tipo: UserType): UserPermissions => {
    const basePermissions: UserPermissions = {
        produtos: { view: false, create: false, edit: false, delete: false },
        vendas: { view: false, create: false, edit: false, delete: false },
        clientes: { view: false, create: false, edit: false, delete: false },
        fornecedores: { view: false, create: false, edit: false, delete: false },
        estoque: { view: false, create: false, edit: false, delete: false },
        relatorios: { view: false, create: false, edit: false, delete: false },
        financeiro: { view: false, create: false, edit: false, delete: false },
        usuarios: { view: false, create: false, edit: false, delete: false },
        configuracoes: { view: false, create: false, edit: false, delete: false }
    };

    switch (tipo) {
        case 'admin':
            // Admin tem acesso total a tudo
            Object.keys(basePermissions).forEach(module => {
                basePermissions[module as keyof UserPermissions] = {
                    view: true, create: true, edit: true, delete: true
                };
            });
            break;
        
        case 'gerente':
            // Gerente pode gerenciar produtos, estoque, vendas, clientes, fornecedores, relatórios e financeiro
            basePermissions.produtos = { view: true, create: true, edit: true, delete: true };
            basePermissions.vendas = { view: true, create: true, edit: true, delete: true };
            basePermissions.clientes = { view: true, create: true, edit: true, delete: true };
            basePermissions.fornecedores = { view: true, create: true, edit: true, delete: true };
            basePermissions.estoque = { view: true, create: true, edit: true, delete: true };
            basePermissions.relatorios = { view: true, create: true, edit: true, delete: false };
            basePermissions.financeiro = { view: true, create: true, edit: true, delete: false };
            break;
        
        case 'vendedor':
            // Vendedor pode visualizar produtos, realizar vendas e cadastrar clientes
            basePermissions.produtos = { view: true, create: false, edit: false, delete: false };
            basePermissions.vendas = { view: true, create: true, edit: true, delete: false };
            basePermissions.clientes = { view: true, create: true, edit: true, delete: false };
            break;
    }

    return basePermissions;
};

// Dados mockados dos usuários para demonstração
const mockUsers: (User & { password: string })[] = [
    {
        id: '1',
        nome: 'Admin Sistema',
        usuario: 'admin',
        password: '123456',
        tipo: 'admin',
        permissions: getDefaultPermissions('admin')
    },
    {
        id: '2',
        nome: 'João Gerente',
        usuario: 'gerente',
        password: '123456',
        tipo: 'gerente',
        permissions: getDefaultPermissions('gerente')
    },
    {
        id: '3',
        nome: 'Maria Vendedora',
        usuario: 'vendedor',
        password: '123456',
        tipo: 'vendedor',
        permissions: getDefaultPermissions('vendedor')
    }
];

// Provider do contexto de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    // Função para fazer login (simulação de API)
    const login = async (usuario: string, password: string): Promise<boolean> => {
        setLoading(true);

        // Simula delay de requisição para API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Busca usuário nos dados mockados
        const foundUser = mockUsers.find(u => u.usuario === usuario && u.password === password);

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);

            // Salva no localStorage para persistir a sessão
            localStorage.setItem('bvolt-user', JSON.stringify(userWithoutPassword));
            setLoading(false);
            return true;
        }

        setLoading(false);
        return false;
    };

    // Função para fazer logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('bvolt-user');
    };

    // Função para verificar permissões por módulo e ação
    const hasPermission = (module: string, action: string): boolean => {
        if (!user) return false;

        // Admin tem acesso a tudo
        if (user.tipo === 'admin') return true;

        // Verifica permissão específica no módulo
        const modulePermissions = user.permissions[module as keyof UserPermissions];
        if (!modulePermissions) return false;

        return modulePermissions[action as keyof Permission] === true;
    };

    // Função para verificar permissões por papel (compatibilidade)
    const hasRolePermission = (requiredRoles: UserType[]): boolean => {
        if (!user) return false;

        // Admin tem acesso a tudo
        if (user.tipo === 'admin') return true;

        // Verifica se o tipo do usuário está na lista de papéis permitidos
        return requiredRoles.includes(user.tipo);
    };

    // Recupera usuário do localStorage ao inicializar - com segurança adicional
    useEffect(() => {
        const checkAuth = () => {
            // Por segurança, sempre redirecionar para login ao recarregar a página
            const isPageReload = window.performance.navigation.type === 1 ||
                (window.performance.getEntriesByType('navigation')[0] as any)?.type === 'reload';

            if (isPageReload) {
                // Limpa dados de autenticação ao recarregar por segurança
                localStorage.removeItem('bvolt-user');
                setUser(null);
                setLoading(false);
                return;
            }

            // Verifica autenticação normal apenas se não for reload
            const savedUser = localStorage.getItem('bvolt-user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Erro ao carregar usuário do localStorage:', error);
                    localStorage.removeItem('bvolt-user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        hasPermission,
        hasRolePermission,
        getDefaultPermissions
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
