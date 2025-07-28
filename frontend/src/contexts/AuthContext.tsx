
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de usuário do sistema BVOLT
export type UserType = 'admin' | 'gerente' | 'vendedor';

// Interface para o usuário logado
export interface User {
    id: string;
    nome: string;
    email: string;
    tipo: UserType;
    avatar?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (requiredRole: UserType[]) => boolean;
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

// Dados mockados dos usuários para demonstração
const mockUsers: (User & { password: string })[] = [
    {
        id: '1',
        nome: 'Admin Sistema',
        email: 'admin@bvolt.com',
        password: '123456',
        tipo: 'admin'
    },
    {
        id: '2',
        nome: 'João Gerente',
        email: 'gerente@bvolt.com',
        password: '123456',
        tipo: 'gerente'
    },
    {
        id: '3',
        nome: 'Maria Vendedora',
        email: 'vendedor@bvolt.com',
        password: '123456',
        tipo: 'vendedor'
    }
];

// Provider do contexto de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    // Função para fazer login (simulação de API)
    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);

        // Simula delay de requisição para API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Busca usuário nos dados mockados
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

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

    // Função para verificar permissões do usuário
    const hasPermission = (requiredRoles: UserType[]): boolean => {
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
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
