import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Truck,
    Plus,
    Search,
    Building2,
    Phone,
    Mail,
    MapPin,
    Edit,
    Eye,
    TrendingUp
} from 'lucide-react';

// Interface para definir a estrutura de um fornecedor
interface Fornecedor {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    status: 'ativo' | 'inativo';
    totalEntregas?: number;
    avaliacaoMedia?: number;
}

// Inicializar sem dados - será populado pelo usuário
const fornecedoresMock: Fornecedor[] = [];

const Fornecedores: React.FC = () => {
    const { hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<any>(null);
    const [fornecedores, setFornecedores] = useState(fornecedoresMock);

    const canEdit = hasPermission(['admin', 'gerente']);

    // Função para filtrar fornecedores baseado na busca e filtros aplicados
    const fornecedoresFiltrados = fornecedores.filter(fornecedor => {
        const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fornecedor.telefone.includes(searchTerm);
        const matchesStatus = statusFilter === 'todos' || fornecedor.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEditFornecedor = (fornecedor: any) => {
        if (!canEdit) {
            alert('Você não tem permissão para editar fornecedores');
            return;
        }
        setEditingFornecedor(fornecedor);
        setIsEditDialogOpen(true);
    };

    const handleSaveFornecedor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFornecedor) return;

        // Atualizar fornecedor na lista
        setFornecedores(fornecedores.map(f =>
            f.id === editingFornecedor.id ? editingFornecedor : f
        ));

        setIsEditDialogOpen(false);
        setEditingFornecedor(null);
        console.log('Fornecedor atualizado:', editingFornecedor);
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho da página */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Fornecedores</h1>
                    <p className="text-slate-600 mt-1">Gerencie seus fornecedores</p>
                </div>
                <Button
                    className="bg-bvolt-gradient hover:opacity-90"
                    onClick={() => {
                        // Simular criação de novo fornecedor
                        const novoFornecedor = {
                            id: Date.now().toString(),
                            nome: 'Novo Fornecedor',
                            email: 'novo@fornecedor.com',
                            telefone: '(11) 99999-9999',
                            endereco: 'Endereço do fornecedor',
                            status: 'ativo' as const,
                            totalEntregas: 0,
                            avaliacaoMedia: 0
                        };
                        setFornecedores([...fornecedores, novoFornecedor]);
                        console.log('Novo fornecedor criado:', novoFornecedor);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fornecedor
                </Button>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fornecedores.length}</div>
                        <p className="text-xs text-muted-foreground">fornecedores cadastrados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
                        <Building2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {fornecedores.filter(f => f.status === 'ativo').length}
                        </div>
                        <p className="text-xs text-muted-foreground">fornecedores ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média de Entregas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-bvolt-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-bvolt-blue">
                            {fornecedores.length > 0 ? (fornecedores.reduce((acc, fornecedor) => acc + (fornecedor.totalEntregas || 0), 0) / fornecedores.length).toFixed(1) : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">entregas por fornecedor</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros e busca */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Lista de Fornecedores</CardTitle>
                            <CardDescription>Todos os fornecedores cadastrados no sistema</CardDescription>
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nome, email ou telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

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
                    <div className="space-y-4">
                        {fornecedoresFiltrados.map((fornecedor) => (
                            <div
                                key={fornecedor.id}
                                className="fornecedor-item flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="h-5 w-5 text-bvolt-blue" />
                                        <h3 className="font-medium text-slate-900">{fornecedor.nome}</h3>
                                        <Badge className={fornecedor.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {fornecedor.status.charAt(0).toUpperCase() + fornecedor.status.slice(1)}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                                        <span>
                                            <Phone className="h-3 w-3 inline-block mr-1" />
                                            {fornecedor.telefone}
                                        </span>
                                        <span>
                                            <Mail className="h-3 w-3 inline-block mr-1" />
                                            {fornecedor.email}
                                        </span>
                                        <span>
                                            <MapPin className="h-3 w-3 inline-block mr-1" />
                                            {fornecedor.endereco}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>

                                    {canEdit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditFornecedor(fornecedor)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Fornecedor</DialogTitle>
                        <DialogDescription>
                            Altere os dados do fornecedor
                        </DialogDescription>
                    </DialogHeader>

                    {editingFornecedor && (
                        <form onSubmit={handleSaveFornecedor} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome da Empresa</Label>
                                    <Input
                                        value={editingFornecedor.nome}
                                        onChange={(e) => setEditingFornecedor({
                                            ...editingFornecedor,
                                            nome: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={editingFornecedor.email}
                                        onChange={(e) => setEditingFornecedor({
                                            ...editingFornecedor,
                                            email: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone</Label>
                                    <Input
                                        value={editingFornecedor.telefone}
                                        onChange={(e) => setEditingFornecedor({
                                            ...editingFornecedor,
                                            telefone: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select
                                        value={editingFornecedor.status}
                                        onChange={(e) => setEditingFornecedor({
                                            ...editingFornecedor,
                                            status: e.target.value
                                        })}
                                        className="filter-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-smooth"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Endereço</Label>
                                    <Input
                                        value={editingFornecedor.endereco}
                                        onChange={(e) => setEditingFornecedor({
                                            ...editingFornecedor,
                                            endereco: e.target.value
                                        })}
                                        required
                                    />
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
                                <Button type="submit" className="btn-bvolt-primary">
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

export default Fornecedores;