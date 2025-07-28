import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Users,
    UserPlus,
    TrendingUp,
    MapPin,
    Phone,
    Mail,
    Edit,
    Eye,
    Search,
    Plus
} from 'lucide-react';

// Interface para definir estrutura de dados do cliente
interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cidade: string;
    cep: string;
    data_cadastro: string;
    total_compras: number;
    ultima_compra: string;
    status: 'ativo' | 'inativo';
}

// Inicializar sem dados - será populado pelo usuário
const clientesMock: Cliente[] = [];

const Clientes: React.FC = () => {
    const { hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [novoCliente, setNovoCliente] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<any>(null);
    const [clientes, setClientes] = useState(clientesMock);

    const canEdit = hasPermission(['admin', 'gerente']);

    // Função para filtrar clientes baseado na busca e filtros aplicados
    const clientesFiltrados = clientes.filter(cliente => {
        const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.telefone.includes(searchTerm);
        const matchesStatus = statusFilter === 'todos' || cliente.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Cálculos para os cards de estatísticas
    const totalClientes = clientes.length;
    const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
    const clientesInativos = clientes.filter(c => c.status === 'inativo').length;
    const ticketMedio = clientes
        .filter(c => c.total_compras > 0)
        .reduce((acc, cliente) => acc + cliente.total_compras, 0) /
        clientes.filter(c => c.total_compras > 0).length || 0;

    // Função para obter cor do badge baseado no status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativo': return 'bg-green-100 text-green-800';
            case 'inativo': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Função para formatar valores monetários em Real brasileiro
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleEditCliente = (cliente: any) => {
        if (!canEdit) {
            alert('Você não tem permissão para editar clientes');
            return;
        }
        setEditingCliente(cliente);
        setIsEditDialogOpen(true);
    };

    const handleSaveCliente = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCliente) return;

        // Atualizar cliente na lista
        setClientes(clientes.map(c =>
            c.id === editingCliente.id ? editingCliente : c
        ));

        setIsEditDialogOpen(false);
        setEditingCliente(null);
        console.log('Cliente atualizado:', editingCliente);
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho da página com título e botão de novo cliente */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
                    <p className="text-slate-600 mt-1">Gerencie sua base de clientes</p>
                </div>

                {/* Botão para cadastrar novo cliente */}
                <Dialog open={novoCliente} onOpenChange={setNovoCliente}>
                    <DialogTrigger asChild>
                        <Button className="bg-bvolt-gradient hover:opacity-90">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do cliente
                            </DialogDescription>
                        </DialogHeader>

                        {/* Formulário de cadastro de cliente */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome Completo</label>
                                <Input placeholder="Digite o nome completo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" placeholder="cliente@email.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefone</label>
                                <Input placeholder="(11) 99999-9999" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">CEP</label>
                                <Input placeholder="12345-678" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Endereço</label>
                                <Input placeholder="Rua, Número - Bairro" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cidade</label>
                                <Input placeholder="São Paulo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bvolt-blue">
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                        </div>

                        {/* Botões do formulário */}
                        <div className="flex justify-end space-x-2 mt-6">
                            <Button variant="outline" onClick={() => setNovoCliente(false)}>
                                Cancelar
                            </Button>
                            <Button className="bg-bvolt-gradient hover:opacity-90">
                                Cadastrar Cliente
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de estatísticas dos clientes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Card do total de clientes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClientes}</div>
                        <p className="text-xs text-muted-foreground">clientes cadastrados</p>
                    </CardContent>
                </Card>

                {/* Card de clientes ativos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                        <UserPlus className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{clientesAtivos}</div>
                        <p className="text-xs text-muted-foreground">com compras recentes</p>
                    </CardContent>
                </Card>

                {/* Card de clientes inativos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
                        <Users className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{clientesInativos}</div>
                        <p className="text-xs text-muted-foreground">sem compras recentes</p>
                    </CardContent>
                </Card>

                {/* Card do ticket médio */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-bvolt-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-bvolt-blue">
                            {formatCurrency(ticketMedio)}
                        </div>
                        <p className="text-xs text-muted-foreground">valor médio por cliente</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção principal com lista de clientes */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Lista de Clientes</CardTitle>
                            <CardDescription>Todos os clientes cadastrados no sistema</CardDescription>
                        </div>
                    </div>

                    {/* Barra de busca e filtros */}
                    <div className="flex space-x-4 mt-4">
                        {/* Campo de busca */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nome, email ou telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filtro por status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-smooth"
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Tabela de clientes */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Cidade</TableHead>
                                <TableHead>Total Compras</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientesFiltrados.map((cliente) => (
                                <TableRow key={cliente.id}>
                                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                                    <TableCell>{cliente.email}</TableCell>
                                    <TableCell>{cliente.telefone}</TableCell>
                                    <TableCell>{cliente.cidade}</TableCell>
                                    <TableCell>{formatCurrency(cliente.total_compras)}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(cliente.status)}>
                                            {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {/* Dialog para visualizar detalhes do cliente */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Detalhes do Cliente</DialogTitle>
                                                        <DialogDescription>
                                                            Informações completas do cliente
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    {/* Detalhes do cliente no modal */}
                                                    <div className="space-y-6">
                                                        {/* Informações pessoais */}
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3 flex items-center">
                                                                <Users className="h-4 w-4 mr-2" />
                                                                Dados Pessoais
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Nome:</label>
                                                                    <p className="font-medium">{cliente.nome}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Status:</label>
                                                                    <div className="mt-1">
                                                                        <Badge className={getStatusColor(cliente.status)}>
                                                                            {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Informações de contato */}
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3 flex items-center">
                                                                <Phone className="h-4 w-4 mr-2" />
                                                                Contato
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Email:</label>
                                                                    <p className="font-medium">{cliente.email}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Telefone:</label>
                                                                    <p className="font-medium">{cliente.telefone}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Informações de endereço */}
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3 flex items-center">
                                                                <MapPin className="h-4 w-4 mr-2" />
                                                                Endereço
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Endereço:</label>
                                                                    <p className="font-medium">{cliente.endereco}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Cidade:</label>
                                                                    <p className="font-medium">{cliente.cidade}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm text-gray-500">CEP:</label>
                                                                    <p className="font-medium">{cliente.cep}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Data Cadastro:</label>
                                                                    <p className="font-medium">
                                                                        {new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Informações de compras */}
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3 flex items-center">
                                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                                Histórico de Compras
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Total em Compras:</label>
                                                                    <p className="font-medium text-bvolt-blue">
                                                                        {formatCurrency(cliente.total_compras)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm text-gray-500">Última Compra:</label>
                                                                    <p className="font-medium">
                                                                        {cliente.ultima_compra ?
                                                                            new Date(cliente.ultima_compra).toLocaleDateString('pt-BR') :
                                                                            'Nenhuma compra'
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Botão de editar cliente */}
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditCliente(cliente)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog de edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                            Altere os dados do cliente
                        </DialogDescription>
                    </DialogHeader>

                    {editingCliente && (
                        <form onSubmit={handleSaveCliente} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input
                                        value={editingCliente.nome}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            nome: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={editingCliente.email}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            email: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone</Label>
                                    <Input
                                        value={editingCliente.telefone}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            telefone: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CEP</Label>
                                    <Input
                                        value={editingCliente.cep}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            cep: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Endereço</Label>
                                    <Input
                                        value={editingCliente.endereco}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            endereco: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cidade</Label>
                                    <Input
                                        value={editingCliente.cidade}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            cidade: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        value={editingCliente.status}
                                        onChange={(e) => setEditingCliente({
                                            ...editingCliente,
                                            status: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bvolt-blue"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-bvolt-gradient hover:opacity-90">
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Clientes;