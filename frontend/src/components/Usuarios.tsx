import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserModal } from './usuarios/UserModal';
import {
    Users,
    UserPlus,
    Shield,
    Crown,
    User,
    Search,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';

// Tipos de usuário do sistema BVOLT
export type UserType = 'admin' | 'gerente' | 'vendedor';

// Interface para o usuário logado
export interface User {
    id: string;
    nome: string;
    email: string;
    tipo: UserType;
    avatar?: string;
    dataCadastro: string;
}

// Dados mockados dos usuários para demonstração
const mockUsers: (User & { password?: string })[] = [
    {
        id: '1',
        nome: 'Admin Sistema',
        email: 'admin@bvolt.com',
        tipo: 'admin',
        dataCadastro: '2024-01-01'
    },
    {
        id: '2',
        nome: 'João Gerente',
        email: 'gerente@bvolt.com',
        tipo: 'gerente',
        dataCadastro: '2024-01-05'
    },
    {
        id: '3',
        nome: 'Maria Vendedora',
        email: 'vendedor@bvolt.com',
        tipo: 'vendedor',
        dataCadastro: '2024-01-10'
    }
];

const Usuarios: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('todos');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [users, setUsers] = useState(mockUsers);

    // Filtrar usuários baseado na busca e tipo
    const usuariosFiltrados = users.filter(usuario => {
        const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = userTypeFilter === 'todos' || usuario.tipo === userTypeFilter;
        return matchesSearch && matchesType;
    });

    const canCreateUser = hasPermission(['admin', 'gerente']);
    const canEditUser = (targetUser: any) => {
        if (user?.tipo === 'admin') return true;
        if (user?.tipo === 'gerente') return targetUser.tipo === 'vendedor'; // Gerente só pode editar vendedores
        return false;
    };
    const canDeleteUser = (targetUser: any) => {
        if (user?.tipo === 'admin') return targetUser.tipo !== 'admin';
        if (user?.tipo === 'gerente') return targetUser.tipo === 'vendedor'; // Gerente só pode excluir vendedores
        return false;
    };

    const handleCreateUser = () => {
        setModalMode('create');
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditUser = (usuario: any) => {
        if (!canEditUser(usuario)) {
            alert('Você não tem permissão para editar este usuário');
            return;
        }
        setModalMode('edit');
        setEditingUser(usuario);
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = (usuarioId: string, usuario: any) => {
        if (!canDeleteUser(usuario)) {
            alert('Você não tem permissão para excluir este usuário');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
            setUsers(users.filter(u => u.id !== usuarioId));
            console.log('Usuário excluído:', usuarioId);
        }
    };

    const handleSaveUser = (userData: any) => {
        if (modalMode === 'create') {
            setUsers([...users, userData]);
            console.log('Usuário criado:', userData);
        } else {
            setUsers(users.map(u => u.id === userData.id ? userData : u));
            console.log('Usuário editado:', userData);
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
            case 'gerente': return <Shield className="h-4 w-4 text-blue-600" />;
            case 'vendedor': return <User className="h-4 w-4 text-green-600" />;
            default: return <User className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'admin': return 'bg-yellow-100 text-yellow-800';
            case 'gerente': return 'bg-blue-100 text-blue-800';
            case 'vendedor': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Estatísticas dos usuários
    const totalUsuarios = users.length;
    const admins = users.filter(u => u.tipo === 'admin').length;
    const gerentes = users.filter(u => u.tipo === 'gerente').length;
    const vendedores = users.filter(u => u.tipo === 'vendedor').length;

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Usuários</h1>
                    <p className="text-slate-600 mt-1">Gerencie os usuários do sistema</p>
                </div>

                {canCreateUser && (
                    <Button
                        className="bg-bvolt-gradient hover:opacity-90"
                        onClick={handleCreateUser}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                    </Button>
                )}
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsuarios}</div>
                        <p className="text-xs text-muted-foreground">usuários ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                        <Crown className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{admins}</div>
                        <p className="text-xs text-muted-foreground">com acesso total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
                        <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{gerentes}</div>
                        <p className="text-xs text-muted-foreground">gerenciamento</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
                        <User className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{vendedores}</div>
                        <p className="text-xs text-muted-foreground">equipe de vendas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção principal */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Lista de Usuários</CardTitle>
                            <CardDescription>Todos os usuários cadastrados no sistema</CardDescription>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex space-x-4 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <select
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value)}
                            className="filter-select px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-smooth"
                        >
                            <option value="todos">Todos os Tipos</option>
                            <option value="admin">Administrador</option>
                            <option value="gerente">Gerente</option>
                            <option value="vendedor">Vendedor</option>
                        </select>
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Data Cadastro</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuariosFiltrados.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTipoIcon(usuario.tipo)}
                                            <Badge className={getTipoColor(usuario.tipo)}>
                                                {usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {canEditUser(usuario) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditUser(usuario)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDeleteUser(usuario) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(usuario.id, usuario)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            {/* Modal de usuário */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
                editingUser={editingUser}
                mode={modalMode}
            />
        </div>
    );
};

export default Usuarios;