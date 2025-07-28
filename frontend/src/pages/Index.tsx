
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';

const Index: React.FC = () => {
    // Hook para verificar autenticação
    const { isAuthenticated, loading } = useAuth();

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center space-y-4">
                    {/* Logo com animação de loading */}
                    <div className="mx-auto w-16 h-16 bg-bvolt-gradient rounded-2xl flex items-center justify-center animate-pulse">
                        <span className="text-xl font-bold text-white">BV</span>
                    </div>

                    {/* Texto de carregamento */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-700">
                            BVOLT Sistemas
                        </h2>
                        <p className="text-slate-500">Carregando...</p>
                    </div>

                    {/* Indicador de loading */}
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bvolt-blue"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Se não estiver autenticado, mostrar tela de login
    if (!isAuthenticated) {
        return <Login />;
    }

    // Se estiver autenticado, mostrar dashboard dentro do layout
    return (
        <Layout>
            <Dashboard />
        </Layout>
    );
};

export default Index;
