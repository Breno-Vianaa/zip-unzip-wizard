
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AutoLogoutHandler } from "./components/AutoLogoutHandler";
import Index from "./pages/Index";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Produtos from "./components/Produtos";
import Estoque from "./components/Estoque";
import Vendas from "./components/Vendas";
import Clientes from "./components/Clientes";
import Fornecedores from "./components/Fornecedores";
import Relatorios from "./components/Relatorios";
import Usuarios from "./components/Usuarios";
import Configuracoes from "./components/Configuracoes";
import Financeiro from "./components/Financeiro";
import Pagamentos from "./components/Pagamentos";
import NotFound from "./pages/NotFound";

// Cliente do React Query para gerenciamento de estado
const queryClient = new QueryClient();

// Componente para proteger rotas autenticadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bvolt-blue"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// Componente principal da aplicação
const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <AutoLogoutHandler />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        {/* Rota inicial - Login ou Dashboard */}
                        <Route path="/" element={<Index />} />

                        {/* Rotas protegidas - requerem autenticação */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Produtos */}
                        <Route path="/produtos" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Produtos />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Estoque */}
                        <Route path="/estoque" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Estoque />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Vendas */}
                        <Route path="/vendas" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Vendas />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Clientes */}
                        <Route path="/clientes" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Clientes />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Fornecedores */}
                        <Route path="/fornecedores" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Fornecedores />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Relatórios */}
                        <Route path="/relatorios" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Relatorios />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Usuários (apenas Admin) */}
                        <Route path="/usuarios" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Usuarios />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Configurações */}
                        <Route path="/configuracoes" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Configuracoes />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Financeiro */}
                        <Route path="/financeiro" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Financeiro />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota de Pagamentos */}
                        <Route path="/pagamentos" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Pagamentos />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Rota 404 - Página não encontrada */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
