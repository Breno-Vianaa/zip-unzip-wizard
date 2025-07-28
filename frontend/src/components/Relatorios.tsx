import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricoRelatorios } from './relatorios/HistoricoRelatorios';
import { generateReport } from '../utils/pdfGenerator.ts';
import { useToast } from '../hooks/use-toast';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Package,
    Users,
    DollarSign,
    BarChart3,
    PieChart,
    Filter,
    RefreshCcw
} from 'lucide-react';

// Interface para definir tipos de relatórios disponíveis
interface TipoRelatorio {
    id: string;
    nome: string;
    descricao: string;
    icone: React.ComponentType<{ className?: string }>;
    categoria: 'vendas' | 'estoque' | 'financeiro' | 'clientes';
}

// Componente principal do módulo de Relatórios
const Relatorios: React.FC = () => {
    // Estados para controlar filtros de data e relatórios
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [relatorioSelecionado, setRelatorioSelecionado] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const { toast } = useToast();

    // Lista de tipos de relatórios disponíveis no sistema
    const tiposRelatorios: TipoRelatorio[] = [
        {
            id: 'vendas-periodo',
            nome: 'Vendas por Período',
            descricao: 'Relatório detalhado de vendas em um período específico',
            icone: TrendingUp,
            categoria: 'vendas'
        },
        {
            id: 'estoque-atual',
            nome: 'Estoque Atual',
            descricao: 'Relatório completo do estoque atual de produtos',
            icone: Package,
            categoria: 'estoque'
        },
        {
            id: 'clientes-ativos',
            nome: 'Clientes Ativos',
            descricao: 'Lista de clientes com compras recentes',
            icone: Users,
            categoria: 'clientes'
        },
        {
            id: 'fluxo-caixa',
            nome: 'Fluxo de Caixa',
            descricao: 'Relatório de entradas e saídas financeiras',
            icone: DollarSign,
            categoria: 'financeiro'
        },
        {
            id: 'produtos-mais-vendidos',
            nome: 'Produtos Mais Vendidos',
            descricao: 'Ranking dos produtos com maior saída',
            icone: BarChart3,
            categoria: 'vendas'
        },
        {
            id: 'analise-categorias',
            nome: 'Análise por Categorias',
            descricao: 'Desempenho de vendas por categoria de produtos',
            icone: PieChart,
            categoria: 'vendas'
        }
    ];

    // Estatísticas dos relatórios - será atualizado conforme uso
    const estatisticasRelatorios = {
        totalRelatorios: 0,
        relatoriosHoje: 0,
        relatoriosMes: 0,
        ultimaAtualizacao: 'Nenhum relatório gerado'
    };

    // Função para obter cor da categoria do relatório
    const getCategoriaColor = (categoria: string) => {
        switch (categoria) {
            case 'vendas': return 'bg-blue-100 text-blue-800';
            case 'estoque': return 'bg-green-100 text-green-800';
            case 'financeiro': return 'bg-purple-100 text-purple-800';
            case 'clientes': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Função para gerar relatório PDF
    const gerarRelatorio = async (tipoId: string) => {
        if (!tipoId) return;

        setIsGenerating(true);

        try {
            console.log(`Gerando relatório: ${tipoId}`);
            console.log(`Período: ${dataInicio} até ${dataFim}`);

            // Simular dados baseados no tipo de relatório
            let dadosRelatorio: any[] = [];

            switch (tipoId) {
                case 'vendas-periodo':
                    dadosRelatorio = [
                        { id: '001', cliente: 'João Silva', data: '2024-01-15', valor: 250.00, status: 'concluida' },
                        { id: '002', cliente: 'Maria Santos', data: '2024-01-16', valor: 150.00, status: 'concluida' }
                    ];
                    break;
                case 'estoque-atual':
                    dadosRelatorio = [
                        { id: '1', nome: 'Produto A', categoria: 'Eletrônicos', estoque: 50, preco: 199.99 },
                        { id: '2', nome: 'Produto B', categoria: 'Roupas', estoque: 25, preco: 89.90 }
                    ];
                    break;
                case 'clientes-ativos':
                    dadosRelatorio = [
                        { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999', status: 'ativo' },
                        { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888', status: 'ativo' }
                    ];
                    break;
                default:
                    dadosRelatorio = [];
            }

            // Gerar PDF
            const doc = generateReport(tipoId, dadosRelatorio);

            // Nome do arquivo
            const tipoNome = tiposRelatorios.find(t => t.id === tipoId)?.nome || 'Relatório';
            const nomeArquivo = `${tipoNome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Download do PDF
            doc.save(nomeArquivo);

            toast({
                title: "Relatório gerado com sucesso!",
                description: `O arquivo ${nomeArquivo} foi baixado.`,
            });

            // Salvar no histórico (simulado)
            const novoRelatorio = {
                id: Date.now().toString(),
                tipo: tipoNome,
                dataGeracao: new Date().toLocaleString('pt-BR'),
                arquivo: nomeArquivo,
                tamanho: '~50KB'
            };

            console.log('Relatório salvo no histórico:', novoRelatorio);

        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            toast({
                title: "Erro ao gerar relatório",
                description: "Ocorreu um erro durante a geração do PDF. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefreshData = async () => {
        setIsRefreshing(true);
        console.log('Atualizando dados dos relatórios...');

        // Simular chamada para API
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsRefreshing(false);
        alert('Dados atualizados com sucesso!');
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho da página com título e informações */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
                    <p className="text-slate-600 mt-1">Central de relatórios e análises do sistema</p>
                </div>

                <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
                </Button>
            </div>

            {/* Cards de estatísticas dos relatórios */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Card do total de relatórios */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{estatisticasRelatorios.totalRelatorios}</div>
                        <p className="text-xs text-muted-foreground">relatórios disponíveis</p>
                    </CardContent>
                </Card>

                {/* Card relatórios gerados hoje */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Relatórios Hoje</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{estatisticasRelatorios.relatoriosHoje}</div>
                        <p className="text-xs text-muted-foreground">gerados hoje</p>
                    </CardContent>
                </Card>

                {/* Card relatórios gerados no mês */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Relatórios no Mês</CardTitle>
                        <BarChart3 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{estatisticasRelatorios.relatoriosMes}</div>
                        <p className="text-xs text-muted-foreground">gerados este mês</p>
                    </CardContent>
                </Card>

                {/* Card da última atualização */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
                        <RefreshCcw className="h-4 w-4 text-bvolt-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold text-bvolt-blue">
                            {estatisticasRelatorios.ultimaAtualizacao}
                        </div>
                        <p className="text-xs text-muted-foreground">dados atualizados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção principal com abas para diferentes tipos de relatórios */}
            <Tabs defaultValue="gerar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="gerar">Gerar Relatórios</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                    <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
                </TabsList>

                {/* Aba para gerar novos relatórios */}
                <TabsContent value="gerar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Seção de filtros e configurações */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Filter className="h-5 w-5" />
                                    <span>Filtros</span>
                                </CardTitle>
                                <CardDescription>Configure os parâmetros do relatório</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Seleção do tipo de relatório */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Relatório</label>
                                    <select
                                        value={relatorioSelecionado}
                                        onChange={(e) => setRelatorioSelecionado(e.target.value)}
                                        className="filter-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-smooth"
                                    >
                                        <option value="">Selecione um relatório</option>
                                        {tiposRelatorios.map((tipo) => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro de data inicial */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Data Inicial</label>
                                    <Input
                                        type="date"
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                    />
                                </div>

                                {/* Filtro de data final */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Data Final</label>
                                    <Input
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                    />
                                </div>

                                {/* Botão para gerar relatório */}
                                <Button
                                    onClick={() => relatorioSelecionado && gerarRelatorio(relatorioSelecionado)}
                                    disabled={!relatorioSelecionado || isGenerating}
                                    className="w-full bg-bvolt-gradient hover:opacity-90"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isGenerating ? 'Gerando PDF...' : 'Gerar Relatório'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Lista de tipos de relatórios disponíveis */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Relatórios Disponíveis</CardTitle>
                                    <CardDescription>Selecione o tipo de relatório que deseja gerar</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tiposRelatorios.map((tipo) => {
                                            const IconeComponent = tipo.icone;
                                            return (
                                                <Card
                                                    key={tipo.id}
                                                    className={`cursor-pointer transition-all hover:shadow-md ${relatorioSelecionado === tipo.id ? 'ring-2 ring-bvolt-blue' : ''
                                                        }`}
                                                    onClick={() => setRelatorioSelecionado(tipo.id)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            {/* Ícone do relatório */}
                                                            <div className="flex-shrink-0">
                                                                <div className="w-10 h-10 bg-bvolt-gradient rounded-lg flex items-center justify-center">
                                                                    <IconeComponent className="h-5 w-5 text-white" />
                                                                </div>
                                                            </div>

                                                            {/* Informações do relatório */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                    {tipo.nome}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {tipo.descricao}
                                                                </p>

                                                                {/* Badge da categoria */}
                                                                <div className="mt-2">
                                                                    <Badge className={getCategoriaColor(tipo.categoria)}>
                                                                        {tipo.categoria.charAt(0).toUpperCase() + tipo.categoria.slice(1)}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Aba com histórico de relatórios gerados */}
                <TabsContent value="historico">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Relatórios</CardTitle>
                            <CardDescription>Relatórios gerados anteriormente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HistoricoRelatorios />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba com configurações dos relatórios */}
                <TabsContent value="configuracoes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações de Relatórios</CardTitle>
                            <CardDescription>Personalize a geração e formatação dos relatórios</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Configurações em Desenvolvimento
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    As configurações de relatórios estão sendo desenvolvidas com:
                                </p>
                                <ul className="text-sm text-gray-500 space-y-1 mb-6">
                                    <li>• Modelo de layout personalizado</li>
                                    <li>• Logo da empresa nos relatórios</li>
                                    <li>• Configuração de cores e fontes</li>
                                    <li>• Campos obrigatórios e opcionais</li>
                                    <li>• Agendamento automático</li>
                                    <li>• Envio por email</li>
                                </ul>
                                <Button className="bg-bvolt-gradient hover:opacity-90">
                                    Em Breve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Relatorios;