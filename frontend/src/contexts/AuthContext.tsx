
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User as ApiUser } from '../lib/api';
import { toast } from '@/hooks/use-toast';

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

// Interface para o usuário logado (adaptada para usar dados da API)
export interface User {
    id: string;
    nome: string;
    email: string;
    tipo: UserType;
    permissions: UserPermissions;
    avatar_url?: string;
    telefone?: string;
    endereco?: string;
    ativo: boolean;
    data_cadastro: string;
    ultimo_login?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (module: string, action: string) => boolean;
    hasRolePermission: (requiredRole: UserType[]) => boolean;
    getDefaultPermissions: (tipo: UserType) => UserPermissions;
    refreshToken: () => Promise<void>;
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

// Função para converter usuário da API para formato local
const convertApiUserToUser = (apiUser: ApiUser): User => {
    return {
        id: apiUser.id,
        nome: apiUser.nome,
        email: apiUser.email,
        tipo: apiUser.tipo as UserType,
        permissions: getDefaultPermissions(apiUser.tipo as UserType),
        avatar_url: apiUser.avatar_url,
        telefone: apiUser.telefone,
        endereco: apiUser.endereco,
        ativo: apiUser.ativo,
        data_cadastro: apiUser.data_cadastro,
        ultimo_login: apiUser.ultimo_login,
    };
};

// Provider do contexto de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    // Função para fazer login usando a API real
    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);

        try {
            const response = await api.login(email, password);
            const userConverted = convertApiUserToUser(response.user);
            setUser(userConverted);

            // Salva no localStorage para persistir a sessão
            localStorage.setItem('bvolt-user', JSON.stringify(userConverted));
            setLoading(false);
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            setLoading(false);
            
            // Tratamento específico de erros de autenticação
            if (error instanceof Error) {
                if (error.message.includes('401') || error.message.includes('INVALID_CREDENTIALS')) {
                    toast({
                        title: "Credenciais inválidas",
                        description: "Email ou senha incorretos.",
                        variant: "destructive"
                    });
                } else if (error.message.includes('USER_INACTIVE')) {
                    toast({
                        title: "Usuário inativo",
                        description: "Sua conta foi desativada. Entre em contato com o administrador.",
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Erro no login",
                        description: "Falha na comunicação com o servidor. Tente novamente.",
                        variant: "destructive"
                    });
                }
            }
            return false;
        }
    };

    // Função para fazer logout usando a API real
    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Erro no logout:', error);
            // Continue with logout even if API call fails
        } finally {
            setUser(null);
            localStorage.removeItem('bvolt-user');
        }
    };

    // Função para renovar token
    const refreshToken = async () => {
        try {
            await api.refreshToken();
            // Token é automaticamente atualizado na instância da API
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            // Se falhar ao renovar, fazer logout
            await logout();
            toast({
                title: "Sessão expirada",
                description: "Sua sessão expirou. Faça login novamente.",
                variant: "destructive"
            });
        }
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

    // Recupera usuário e valida autenticação ao inicializar
    useEffect(() => {
        const checkAuth = async () => {
            const savedUser = localStorage.getItem('bvolt-user');
            const token = localStorage.getItem('token');

            console.log('CheckAuth - savedUser:', savedUser);
            console.log('CheckAuth - token:', token);

            if (savedUser && token) {
                try {
                    console.log('Validando token com servidor...');
                    // Valida o token com o servidor
                    const response = await api.getCurrentUser();
                    console.log('getCurrentUser response:', response);
                    const userConverted = convertApiUserToUser(response.user);
                    setUser(userConverted);
                    
                    // Atualiza dados salvos se necessário
                    localStorage.setItem('bvolt-user', JSON.stringify(userConverted));
                } catch (error) {
                    console.error('Erro ao validar autenticação:', error);
                    // Token inválido ou expirado, limpar dados
                    localStorage.removeItem('bvolt-user');
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Configurar interceptador para lidar com tokens expirados
    useEffect(() => {
        const setupTokenRefresh = () => {
            // Interceptar requisições que falham com 401
            const originalRequest = api.get;
            // Note: This is a simplified approach. In a real app, you'd want to 
            // implement proper request/response interceptors
        };

        if (user) {
            setupTokenRefresh();
        }
    }, [user]);

    const value: AuthContextType = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        hasPermission,
        hasRolePermission,
        getDefaultPermissions,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
