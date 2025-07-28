import { jsPDF } from 'jspdf';

/**
 * GERADOR DE RELATÓRIOS FINANCEIROS EM PDF
 * 
 * Funcionalidades:
 * - Relatório completo de contas a pagar e receber
 * - Dashboard com indicadores financeiros
 * - Layout profissional e responsivo
 * - Integração com o sistema de contas
 */

interface ContaFinanceira {
    id: number;
    tipo: 'pagar' | 'receber';
    descricao: string;
    valor: number;
    vencimento: string;
    status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
    clienteOuFornecedor: string;
    categoria: string;
    formaPagamento?: string;
    observacoes?: string;
    dataPagamento?: string;
    valorPago?: number;
    created_at: string;
}

interface IndicadoresFinanceiros {
    aReceber: number;
    aPagar: number;
    recebido: number;
    pago: number;
    vencidas: number;
    saldoPrevisto: number;
    saldoRealizado: number;
}

export const generateFinanceReport = (contas: ContaFinanceira[], indicadores: IndicadoresFinanceiros) => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = 20;
        }
    };

    // Função para formatar moeda
    const formatCurrency = (value: number) => {
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    };

    // Função para formatar data
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    // Header do relatório
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO', 105, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Seção de Indicadores
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INDICADORES FINANCEIROS', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Caixa de indicadores
    const boxHeight = 80;
    doc.rect(margin, yPosition - 5, 170, boxHeight);

    // Linha 1 de indicadores
    doc.text(`A Receber: ${formatCurrency(indicadores.aReceber)}`, margin + 5, yPosition + 10);
    doc.text(`A Pagar: ${formatCurrency(indicadores.aPagar)}`, margin + 90, yPosition + 10);

    // Linha 2 de indicadores
    doc.text(`Recebido: ${formatCurrency(indicadores.recebido)}`, margin + 5, yPosition + 25);
    doc.text(`Pago: ${formatCurrency(indicadores.pago)}`, margin + 90, yPosition + 25);

    // Linha 3 de indicadores
    doc.text(`Saldo Previsto: ${formatCurrency(indicadores.saldoPrevisto)}`, margin + 5, yPosition + 40);
    doc.text(`Saldo Realizado: ${formatCurrency(indicadores.saldoRealizado)}`, margin + 90, yPosition + 40);

    // Linha 4 de indicadores
    doc.text(`Contas Vencidas: ${indicadores.vencidas}`, margin + 5, yPosition + 55);

    yPosition += boxHeight + 20;

    // Verificar quebra de página
    checkPageBreak(30);

    // Seção de Contas a Receber
    const contasReceber = contas.filter(c => c.tipo === 'receber');
    if (contasReceber.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTAS A RECEBER', margin, yPosition);
        yPosition += 15;

        // Cabeçalho da tabela
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Descrição', margin, yPosition);
        doc.text('Cliente', margin + 60, yPosition);
        doc.text('Valor', margin + 100, yPosition);
        doc.text('Vencimento', margin + 130, yPosition);
        doc.text('Status', margin + 165, yPosition);
        yPosition += 10;

        // Linha divisória
        doc.line(margin, yPosition - 2, margin + 170, yPosition - 2);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        contasReceber.forEach((conta) => {
            checkPageBreak(15);

            doc.text(conta.descricao.substring(0, 25), margin, yPosition);
            doc.text(conta.clienteOuFornecedor.substring(0, 15), margin + 60, yPosition);
            doc.text(formatCurrency(conta.valor), margin + 100, yPosition);
            doc.text(formatDate(conta.vencimento), margin + 130, yPosition);
            doc.text(conta.status.charAt(0).toUpperCase() + conta.status.slice(1), margin + 165, yPosition);
            yPosition += 8;
        });

        yPosition += 15;
    }

    // Seção de Contas a Pagar
    const contasPagar = contas.filter(c => c.tipo === 'pagar');
    if (contasPagar.length > 0) {
        checkPageBreak(30);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTAS A PAGAR', margin, yPosition);
        yPosition += 15;

        // Cabeçalho da tabela
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Descrição', margin, yPosition);
        doc.text('Fornecedor', margin + 60, yPosition);
        doc.text('Valor', margin + 100, yPosition);
        doc.text('Vencimento', margin + 130, yPosition);
        doc.text('Status', margin + 165, yPosition);
        yPosition += 10;

        // Linha divisória
        doc.line(margin, yPosition - 2, margin + 170, yPosition - 2);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        contasPagar.forEach((conta) => {
            checkPageBreak(15);

            doc.text(conta.descricao.substring(0, 25), margin, yPosition);
            doc.text(conta.clienteOuFornecedor.substring(0, 15), margin + 60, yPosition);
            doc.text(formatCurrency(conta.valor), margin + 100, yPosition);
            doc.text(formatDate(conta.vencimento), margin + 130, yPosition);
            doc.text(conta.status.charAt(0).toUpperCase() + conta.status.slice(1), margin + 165, yPosition);
            yPosition += 8;
        });

        yPosition += 15;
    }

    // Resumo por categoria
    const categorias = [...new Set(contas.map(c => c.categoria))].filter(Boolean);
    if (categorias.length > 0) {
        checkPageBreak(50);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMO POR CATEGORIA', margin, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        categorias.forEach(categoria => {
            const contasCategoria = contas.filter(c => c.categoria === categoria);
            const valorTotal = contasCategoria.reduce((sum, c) => sum + c.valor, 0);

            checkPageBreak(10);
            doc.text(`${categoria}: ${formatCurrency(valorTotal)} (${contasCategoria.length} conta(s))`, margin, yPosition);
            yPosition += 8;
        });
    }

    // Footer
    const totalPages = doc.getNumberOfPages ? doc.getNumberOfPages() : 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Página ${i} de ${totalPages} - BVOLT Commerce System - Relatório Financeiro`,
            105,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Download do arquivo
    const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

/**
 * GERADOR DE RELATÓRIO DE EXPORTAÇÃO CONTÁBIL
 * Para integração com sistemas de contabilidade
 */
export const generateAccountingExport = (contas: ContaFinanceira[], dataInicio: string, dataFim: string) => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPORTAÇÃO CONTÁBIL', 105, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Filtrar contas do período
    const contasPeriodo = contas.filter(conta => {
        const dataVencimento = new Date(conta.vencimento);
        return dataVencimento >= new Date(dataInicio) && dataVencimento <= new Date(dataFim);
    });

    // Cabeçalho da exportação
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', 20, yPosition);
    doc.text('Tipo', 40, yPosition);
    doc.text('Descrição', 60, yPosition);
    doc.text('Valor', 120, yPosition);
    doc.text('Cliente/Fornecedor', 140, yPosition);
    doc.text('Categoria', 180, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    contasPeriodo.forEach(conta => {
        if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
        }

        doc.text(new Date(conta.vencimento).toLocaleDateString('pt-BR'), 20, yPosition);
        doc.text(conta.tipo === 'receber' ? 'REC' : 'PAG', 40, yPosition);
        doc.text(conta.descricao.substring(0, 30), 60, yPosition);
        doc.text(`R$ ${conta.valor.toFixed(2)}`, 120, yPosition);
        doc.text(conta.clienteOuFornecedor.substring(0, 20), 140, yPosition);
        doc.text(conta.categoria.substring(0, 15), 180, yPosition);
        yPosition += 6;
    });

    const fileName = `exportacao-contabil-${dataInicio}-${dataFim}.pdf`;
    doc.save(fileName);
};