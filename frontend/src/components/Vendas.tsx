import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from './charts/ChartCard';
import { PaymentTab } from './vendas/PaymentTab';
import {
    ShoppingCart,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    TrendingUp,
    Package,
    Users,
    Receipt
} from 'lucide-react';

// Interface para definir estrutura de uma venda
interface Sale {
    id: string;
    cliente: string;
    data: string;
    valor: number;
    status: 'concluida' | 'pendente' | 'cancelada';
    produtos: number;
    vendedor: string;
    formaPagamento: string;
}

// Interface para definir estrutura de um produto no carrinho
interface CartItem {
    id: string;
    nome: string;
    preco: number;
    quantidade: number;
    estoque: number;
}

const Vendas: React.FC = () => {
    const { user } = useAuth();

    // Estados para controle da interface
    const [activeTab, setActiveTab] = useState('pdv');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('hoje');
    const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    // Estados para dados dinâmicos
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [salesChartData, setSalesChartData] = useState<any[]>([]);

    // Função para filtrar vendas baseado no termo de busca
    const filteredSales = sales.filter(sale =>
        sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.includes(searchTerm)
    );

    // Função para calcular estatísticas das vendas
    const calculateStats = () => {
        const totalVendas = sales.reduce((sum, sale) => sum + sale.valor, 0);
        const vendasConcluidas = sales.filter(sale => sale.status === 'concluida').length;
        const vendasPendentes = sales.filter(sale => sale.status === 'pendente').length;
        const ticketMedio = totalVendas / sales.length;

        return { totalVendas, vendasConcluidas, vendasPendentes, ticketMedio };
    };

    const stats = calculateStats();

    // Função para adicionar produto ao carrinho
    const addToCart = (product: typeof products[0]) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            // Se já existe, aumenta a quantidade
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantidade: Math.min(item.quantidade + 1, item.estoque) }
                    : item
            ));
        } else {
            // Se não existe, adiciona novo item
            setCart([...cart, {
                id: product.id,
                nome: product.nome,
                preco: product.preco,
                quantidade: 1,
                estoque: product.estoque
            }]);
        }
    };

    // Função para remover produto do carrinho
    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    // Função para calcular total do carrinho
    const calculateCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    };

    // Função para finalizar venda
    const finalizeSale = () => {
        if (cart.length === 0 || !selectedClient || !paymentMethod) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Simulação de finalização da venda
        console.log('Venda finalizada:', {
            cliente: selectedClient,
            produtos: cart,
            total: calculateCartTotal(),
            formaPagamento: paymentMethod,
            vendedor: user?.nome
        });

        // Limpar carrinho e fechar modal
        setCart([]);
        setSelectedClient('');
        setPaymentMethod('');
        setIsNewSaleOpen(false);
    };

    // Função para obter cor do status
    const getStatusColor = (status: Sale['status']) => {
        switch (status) {
            case 'concluida':
                return 'bg-green-100 text-green-800';
            case 'pendente':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelada':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewSale = (sale: Sale) => {
        setSelectedSale(sale);
    };

    const handleDownloadSale = (sale: Sale) => {
        console.log('Fazendo download da venda:', sale.id);
        // Simular download do PDF da venda
        alert(`Download iniciado para venda #${sale.id}`);
    };

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full">
            {/* Cabeçalho da página - responsivo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Vendas
                    </h1>
                    <p className="text-slate-600 mt-1 text-sm sm:text-base">
                        Gerencie suas vendas e controle o PDV
                    </p>
                </div>

                {/* Botão de nova venda */}
                <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-bvolt-gradient hover:opacity-90">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Venda
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nova Venda - PDV</DialogTitle>
                            <DialogDescription>
                                Adicione produtos ao carrinho e finalize a venda
                            </DialogDescription>
                        </DialogHeader>

                        {/* Conteúdo do PDV */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Lista de produtos */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Produtos Disponíveis</h3>
                                <div className="grid gap-3 max-h-60 overflow-y-auto">
                                    {products.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{product.nome}</p>
                                                <p className="text-sm text-slate-500">
                                                    R$ {product.preco.toFixed(2)} | Estoque: {product.estoque}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => addToCart(product)}
                                                disabled={product.estoque === 0}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Carrinho */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Carrinho</h3>
                                {cart.length === 0 ? (
                                    <p className="text-slate-500 text-center py-8">
                                        Carrinho vazio
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium truncate">{item.nome}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {item.quantidade}x R$ {item.preco.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        R$ {(item.preco * item.quantidade).toFixed(2)}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Informações da venda */}
                                <div className="space-y-3 pt-4 border-t">
                                    <div>
                                        <Label htmlFor="client">Cliente</Label>
                                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um cliente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map(client => (
                                                    <SelectItem key={client.id} value={client.nome}>
                                                        {client.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="payment">Forma de Pagamento</Label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a forma de pagamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                                <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                                                <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                                                <SelectItem value="pix">PIX</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="font-semibold text-lg">Total:</span>
                                        <span className="font-bold text-xl text-bvolt-blue">
                                            R$ {calculateCartTotal().toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Botão finalizar */}
                                    <Button
                                        onClick={finalizeSale}
                                        className="w-full bg-bvolt-gradient hover:opacity-90"
                                        disabled={cart.length === 0}
                                    >
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Finalizar Venda
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de estatísticas - responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                        <DollarSign className="h-4 w-4 text-bvolt-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.totalVendas.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            +15% em relação ao mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendas Concluídas</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.vendasConcluidas}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.vendasPendentes} pendentes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-bvolt-purple" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.ticketMedio.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            +8% em relação ao mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
                        <Package className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sales.reduce((sum, sale) => sum + sale.produtos, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Últimas 24 horas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Abas principais */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pdv">PDV</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                    <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="pdv" className="space-y-4">
                    <ChartCard
                        title="Vendas Mensais"
                        description={salesChartData.length > 0 ? `Evolução das vendas de ${salesChartData[0].name} até ${salesChartData[salesChartData.length - 1].name}` : "Nenhum dado disponível"}
                        data={salesChartData}
                        type="area"
                        dataKey="value"
                        color="hsl(var(--bvolt-blue))"
                        height={300}
                        showTooltip={true}
                    />
                </TabsContent>

                <TabsContent value="historico" className="space-y-4">
                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por cliente ou ID da venda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hoje">Hoje</SelectItem>
                                <SelectItem value="semana">Esta Semana</SelectItem>
                                <SelectItem value="mes">Este Mês</SelectItem>
                                <SelectItem value="ano">Este Ano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lista de vendas */}
                    <div className="space-y-4">
                        {filteredSales.map((sale) => (
                            <Card key={sale.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">Venda #{sale.id}</h3>
                                                <Badge className={getStatusColor(sale.status)}>
                                                    {sale.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                                <span>Cliente: {sale.cliente}</span>
                                                <span>Data: {new Date(sale.data).toLocaleDateString('pt-BR')}</span>
                                                <span>Vendedor: {sale.vendedor}</span>
                                                <span>Pagamento: {sale.formaPagamento}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-bvolt-blue">
                                                    R$ {sale.valor.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {sale.produtos} produto{sale.produtos > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" onClick={() => handleViewSale(sale)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Detalhes da Venda #{sale.id}</DialogTitle>
                                                            <DialogDescription>
                                                                Informações completas da venda
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-sm text-gray-500">Cliente:</Label>
                                                                    <p className="font-medium">{sale.cliente}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm text-gray-500">Data:</Label>
                                                                    <p className="font-medium">{new Date(sale.data).toLocaleDateString('pt-BR')}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm text-gray-500">Vendedor:</Label>
                                                                    <p className="font-medium">{sale.vendedor}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm text-gray-500">Forma de Pagamento:</Label>
                                                                    <p className="font-medium">{sale.formaPagamento}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm text-gray-500">Valor Total:</Label>
                                                                    <p className="font-medium text-bvolt-blue text-xl">R$ {sale.valor.toFixed(2)}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm text-gray-500">Produtos:</Label>
                                                                    <p className="font-medium">{sale.produtos} itens</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownloadSale(sale)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pagamentos">
                    <PaymentTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Vendas;