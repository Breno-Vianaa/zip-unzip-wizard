
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Building2,
    FileText,
    Settings,
    UserPlus,
    Warehouse,
    LogOut,
    ChevronRight,
    DollarSign,
    CreditCard
} from 'lucide-react';
import BvoltLogo from './BvoltLogo';
import type { UserType } from '../contexts/AuthContext';

/**
 * Componente da Sidebar principal da aplicação
 * Navegação responsiva com collapse/expand
 * Logo oficial da BVOLT (não substituível)
 * Itens de menu filtrados por permissão
 */
export function AppSidebar() {
    const { user, logout, hasPermission } = useAuth();
    const { open } = useSidebar(); // Usar 'open' ao invés de 'collapsed'
    const location = useLocation();

    // Itens de navegação com controle de permissão tipado
    const navigationItems = [
        {
            title: 'Dashboard',
            url: '/',
            icon: LayoutDashboard,
            permissions: ['admin', 'gerente', 'vendedor'] as UserType[]
        },
        {
            title: 'Produtos',
            url: '/produtos',
            icon: Package,
            permissions: ['admin', 'gerente', 'vendedor'] as UserType[]
        },
        {
            title: 'Vendas',
            url: '/vendas',
            icon: ShoppingCart,
            permissions: ['admin', 'gerente', 'vendedor'] as UserType[]
        },
        {
            title: 'Estoque',
            url: '/estoque',
            icon: Warehouse,
            permissions: ['admin', 'gerente'] as UserType[]
        },
        {
            title: 'Clientes',
            url: '/clientes',
            icon: Users,
            permissions: ['admin', 'gerente', 'vendedor'] as UserType[]
        },
        {
            title: 'Fornecedores',
            url: '/fornecedores',
            icon: Building2,
            permissions: ['admin', 'gerente'] as UserType[]
        },
        {
            title: 'Financeiro',
            url: '/financeiro',
            icon: DollarSign,
            permissions: ['admin', 'gerente'] as UserType[]
        },
        {
            title: 'Pagamentos',
            url: '/pagamentos',
            icon: CreditCard,
            permissions: ['admin', 'gerente'] as UserType[]
        },
        {
            title: 'Relatórios',
            url: '/relatorios',
            icon: FileText,
            permissions: ['admin', 'gerente'] as UserType[]
        },
        {
            title: 'Usuários',
            url: '/usuarios',
            icon: UserPlus,
            permissions: ['admin', 'gerente'] as UserType[]
        },
        {
            title: 'Configurações',
            url: '/configuracoes',
            icon: Settings,
            permissions: ['admin', 'gerente'] as UserType[]
        }
    ];

    // Filtrar itens baseado nas permissões do usuário
    const filteredItems = navigationItems.filter(item =>
        hasPermission(item.permissions)
    );

    // Função para verificar se a rota está ativa
    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    // Função para obter iniciais do nome do usuário
    const getUserInitials = (nome: string) => {
        return nome
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    // Estado colapsado (inverso de open)
    const collapsed = !open;

    // Componente de tooltip para modo colapsado
    const TooltipWrapper = ({ children, content }: { children: React.ReactNode; content: string }) => {
        if (!collapsed) return <>{children}</>;

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {children}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                        <p>{content}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <Sidebar className="border-r border-slate-200 bg-white">
            {/* Cabeçalho com logo da BVOLT */}
            <SidebarHeader className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-center">
                    {collapsed ? (
                        <TooltipWrapper content="BVOLT Sistema">
                            <div className="flex items-center justify-center">
                                <BvoltLogo variant="icon" size="md" />
                            </div>
                        </TooltipWrapper>
                    ) : (
                        <BvoltLogo variant="full" size="md" />
                    )}
                </div>
            </SidebarHeader>

            {/* Conteúdo principal da sidebar */}
            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    {!collapsed && (
                        <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                            Navegação
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {filteredItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.url);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <TooltipWrapper content={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`
                          w-full justify-start transition-all duration-200 rounded-lg
                          ${active
                                                        ? 'bg-bvolt-gradient text-white shadow-sm'
                                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                    }
                          ${collapsed ? 'justify-center px-3' : 'px-3'}
                        `}
                                            >
                                                <NavLink to={item.url} className="flex items-center">
                                                    <Icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                                                    {!collapsed && (
                                                        <>
                                                            <span className="font-medium">{item.title}</span>
                                                            {active && (
                                                                <ChevronRight className="h-4 w-4 ml-auto" />
                                                            )}
                                                        </>
                                                    )}
                                                </NavLink>
                                            </SidebarMenuButton>
                                        </TooltipWrapper>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Rodapé com informações do usuário */}
            <SidebarFooter className="border-t border-slate-200 p-4">
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
                    {/* Avatar e informações do usuário */}
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <TooltipWrapper content={user?.nome || 'Usuário'}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-bvolt-gradient text-white text-sm font-medium">
                                    {user?.nome ? getUserInitials(user.nome) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipWrapper>

                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {user?.nome}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-300"
                                    >
                                        {user?.tipo}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botão de logout */}
                    <TooltipWrapper content="Sair">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className={`
                flex-shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors
                ${collapsed ? 'p-2' : 'p-2'}
              `}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </TooltipWrapper>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
