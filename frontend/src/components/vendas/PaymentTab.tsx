
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    CreditCard,
    DollarSign,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Eye,
    Download
} from 'lucide-react';

interface Payment {
    id: string;
    vendaId: string;
    cliente: string;
    valor: number;
    valorPago: number;
    valorPendente: number;
    status: 'pago' | 'pendente' | 'parcial' | 'vencido';
    formaPagamento: string;
    dataVencimento: string;
    dataPagamento?: string;
    parcelas: number;
    parcelaAtual: number;
}

export const PaymentTab: React.FC = () => {
    const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [paymentForm, setPaymentForm] = useState({
        vendaId: '',
        valor: '',
        formaPagamento: '',
        parcelas: 1,
        dataVencimento: ''
    });

    // Dados de pagamentos - inicialmente vazio
    const payments: Payment[] = [];

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'pago': return 'bg-green-100 text-green-800';
            case 'pendente': return 'bg-yellow-100 text-yellow-800';
            case 'parcial': return 'bg-blue-100 text-blue-800';
            case 'vencido': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: Payment['status']) => {
        switch (status) {
            case 'pago': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'vencido': return <AlertCircle className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4 text-yellow-600" />;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleCreatePayment = () => {
        console.log('Criando pagamento:', paymentForm);
        setIsNewPaymentOpen(false);
        setPaymentForm({
            vendaId: '',
            valor: '',
            formaPagamento: '',
            parcelas: 1,
            dataVencimento: ''
        });
    };

    const totalPagamentos = payments.reduce((sum, p) => sum + p.valor, 0);
    const totalPago = payments.reduce((sum, p) => sum + p.valorPago, 0);
    const totalPendente = payments.reduce((sum, p) => sum + p.valorPendente, 0);

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Pagamentos</h2>
                    <p className="text-slate-600">Gerencie os pagamentos das vendas</p>
                </div>
                <Dialog open={isNewPaymentOpen} onOpenChange={setIsNewPaymentOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-bvolt-primary">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Pagamento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                            <DialogDescription>
                                Registre um novo pagamento para uma venda
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>ID da Venda</Label>
                                <Input
                                    value={paymentForm.vendaId}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, vendaId: e.target.value })}
                                    placeholder="Ex: 001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valor</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.valor}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, valor: e.target.value })}
                                    placeholder="0,00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Forma de Pagamento</Label>
                                <Select
                                    value={paymentForm.formaPagamento}
                                    onValueChange={(value) => setPaymentForm({ ...paymentForm, formaPagamento: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                                        <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Parcelas</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={paymentForm.parcelas}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, parcelas: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Vencimento</Label>
                                <Input
                                    type="date"
                                    value={paymentForm.dataVencimento}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, dataVencimento: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setIsNewPaymentOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreatePayment} className="btn-bvolt-primary">
                                    Registrar Pagamento
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
                        <DollarSign className="h-4 w-4 text-bvolt-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalPagamentos)}</div>
                        <p className="text-xs text-muted-foreground">{payments.length} pagamentos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
                        <p className="text-xs text-muted-foreground">Valores pagos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPendente)}</div>
                        <p className="text-xs text-muted-foreground">Valores em aberto</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de pagamentos */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Pagamentos</CardTitle>
                    <CardDescription>Todos os pagamentos registrados no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="pagamento-item flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusIcon(payment.status)}
                                        <h3 className="font-medium">Venda #{payment.vendaId} - {payment.cliente}</h3>
                                        <Badge className={getStatusColor(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-slate-600">
                                        <span><strong>Valor Total:</strong> {formatCurrency(payment.valor)}</span>
                                        <span><strong>Valor Pago:</strong> {formatCurrency(payment.valorPago)}</span>
                                        <span><strong>Pendente:</strong> {formatCurrency(payment.valorPendente)}</span>
                                        <span><strong>Forma:</strong> {payment.formaPagamento}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-500 mt-1">
                                        <span><strong>Vencimento:</strong> {new Date(payment.dataVencimento).toLocaleDateString('pt-BR')}</span>
                                        {payment.dataPagamento && (
                                            <span><strong>Pago em:</strong> {new Date(payment.dataPagamento).toLocaleDateString('pt-BR')}</span>
                                        )}
                                        <span><strong>Parcela:</strong> {payment.parcelaAtual}/{payment.parcelas}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Detalhes do Pagamento</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-sm text-gray-500">Venda ID:</Label>
                                                        <p className="font-medium">#{payment.vendaId}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm text-gray-500">Cliente:</Label>
                                                        <p className="font-medium">{payment.cliente}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm text-gray-500">Status:</Label>
                                                        <Badge className={getStatusColor(payment.status)}>
                                                            {payment.status}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm text-gray-500">Forma de Pagamento:</Label>
                                                        <p className="font-medium">{payment.formaPagamento}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};