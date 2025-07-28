
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    Calendar,
    Search,
    Filter,
    RefreshCcw,
    Eye,
    Trash2
} from 'lucide-react';

interface RelatorioHistorico {
    id: string;
    nome: string;
    tipo: string;
    dataGeracao: string;
    tamanho: string;
    status: 'concluido' | 'processando' | 'erro';
    parametros: {
        dataInicio?: string;
        dataFim?: string;
        categoria?: string;
    };
}

export const HistoricoRelatorios: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    // Histórico de relatórios - será populado quando usuário gerar relatórios
    const historico: RelatorioHistorico[] = [];

    // Filtrar relatórios baseado na busca e status
    const relatoriosFiltrados = historico.filter(relatorio => {
        const matchesSearch = relatorio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            relatorio.tipo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || relatorio.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: RelatorioHistorico['status']) => {
        switch (status) {
            case 'concluido': return 'bg-green-100 text-green-800';
            case 'processando': return 'bg-yellow-100 text-yellow-800';
            case 'erro': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoriaColor = (categoria: string) => {
        switch (categoria) {
            case 'vendas': return 'bg-blue-100 text-blue-800';
            case 'estoque': return 'bg-green-100 text-green-800';
            case 'financeiro': return 'bg-purple-100 text-purple-800';
            case 'clientes': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatarDataHora = (dataString: string) => {
        const data = new Date(dataString);
        return {
            data: data.toLocaleDateString('pt-BR'),
            hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const handleDownload = (relatorio: RelatorioHistorico) => {
        if (relatorio.status === 'concluido') {
            console.log('Fazendo download do relatório:', relatorio.nome);
            // Simular download
            alert(`Download iniciado: ${relatorio.nome}`);
        }
    };

    const handleDelete = (relatorioId: string) => {
        if (confirm('Tem certeza que deseja deletar este relatório?')) {
            console.log('Deletando relatório:', relatorioId);
            // Implementar lógica de deleção
        }
    };

    const handleRegenerate = (relatorio: RelatorioHistorico) => {
        console.log('Regenerando relatório:', relatorio);
        // Implementar lógica de regeneração
        alert('Relatório será regenerado em breve');
    };

    return (
        <div className="space-y-6">
            {/* Filtros e busca */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar relatórios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-bvolt-blue"
                    >
                        <option value="todos">Todos os Status</option>
                        <option value="concluido">Concluídos</option>
                        <option value="processando">Processando</option>
                        <option value="erro">Com Erro</option>
                    </select>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* Lista de relatórios */}
            <div className="space-y-4">
                {relatoriosFiltrados.map((relatorio) => {
                    const { data, hora } = formatarDataHora(relatorio.dataGeracao);

                    return (
                        <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText className="h-5 w-5 text-bvolt-blue" />
                                            <h3 className="font-medium text-slate-900">{relatorio.nome}</h3>
                                            <Badge className={getStatusColor(relatorio.status)}>
                                                {relatorio.status}
                                            </Badge>
                                            {relatorio.parametros.categoria && (
                                                <Badge className={getCategoriaColor(relatorio.parametros.categoria)}>
                                                    {relatorio.parametros.categoria}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {data} às {hora}
                                            </span>
                                            <span><strong>Tamanho:</strong> {relatorio.tamanho}</span>
                                            <span><strong>Tipo:</strong> {relatorio.tipo}</span>
                                            {relatorio.parametros.dataInicio && relatorio.parametros.dataFim && (
                                                <span>
                                                    <strong>Período:</strong> {new Date(relatorio.parametros.dataInicio).toLocaleDateString('pt-BR')} - {new Date(relatorio.parametros.dataFim).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        {relatorio.status === 'concluido' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(relatorio)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}

                                        {relatorio.status === 'erro' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRegenerate(relatorio)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <RefreshCcw className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(relatorio.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {relatoriosFiltrados.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                Nenhum relatório encontrado
                            </h3>
                            <p className="text-slate-600">
                                Tente ajustar os filtros de busca ou gerar novos relatórios.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};