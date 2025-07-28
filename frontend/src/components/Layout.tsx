
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '../hooks/useTheme';
import GlobalSearch from './GlobalSearch';

interface LayoutProps {
    children: React.ReactNode;
}

/**
 * Componente de Layout principal da aplicação
 * Gerencia a estrutura base com sidebar, header e área de conteúdo
 * Inclui busca global funcional e notificações
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const { theme, changeTheme } = useTheme();

    const toggleTheme = () => {
        changeTheme(theme === 'escuro' ? 'claro' : 'escuro');
    };

    return (
        // Provider da sidebar com configurações responsivas
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                {/* Sidebar principal - responsiva */}
                <AppSidebar />

                {/* Área principal de conteúdo */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    {/* Header/Barra superior - responsiva */}
                    <header className="bg-card border-b border-border px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
                        <div className="flex items-center justify-between gap-4">
                            {/* Lado esquerdo - Trigger da sidebar e busca */}
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                {/* Trigger da sidebar - sempre visível e bem posicionado */}
                                <SidebarTrigger className="shrink-0 hover:bg-accent transition-colors" />

                                {/* Campo de busca global - responsivo e funcional */}
                                <div className="hidden sm:block flex-1 max-w-md">
                                    <GlobalSearch />
                                </div>

                                {/* Botão de busca mobile */}
                                <div className="sm:hidden flex-1">
                                    <GlobalSearch />
                                </div>
                            </div>

                            {/* Lado direito - Tema, Notificações e perfil */}
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                {/* Botão de tema - para todos os usuários */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleTheme}
                                    className="shrink-0 hover:bg-accent"
                                    title={`Alternar para modo ${theme === 'escuro' ? 'claro' : 'escuro'}`}
                                >
                                    {theme === 'escuro' ? (
                                        <Sun className="h-5 w-5" />
                                    ) : (
                                        <Moon className="h-5 w-5" />
                                    )}
                                </Button>

                                {/* Botão de notificações com contador */}
                                <Button variant="ghost" size="sm" className="relative shrink-0 hover:bg-accent">
                                    <Bell className="h-5 w-5" />
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                    >
                                        0
                                    </Badge>
                                </Button>

                                {/* Informações do usuário logado - responsivo */}
                                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border">
                                    {/* Informações do usuário - oculto em mobile */}
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-foreground truncate max-w-32">
                                            {user?.nome}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {user?.tipo}
                                        </p>
                                    </div>

                                    {/* Avatar do usuário */}
                                    <Button variant="ghost" size="sm" className="rounded-full shrink-0 hover:bg-accent">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Área de conteúdo principal - responsiva */}
                    <main className="flex-1 p-3 sm:p-6 overflow-auto bg-background">
                        <div className="max-w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Layout;