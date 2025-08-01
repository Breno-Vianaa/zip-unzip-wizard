import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Scanner, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    nome: string;
    codigo_barras: string;
    categoria: string;
    preco: number;
    estoque_atual: number;
    unidade: string;
}

interface StockMovement {
    id: string;
    produto_id: string;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    data: string;
    fornecedor?: string;
    motivo?: string;
    usuario_id: string;
    usuario_nome: string;
}

interface BarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onStockUpdated?: () => void;
}

// Mock de produtos para demonstração
const mockProducts: Product[] = [
    {
        id: '1',
        nome: 'Produto A',
        codigo_barras: '7891234567890',
        categoria: 'Eletrônicos',
        preco: 150.00,
        estoque_atual: 10,
        unidade: 'un'
    },
    {
        id: '2',
        nome: 'Produto B',
        codigo_barras: '7891234567891',
        categoria: 'Casa',
        preco: 85.50,
        estoque_atual: 25,
        unidade: 'un'
    }
];

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    isOpen,
    onClose,
    onStockUpdated
}) => {
    const { user, hasPermission } = useAuth();
    const [barcode, setBarcode] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState('');
    const [supplier, setSupplier] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Verifica se o usuário tem permissão para editar estoque
    const canEditStock = hasPermission('estoque', 'edit');

    const handleBarcodeSearch = () => {
        if (!barcode.trim()) {
            toast.error('Digite ou escaneie um código de barras');
            return;
        }

        // Simula busca por código de barras
        const product = mockProducts.find(p => p.codigo_barras === barcode);
        
        if (product) {
            setSelectedProduct(product);
            toast.success('Produto encontrado!');
        } else {
            toast.error('Produto não encontrado');
            setSelectedProduct(null);
        }
    };

    const handleStockEntry = async () => {
        if (!selectedProduct || !quantity || Number(quantity) <= 0) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        if (!canEditStock) {
            toast.error('Você não tem permissão para editar estoque');
            return;
        }

        setLoading(true);

        try {
            // Simula delay de API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simula criação de movimento de estoque
            const movement: StockMovement = {
                id: Date.now().toString(),
                produto_id: selectedProduct.id,
                tipo: 'entrada',
                quantidade: Number(quantity),
                data: new Date().toISOString(),
                fornecedor: supplier || undefined,
                motivo: reason || undefined,
                usuario_id: user?.id || '',
                usuario_nome: user?.nome || ''
            };

            // Atualiza estoque local (em implementação real, seria via API)
            selectedProduct.estoque_atual += Number(quantity);

            toast.success(`Entrada de ${quantity} ${selectedProduct.unidade} registrada com sucesso!`);
            
            // Reset form
            setBarcode('');
            setSelectedProduct(null);
            setQuantity('');
            setSupplier('');
            setReason('');
            
            onStockUpdated?.();
            onClose();

        } catch (error) {
            toast.error('Erro ao registrar entrada no estoque');
        } finally {
            setLoading(false);
        }
    };

    if (!canEditStock) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Scanner className="h-5 w-5" />
                            Acesso Negado
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        Você não tem permissão para gerenciar estoque.
                    </p>
                    <Button onClick={onClose} variant="outline">
                        Fechar
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scanner className="h-5 w-5" />
                        Entrada de Estoque por Código de Barras
                    </DialogTitle>
                    <DialogDescription>
                        Escaneie ou digite o código de barras para adicionar produtos ao estoque
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Campo de código de barras */}
                    <div className="space-y-2">
                        <Label htmlFor="barcode">Código de Barras</Label>
                        <div className="flex gap-2">
                            <Input
                                id="barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Digite ou escaneie o código"
                                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                            />
                            <Button 
                                onClick={handleBarcodeSearch}
                                variant="outline"
                                size="icon"
                            >
                                <Scanner className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Produto encontrado */}
                    {selectedProduct && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center gap-3 mb-3">
                                <Package className="h-8 w-8 text-primary" />
                                <div>
                                    <h3 className="font-semibold">{selectedProduct.nome}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedProduct.categoria} | Estoque atual: {selectedProduct.estoque_atual} {selectedProduct.unidade}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="quantity">Quantidade *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supplier">Fornecedor</Label>
                                    <Input
                                        id="supplier"
                                        value={supplier}
                                        onChange={(e) => setSupplier(e.target.value)}
                                        placeholder="Nome do fornecedor"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label htmlFor="reason">Motivo/Observações</Label>
                                <Textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Compra, reposição, devolução..."
                                    rows={2}
                                />
                            </div>

                            <Button 
                                onClick={handleStockEntry}
                                disabled={loading || !quantity || Number(quantity) <= 0}
                                className="w-full mt-4"
                            >
                                {loading ? (
                                    'Processando...'
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar Entrada
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};