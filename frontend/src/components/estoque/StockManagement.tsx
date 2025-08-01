import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scanner, Package, TrendingUp, TrendingDown, History } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface Product {
    id: string;
    nome: string;
    codigo_barras: string;
    categoria: string;
    preco: number;
    estoque_atual: number;
    estoque_minimo: number;
    unidade: string;
}

interface StockMovement {
    id: string;
    produto_nome: string;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    data: string;
    usuario_nome: string;
    fornecedor?: string;
    motivo?: string;
}

// Mock data para demonstração
const mockProducts: Product[] = [
    {
        id: '1',
        nome: 'Produto A',
        codigo_barras: '7891234567890',
        categoria: 'Eletrônicos',
        preco: 150.00,
        estoque_atual: 10,
        estoque_minimo: 5,
        unidade: 'un'
    },
    {
        id: '2',
        nome: 'Produto B',
        codigo_barras: '7891234567891',
        categoria: 'Casa',
        preco: 85.50,
        estoque_atual: 25,
        estoque_minimo: 10,
        unidade: 'un'
    },
    {
        id: '3',
        nome: 'Produto C',
        codigo_barras: '7891234567892',
        categoria: 'Escritório',
        preco: 320.00,
        estoque_atual: 3,
        estoque_minimo: 5,
        unidade: 'un'
    }
];

const mockMovements: StockMovement[] = [
    {
        id: '1',
        produto_nome: 'Produto A',
        tipo: 'entrada',
        quantidade: 10,
        data: '2024-01-15T10:30:00',
        usuario_nome: 'João Gerente',
        fornecedor: 'Fornecedor ABC',
        motivo: 'Reposição mensal'
    },
    {
        id: '2',
        produto_nome: 'Produto B',
        tipo: 'saida',
        quantidade: 5,
        data: '2024-01-14T14:20:00',
        usuario_nome: 'Maria Vendedora',
        motivo: 'Venda cliente'
    }
];

export const StockManagement: React.FC = () => {
    const { hasPermission } = useAuth();
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
    const [products] = useState<Product[]>(mockProducts);
    const [movements] = useState<StockMovement[]>(mockMovements);

    const canViewStock = hasPermission('estoque', 'view');
    const canEditStock = hasPermission('estoque', 'edit');

    if (!canViewStock) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Acesso Negado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Você não tem permissão para visualizar o estoque.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const lowStockProducts = products.filter(p => p.estoque_atual <= p.estoque_minimo);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
                    <p className="text-muted-foreground">
                        Controle e movimentação do estoque
                    </p>
                </div>
                
                {canEditStock && (
                    <Button 
                        onClick={() => setShowBarcodeScanner(true)}
                        className="bg-bvolt-gradient hover:opacity-90"
                    >
                        <Scanner className="h-4 w-4 mr-2" />
                        Entrada por Código de Barras
                    </Button>
                )}
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Produtos
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Estoque Baixo
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {lowStockProducts.length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Movimentações Hoje
                        </CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {movements.filter(m => 
                                new Date(m.data).toDateString() === new Date().toDateString()
                            ).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de produtos */}
            <Card>
                <CardHeader>
                    <CardTitle>Produtos em Estoque</CardTitle>
                    <CardDescription>
                        Visualização dos produtos e quantidades disponíveis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {products.map((product) => (
                            <div 
                                key={product.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <Package className="h-8 w-8 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">{product.nome}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {product.categoria} | Código: {product.codigo_barras}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {product.estoque_atual} {product.unidade}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Mín: {product.estoque_minimo} {product.unidade}
                                        </p>
                                    </div>
                                    
                                    {product.estoque_atual <= product.estoque_minimo ? (
                                        <Badge variant="destructive">
                                            Estoque Baixo
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            OK
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Histórico de movimentações */}
            <Card>
                <CardHeader>
                    <CardTitle>Movimentações Recentes</CardTitle>
                    <CardDescription>
                        Histórico das últimas entradas e saídas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {movements.map((movement) => (
                            <div 
                                key={movement.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    {movement.tipo === 'entrada' ? (
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-6 w-6 text-red-600" />
                                    )}
                                    <div>
                                        <h4 className="font-medium">{movement.produto_nome}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {movement.usuario_nome} • {new Date(movement.data).toLocaleDateString()}
                                        </p>
                                        {movement.motivo && (
                                            <p className="text-sm text-muted-foreground">
                                                {movement.motivo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <Badge 
                                        variant={movement.tipo === 'entrada' ? 'default' : 'secondary'}
                                    >
                                        {movement.tipo === 'entrada' ? '+' : '-'}{movement.quantidade}
                                    </Badge>
                                    {movement.fornecedor && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {movement.fornecedor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal do scanner de código de barras */}
            <BarcodeScanner
                isOpen={showBarcodeScanner}
                onClose={() => setShowBarcodeScanner(false)}
                onStockUpdated={() => {
                    // Em implementação real, recarregaria os dados
                    console.log('Stock updated');
                }}
            />
        </div>
    );
};