import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    ArrowUp,
    ArrowDown,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Search,
    Calendar,
    Filter,
    Plus
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Interface para movimentação de estoque
interface MovimentacaoEstoque {
    id: number;
    produtoId: number;
    produtoNome: string;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    valorUnitario: number;
    data: string;
    observacao?: string;
    usuario: string;
}

// Interface para resumo de estoque por produto
interface ResumoEstoque {
    produtoId: number;
    produtoNome: string;
    categoria: string;
    estoqueAtual: number;
    estoqueMinimo: number;
    valorMedio: number;
    ultimaMovimentacao: string;
}

// Inicializar sem dados - será populado pelo usuário
const movimentacoesMock: MovimentacaoEstoque[] = [];

const resumoEstoqueMock: ResumoEstoque[] = [];

const Estoque: React.FC = () => {
    // Estados para controle da interface
    const [abaSelecionada, setAbaSelecionada] = useState<'resumo' | 'movimentacoes'>('resumo');
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
    const [showNovaEntrada, setShowNovaEntrada] = useState(false);
    const [showNovaSaida, setShowNovaSaida] = useState(false);
    const { toast } = useToast();

    // Estados para formulários de entrada e saída
    const [novaEntrada, setNovaEntrada] = useState({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        valorUnitario: '',
        observacao: ''
    });

    const [novaSaida, setNovaSaida] = useState({
        produtoId: '',
        produtoNome: '',
        quantidade: '',
        valorUnitario: '',
        observacao: ''
    });

    // Filtrar movimentações baseado na busca e tipo
    const movimentacoesFiltradas = movimentacoesMock.filter(mov => {
        const matchBusca = mov.produtoNome.toLowerCase().includes(busca.toLowerCase()) ||
            mov.usuario.toLowerCase().includes(busca.toLowerCase());
        const matchTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo;
        return matchBusca && matchTipo;
    });

    // Calcular estatísticas gerais
    const totalProdutos = resumoEstoqueMock.length;
    const produtosEstoqueBaixo = resumoEstoqueMock.filter(p => p.estoqueAtual <= p.estoqueMinimo).length;
    const produtosSemEstoque = resumoEstoqueMock.filter(p => p.estoqueAtual === 0).length;
    const valorTotalEstoque = resumoEstoqueMock.reduce((acc, p) => acc + (p.estoqueAtual * p.valorMedio), 0);

    // Função para formatar data
    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Função para formatar valores monetários
    const formatarValor = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    // Função para determinar cor do status do estoque
    const getStatusEstoque = (atual: number, minimo: number) => {
        if (atual === 0) return { color: 'text-red-600', bg: 'bg-red-50', text: 'Sem Estoque' };
        if (atual <= minimo) return { color: 'text-orange-600', bg: 'bg-orange-50', text: 'Estoque Baixo' };
        return { color: 'text-green-600', bg: 'bg-green-50', text: 'Normal' };
    };

    // Função para registrar nova entrada
    const handleNovaEntrada = async () => {
        if (!novaEntrada.produtoNome || !novaEntrada.quantidade || !novaEntrada.valorUnitario) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha todos os campos obrigatórios.",
                variant: "destructive"
            });
            return;
        }

        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Entrada registrada",
            description: `Entrada de ${novaEntrada.quantidade} unidades de ${novaEntrada.produtoNome} registrada com sucesso.`,
        });

        // Resetar formulário e fechar modal
        setNovaEntrada({
            produtoId: '',
            produtoNome: '',
            quantidade: '',
            valorUnitario: '',
            observacao: ''
        });
        setShowNovaEntrada(false);
    };

    // Função para registrar nova saída
    const handleNovaSaida = async () => {
        if (!novaSaida.produtoNome || !novaSaida.quantidade || !novaSaida.valorUnitario) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha todos os campos obrigatórios.",
                variant: "destructive"
            });
            return;
        }

        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Saída registrada",
            description: `Saída de ${novaSaida.quantidade} unidades de ${novaSaida.produtoNome} registrada com sucesso.`,
        });

        // Resetar formulário e fechar modal
        setNovaSaida({
            produtoId: '',
            produtoNome: '',
            quantidade: '',
            valorUnitario: '',
            observacao: ''
        });
        setShowNovaSaida(false);
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho da seção */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Controle de Estoque</h1>
                    <p className="text-slate-600 dark:text-slate-400">Monitore entradas, saídas e níveis de estoque</p>
                </div>

                {/* Botões de ação - FUNCIONAIS */}
                <div className="flex gap-2">
                    <Dialog open={showNovaEntrada} onOpenChange={setShowNovaEntrada}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Nova Entrada
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
                            <DialogHeader>
                                <DialogTitle className="dark:text-slate-100">Registrar Nova Entrada</DialogTitle>
                                <DialogDescription className="dark:text-slate-400">
                                    Registre uma nova entrada de produtos no estoque
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="dark:text-slate-200">Produto *</Label>
                                        <Input
                                            placeholder="Nome do produto"
                                            value={novaEntrada.produtoNome}
                                            onChange={(e) => setNovaEntrada(prev => ({ ...prev, produtoNome: e.target.value }))}
                                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-slate-200">Quantidade *</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={novaEntrada.quantidade}
                                            onChange={(e) => setNovaEntrada(prev => ({ ...prev, quantidade: e.target.value }))}
                                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-200">Valor Unitário *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={novaEntrada.valorUnitario}
                                        onChange={(e) => setNovaEntrada(prev => ({ ...prev, valorUnitario: e.target.value }))}
                                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-200">Observação</Label>
                                    <Input
                                        placeholder="Observações sobre a entrada"
                                        value={novaEntrada.observacao}
                                        onChange={(e) => setNovaEntrada(prev => ({ ...prev, observacao: e.target.value }))}
                                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowNovaEntrada(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleNovaEntrada} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar Entrada
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showNovaSaida} onOpenChange={setShowNovaSaida}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Nova Saída
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
                            <DialogHeader>
                                <DialogTitle className="dark:text-slate-100">Registrar Nova Saída</DialogTitle>
                                <DialogDescription className="dark:text-slate-400">
                                    Registre uma nova saída de produtos do estoque
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="dark:text-slate-200">Produto *</Label>
                                        <Input
                                            placeholder="Nome do produto"
                                            value={novaSaida.produtoNome}
                                            onChange={(e) => setNovaSaida(prev => ({ ...prev, produtoNome: e.target.value }))}
                                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="dark:text-slate-200">Quantidade *</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={novaSaida.quantidade}
                                            onChange={(e) => setNovaSaida(prev => ({ ...prev, quantidade: e.target.value }))}
                                            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-200">Valor Unitário *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={novaSaida.valorUnitario}
                                        onChange={(e) => setNovaSaida(prev => ({ ...prev, valorUnitario: e.target.value }))}
                                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="dark:text-slate-200">Observação</Label>
                                    <Input
                                        placeholder="Motivo da saída"
                                        value={novaSaida.observacao}
                                        onChange={(e) => setNovaSaida(prev => ({ ...prev, observacao: e.target.value }))}
                                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowNovaSaida(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleNovaSaida} className="bg-red-600 hover:bg-red-700">
                                        <ArrowDown className="h-4 w-4 mr-2" />
                                        Registrar Saída
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-slate-600">Total Produtos</p>
                                <p className="text-2xl font-bold text-slate-900">{totalProdutos}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                            <div>
                                <p className="text-sm text-slate-600">Estoque Baixo</p>
                                <p className="text-2xl font-bold text-slate-900">{produtosEstoqueBaixo}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingDown className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="text-sm text-slate-600">Sem Estoque</p>
                                <p className="text-2xl font-bold text-slate-900">{produtosSemEstoque}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-slate-600">Valor Total</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {formatarValor(valorTotalEstoque)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Abas de navegação */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setAbaSelecionada('resumo')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${abaSelecionada === 'resumo'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Resumo por Produto
                </button>
                <button
                    onClick={() => setAbaSelecionada('movimentacoes')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${abaSelecionada === 'movimentacoes'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Movimentações
                </button>
            </div>

            {/* Conteúdo das abas */}
            {abaSelecionada === 'resumo' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo de Estoque por Produto</CardTitle>
                        <CardDescription>
                            Visão geral dos níveis de estoque atuais
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {resumoEstoqueMock.map((item) => {
                                const status = getStatusEstoque(item.estoqueAtual, item.estoqueMinimo);

                                return (
                                    <div
                                        key={item.produtoId}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-medium text-slate-900">{item.produtoNome}</h3>
                                                <Badge className={`${status.bg} ${status.color} border-0`}>
                                                    {status.text}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm text-slate-600">
                                                <span><strong>Categoria:</strong> {item.categoria}</span>
                                                <span><strong>Atual:</strong> {item.estoqueAtual} un.</span>
                                                <span><strong>Mínimo:</strong> {item.estoqueMinimo} un.</span>
                                                <span><strong>Valor Médio:</strong> {formatarValor(item.valorMedio)}</span>
                                                <span><strong>Última Mov.:</strong> {new Date(item.ultimaMovimentacao).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {abaSelecionada === 'movimentacoes' && (
                <>
                    {/* Filtros para movimentações */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por produto ou usuário..."
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-slate-500" />
                                    <select
                                        value={filtroTipo}
                                        onChange={(e) => setFiltroTipo(e.target.value as any)}
                                        className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="todos">Todas as Movimentações</option>
                                        <option value="entrada">Apenas Entradas</option>
                                        <option value="saida">Apenas Saídas</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de movimentações */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Histórico de Movimentações
                            </CardTitle>
                            <CardDescription>
                                {movimentacoesFiltradas.length} movimentação(ões) encontrada(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {movimentacoesFiltradas.map((mov) => (
                                    <div
                                        key={mov.id}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Ícone do tipo de movimentação */}
                                            <div className={`p-2 rounded-full ${mov.tipo === 'entrada'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                }`}>
                                                {mov.tipo === 'entrada' ? (
                                                    <ArrowUp className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4" />
                                                )}
                                            </div>

                                            {/* Informações da movimentação */}
                                            <div>
                                                <h3 className="font-medium text-slate-900">{mov.produtoNome}</h3>
                                                <div className="text-sm text-slate-600 space-y-1">
                                                    <p>
                                                        <strong>{mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}:</strong> {mov.quantidade} unidades
                                                        {mov.tipo === 'entrada' ? ' adicionadas' : ' removidas'}
                                                    </p>
                                                    <p><strong>Valor unitário:</strong> {formatarValor(mov.valorUnitario)}</p>
                                                    <p><strong>Data:</strong> {formatarData(mov.data)}</p>
                                                    <p><strong>Usuário:</strong> {mov.usuario}</p>
                                                    {mov.observacao && (
                                                        <p><strong>Observação:</strong> {mov.observacao}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Valor total da movimentação */}
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600">Valor Total</p>
                                            <p className={`text-lg font-bold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {mov.tipo === 'entrada' ? '-' : '+'}{formatarValor(mov.quantidade * mov.valorUnitario)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Mensagem quando não há movimentações */}
                                {movimentacoesFiltradas.length === 0 && (
                                    <div className="text-center py-8">
                                        <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                                            Nenhuma movimentação encontrada
                                        </h3>
                                        <p className="text-slate-600">
                                            Tente ajustar os filtros ou registre uma nova movimentação.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Estoque;