import jsPDF from 'jspdf';

// Interface para dados do relatório
interface ReportData {
    tipo: string;
    dataInicio?: string;
    dataFim?: string;
    dados: any[];
}

// Interface para configurações da empresa
interface CompanyConfig {
    nome: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
}

// Função para obter configurações da empresa do localStorage
const getCompanyConfig = (): CompanyConfig => {
    return {
        nome: localStorage.getItem('bvolt-empresa-nome') || 'BVOLT Sistemas',
        cnpj: localStorage.getItem('bvolt-empresa-cnpj') || '00.000.000/0000-00',
        endereco: localStorage.getItem('bvolt-empresa-endereco') || 'Endereço não informado',
        telefone: localStorage.getItem('bvolt-empresa-telefone') || 'Telefone não informado',
        email: localStorage.getItem('bvolt-empresa-email') || 'contato@bvolt.com'
    };
};

// Função para gerar cabeçalho do relatório
const addHeader = (doc: jsPDF, company: CompanyConfig, reportTitle: string) => {
    // Logo/Nome da empresa
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(company.nome, 20, 25);

    // Informações da empresa
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNPJ: ${company.cnpj}`, 20, 35);
    doc.text(`${company.endereco}`, 20, 42);
    doc.text(`Tel: ${company.telefone} | Email: ${company.email}`, 20, 49);

    // Título do relatório
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 20, 65);

    // Data de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 75);

    // Linha separadora
    doc.line(20, 80, 190, 80);

    return 90; // Retorna a posição Y onde o conteúdo deve começar
};

// Função para gerar rodapé
const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${pageNum} de ${totalPages}`, 20, pageHeight - 10);
    doc.text('Gerado pelo Sistema BVOLT', 150, pageHeight - 10);
};

// Função para gerar relatório de vendas
export const generateSalesReport = (data: any[]) => {
    const doc = new jsPDF();
    const company = getCompanyConfig();
    let yPos = addHeader(doc, company, 'RELATÓRIO DE VENDAS');

    // Resumo estatístico
    const totalVendas = data.reduce((sum, venda) => sum + venda.valor, 0);
    const ticketMedio = totalVendas / data.length || 0;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO ESTATÍSTICO', 20, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Vendas: ${data.length}`, 20, yPos);
    doc.text(`Valor Total: R$ ${totalVendas.toFixed(2)}`, 100, yPos);
    yPos += 10;
    doc.text(`Ticket Médio: R$ ${ticketMedio.toFixed(2)}`, 20, yPos);
    yPos += 20;

    // Tabela de vendas
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHAMENTO DAS VENDAS', 20, yPos);
    yPos += 15;

    // Cabeçalho da tabela
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ID', 20, yPos);
    doc.text('Cliente', 40, yPos);
    doc.text('Data', 90, yPos);
    doc.text('Valor', 130, yPos);
    doc.text('Status', 160, yPos);
    yPos += 8;

    // Linha do cabeçalho
    doc.line(20, yPos - 2, 190, yPos - 2);

    // Dados das vendas
    doc.setFont('helvetica', 'normal');
    data.forEach((venda, index) => {
        if (yPos > 270) { // Nova página se necessário
            doc.addPage();
            yPos = 20;
        }

        doc.text(venda.id.toString(), 20, yPos);
        doc.text(venda.cliente.substring(0, 20), 40, yPos);
        doc.text(new Date(venda.data).toLocaleDateString('pt-BR'), 90, yPos);
        doc.text(`R$ ${venda.valor.toFixed(2)}`, 130, yPos);
        doc.text(venda.status, 160, yPos);
        yPos += 8;
    });

    addFooter(doc, 1, 1);
    return doc;
};

// Função para gerar relatório de estoque
export const generateStockReport = (data: any[]) => {
    const doc = new jsPDF();
    const company = getCompanyConfig();
    let yPos = addHeader(doc, company, 'RELATÓRIO DE ESTOQUE');

    // Resumo estatístico
    const totalProdutos = data.length;
    const produtosBaixoEstoque = data.filter(p => p.estoque < 10).length;
    const valorTotalEstoque = data.reduce((sum, produto) => sum + (produto.preco * produto.estoque), 0);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DO ESTOQUE', 20, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Produtos: ${totalProdutos}`, 20, yPos);
    doc.text(`Produtos com Estoque Baixo: ${produtosBaixoEstoque}`, 100, yPos);
    yPos += 10;
    doc.text(`Valor Total do Estoque: R$ ${valorTotalEstoque.toFixed(2)}`, 20, yPos);
    yPos += 20;

    // Tabela de produtos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUTOS EM ESTOQUE', 20, yPos);
    yPos += 15;

    // Cabeçalho da tabela
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Código', 20, yPos);
    doc.text('Produto', 50, yPos);
    doc.text('Categoria', 100, yPos);
    doc.text('Estoque', 130, yPos);
    doc.text('Preço', 160, yPos);
    yPos += 8;

    // Linha do cabeçalho
    doc.line(20, yPos - 2, 190, yPos - 2);

    // Dados dos produtos
    doc.setFont('helvetica', 'normal');
    data.forEach((produto, index) => {
        if (yPos > 270) { // Nova página se necessário
            doc.addPage();
            yPos = 20;
        }

        doc.text(produto.codigo || produto.id.toString(), 20, yPos);
        doc.text(produto.nome.substring(0, 20), 50, yPos);
        doc.text(produto.categoria || 'N/A', 100, yPos);
        doc.text(produto.estoque.toString(), 130, yPos);
        doc.text(`R$ ${produto.preco.toFixed(2)}`, 160, yPos);
        yPos += 8;
    });

    addFooter(doc, 1, 1);
    return doc;
};

// Função para gerar relatório de clientes
export const generateCustomersReport = (data: any[]) => {
    const doc = new jsPDF();
    const company = getCompanyConfig();
    let yPos = addHeader(doc, company, 'RELATÓRIO DE CLIENTES');

    // Resumo estatístico
    const totalClientes = data.length;
    const clientesAtivos = data.filter(c => c.status === 'ativo').length;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO DE CLIENTES', 20, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Clientes: ${totalClientes}`, 20, yPos);
    doc.text(`Clientes Ativos: ${clientesAtivos}`, 100, yPos);
    yPos += 20;

    // Tabela de clientes
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTA DE CLIENTES', 20, yPos);
    yPos += 15;

    // Cabeçalho da tabela
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Nome', 20, yPos);
    doc.text('Email', 80, yPos);
    doc.text('Telefone', 130, yPos);
    doc.text('Status', 170, yPos);
    yPos += 8;

    // Linha do cabeçalho
    doc.line(20, yPos - 2, 190, yPos - 2);

    // Dados dos clientes
    doc.setFont('helvetica', 'normal');
    data.forEach((cliente, index) => {
        if (yPos > 270) { // Nova página se necessário
            doc.addPage();
            yPos = 20;
        }

        doc.text(cliente.nome.substring(0, 25), 20, yPos);
        doc.text(cliente.email.substring(0, 20), 80, yPos);
        doc.text(cliente.telefone || 'N/A', 130, yPos);
        doc.text(cliente.status || 'Ativo', 170, yPos);
        yPos += 8;
    });

    addFooter(doc, 1, 1);
    return doc;
};

// Função principal para gerar relatórios
export const generateReport = (tipo: string, dados: any[]) => {
    let doc: jsPDF;

    switch (tipo) {
        case 'vendas-periodo':
        case 'produtos-mais-vendidos':
            doc = generateSalesReport(dados);
            break;
        case 'estoque-atual':
            doc = generateStockReport(dados);
            break;
        case 'clientes-ativos':
            doc = generateCustomersReport(dados);
            break;
        case 'fluxo-caixa':
            doc = generateSalesReport(dados); // Usar mesmo formato de vendas por enquanto
            break;
        case 'analise-categorias':
            doc = generateStockReport(dados); // Usar formato de estoque por enquanto
            break;
        default:
            doc = new jsPDF();
            const company = getCompanyConfig();
            addHeader(doc, company, 'RELATÓRIO PERSONALIZADO');
            doc.text('Dados não disponíveis para este relatório.', 20, 100);
    }

    return doc;
};