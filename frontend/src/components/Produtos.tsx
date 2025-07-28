import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductModal } from './produtos/ProductModal';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Package,
    AlertCircle,
    Filter,
    Download,
    Upload
} from 'lucide-react';

// Interface para definir a estrutura de um produto
interface Produto {
    id: number;
    nome: string;
    categoria: string;
    preco: number;
    estoque: number;
    fornecedor: string;
    status: 'ativo' | 'inativo';
    codigoBarras?: string;
}

// Inicializar sem dados - será populado pelo usuário
const produtosMock: Produto[] = [];

const Produtos: React.FC = () => {
    const { hasPermission } = useAuth();

    const [produtos, setProdutos] = useState(produtosMock);
    const [busca, setBusca] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    // Função para filtrar produtos baseado na busca e categoria - CORRIGIDA
    const produtosFiltrados = produtos.filter(produto => {
        // Busca corrigida - verifica se o termo existe antes de fazer toLowerCase
        const termoBusca = busca.toLowerCase().trim();
        const matchBusca = termoBusca === '' ||
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.categoria.toLowerCase().includes(termoBusca) ||
            produto.fornecedor.toLowerCase().includes(termoBusca) ||
            (produto.codigoBarras && produto.codigoBarras.includes(termoBusca));

        const matchCategoria = categoriaFiltro === 'todas' || produto.categoria === categoriaFiltro;

        return matchBusca && matchCategoria;
    });

    // Obter categorias únicas para o filtro
    const categorias = Array.from(new Set(produtos.map(p => p.categoria)));

    // Função para determinar a cor do badge baseado no estoque
    const getEstoqueBadge = (estoque: number) => {
        if (estoque === 0) return { variant: 'destructive' as const, text: 'Sem Estoque' };
        if (estoque <= 5) return { variant: 'secondary' as const, text: 'Estoque Baixo' };
        return { variant: 'default' as const, text: 'Em Estoque' };
    };

    // Função para formatar preço em reais
    const formatarPreco = (preco: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    // Função para lidar com busca em tempo real
    const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusca(e.target.value);
        console.log('Busca alterada para:', e.target.value); // Debug
    };

    // Função para lidar com mudança de categoria
    const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoriaFiltro(e.target.value);
        console.log('Categoria alterada para:', e.target.value); // Debug
    };

    const canEdit = hasPermission(['admin', 'gerente']);

    const handleCreateProduct = () => {
        if (!canEdit) {
            alert('Você não tem permissão para criar produtos');
            return;
        }
        setModalMode('create');
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (produto: any) => {
        if (!canEdit) {
            alert('Você não tem permissão para editar produtos');
            return;
        }
        setModalMode('edit');
        setEditingProduct(produto);
        setIsProductModalOpen(true);
    };

    const handleDeleteProduct = (produtoId: number, produto: any) => {
        if (!canEdit) {
            alert('Você não tem permissão para excluir produtos');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
            setProdutos(produtos.filter(p => p.id !== produtoId));
            console.log('Produto excluído:', produtoId);
        }
    };

    const handleSaveProduct = (productData: any) => {
        if (modalMode === 'create') {
            setProdutos([...produtos, productData]);
            console.log('Produto criado:', productData);
        } else {
            setProdutos(produtos.map(p => p.id === productData.id ? productData : p));
            console.log('Produto editado:', productData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Produtos</h1>
                    <p className="text-slate-600">Gerencie seu catálogo de produtos</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                    </Button>
                    <Button
                        className="btn-bvolt-primary"
                        onClick={handleCreateProduct}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Produto
                    </Button>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-slate-600">Total de Produtos</p>
                                <p className="text-2xl font-bold text-slate-900">{produtos.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="text-sm text-slate-600">Estoque Baixo</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {produtos.filter(p => p.estoque <= 5 && p.estoque > 0).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-8 w-8 text-gray-500" />
                            <div>
                                <p className="text-sm text-slate-600">Sem Estoque</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {produtos.filter(p => p.estoque === 0).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Package className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-slate-600">Categorias</p>
                                <p className="text-2xl font-bold text-slate-900">{categorias.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros e busca - CORRIGIDOS */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Campo de busca */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar produtos, categorias ou fornecedores..."
                                value={busca}
                                onChange={handleBuscaChange}
                                className="pl-10"
                            />
                        </div>

                        {/* Filtro por categoria */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-secondary" />
                            <select
                                value={categoriaFiltro}
                                onChange={handleCategoriaChange}
                                className="filter-select px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-smooth"
                            >
                                <option value="todas">Todas as Categorias</option>
                                {categorias.map(categoria => (
                                    <option key={categoria} value={categoria}>{categoria}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Indicador de filtros ativos */}
                    {(busca || categoriaFiltro !== 'todas') && (
                        <div className="mt-3 text-sm text-slate-600">
                            Mostrando {produtosFiltrados.length} de {produtos.length} produtos
                            {busca && <span> • Busca: "{busca}"</span>}
                            {categoriaFiltro !== 'todas' && <span> • Categoria: {categoriaFiltro}</span>}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Produtos Cadastrados</CardTitle>
                    <CardDescription>
                        {produtosFiltrados.length} produto(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {produtosFiltrados.map((produto) => {
                            const badgeEstoque = getEstoqueBadge(produto.estoque);

                            return (
                                <div
                                    key={produto.id}
                                    className="produto-item flex items-center justify-between"
                                >
                                    {/* Informações do produto */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium text-slate-900">{produto.nome}</h3>
                                            <Badge variant={badgeEstoque.variant}>
                                                {badgeEstoque.text}
                                            </Badge>
                                            {produto.status === 'inativo' && (
                                                <Badge variant="secondary">Inativo</Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-slate-600">
                                            <span><strong>Categoria:</strong> {produto.categoria}</span>
                                            <span><strong>Preço:</strong> {formatarPreco(produto.preco)}</span>
                                            <span><strong>Estoque:</strong> {produto.estoque} unidades</span>
                                            <span><strong>Fornecedor:</strong> {produto.fornecedor}</span>
                                        </div>

                                        {produto.codigoBarras && (
                                            <div className="mt-1 text-xs text-slate-500">
                                                <strong>Código:</strong> {produto.codigoBarras}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        {canEdit && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditProduct(produto)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canEdit && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteProduct(produto.id, produto)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mensagem quando não há produtos */}
                        {produtosFiltrados.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">
                                    Nenhum produto encontrado
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {busca || categoriaFiltro !== 'todas'
                                        ? 'Tente ajustar os filtros de busca.'
                                        : 'Tente ajustar os filtros ou adicionar novos produtos.'
                                    }
                                </p>
                                <Button
                                    className="bg-bvolt-gradient hover:opacity-80"
                                    onClick={() => {
                                        setBusca('');
                                        setCategoriaFiltro('todas');
                                    }}
                                >
                                    {busca || categoriaFiltro !== 'todas' ? 'Limpar Filtros' : 'Adicionar Primeiro Produto'}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleSaveProduct}
                editingProduct={editingProduct}
                mode={modalMode}
            />
        </div>
    );
};

export default Produtos;
