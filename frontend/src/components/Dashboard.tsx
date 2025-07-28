import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ChartCard from './charts/ChartCard';
import {
    TrendingUp,
    TrendingDown,
    Package,
    Users,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    Eye,
    Calendar,
    Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

// Interface para os dados dos cards de estatísticas
interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    variant?: 'default' | 'warning' | 'success';
}

// Componente reutilizável para cards de estatísticas - responsivo
const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = 'default'
}) => {
    // Função para definir classes CSS baseadas na variante
    const getVariantClasses = () => {
        switch (variant) {
            case 'warning':
                return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
            case 'success':
                return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
            default:
                return 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800';
        }
    };

    // Função para definir classes do ícone baseadas na variante
    const getIconClasses = () => {
        switch (variant) {
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'success':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-bvolt-blue';
        }
    };

    return (
        <Card className={`${getVariantClasses()} shadow-sm hover:shadow-md transition-shadow duration-200`}>
            {/* Cabeçalho do card com título e ícone */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                    {title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${getIconClasses()} flex-shrink-0`} />
            </CardHeader>

            {/* Conteúdo do card com valor e descrição */}
            <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">
                    {value}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {description}
                    </CardDescription>

                    {/* Indicador de tendência */}
                    {trend && (
                        <div className={`flex items-center text-xs flex-shrink-0 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            {trend.isPositive ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            <span className="whitespace-nowrap">{trend.value}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Interface para atividades recentes
interface RecentActivity {
    id: string;
    type: 'sale' | 'stock' | 'customer';
    description: string;
    time: string;
    value?: string;
}

/**
 * Componente principal do Dashboard
 * Exibe estatísticas, gráficos e atividades recentes
 * Botões funcionais para navegação e ações
 */
const Dashboard: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();
    const [showAllActivities, setShowAllActivities] = useState(false);

    // Estados para dados dinâmicos
    const [vendas, setVendas] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);

    // Estatísticas calculadas dinamicamente
    const stats = [
        {
            title: 'Vendas Hoje',
            value: vendas.length > 0 ? `R$ ${vendas.reduce((total, venda) => total + venda.valor, 0).toFixed(2)}` : 'R$ 0,00',
            description: 'Total de vendas do dia',
            icon: DollarSign,
            trend: { value: '+0%', isPositive: true }
        },
        {
            title: 'Produtos em Estoque',
            value: produtos.length.toString(),
            description: produtos.filter(p => p.estoque < 10).length + ' produtos acabando',
            icon: Package,
            trend: { value: '0%', isPositive: true },
            variant: produtos.filter(p => p.estoque < 10).length > 0 ? 'warning' as const : 'default' as const
        },
        {
            title: 'Clientes Ativos',
            value: clientes.length.toString(),
            description: '0 novos este mês',
            icon: Users,
            trend: { value: '+0%', isPositive: true },
            variant: 'success' as const
        },
        {
            title: 'Vendas do Mês',
            value: vendas.length > 0 ? `R$ ${vendas.reduce((total, venda) => total + venda.valor, 0).toFixed(2)}` : 'R$ 0,00',
            description: 'Meta: R$ 100.000',
            icon: ShoppingCart,
            trend: { value: '+0%', isPositive: true }
        }
    ];

    // Dados para gráfico de vendas dos últimos 7 dias - inicialmente vazio
    const salesData: any[] = [];

    // Dados para gráfico de produtos mais vendidos - inicialmente vazio
    const productsData: any[] = [];

    // Atividades recentes dinamicas - inicialmente vazia
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    // Função para obter ícone baseado no tipo de atividade
    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'sale':
                return ShoppingCart;
            case 'stock':
                return Package;
            case 'customer':
                return Users;
            default:
                return Activity;
        }
    };

    // Função para navegar para produtos com estoque baixo
    const handleVerProdutos = () => {
        navigate('/estoque?filter=baixo');
    };

    // Função para navegar para clientes em atraso
    const handleVerClientes = () => {
        navigate('/clientes?filter=atraso');
    };

    // Modal de todas as atividades - FUNCIONAL
    const AllActivitiesModal = () => (
        <Dialog open={showAllActivities} onOpenChange={setShowAllActivities}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center dark:text-slate-100">
                        <Activity className="h-5 w-5 mr-2 text-bvolt-purple" />
                        Todas as Atividades
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                    {recentActivities.map((activity) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors">
                                <div className="flex-shrink-0 mt-0.5">
                                    <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-tight">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-1 gap-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {activity.time}
                                        </p>
                                        {activity.value && (
                                            <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                                                {activity.value}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full">
            {/* Cabeçalho da página - responsivo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
                        Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                        Bem-vindo de volta, {user?.nome}! Aqui está um resumo do seu negócio.
                    </p>
                </div>

                {/* Controles do cabeçalho - responsivo */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Hoje, </span>
                        {new Date().toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit'
                        })}
                    </Badge>
                    <Button
                        size="sm"
                        className="bg-bvolt-gradient hover:opacity-90"
                        onClick={() => navigate('/relatorios')}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Relatório </span>Completo
                    </Button>
                </div>
            </div>

            {/* Grid de cards de estatísticas - responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                    <StatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        description={stat.description}
                        icon={stat.icon}
                        trend={stat.trend}
                        variant={stat.variant}
                    />
                ))}
            </div>

            {/* Grid principal com gráficos e atividades - responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Gráfico de vendas dos últimos 7 dias */}
                <div className="lg:col-span-2">
                    <ChartCard
                        title="Vendas dos Últimos 7 Dias"
                        description={salesData.length > 0 ? `Período: ${salesData[0].date} - ${salesData[salesData.length - 1].date}` : "Nenhum dado disponível"}
                        data={salesData}
                        type="area"
                        dataKey="value"
                        color="hsl(var(--bvolt-blue))"
                        height={250}
                        showTooltip={true}
                        xAxisLabel="Dias da Semana"
                        yAxisLabel="Vendas (R$)"
                    />
                </div>

                {/* Atividades recentes */}
                <Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-base dark:text-slate-100">
                            <Activity className="h-5 w-5 mr-2 text-bvolt-purple" />
                            Atividades Recentes
                        </CardTitle>
                        <CardDescription className="text-sm dark:text-slate-400">
                            Últimas movimentações do sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {/* Lista de atividades */}
                        <div className="space-y-3">
                            {recentActivities.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                                    <p className="text-xs text-gray-400 mt-1">As atividades aparecerão aqui conforme você usar o sistema</p>
                                </div>
                            ) : (
                                recentActivities.slice(0, 4).map((activity) => {
                                    const Icon = getActivityIcon(activity.type);
                                    return (
                                        <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-tight">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-1 gap-2">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {activity.time}
                                                    </p>
                                                    {activity.value && (
                                                        <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                                                            {activity.value}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Botão para ver todas as atividades - FUNCIONAL */}
                        {recentActivities.length > 0 && (
                            <div className="mt-4 pt-3 border-t dark:border-slate-600">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-sm dark:text-slate-300 dark:hover:bg-slate-700"
                                    onClick={() => setShowAllActivities(true)}
                                >
                                    Ver todas as atividades
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Seção adicional com gráficos de produtos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Gráfico de produtos mais vendidos */}
                <ChartCard
                    title="Produtos Mais Vendidos"
                    description="Top 5 produtos do mês atual com detalhes"
                    data={productsData}
                    type="bar"
                    dataKey="value"
                    color="hsl(var(--bvolt-purple))"
                    height={250}
                    showTooltip={true}
                    xAxisLabel="Produtos"
                    yAxisLabel="Unidades Vendidas"
                />

                {/* Gráfico de tendência de vendas */}
                <ChartCard
                    title="Tendência de Vendas"
                    description={salesData.length > 0 ? `Crescimento semanal - ${salesData[0].date} até ${salesData[salesData.length - 1].date}` : "Nenhum dado disponível"}
                    data={salesData}
                    type="line"
                    dataKey="value"
                    color="hsl(var(--bvolt-blue))"
                    height={250}
                    showTooltip={true}
                    xAxisLabel="Período"
                    yAxisLabel="Faturamento (R$)"
                />
            </div>

            {/* Lista detalhada de produtos mais vendidos */}
            <Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg dark:text-slate-100">
                        <Package className="h-5 w-5 mr-2 text-bvolt-purple" />
                        Detalhes dos Produtos Mais Vendidos
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        Informações completas dos produtos com melhor desempenho
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {productsData.map((produto, index) => (
                            <div key={produto.name} className="flex items-center justify-between p-4 rounded-lg border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bvolt-gradient text-white font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                            {produto.produto}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Categoria: {produto.categoria} • Preço: {produto.preco}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-bvolt-purple">
                                        {produto.value} unidades
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        vendidas este mês
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Alertas importantes - apenas para admin e gerente com botões funcionais */}
            {hasPermission(['admin', 'gerente']) && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200 text-base">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Alertas Importantes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-3">
                            {/* Alerta de estoque baixo - BOTÃO FUNCIONAL */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-800 rounded border border-yellow-200 dark:border-yellow-800">
                                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                    23 produtos com estoque baixo precisam de reposição
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full sm:w-auto dark:border-slate-600 dark:text-slate-300"
                                    onClick={handleVerProdutos}
                                >
                                    Ver Produtos
                                </Button>
                            </div>

                            {/* Alerta de pagamentos em atraso - BOTÃO FUNCIONAL */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-800 rounded border border-yellow-200 dark:border-yellow-800">
                                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                    5 clientes com pagamentos em atraso
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full sm:w-auto dark:border-slate-600 dark:text-slate-300"
                                    onClick={handleVerClientes}
                                >
                                    Ver Clientes
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de todas as atividades */}
            <AllActivitiesModal />
        </div>
    );
};

export default Dashboard;