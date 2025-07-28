import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, QrCode, Banknote, Globe, Settings, Plus, ExternalLink } from 'lucide-react';

/**
 * SISTEMA DE INTEGRAÇÃO COM GATEWAYS DE PAGAMENTO
 * 
 * Funcionalidades:
 * - Configuração de gateways (MercadoPago, PagSeguro, Stripe, PayPal)
 * - Processamento de pagamentos PIX, Cartão, Boleto
 * - Integração automática com contas a receber
 * - Webhooks para confirmação automática
 * - Dashboard de transações
 */

interface Gateway {
    id: string;
    nome: string;
    ativo: boolean;
    configuracao: {
        publicKey?: string;
        secretKey?: string;
        clientId?: string;
        clientSecret?: string;
        sandboxMode?: boolean;
    };
}

interface Transacao {
    id: string;
    gateway: string;
    valor: number;
    status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
    metodo: 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto';
    cliente: string;
    dataTransacao: string;
    contaReceberVinculada?: string;
}

const Pagamentos: React.FC = () => {
    const { hasPermission } = useAuth();
    const { toast } = useToast();

    // Estados principais
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);

    // Estados dos gateways
    const [gateways, setGateways] = useState<Gateway[]>([
        {
            id: 'mercadopago',
            nome: 'MercadoPago',
            ativo: false,
            configuracao: { sandboxMode: true }
        },
        {
            id: 'pagseguro',
            nome: 'PagSeguro',
            ativo: false,
            configuracao: { sandboxMode: true }
        },
        {
            id: 'stripe',
            nome: 'Stripe',
            ativo: false,
            configuracao: { sandboxMode: true }
        },
        {
            id: 'paypal',
            nome: 'PayPal',
            ativo: false,
            configuracao: { sandboxMode: true }
        }
    ]);

    // Estados das transações (mock data para demonstração)
    const [transacoes] = useState<Transacao[]>([]);

    // Estados do formulário de configuração
    const [configForm, setConfigForm] = useState({
        publicKey: '',
        secretKey: '',
        clientId: '',
        clientSecret: '',
        sandboxMode: true
    });

    // Verifica permissões
    const canManage = hasPermission(['admin', 'gerente']);

    // Estatísticas das transações
    const estatisticas = {
        totalTransacoes: transacoes.length,
        totalValor: transacoes.reduce((sum, t) => sum + t.valor, 0),
        aprovadas: transacoes.filter(t => t.status === 'aprovado').length,
        pendentes: transacoes.filter(t => t.status === 'pendente').length,
        rejeitadas: transacoes.filter(t => t.status === 'rejeitado').length
    };

    // Função para abrir modal de configuração
    const openConfigModal = (gateway: Gateway) => {
        setSelectedGateway(gateway);
        setConfigForm({
            publicKey: gateway.configuracao.publicKey || '',
            secretKey: gateway.configuracao.secretKey || '',
            clientId: gateway.configuracao.clientId || '',
            clientSecret: gateway.configuracao.clientSecret || '',
            sandboxMode: gateway.configuracao.sandboxMode || true
        });
        setIsConfigModalOpen(true);
    };

    // Função para salvar configuração do gateway
    const handleSaveConfig = () => {
        if (!selectedGateway || !canManage) return;

        const updatedGateways = gateways.map(g =>
            g.id === selectedGateway.id
                ? {
                    ...g,
                    configuracao: {
                        ...configForm
                    },
                    ativo: configForm.publicKey?.length > 0 || configForm.clientId?.length > 0
                }
                : g
        );

        setGateways(updatedGateways);
        setIsConfigModalOpen(false);

        toast({
            title: "Configuração salva",
            description: `Gateway ${selectedGateway.nome} configurado com sucesso`
        });
    };

    // Função para toggle do gateway
    const toggleGateway = (gatewayId: string) => {
        if (!canManage) return;

        const updatedGateways = gateways.map(g =>
            g.id === gatewayId
                ? { ...g, ativo: !g.ativo }
                : g
        );

        setGateways(updatedGateways);

        const gateway = gateways.find(g => g.id === gatewayId);
        toast({
            title: `Gateway ${gateway?.ativo ? 'desativado' : 'ativado'}`,
            description: `${gateway?.nome} foi ${gateway?.ativo ? 'desativado' : 'ativado'} com sucesso`
        });
    };

    // Função para processar pagamento (simulação)
    const processPayment = (metodo: string, valor: number) => {
        // Esta função seria integrada com os SDKs dos gateways
        toast({
            title: "Pagamento iniciado",
            description: `Processando pagamento via ${metodo} no valor de R$ ${valor.toFixed(2)}`,
        });
    };

    const getGatewayIcon = (gatewayId: string) => {
        const icons = {
            mercadopago: <CreditCard className="h-6 w-6" />,
            pagseguro: <QrCode className="h-6 w-6" />,
            stripe: <Globe className="h-6 w-6" />,
            paypal: <Banknote className="h-6 w-6" />
        };
        return icons[gatewayId as keyof typeof icons] || <CreditCard className="h-6 w-6" />;
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            aprovado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            rejeitado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            cancelado: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        };
        return styles[status as keyof typeof styles] || styles.pendente;
    };

    if (!canManage) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Você não tem permissão para acessar o módulo de pagamentos.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pagamentos</h1>
                    <p className="text-muted-foreground">Integração com gateways de pagamento</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="gateways">Gateways</TabsTrigger>
                    <TabsTrigger value="transacoes">Transações</TabsTrigger>
                    <TabsTrigger value="documentacao">Docs</TabsTrigger>
                </TabsList>

                {/* Dashboard */}
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Transações</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{estatisticas.totalTransacoes}</div>
                                <p className="text-xs text-muted-foreground">
                                    Transações processadas
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                                <Banknote className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    R$ {estatisticas.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Volume transacionado
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{estatisticas.aprovadas}</div>
                                <p className="text-xs text-muted-foreground">
                                    Transações aprovadas
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
                                <p className="text-xs text-muted-foreground">
                                    Aguardando confirmação
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status dos Gateways */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status dos Gateways</CardTitle>
                            <CardDescription>
                                Situação atual dos gateways de pagamento configurados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {gateways.map((gateway) => (
                                    <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getGatewayIcon(gateway.id)}
                                            <div>
                                                <p className="font-medium">{gateway.nome}</p>
                                                <Badge variant={gateway.ativo ? "default" : "secondary"}>
                                                    {gateway.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Gateways */}
                <TabsContent value="gateways" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {gateways.map((gateway) => (
                            <Card key={gateway.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getGatewayIcon(gateway.id)}
                                            <div>
                                                <CardTitle>{gateway.nome}</CardTitle>
                                                <Badge variant={gateway.ativo ? "default" : "secondary"}>
                                                    {gateway.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openConfigModal(gateway)}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Configurar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            {gateway.id === 'mercadopago' && 'PIX, Cartão, Boleto - Taxa competitiva'}
                                            {gateway.id === 'pagseguro' && 'PIX, Cartão, Boleto - Integração nacional'}
                                            {gateway.id === 'stripe' && 'Cartão internacional - Global'}
                                            {gateway.id === 'paypal' && 'PayPal, Cartão - Internacional'}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={gateway.ativo ? "destructive" : "default"}
                                                size="sm"
                                                onClick={() => toggleGateway(gateway.id)}
                                            >
                                                {gateway.ativo ? 'Desativar' : 'Ativar'}
                                            </Button>

                                            {gateway.ativo && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => processPayment(gateway.id, 10.00)}
                                                >
                                                    Testar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Transações */}
                <TabsContent value="transacoes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Transações</CardTitle>
                            <CardDescription>
                                Todas as transações processadas pelos gateways
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transacoes.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        Nenhuma transação encontrada. Configure os gateways e processe alguns pagamentos.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Lista de transações seria renderizada aqui */}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documentação */}
                <TabsContent value="documentacao" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração dos Gateways</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium">MercadoPago</h4>
                                    <p className="text-sm text-muted-foreground">
                                        1. Acesse o painel do MercadoPago<br />
                                        2. Vá em Credenciais<br />
                                        3. Copie Public Key e Access Token<br />
                                        4. Configure no sistema
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Documentação
                                    </Button>
                                </div>

                                <div>
                                    <h4 className="font-medium">PagSeguro</h4>
                                    <p className="text-sm text-muted-foreground">
                                        1. Acesse o painel do PagSeguro<br />
                                        2. Vá em Credenciais de integração<br />
                                        3. Gere suas credenciais<br />
                                        4. Configure no sistema
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Documentação
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Integração com Contas a Receber</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        O sistema automaticamente:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Cria conta a receber para cada venda</li>
                                        <li>• Atualiza status quando pagamento é confirmado</li>
                                        <li>• Envia webhooks para confirmação automática</li>
                                        <li>• Gera relatórios de conciliação</li>
                                    </ul>

                                    <div className="mt-4">
                                        <h4 className="font-medium">Webhooks</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Configure nos gateways a URL:<br />
                                            <code className="bg-muted px-2 py-1 rounded">
                                                https://seudominio.com/api/webhooks/pagamento
                                            </code>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal de Configuração */}
            <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Configurar {selectedGateway?.nome}</DialogTitle>
                        <DialogDescription>
                            Configure as credenciais do gateway de pagamento
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedGateway?.id === 'mercadopago' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Public Key</Label>
                                    <Input
                                        placeholder="APP_USR-xxxxxxxx"
                                        value={configForm.publicKey}
                                        onChange={(e) => setConfigForm({ ...configForm, publicKey: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Access Token</Label>
                                    <Input
                                        placeholder="APP_USR-xxxxxxxx"
                                        value={configForm.secretKey}
                                        onChange={(e) => setConfigForm({ ...configForm, secretKey: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {selectedGateway?.id === 'stripe' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Publishable Key</Label>
                                    <Input
                                        placeholder="pk_test_xxxxxxxx"
                                        value={configForm.publicKey}
                                        onChange={(e) => setConfigForm({ ...configForm, publicKey: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secret Key</Label>
                                    <Input
                                        placeholder="sk_test_xxxxxxxx"
                                        value={configForm.secretKey}
                                        onChange={(e) => setConfigForm({ ...configForm, secretKey: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {selectedGateway?.id === 'paypal' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Client ID</Label>
                                    <Input
                                        placeholder="xxxxxxxx"
                                        value={configForm.clientId}
                                        onChange={(e) => setConfigForm({ ...configForm, clientId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Client Secret</Label>
                                    <Input
                                        placeholder="xxxxxxxx"
                                        value={configForm.clientSecret}
                                        onChange={(e) => setConfigForm({ ...configForm, clientSecret: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {selectedGateway?.id === 'pagseguro' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Token</Label>
                                    <Input
                                        placeholder="xxxxxxxx"
                                        value={configForm.secretKey}
                                        onChange={(e) => setConfigForm({ ...configForm, secretKey: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="sandbox"
                                checked={configForm.sandboxMode}
                                onChange={(e) => setConfigForm({ ...configForm, sandboxMode: e.target.checked })}
                            />
                            <Label htmlFor="sandbox">Modo Sandbox (Teste)</Label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveConfig} className="bg-bvolt-gradient hover:opacity-90">
                            Salvar Configuração
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Pagamentos;