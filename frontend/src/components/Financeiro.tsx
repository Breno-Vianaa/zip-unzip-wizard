import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, Filter, Calendar, Eye, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { generateFinanceReport } from '../utils/financeReportGenerator';

/**
 * SISTEMA FINANCEIRO COMPLETO
 * 
 * Funcionalidades:
 * - Contas a Pagar e Receber
 * - Dashboard financeiro com indicadores
 * - Controle de vencimentos e status
 * - Geração automática de relatórios PDF
 * - Filtros avançados por período, cliente, status
 * - Integração preparada para gateways de pagamento
 */

interface ContaFinanceira {
    id: number;
    tipo: 'pagar' | 'receber';
    descricao: string;
    valor: number;
    vencimento: string;
    status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
    clienteOuFornecedor: string;
    categoria: string;
    formaPagamento?: string;
    observacoes?: string;
    dataPagamento?: string;
    valorPago?: number;
    created_at: string;
}

const Financeiro: React.FC = () => {
    const { hasPermission, user } = useAuth();
    const { toast } = useToast();

    // Estados principais
    const [contas, setContas] = useState<ContaFinanceira[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConta, setEditingConta] = useState<ContaFinanceira | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Estados de filtros
    const [filtros, setFiltros] = useState({
        tipo: 'todos',
        status: 'todos',
        dataInicio: '',
        dataFim: '',
        clienteOuFornecedor: ''
    });

    // Formulário
    const [formData, setFormData] = useState({
        tipo: 'receber' as 'pagar' | 'receber',
        descricao: '',
        valor: '',
        vencimento: '',
        status: 'pendente' as 'pendente' | 'pago' | 'vencido' | 'cancelado',
        clienteOuFornecedor: '',
        categoria: '',
        formaPagamento: '',
        observacoes: ''
    });

    // Verifica permissões
    const canManage = hasPermission(['admin', 'gerente']);
    const canView = hasPermission(['admin', 'gerente', 'vendedor']);

    useEffect(() => {
        // Carrega dados salvos do localStorage
        const savedContas = localStorage.getItem('bvolt-contas-financeiras');
        if (savedContas) {
            setContas(JSON.parse(savedContas));
        }
    }, []);

    useEffect(() => {
        // Salva dados no localStorage
        localStorage.setItem('bvolt-contas-financeiras', JSON.stringify(contas));
    }, [contas]);

    // Cálculos do dashboard
    const calcularIndicadores = () => {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const contasMesAtual = contas.filter(conta => {
            const dataVencimento = new Date(conta.vencimento);
            return dataVencimento.getMonth() === mesAtual && dataVencimento.getFullYear() === anoAtual;
        });

        const aReceber = contasMesAtual
            .filter(c => c.tipo === 'receber' && c.status !== 'cancelado')
            .reduce((sum, c) => sum + c.valor, 0);

        const aPagar = contasMesAtual
            .filter(c => c.tipo === 'pagar' && c.status !== 'cancelado')
            .reduce((sum, c) => sum + c.valor, 0);

        const recebido = contasMesAtual
            .filter(c => c.tipo === 'receber' && c.status === 'pago')
            .reduce((sum, c) => sum + (c.valorPago || c.valor), 0);

        const pago = contasMesAtual
            .filter(c => c.tipo === 'pagar' && c.status === 'pago')
            .reduce((sum, c) => sum + (c.valorPago || c.valor), 0);

        const vencidas = contas.filter(c => {
            const vencimento = new Date(c.vencimento);
            return vencimento < hoje && c.status === 'pendente';
        }).length;

        const saldoPrevisto = aReceber - aPagar;
        const saldoRealizado = recebido - pago;

        return {
            aReceber,
            aPagar,
            recebido,
            pago,
            vencidas,
            saldoPrevisto,
            saldoRealizado
        };
    };

    const indicadores = calcularIndicadores();

    // Função para aplicar filtros
    const contasFiltradas = contas.filter(conta => {
        if (filtros.tipo !== 'todos' && conta.tipo !== filtros.tipo) return false;
        if (filtros.status !== 'todos' && conta.status !== filtros.status) return false;
        if (filtros.clienteOuFornecedor && !conta.clienteOuFornecedor.toLowerCase().includes(filtros.clienteOuFornecedor.toLowerCase())) return false;

        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            const vencimento = new Date(conta.vencimento);
            if (vencimento < dataInicio) return false;
        }

        if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim);
            const vencimento = new Date(conta.vencimento);
            if (vencimento > dataFim) return false;
        }

        return true;
    });

    // Funções de CRUD
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canManage) {
            toast({
                title: "Acesso negado",
                description: "Você não tem permissão para gerenciar contas financeiras",
                variant: "destructive"
            });
            return;
        }

        const contaData: ContaFinanceira = {
            id: editingConta?.id || Date.now(),
            ...formData,
            valor: parseFloat(formData.valor),
            created_at: editingConta?.created_at || new Date().toISOString()
        };

        if (editingConta) {
            setContas(contas.map(c => c.id === editingConta.id ? contaData : c));
            toast({
                title: "Conta atualizada",
                description: "Conta financeira atualizada com sucesso"
            });
        } else {
            setContas([...contas, contaData]);
            toast({
                title: "Conta cadastrada",
                description: "Nova conta financeira cadastrada com sucesso"
            });
        }

        setIsModalOpen(false);
        resetForm();
    };

    const handleEdit = (conta: ContaFinanceira) => {
        setEditingConta(conta);
        setFormData({
            tipo: conta.tipo,
            descricao: conta.descricao,
            valor: conta.valor.toString(),
            vencimento: conta.vencimento,
            status: conta.status,
            clienteOuFornecedor: conta.clienteOuFornecedor,
            categoria: conta.categoria,
            formaPagamento: conta.formaPagamento || '',
            observacoes: conta.observacoes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (!canManage) {
            toast({
                title: "Acesso negado",
                description: "Você não tem permissão para excluir contas",
                variant: "destructive"
            });
            return;
        }

        setContas(contas.filter(c => c.id !== id));
        toast({
            title: "Conta excluída",
            description: "Conta financeira removida com sucesso"
        });
    };

    const resetForm = () => {
        setFormData({
            tipo: 'receber',
            descricao: '',
            valor: '',
            vencimento: '',
            status: 'pendente',
            clienteOuFornecedor: '',
            categoria: '',
            formaPagamento: '',
            observacoes: ''
        });
        setEditingConta(null);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Função para gerar relatório
    const handleGenerateReport = () => {
        try {
            generateFinanceReport(contasFiltradas, indicadores);
            toast({
                title: "Relatório gerado",
                description: "Relatório financeiro PDF gerado com sucesso"
            });
        } catch (error) {
            toast({
                title: "Erro ao gerar relatório",
                description: "Não foi possível gerar o relatório PDF",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            pago: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            vencido: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            cancelado: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        };
        return styles[status as keyof typeof styles] || styles.pendente;
    };

    if (!canView) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Você não tem permissão para acessar o módulo financeiro.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financeiro</h1>
                    <p className="text-muted-foreground">Controle de contas a pagar e receber</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {canManage && (
                        <Button onClick={openModal} className="bg-bvolt-gradient hover:opacity-90 w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Conta
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleGenerateReport} className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Gerar Relatório
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="contas">Contas</TabsTrigger>
                    <TabsTrigger value="filtros">Filtros</TabsTrigger>
                </TabsList>

                {/* Dashboard */}
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    R$ {indicadores.aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Valores a receber este mês
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    R$ {indicadores.aPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Valores a pagar este mês
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
                                <DollarSign className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${indicadores.saldoPrevisto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {indicadores.saldoPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Previsão para este mês
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {indicadores.vencidas}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Contas em atraso
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Lista de Contas */}
                <TabsContent value="contas" className="space-y-4">
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[100px]">Tipo</TableHead>
                                        <TableHead className="min-w-[200px]">Descrição</TableHead>
                                        <TableHead className="min-w-[120px]">Valor</TableHead>
                                        <TableHead className="min-w-[120px]">Vencimento</TableHead>
                                        <TableHead className="min-w-[100px]">Status</TableHead>
                                        <TableHead className="min-w-[150px]">Cliente/Fornecedor</TableHead>
                                        {canManage && <TableHead className="min-w-[120px]">Ações</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contasFiltradas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8">
                                                <p className="text-muted-foreground">Nenhuma conta encontrada</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        contasFiltradas.map((conta) => (
                                            <TableRow key={conta.id}>
                                                <TableCell>
                                                    <Badge variant={conta.tipo === 'receber' ? 'default' : 'secondary'}>
                                                        {conta.tipo === 'receber' ? 'Receber' : 'Pagar'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{conta.descricao}</TableCell>
                                                <TableCell>
                                                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadge(conta.status)}>
                                                        {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{conta.clienteOuFornecedor}</TableCell>
                                                {canManage && (
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(conta)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(conta.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                {/* Filtros */}
                <TabsContent value="filtros" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros Avançados</CardTitle>
                            <CardDescription>
                                Configure os filtros para visualizar contas específicas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select value={filtros.tipo} onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="receber">A Receber</SelectItem>
                                            <SelectItem value="pagar">A Pagar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={filtros.status} onValueChange={(value) => setFiltros({ ...filtros, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="pendente">Pendente</SelectItem>
                                            <SelectItem value="pago">Pago</SelectItem>
                                            <SelectItem value="vencido">Vencido</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cliente/Fornecedor</Label>
                                    <Input
                                        placeholder="Digite para filtrar..."
                                        value={filtros.clienteOuFornecedor}
                                        onChange={(e) => setFiltros({ ...filtros, clienteOuFornecedor: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Data Início</Label>
                                    <Input
                                        type="date"
                                        value={filtros.dataInicio}
                                        onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Data Fim</Label>
                                    <Input
                                        type="date"
                                        value={filtros.dataFim}
                                        onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setFiltros({
                                        tipo: 'todos',
                                        status: 'todos',
                                        dataInicio: '',
                                        dataFim: '',
                                        clienteOuFornecedor: ''
                                    })}
                                    className="w-full sm:w-auto"
                                >
                                    Limpar Filtros
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal de Cadastro/Edição */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingConta ? 'Editar Conta' : 'Nova Conta Financeira'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingConta ? 'Altere os dados da conta' : 'Preencha os dados da nova conta'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value: 'pagar' | 'receber') => setFormData({ ...formData, tipo: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="receber">Conta a Receber</SelectItem>
                                        <SelectItem value="pagar">Conta a Pagar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: 'pendente' | 'pago' | 'vencido' | 'cancelado') => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pendente">Pendente</SelectItem>
                                        <SelectItem value="pago">Pago</SelectItem>
                                        <SelectItem value="vencido">Vencido</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Input
                                    id="descricao"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    required
                                    placeholder="Descrição da conta"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="valor">Valor (R$)</Label>
                                <Input
                                    id="valor"
                                    type="number"
                                    step="0.01"
                                    value={formData.valor}
                                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                    required
                                    placeholder="0,00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vencimento">Data de Vencimento</Label>
                                <Input
                                    id="vencimento"
                                    type="date"
                                    value={formData.vencimento}
                                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="clienteOuFornecedor">Cliente/Fornecedor</Label>
                                <Input
                                    id="clienteOuFornecedor"
                                    value={formData.clienteOuFornecedor}
                                    onChange={(e) => setFormData({ ...formData, clienteOuFornecedor: e.target.value })}
                                    required
                                    placeholder="Nome do cliente ou fornecedor"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria</Label>
                                <Select
                                    value={formData.categoria}
                                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vendas">Vendas</SelectItem>
                                        <SelectItem value="servicos">Serviços</SelectItem>
                                        <SelectItem value="fornecedores">Fornecedores</SelectItem>
                                        <SelectItem value="despesas-operacionais">Despesas Operacionais</SelectItem>
                                        <SelectItem value="impostos">Impostos</SelectItem>
                                        <SelectItem value="salarios">Salários</SelectItem>
                                        <SelectItem value="aluguel">Aluguel</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                                <Select
                                    value={formData.formaPagamento}
                                    onValueChange={(value) => setFormData({ ...formData, formaPagamento: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a forma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                                        <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                        <SelectItem value="transferencia">Transferência</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-full">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Input
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Observações adicionais (opcional)"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-bvolt-gradient hover:opacity-90 w-full sm:w-auto">
                                {editingConta ? 'Salvar Alterações' : 'Cadastrar Conta'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Financeiro;